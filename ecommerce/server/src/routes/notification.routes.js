const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { rbac } = require('../middleware/rbac.middleware');
const {
  listNotifications,
  getUnreadCount,
  markAsRead,
  markAllRead,
} = require('../controllers/notification.controller');

// All routes require authentication + Admin/Super Admin role
router.use(authenticate, rbac('Admin', 'Super Admin'));

router.get('/', listNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', markAsRead);

module.exports = router;
