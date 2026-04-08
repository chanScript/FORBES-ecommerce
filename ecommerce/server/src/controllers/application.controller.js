const prisma = require('../config/db');
const { parsePagination, paginatedResponse } = require('../utils/pagination');
const { sendEmail } = require('../utils/email');

/**
 * POST /api/applications — Public: submit a service application.
 */
async function createApplication(req, res, next) {
  try {
    const { fullName, email, address, serviceType } = req.body;

    const application = await prisma.serviceApplication.create({
      data: { fullName, email, address, serviceType },
    });

    // Non-blocking email notifications
    setImmediate(() => {
      sendEmail(
        email,
        'We Received Your Application',
        `<h2>Thank You, ${fullName}!</h2>
         <p>We have received your <strong>${serviceType.replace(/-/g, ' ')}</strong> application and our team will contact you shortly.</p>`
      );
    });

    setImmediate(async () => {
      try {
        const adminRole = await prisma.role.findFirst({ where: { name: 'Admin' } });
        if (adminRole) {
          const admins = await prisma.user.findMany({ where: { roleId: adminRole.id }, select: { email: true } });
          for (const admin of admins) {
            sendEmail(
              admin.email,
              `New Service Application: ${serviceType}`,
              `<h2>New Application Received</h2>
               <p><strong>Name:</strong> ${fullName}</p>
               <p><strong>Email:</strong> ${email}</p>
               <p><strong>Service:</strong> ${serviceType.replace(/-/g, ' ')}</p>`
            );
          }
        }
      } catch (err) {
        console.error('[Application] Admin notification failed:', err.message);
      }
    });

    res.status(201).json({ message: 'Application submitted successfully.', id: application.id });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/applications/admin — Admin: paginated list of applications.
 */
async function listApplications(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { serviceType, status } = req.query;

    const where = {};
    if (serviceType) where.serviceType = serviceType;
    if (status) where.status = status;

    const [applications, total] = await Promise.all([
      prisma.serviceApplication.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.serviceApplication.count({ where }),
    ]);

    res.json(paginatedResponse(applications, total, page, limit));
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/applications/admin/:id/status — Admin: update application status.
 */
async function updateApplicationStatus(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;

    const application = await prisma.serviceApplication.findUnique({ where: { id } });
    if (!application) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    await prisma.serviceApplication.update({
      where: { id },
      data: { status },
    });

    res.json({ message: `Application status updated to ${status}.` });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/applications/admin/count — Admin: count of new applications.
 */
async function getApplicationCount(req, res, next) {
  try {
    const count = await prisma.serviceApplication.count({ where: { status: 'New' } });
    res.json({ count });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/applications/admin/:id — Admin: delete an application.
 */
async function deleteApplication(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const application = await prisma.serviceApplication.findUnique({ where: { id } });
    if (!application) {
      return res.status(404).json({ error: 'Application not found.' });
    }
    await prisma.serviceApplication.delete({ where: { id } });
    res.json({ message: 'Application deleted.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createApplication,
  listApplications,
  updateApplicationStatus,
  getApplicationCount,
  deleteApplication,
};
