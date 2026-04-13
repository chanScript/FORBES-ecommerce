const prisma = require('../config/db');
const slugify = require('slugify');
const { parsePagination, paginatedResponse } = require('../utils/pagination');
const { createAuditLog } = require('../middleware/audit.middleware');
const { sendEmail, sendSubmissionReceivedEmail, sendSubmissionStatusEmail } = require('../utils/email');
const { uploadImageLocal } = require('../middleware/upload.middleware');
const { createNotification } = require('../utils/notification.service');

// Prisma enum whitelists — safely null out values not in the enum
const VALID_TRANSMISSIONS = ['Automatic', 'Manual', 'CVT'];
const VALID_FUEL_TYPES = ['Gasoline', 'Diesel', 'Electric', 'Hybrid', 'LPG'];

function sanitizeTransmission(val) {
  return VALID_TRANSMISSIONS.includes(val) ? val : null;
}

function sanitizeFuelType(val) {
  return VALID_FUEL_TYPES.includes(val) ? val : null;
}

/**
 * POST /api/submissions — Public: anonymous seller submission.
 */
async function createSubmission(req, res, next) {
  try {
    const {
      fullName, email, phone,
      category, vehicleSubtype, realEstateSubtype,
      propertyDetails, price, vehicleData: vehicleDataRaw,
    } = req.body;

    let vehicleData = null;
    if (category === 'Vehicle' && vehicleDataRaw) {
      try { vehicleData = typeof vehicleDataRaw === 'string' ? JSON.parse(vehicleDataRaw) : vehicleDataRaw; }
      catch { vehicleData = null; }
    }

    const submission = await prisma.sellerSubmission.create({
      data: {
        fullName,
        email,
        phone,
        category,
        vehicleSubtype: vehicleSubtype || null,
        realEstateSubtype: realEstateSubtype || null,
        propertyDetails: propertyDetails || null,
        vehicleData,
        price: price ? parseFloat(price) : null,
      },
    });

    // Upload images if provided (non-blocking)
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const { publicId, url } = await uploadImageLocal(file.buffer);
          await prisma.sellerSubmissionImage.create({
            data: {
              submissionId: submission.id,
              url,
              publicId,
            },
          });
        } catch (imgErr) {
          console.error('[Submission] Failed to upload image:', imgErr.message);
          // Continue with submission even if image upload fails
        }
      }
    }

    // Notify admins (non-blocking)
    setImmediate(async () => {
      try {
        const adminEmails = await prisma.user.findMany({
          where: { role: { name: { in: ['Admin', 'Super Admin'] } } },
          select: { email: true },
        });

        for (const admin of adminEmails) {
          await sendEmail(
            admin.email,
            'New Seller Submission Received',
            `<h2>New Submission</h2>
             <p><strong>From:</strong> ${fullName} (${email})</p>
             <p><strong>Category:</strong> ${category}${vehicleSubtype ? ' — ' + vehicleSubtype : ''}${realEstateSubtype ? ' — ' + realEstateSubtype : ''}</p>
             <p><strong>Details:</strong> ${propertyDetails}</p>
             <p>Log in to the admin panel to review this submission.</p>`
          );
        }
      } catch (adminErr) {
        console.error('[Submission] Failed to notify admins:', adminErr.message);
      }
    });

    // Confirmation to submitter (non-blocking)
    setImmediate(() => sendSubmissionReceivedEmail(email, fullName));

    // Real-time notification for admins
    const io = req.app.get('io');
    createNotification({
      type: 'NEW_SUBMISSION',
      title: 'New Seller Submission',
      message: `${fullName} submitted a new ${category} listing for review.`,
      metadata: { submissionId: submission.id, category },
      io,
    });

    res.status(201).json({ message: 'Submission received. We will review it shortly.', id: submission.id });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/submissions — Admin: list all submissions.
 */
async function listSubmissions(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req.query);

    const where = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.category) where.category = req.query.category;

    const [submissions, total] = await Promise.all([
      prisma.sellerSubmission.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          images: true,
          documents: true,
          reviewer: { select: { id: true, name: true } },
          convertedListing: { select: { id: true, title: true, slug: true } },
        },
      }),
      prisma.sellerSubmission.count({ where }),
    ]);

    res.json(paginatedResponse(submissions, total, page, limit));
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/submissions/:id — Admin: single submission detail.
 */
