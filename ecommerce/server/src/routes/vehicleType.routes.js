const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const { rbac } = require('../middleware/rbac.middleware');
const { listVehicleTypes, createVehicleType, deleteVehicleType } = require('../controllers/vehicleType.controller');

// GET /api/vehicle-types
router.get('/', listVehicleTypes);

// POST /api/vehicle-types (Admin + Seller)
router.post(
  '/',
  authenticate,
  rbac('Admin', 'Super Admin', 'Seller'),
  [body('name').trim().notEmpty().withMessage('Vehicle type name is required.')],
  validate,
  createVehicleType
);

// DELETE /api/vehicle-types/:id (Admin + Seller)
router.delete(
  '/:id',
  authenticate,
  rbac('Admin', 'Super Admin', 'Seller'),
  deleteVehicleType
);

module.exports = router;
