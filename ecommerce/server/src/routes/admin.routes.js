const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { rbac } = require('../middleware/rbac.middleware');
const {
  listAllListings,
  listPendingListings,
  approveListing,
  rejectListing,
  adminSoftDelete,
  restoreListing,
  forceDeleteListing,
  listTrash,
  markAsSold,
} = require('../controllers/admin.controller');
const {
  listSubmissions,
  getSubmission,
  approveSubmission,
  rejectSubmission,
  convertToListing,
  getPendingCount,
} = require('../controllers/submission.controller');

// All admin routes require Admin or Super Admin
router.use(authenticate, rbac('Admin', 'Super Admin'));

// Listing management
router.get('/listings', listAllListings);
router.get('/listings/pending', listPendingListings);
router.get('/listings/trash', listTrash);
router.patch('/listings/:id/approve', approveListing);
router.patch('/listings/:id/reject', rejectListing);
router.patch('/listings/:id/restore', restoreListing);
router.patch('/listings/:id/sold', markAsSold);
router.delete('/listings/:id', adminSoftDelete);
router.delete('/listings/:id/force', rbac('Super Admin'), forceDeleteListing);

// Seller submission management
router.get('/submissions', listSubmissions);
router.get('/submissions/count', getPendingCount);
router.get('/submissions/:id', getSubmission);
router.patch('/submissions/:id/approve', approveSubmission);
router.patch('/submissions/:id/reject', rejectSubmission);
router.post('/submissions/:id/convert', convertToListing);

module.exports = router;
