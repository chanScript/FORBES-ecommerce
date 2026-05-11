const prisma = require('../config/db');
const { parsePagination, paginatedResponse } = require('../utils/pagination');
const { createAuditLog } = require('../middleware/audit.middleware');
const { sendSellerRequestApprovedEmail, sendSellerRequestRejectedEmail } = require('../utils/email');

/**
 * POST /api/seller-requests
 * User submits a request to become a seller.
 */
async function submitRequest(req, res, next) {
  try {
    const { reason } = req.body;

    // Prevent duplicate pending requests
    const existing = await prisma.sellerRequest.findFirst({
      where: { userId: req.user.id, status: 'Pending' },
    });

    if (existing) {
      return res.status(409).json({ error: 'You already have a pending seller request.' });
    }

    // Prevent users who are already sellers or above
    if (['Seller', 'Admin', 'Super Admin'].includes(req.user.role.name)) {
      return res.status(400).json({ error: 'You already have seller or higher privileges.' });
    }

    const request = await prisma.sellerRequest.create({
      data: {
        userId: req.user.id,
        reason: reason || null,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    await createAuditLog({
      userId: req.user.id,
      action: 'SELLER_REQUEST_SUBMITTED',
      module: 'seller_requests',
      recordId: String(request.id),
      ipAddress: req.ip,
    });

    res.status(201).json(request);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/seller-requests/my
 * User checks their latest seller request status.
 */
async function getMyRequest(req, res, next) {
  try {
    const request = await prisma.sellerRequest.findFirst({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        reviewer: { select: { id: true, name: true } },
      },
    });

    res.json({ request });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/seller-requests
 * Admin lists all seller requests with optional status filter.
 */
async function listRequests(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const where = {};

    if (req.query.status) {
      where.status = req.query.status;
    }

    const [requests, total] = await Promise.all([
      prisma.sellerRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: { select: { id: true, name: true, email: true, phone: true, createdAt: true } },
          reviewer: { select: { id: true, name: true } },
        },
      }),
      prisma.sellerRequest.count({ where }),
    ]);

    res.json(paginatedResponse(requests, total, page, limit));
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/admin/seller-requests/:id/approve
 * Admin approves a seller request — user role is updated to Seller.
 */
async function approveRequest(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);

    const request = await prisma.sellerRequest.findUnique({
      where: { id },
      include: { user: { include: { role: true } } },
    });

    if (!request) {
      return res.status(404).json({ error: 'Seller request not found.' });
    }

    if (request.status !== 'Pending') {
      return res.status(400).json({ error: 'This request has already been reviewed.' });
    }

    const sellerRole = await prisma.role.findUnique({ where: { name: 'Seller' } });
    if (!sellerRole) {
      return res.status(500).json({ error: 'Seller role not found. Run seeders.' });
    }

    // Transaction: approve request + update user role
    const [updated] = await prisma.$transaction([
      prisma.sellerRequest.update({
        where: { id },
        data: {
          status: 'Approved',
          reviewedBy: req.user.id,
          reviewedAt: new Date(),
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.user.update({
        where: { id: request.userId },
        data: { roleId: sellerRole.id },
      }),
    ]);

    await createAuditLog({
      userId: req.user.id,
      action: 'SELLER_REQUEST_APPROVED',
      module: 'seller_requests',
      recordId: String(id),
      ipAddress: req.ip,
      metadata: { userId: request.userId },
    });

    // Send email notification
    await sendSellerRequestApprovedEmail(request.user.email, request.user.name);

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/admin/seller-requests/:id/reject
 * Admin rejects a seller request.
 */
async function rejectRequest(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const { adminNote } = req.body;

    const request = await prisma.sellerRequest.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!request) {
      return res.status(404).json({ error: 'Seller request not found.' });
    }

    if (request.status !== 'Pending') {
      return res.status(400).json({ error: 'This request has already been reviewed.' });
    }

    const updated = await prisma.sellerRequest.update({
      where: { id },
      data: {
        status: 'Rejected',
        adminNote: adminNote || null,
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    await createAuditLog({
      userId: req.user.id,
      action: 'SELLER_REQUEST_REJECTED',
      module: 'seller_requests',
      recordId: String(id),
      ipAddress: req.ip,
      metadata: { userId: request.userId, reason: adminNote },
    });

    // Send email notification
    await sendSellerRequestRejectedEmail(request.user.email, request.user.name, adminNote);

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  submitRequest,
  getMyRequest,
  listRequests,
  approveRequest,
  rejectRequest,
};
