const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const { rbac } = require('../middleware/rbac.middleware');
const {
  createApplication,
  listApplications,
  updateApplicationStatus,
  getApplicationCount,
  deleteApplication,
} = require('../controllers/application.controller');

// POST /api/applications — Public: submit application
router.post(
  '/',
  [
    body('fullName').trim().notEmpty().withMessage('Full name is required.'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
    body('address').trim().notEmpty().withMessage('Complete address is required.'),
    body('serviceType').trim().notEmpty().withMessage('Service type is required.'),
  ],
  validate,
  createApplication
);

// Admin routes
router.use('/admin', authenticate, rbac('Admin', 'Super Admin'));
router.get('/admin', listApplications);
router.get('/admin/count', getApplicationCount);
router.patch(
  '/admin/:id/status',
  [body('status').isIn(['New', 'Contacted', 'Closed']).withMessage('Invalid status.')],
  validate,
  updateApplicationStatus
);
router.delete('/admin/:id', deleteApplication);

module.exports = router;
