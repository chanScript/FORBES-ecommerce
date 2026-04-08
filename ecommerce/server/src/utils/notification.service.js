const prisma = require('../config/db');

/**
 * Create a notification and broadcast it via Socket.io.
 *
 * @param {object} opts
 * @param {string} opts.type       - NotificationType enum value
 * @param {string} opts.title      - Short title
 * @param {string} opts.message    - Descriptive message
 * @param {object} [opts.metadata] - Optional JSON metadata (IDs, links, etc.)
 * @param {string} [opts.userId]   - Target user ID (if null, notifies ALL admins)
 * @param {object} opts.io         - Socket.io server instance
 */
async function createNotification({ type, title, message, metadata = null, userId = null, io }) {
  try {
    // If a specific user is targeted, create one notification
    if (userId) {
      const notification = await prisma.notification.create({
        data: { userId, type, title, message, metadata },
      });

      if (io) {
        io.to(`user:${userId}`).emit('new_notification', notification);
      }

      return [notification];
    }

    // Otherwise, notify ALL Admin + Super Admin users
    const admins = await prisma.user.findMany({
      where: { role: { name: { in: ['Admin', 'Super Admin'] } } },
      select: { id: true },
    });

    const notifications = [];
    for (const admin of admins) {
      const notification = await prisma.notification.create({
        data: { userId: admin.id, type, title, message, metadata },
      });
      notifications.push(notification);

      if (io) {
        io.to(`user:${admin.id}`).emit('new_notification', notification);
      }
    }

    return notifications;
  } catch (err) {
    console.error('[NotificationService] Failed to create notification:', err.message);
    return [];
  }
}

module.exports = { createNotification };
