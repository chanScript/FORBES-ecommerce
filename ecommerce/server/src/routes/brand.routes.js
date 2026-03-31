const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const { rbac } = require('../middleware/rbac.middleware');
const { listBrands, getModelsByBrand, createBrand, updateBrand, deleteBrand } = require('../controllers/brand.controller');

// GET /api/brands
router.get('/', listBrands);

// GET /api/brands/:slug/models
router.get('/:slug/models', getModelsByBrand);

// POST /api/brands (Admin + Seller)
router.post(
  '/',
  authenticate,
  rbac('Admin', 'Super Admin', 'Seller'),
  [
    body('name').trim().notEmpty().withMessage('Brand name is required.'),
    body('logoUrl').optional().isURL().withMessage('Logo URL must be valid.'),
  ],
  validate,
  createBrand
);

// PUT /api/brands/:id (Admin only)
router.put(
  '/:id',
  authenticate,
  rbac('Admin', 'Super Admin'),
  [
    body('name').optional().trim().notEmpty(),
    body('logoUrl').optional(),
  ],
  validate,
  updateBrand
);

// DELETE /api/brands/:id (Admin + Seller)
router.delete(
  '/:id',
  authenticate,
  rbac('Admin', 'Super Admin', 'Seller'),
  deleteBrand
);

module.exports = router;
