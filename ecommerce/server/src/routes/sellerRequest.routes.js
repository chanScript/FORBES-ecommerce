const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const { rbac } = require('../middleware/rbac.middleware');
const {
  submitRequest,
  getMyRequest,
  listRequests,
  approveRequest,
  rejectRequest,
} = require('../controllers/sellerRequest.controller');

// ---- User Routes ----

// POST /api/seller-requests — Submit a request to become a seller
router.post(
  '/',
  authenticate,
  rbac('User'),
  [body('reason').optional().trim()],
  validate,
  submitRequest
);

// GET /api/seller-requests/my — Check own request status
router.get('/my', authenticate, getMyRequest);

// ---- Admin Routes ----

// GET /api/seller-requests/admin — List all seller requests (admin)
router.get(
  '/admin',
  authenticate,
  rbac('Admin', 'Super Admin'),
  listRequests
);

// PATCH /api/seller-requests/:id/approve — Approve a seller request
router.patch(
  '/:id/approve',
  authenticate,
  rbac('Admin', 'Super Admin'),
  approveRequest
);

// PATCH /api/seller-requests/:id/reject — Reject a seller request
router.patch(
  '/:id/reject',
  authenticate,
  rbac('Admin', 'Super Admin'),
  [body('adminNote').optional().trim()],
  validate,
  rejectRequest
);

module.exports = router;
