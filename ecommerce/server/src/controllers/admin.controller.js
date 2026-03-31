const prisma = require('../config/db');
const { parsePagination, paginatedResponse } = require('../utils/pagination');
const { createAuditLog } = require('../middleware/audit.middleware');
const {
  sendListingApprovedEmail,
  sendListingRejectedEmail,
  sendListingForceDeletedEmail,
} = require('../utils/email');

/**
 * GET /api/admin/cars — All listings (any status).
 */
async function listAllCars(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req.query);

    const where = { isDeleted: false };
    if (req.query.status) where.status = req.query.status;

    const [cars, total] = await Promise.all([
      prisma.car.findMany({
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
      prisma.car.count({ where }),
    ]);

    res.json(paginatedResponse(cars, total, page, limit));
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/cars/pending — Pending approval queue.
 */
async function listPendingCars(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req.query);

    const where = { status: 'Pending', isDeleted: false };

    const [cars, total] = await Promise.all([
      prisma.car.findMany({
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
      prisma.car.count({ where }),
    ]);

    res.json(paginatedResponse(cars, total, page, limit));
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/admin/cars/:id/approve — Approve a listing.
 */
async function approveCar(req, res, next) {
  try {
    const car = await prisma.car.findUnique({
      where: { id: req.params.id },
      include: { seller: { select: { email: true } } },
    });

    if (!car || car.isDeleted) {
      return res.status(404).json({ error: 'Car not found.' });
    }

    if (car.status !== 'Pending') {
      return res.status(400).json({ error: 'Only pending listings can be approved.' });
    }

    const updated = await prisma.car.update({
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
      action: 'CAR_APPROVED',
      module: 'cars',
      recordId: car.id,
      ipAddress: req.ip,
    });

    // Email notification to seller
    sendListingApprovedEmail(car.seller.email, car.title);

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/admin/cars/:id/reject — Reject a listing.
 */
async function rejectCar(req, res, next) {
  try {
    const { reason } = req.body;

    const car = await prisma.car.findUnique({
      where: { id: req.params.id },
      include: { seller: { select: { email: true } } },
    });

    if (!car || car.isDeleted) {
      return res.status(404).json({ error: 'Car not found.' });
    }

    if (car.status !== 'Pending') {
      return res.status(400).json({ error: 'Only pending listings can be rejected.' });
    }

    const updated = await prisma.car.update({
      where: { id: req.params.id },
      data: {
        status: 'Rejected',
        rejectionReason: reason || null,
      },
      include: { brand: true, model: true },
    });

    await createAuditLog({
      userId: req.user.id,
      action: 'CAR_REJECTED',
      module: 'cars',
      recordId: car.id,
      ipAddress: req.ip,
    });

    sendListingRejectedEmail(car.seller.email, car.title, reason);

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/admin/cars/:id — Admin soft delete.
 */
async function adminSoftDelete(req, res, next) {
  try {
    const car = await prisma.car.findUnique({ where: { id: req.params.id } });

    if (!car || car.isDeleted) {
      return res.status(404).json({ error: 'Car not found.' });
    }

    await prisma.car.update({
      where: { id: req.params.id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: req.user.id,
      },
    });

    await createAuditLog({
      userId: req.user.id,
      action: 'CAR_SOFT_DELETE',
      module: 'cars',
      recordId: car.id,
      ipAddress: req.ip,
    });

    res.json({ message: 'Listing moved to trash.' });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/admin/cars/:id/restore — Restore soft-deleted listing.
 */
async function restoreCar(req, res, next) {
  try {
    const car = await prisma.car.findUnique({ where: { id: req.params.id } });

    if (!car) {
      return res.status(404).json({ error: 'Car not found.' });
    }

    if (!car.isDeleted) {
      return res.status(400).json({ error: 'Car is not in trash.' });
    }

    const updated = await prisma.car.update({
      where: { id: req.params.id },
      data: {
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
      },
    });

    await createAuditLog({
      userId: req.user.id,
      action: 'CAR_RESTORE',
      module: 'cars',
      recordId: car.id,
      ipAddress: req.ip,
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/admin/cars/:id/force — Super Admin: permanent delete.
 */
async function forceDeleteCar(req, res, next) {
  try {
    const car = await prisma.car.findUnique({
      where: { id: req.params.id },
      include: {
        seller: { select: { email: true } },
        images: true,
      },
    });

    if (!car) {
      return res.status(404).json({ error: 'Car not found.' });
    }

    // Delete images from Cloudinary
    const cloudinary = require('../config/cloudinary');
    for (const img of car.images) {
      await cloudinary.uploader.destroy(img.publicId).catch(() => {});
    }

    // Permanent delete (cascades images, favorites)
    await prisma.car.delete({ where: { id: req.params.id } });

    await createAuditLog({
      userId: req.user.id,
      action: 'CAR_FORCE_DELETE',
      module: 'cars',
      recordId: car.id,
      ipAddress: req.ip,
    });

    sendListingForceDeletedEmail(car.seller.email, car.title);

    res.json({ message: 'Listing permanently deleted.' });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/cars/trash — List trashed listings.
 */
async function listTrash(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req.query);

    const where = { isDeleted: true };

    const [cars, total] = await Promise.all([
      prisma.car.findMany({
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
      prisma.car.count({ where }),
    ]);

    res.json(paginatedResponse(cars, total, page, limit));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listAllCars,
  listPendingCars,
  approveCar,
  rejectCar,
  adminSoftDelete,
  restoreCar,
  forceDeleteCar,
  listTrash,
};
