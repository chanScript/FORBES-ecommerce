const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { rbac } = require('../middleware/rbac.middleware');
const {
  listAllCars,
  listPendingCars,
  approveCar,
  rejectCar,
  adminSoftDelete,
  restoreCar,
  forceDeleteCar,
  listTrash,
} = require('../controllers/admin.controller');

// All admin routes require Admin or Super Admin
router.use(authenticate, rbac('Admin', 'Super Admin'));

// GET /api/admin/cars
router.get('/cars', listAllCars);

// GET /api/admin/cars/pending
router.get('/cars/pending', listPendingCars);

// GET /api/admin/cars/trash
router.get('/cars/trash', listTrash);

// PATCH /api/admin/cars/:id/approve
router.patch('/cars/:id/approve', approveCar);

// PATCH /api/admin/cars/:id/reject
router.patch('/cars/:id/reject', rejectCar);

// PATCH /api/admin/cars/:id/restore
router.patch('/cars/:id/restore', restoreCar);

// DELETE /api/admin/cars/:id (soft delete)
router.delete('/cars/:id', adminSoftDelete);

// DELETE /api/admin/cars/:id/force (Super Admin only)
router.delete('/cars/:id/force', rbac('Super Admin'), forceDeleteCar);

module.exports = router;
