const prisma = require('../config/db');
const { parsePagination, paginatedResponse } = require('../utils/pagination');
const { createAuditLog } = require('../middleware/audit.middleware');
const { sendEmail } = require('../utils/email');

/**
 * POST /api/inquiries/:listingId — Public: submit an inquiry (no login required).
 */
async function createInquiry(req, res, next) {
  try {
    const listingId = req.params.listingId;
    const { name, email, phone, message } = req.body;

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        brand: true,
        model: true,
        seller: { select: { id: true, name: true, email: true } },
        images: { where: { isPrimary: true }, take: 1 },
      },
    });

    if (!listing || listing.isDeleted || listing.status !== 'Approved') {
      return res.status(404).json({ error: 'Listing not found.' });
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        name,
        email,
        phone: phone || null,
        listingId,
        message: message || null,
        userId: req.user?.id || null,
      },
    });

    // Email admin(s) about new inquiry
    const admins = await prisma.user.findMany({
      where: { role: { name: { in: ['Admin', 'Super Admin'] } } },
      select: { email: true },
    });

    const adminEmails = admins.map(a => a.email);
    if (adminEmails.length > 0) {
      const imgUrl = listing.images[0]?.url || '';
      await sendEmail(
        adminEmails.join(','),
        `New Inquiry: ${listing.title}`,
        `<h2>New Product Inquiry</h2>
         <p><strong>Listing:</strong> ${listing.title}</p>
         ${imgUrl ? `<img src="${imgUrl}" alt="${listing.title}" style="max-width:300px;border-radius:8px;" />` : ''}
         <p><strong>From:</strong> ${name} (${email})</p>
         ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
         ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
         <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>`,
      );
    }

    res.status(201).json({ message: 'Inquiry submitted successfully.', id: inquiry.id });
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
          listing: {
            select: {
              id: true, title: true, slug: true, price: true, category: true,
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
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/inquiries/admin/count — Admin: count of new inquiries.
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
  listInquiries,
  updateInquiryStatus,
  getNewInquiryCount,
};
