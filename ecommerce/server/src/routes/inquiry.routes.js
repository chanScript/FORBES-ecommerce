const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { rbac } = require('../middleware/rbac.middleware');
const {
  createInquiry,
  getMyInquiries,
  checkInquiry,
  listInquiries,
  updateInquiryStatus,
  getNewInquiryCount,
} = require('../controllers/inquiry.controller');

// ---- Authenticated User Routes ----
router.post('/:carId', authenticate, createInquiry);
router.get('/my', authenticate, getMyInquiries);
router.get('/check/:carId', authenticate, checkInquiry);

// ---- Admin Routes ----
router.get('/admin', authenticate, rbac('Admin', 'Super Admin'), listInquiries);
router.get('/admin/count', authenticate, rbac('Admin', 'Super Admin'), getNewInquiryCount);
router.patch('/admin/:id/status', authenticate, rbac('Admin', 'Super Admin'), updateInquiryStatus);

module.exports = router;
