const prisma = require('../config/db');
const { parsePagination, paginatedResponse } = require('../utils/pagination');
const { createAuditLog } = require('../middleware/audit.middleware');
const {
  sendListingApprovedEmail,
  sendListingRejectedEmail,
  sendListingForceDeletedEmail,
} = require('../utils/email');

/**
 * GET /api/admin/listings — All listings (any status).
 */
async function listAllListings(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req.query);

    const where = { isDeleted: false };
    if (req.query.status) where.status = req.query.status;
    if (req.query.category) where.category = req.query.category;

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          brand: true,
          model: true,
          vehicleType: true,
          seller: { select: { id: true, name: true, email: true } },
          images: { where: { isPrimary: true }, take: 1 },
        },
      }),
      prisma.listing.count({ where }),
    ]);

    res.json(paginatedResponse(listings, total, page, limit));
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/listings/pending — Pending approval queue.
 */
async function listPendingListings(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req.query);

    const where = { status: 'Pending', isDeleted: false };
    if (req.query.category) where.category = req.query.category;

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
        include: {
          brand: true,
          model: true,
          vehicleType: true,
          seller: { select: { id: true, name: true, email: true } },
          images: { orderBy: { sortOrder: 'asc' } },
        },
      }),
      prisma.listing.count({ where }),
    ]);

    res.json(paginatedResponse(listings, total, page, limit));
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/admin/listings/:id/approve — Approve a listing.
 */
async function approveListing(req, res, next) {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: req.params.id },
      include: { seller: { select: { email: true } } },
    });

    if (!listing || listing.isDeleted) {
      return res.status(404).json({ error: 'Listing not found.' });
    }

    if (listing.status !== 'Pending') {
      return res.status(400).json({ error: 'Only pending listings can be approved.' });
    }

    const updated = await prisma.listing.update({
      where: { id: req.params.id },
      data: {
        status: 'Approved',
        approvedAt: new Date(),
        approvedBy: req.user.id,
        rejectionReason: null,
      },
      include: { brand: true, model: true },
    });

    await createAuditLog({
      userId: req.user.id,
      action: 'LISTING_APPROVED',
      module: 'listings',
      recordId: listing.id,
      ipAddress: req.ip,
    });

    sendListingApprovedEmail(listing.seller.email, listing.title);

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/admin/listings/:id/reject — Reject a listing.
 */
async function rejectListing(req, res, next) {
  try {
    const { reason } = req.body;

    const listing = await prisma.listing.findUnique({
      where: { id: req.params.id },
      include: { seller: { select: { email: true } } },
    });

    if (!listing || listing.isDeleted) {
      return res.status(404).json({ error: 'Listing not found.' });
    }

    if (listing.status !== 'Pending') {
      return res.status(400).json({ error: 'Only pending listings can be rejected.' });
    }

    const updated = await prisma.listing.update({
      where: { id: req.params.id },
      data: {
        status: 'Rejected',
        rejectionReason: reason || null,
      },
      include: { brand: true, model: true },
    });

    await createAuditLog({
      userId: req.user.id,
      action: 'LISTING_REJECTED',
      module: 'listings',
      recordId: listing.id,
      ipAddress: req.ip,
    });

    sendListingRejectedEmail(listing.seller.email, listing.title, reason);

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/admin/listings/:id — Admin soft delete.
 */
async function adminSoftDelete(req, res, next) {
  try {
    const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });

    if (!listing || listing.isDeleted) {
      return res.status(404).json({ error: 'Listing not found.' });
    }

    await prisma.listing.update({
      where: { id: req.params.id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: req.user.id,
      },
    });

    await createAuditLog({
      userId: req.user.id,
      action: 'LISTING_SOFT_DELETE',
      module: 'listings',
      recordId: listing.id,
      ipAddress: req.ip,
    });

    res.json({ message: 'Listing moved to trash.' });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/admin/listings/:id/restore — Restore soft-deleted listing.
 */
async function restoreListing(req, res, next) {
  try {
    const listing = await prisma.listing.findUnique({ where: { id: req.params.id } });

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found.' });
    }

    if (!listing.isDeleted) {
      return res.status(400).json({ error: 'Listing is not in trash.' });
    }

    const updated = await prisma.listing.update({
      where: { id: req.params.id },
      data: {
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
      },
    });

    await createAuditLog({
      userId: req.user.id,
      action: 'LISTING_RESTORE',
      module: 'listings',
      recordId: listing.id,
      ipAddress: req.ip,
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/admin/listings/:id/force — Super Admin: permanent delete.
 */
async function forceDeleteListing(req, res, next) {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: req.params.id },
      include: {
        seller: { select: { email: true } },
        images: true,
      },
    });

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found.' });
    }

    const cloudinary = require('../config/cloudinary');
    for (const img of listing.images) {
      await cloudinary.uploader.destroy(img.publicId).catch(() => {});
    }

    await prisma.listing.delete({ where: { id: req.params.id } });

    await createAuditLog({
      userId: req.user.id,
      action: 'LISTING_FORCE_DELETE',
      module: 'listings',
      recordId: listing.id,
      ipAddress: req.ip,
    });

    sendListingForceDeletedEmail(listing.seller.email, listing.title);

    res.json({ message: 'Listing permanently deleted.' });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/listings/trash — List trashed listings.
 */
async function listTrash(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req.query);

    const where = { isDeleted: true };

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy: { deletedAt: 'desc' },
        skip,
        take: limit,
        include: {
          brand: true,
          model: true,
          seller: { select: { id: true, name: true, email: true } },
          deletedByUser: { select: { id: true, name: true } },
          images: { where: { isPrimary: true }, take: 1 },
        },
      }),
      prisma.listing.count({ where }),
    ]);

    res.json(paginatedResponse(listings, total, page, limit));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listAllListings,
  listPendingListings,
  approveListing,
  rejectListing,
  adminSoftDelete,
  restoreListing,
  forceDeleteListing,
  listTrash,
};
