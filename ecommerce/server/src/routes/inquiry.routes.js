const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');
const { authenticate, optionalAuth } = require('../middleware/auth.middleware');
const { rbac } = require('../middleware/rbac.middleware');
const {
  createInquiry,
  listInquiries,
  updateInquiryStatus,
  getNewInquiryCount,
  deleteInquiry,
} = require('../controllers/inquiry.controller');

// ---- Public: submit an inquiry (no login required) ----
router.post(
  '/:listingId',
  optionalAuth,
  [
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
    body('phone').optional().trim(),
    body('message').optional().trim(),
  ],
  validate,
  createInquiry
);

// ---- Admin Routes ----
router.get('/admin', authenticate, rbac('Admin', 'Super Admin'), listInquiries);
router.get('/admin/count', authenticate, rbac('Admin', 'Super Admin'), getNewInquiryCount);
router.patch('/admin/:id/status', authenticate, rbac('Admin', 'Super Admin'), updateInquiryStatus);
router.delete('/admin/:id', authenticate, rbac('Admin', 'Super Admin'), deleteInquiry);

module.exports = router;
