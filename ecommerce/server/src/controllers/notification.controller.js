const prisma = require('../config/db');
const { parsePagination, paginatedResponse } = require('../utils/pagination');

/**
 * GET /api/notifications — List notifications for the authenticated user.
 */
async function listNotifications(req, res, next) {
  try {
    const { page, limit, skip } = parsePagination(req.query);

    const where = { userId: req.user.id };

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
    ]);

    res.json(paginatedResponse(notifications, total, page, limit));
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/notifications/unread-count — Count of unread notifications.
 */
async function getUnreadCount(req, res, next) {
  try {
    const count = await prisma.notification.count({
      where: { userId: req.user.id, isRead: false },
    });
    res.json({ count });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/notifications/:id/read — Mark a single notification as read.
 */
async function markAsRead(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const notification = await prisma.notification.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found.' });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/notifications/read-all — Mark all notifications as read.
 */
async function markAllRead(req, res, next) {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true },
    });

    res.json({ message: 'All notifications marked as read.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listNotifications,
  getUnreadCount,
  markAsRead,
  markAllRead,
};