async function getSubmission(req, res, next) {
  try {
    const submission = await prisma.sellerSubmission.findUnique({
      where: { id: parseInt(req.params.id, 10) },
      include: {
        images: true,
        documents: true,
        reviewer: { select: { id: true, name: true } },
        convertedListing: { select: { id: true, title: true, slug: true, status: true } },
      },
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found.' });
    }

    res.json(submission);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/admin/submissions/:id/approve — Approve + optionally convert to listing.
 */
async function approveSubmission(req, res, next) {
  try {
    const submission = await prisma.sellerSubmission.findUnique({
      where: { id: parseInt(req.params.id, 10) },
      include: { images: true },
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found.' });
    }

    if (submission.status !== 'Pending') {
      return res.status(400).json({ error: 'Only pending submissions can be approved.' });
    }

    await prisma.sellerSubmission.update({
      where: { id: submission.id },
      data: {
        status: 'Approved',
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
        adminNote: req.body.adminNote || null,
      },
    });

    await createAuditLog({
      userId: req.user.id,
      action: 'SUBMISSION_APPROVED',
      module: 'submissions',
      recordId: String(submission.id),
      ipAddress: req.ip,
    });

    sendSubmissionStatusEmail(submission.email, submission.fullName, 'approved');

    res.json({ message: 'Submission approved.' });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/admin/submissions/:id/reject — Reject submission.
 */
async function rejectSubmission(req, res, next) {
  try {
    const submission = await prisma.sellerSubmission.findUnique({
      where: { id: parseInt(req.params.id, 10) },
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found.' });
    }

    if (submission.status !== 'Pending') {
      return res.status(400).json({ error: 'Only pending submissions can be rejected.' });
    }

    await prisma.sellerSubmission.update({
      where: { id: submission.id },
      data: {
        status: 'Rejected',
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
        adminNote: req.body.adminNote || null,
      },
    });

    await createAuditLog({
      userId: req.user.id,
      action: 'SUBMISSION_REJECTED',
      module: 'submissions',
      recordId: String(submission.id),
      ipAddress: req.ip,
    });

    sendSubmissionStatusEmail(submission.email, submission.fullName, 'rejected', req.body.adminNote);

    res.json({ message: 'Submission rejected.' });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/submissions/:id/convert — Convert submission to a listing.
 */
async function convertToListing(req, res, next) {
  try {
    const submission = await prisma.sellerSubmission.findUnique({
      where: { id: parseInt(req.params.id, 10) },
      include: { images: true, convertedListing: true },
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found.' });
    }

    if (submission.convertedListing) {
      return res.status(400).json({ error: 'Submission already converted to a listing.' });
    }

    // Accept optional overrides from admin; fall back to stored vehicleData for vehicle fields
    const vd = submission.vehicleData || {};
    const {
      title: customTitle, description, price, city, condition, category,
      vehicleSubtype, realEstateSubtype,
      year, mileage, fuelType, transmission, engineCapacity, color, seats,
      lotArea, floorArea, bedrooms, bathrooms, parkingSpaces,
      furnishingStatus, amenities, propertyAge, titleType,
    } = req.body;

    const effectiveCategory = category || submission.category;
    const effectiveCity = city || 'Philippines';

    const title = customTitle || `${submission.fullName}'s ${effectiveCategory === 'Vehicle' ? (vehicleSubtype || submission.vehicleSubtype || 'Vehicle') : (realEstateSubtype || submission.realEstateSubtype || 'Property')} Listing`;
    const baseSlug = slugify(title, { lower: true, strict: true });
    const slug = `${baseSlug}-${require('crypto').randomUUID().slice(0, 8)}`;

    const data = {
      title,
      slug,
      description: description || submission.propertyDetails || '',
      price: price ? parseFloat(price) : (submission.price ? Number(submission.price) : 0),
      city: effectiveCity,
      condition: condition || 'Used',
      status: 'Approved',
      category: effectiveCategory,
      sellerId: req.user.id,
      approvedAt: new Date(),
      approvedBy: req.user.id,
      sourceSubmissionId: submission.id,
    };

    if (effectiveCategory === 'Vehicle') {
      data.vehicleSubtype = vehicleSubtype || submission.vehicleSubtype;
      data.year = year ? parseInt(year, 10) : (vd.year ? parseInt(vd.year, 10) : null);
      data.mileage = mileage ? parseInt(mileage, 10) : (vd.mileage ? parseInt(vd.mileage, 10) : null);
      data.fuelType = sanitizeFuelType(fuelType || vd.fuelType);
      data.transmission = sanitizeTransmission(transmission || vd.transmission);
      data.drivetrain = vd.drivetrain || null;
      data.engineCapacity = engineCapacity ? parseInt(engineCapacity, 10) : (vd.engineCapacity ? parseInt(vd.engineCapacity, 10) : null);
      data.engineType = vd.engineType || null;
      data.color = color || vd.color || null;
      data.interiorColor = vd.interiorColor || null;
      data.seats = seats ? parseInt(seats, 10) : (vd.seats ? parseInt(vd.seats, 10) : null);
      data.horsepower = vd.horsepower ? parseInt(vd.horsepower, 10) : null;
      data.torque = vd.torque ? parseInt(vd.torque, 10) : null;
      data.topSpeed = vd.topSpeed ? parseInt(vd.topSpeed, 10) : null;
      data.fuelEconomy = vd.fuelEconomy ? parseFloat(vd.fuelEconomy) : null;
      data.brand = vd.brand || null;
      data.model = vd.model || null;
      data.variant = vd.variant || null;
      data.bodyType = vd.bodyType || null;
      data.plateNumber = vd.plateNumber || null;
      data.vinNumber = vd.vinNumber || null;
      data.features = vd.features || null;
      data.safetyFeatures = vd.safetyFeatures || null;
      data.overallCondition = vd.overallCondition || null;
      data.accidentHistory = vd.accidentHistory != null ? Boolean(vd.accidentHistory) : null;
      data.serviceHistoryAvailable = vd.serviceHistoryAvailable != null ? Boolean(vd.serviceHistoryAvailable) : null;
      data.previousOwners = vd.previousOwners ? parseInt(vd.previousOwners, 10) : null;
      data.lastMaintenanceDate = vd.lastMaintenanceDate || null;
      data.tiresCondition = vd.tiresCondition || null;
      data.knownIssues = vd.knownIssues || null;
      data.ownershipDetails = vd.ownershipDetails || null;
      data.negotiable = vd.negotiable != null ? Boolean(vd.negotiable) : false;
      data.reasonForSelling = vd.reasonForSelling || null;
      data.viewingAvailability = vd.viewingAvailability || null;
    } else if (effectiveCategory === 'RealEstate') {
      data.realEstateSubtype = realEstateSubtype || submission.realEstateSubtype;
      data.lotArea = lotArea ? parseFloat(lotArea) : null;
      data.floorArea = floorArea ? parseFloat(floorArea) : null;
      data.bedrooms = bedrooms ? parseInt(bedrooms, 10) : null;
      data.bathrooms = bathrooms ? parseInt(bathrooms, 10) : null;
      data.parkingSpaces = parkingSpaces ? parseInt(parkingSpaces, 10) : null;
      data.furnishingStatus = furnishingStatus || null;
      data.amenities = amenities || null;
      data.propertyAge = propertyAge ? parseInt(propertyAge, 10) : null;
      data.titleType = titleType || null;
    }

    const listing = await prisma.listing.create({ data });

    // Copy submission images to listing images
    for (let i = 0; i < submission.images.length; i++) {
      const img = submission.images[i];
      await prisma.listingImage.create({
        data: {
          listingId: listing.id,
          url: img.url,
          publicId: img.publicId,
          isPrimary: i === 0,
          sortOrder: i,
        },
      });
    }

    // Mark submission as approved if still pending
    if (submission.status === 'Pending') {
      await prisma.sellerSubmission.update({
        where: { id: submission.id },
        data: {
          status: 'Approved',
          reviewedBy: req.user.id,
          reviewedAt: new Date(),
        },
      });
    }

    await createAuditLog({
      userId: req.user.id,
      action: 'SUBMISSION_CONVERTED',
      module: 'submissions',
      recordId: String(submission.id),
      ipAddress: req.ip,
      metadata: { listingId: listing.id },
    });

    res.status(201).json(listing);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/submissions/count — Count of pending submissions.
 */
async function getPendingCount(req, res, next) {
  try {
    const count = await prisma.sellerSubmission.count({ where: { status: 'Pending' } });
    res.json({ count });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createSubmission,
  listSubmissions,
  getSubmission,
  approveSubmission,
  rejectSubmission,
  convertToListing,
  getPendingCount,
};
