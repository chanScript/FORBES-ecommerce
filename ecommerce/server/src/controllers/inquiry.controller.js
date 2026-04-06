const prisma = require('../config/db');
const { parsePagination, paginatedResponse } = require('../utils/pagination');
const { createAuditLog } = require('../middleware/audit.middleware');
const { sendEmail } = require('../utils/email');

/**
 * POST /api/inquiries/:carId — User expresses interest in a car.
 */
async function createInquiry(req, res, next) {
  try {
    const carId = req.params.carId;
    const userId = req.user.id;
    const { message } = req.body;

    // Verify the car exists and is approved
    const car = await prisma.car.findUnique({
      where: { id: carId },
      include: {
        brand: true,
        model: true,
        seller: { select: { id: true, name: true, email: true } },
        images: { where: { isPrimary: true }, take: 1 },
      },
    });

    if (!car || car.isDeleted || car.status !== 'Approved') {
      return res.status(404).json({ error: 'Car not found.' });
    }

    // Prevent seller from inquiring on their own listing
    if (car.sellerId === userId) {
      return res.status(400).json({ error: 'You cannot inquire on your own listing.' });
    }

    // Upsert — one inquiry per user per car
    const inquiry = await prisma.inquiry.upsert({
      where: { userId_carId: { userId, carId } },
      update: { message: message || null, status: 'New', updatedAt: new Date() },
      create: { userId, carId, message: message || null },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        car: { select: { id: true, title: true, slug: true } },
      },
    });

    await createAuditLog({
      userId,
      action: 'INQUIRY_SUBMITTED',
      module: 'inquiries',
      recordId: String(inquiry.id),
      ipAddress: req.ip,
      metadata: { carId, carTitle: car.title },
    });

    // Email admin(s) about new inquiry
    const admins = await prisma.user.findMany({
      where: { role: { name: { in: ['Admin', 'Super Admin'] } } },
      select: { email: true },
    });

    const adminEmails = admins.map(a => a.email);
    if (adminEmails.length > 0) {
      const imgUrl = car.images[0]?.url || '';
      await sendEmail(
        adminEmails.join(','),
        `New Inquiry: ${car.title}`,
        `<h2>New Product Inquiry</h2>
         <p><strong>Vehicle:</strong> ${car.title}</p>
         ${imgUrl ? `<img src="${imgUrl}" alt="${car.title}" style="max-width:300px;border-radius:8px;" />` : ''}
         <p><strong>Interested User:</strong> ${req.user.name} (${req.user.email})</p>
         ${req.user.phone ? `<p><strong>Phone:</strong> ${req.user.phone}</p>` : ''}
         ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
         <p><strong>Seller:</strong> ${car.seller.name} (${car.seller.email})</p>
         <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>`,
      );
    }

    res.status(201).json(inquiry);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/inquiries/my — User's own inquiries.
 */
async function getMyInquiries(req, res, next) {
  try {
    const inquiries = await prisma.inquiry.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        car: {
          select: {
            id: true, title: true, slug: true, price: true,
            images: { where: { isPrimary: true }, take: 1 },
          },
        },
      },
    });

    res.json(inquiries);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/inquiries/check/:carId — Check if user already inquired about a car.
 */
async function checkInquiry(req, res, next) {
  try {
    const inquiry = await prisma.inquiry.findUnique({
      where: { userId_carId: { userId: req.user.id, carId: req.params.carId } },
    });
    res.json({ hasInquired: !!inquiry });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/inquiries/admin — Admin: list all inquiries.
 */
async function listInquiries(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req.query);

    const where = {};
    if (req.query.status) where.status = req.query.status;

    const [inquiries, total] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          car: {
            select: {
              id: true, title: true, slug: true, price: true,
              seller: { select: { id: true, name: true, email: true } },
              images: { where: { isPrimary: true }, take: 1 },
            },
          },
        },
      }),
      prisma.inquiry.count({ where }),
    ]);

    res.json(paginatedResponse(inquiries, total, page, limit));
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/inquiries/admin/:id/status — Admin: update inquiry status.
 */
async function updateInquiryStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!['New', 'Seen', 'Contacted'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }

    const inquiry = await prisma.inquiry.findUnique({ where: { id: parseInt(req.params.id, 10) } });
    if (!inquiry) {
      return res.status(404).json({ error: 'Inquiry not found.' });
    }

    const updated = await prisma.inquiry.update({
      where: { id: inquiry.id },
      data: { status },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        car: { select: { id: true, title: true, slug: true } },
      },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/inquiries/admin/count — Admin: count of new inquiries (for badge).
 */
async function getNewInquiryCount(req, res, next) {
  try {
    const count = await prisma.inquiry.count({ where: { status: 'New' } });
    res.json({ count });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createInquiry,
  getMyInquiries,
  checkInquiry,
  listInquiries,
  updateInquiryStatus,
  getNewInquiryCount,
};
