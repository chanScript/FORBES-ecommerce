const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');
const { authenticate, optionalAuth } = require('../middleware/auth.middleware');
const { rbac } = require('../middleware/rbac.middleware');
const { upload } = require('../middleware/upload.middleware');
const {
  listCars,
  getCarBySlug,
  createCar,
  getMyListings,
  updateCar,
  deleteCar,
  uploadImages,
  deleteImage,
  getSellerProfile,
} = require('../controllers/car.controller');

// ---- Public Routes ----

// GET /api/cars — Browse approved cars (with optional auth for favorites)
router.get('/', optionalAuth, listCars);

// GET /api/cars/my-listings — Seller's own listings (must come before :slug)
router.get('/my-listings', authenticate, rbac('Seller', 'Admin', 'Super Admin'), getMyListings);

// GET /api/cars/seller/:sellerId — Public seller profile
router.get('/seller/:sellerId', getSellerProfile);

// GET /api/cars/:slug — Single car details
router.get('/:slug', optionalAuth, getCarBySlug);

// ---- Seller Routes ----

// POST /api/cars — Submit listing
router.post(
  '/',
  authenticate,
  rbac('Seller', 'Admin', 'Super Admin'),
  [
    body('price').isFloat({ gt: 0 }).withMessage('Price must be a positive number.'),
    body('year').isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Invalid year.'),
    body('mileage').isInt({ min: 0 }).withMessage('Mileage must be a non-negative number.'),
    body('fuelType').isIn(['Gasoline', 'Diesel', 'Electric', 'Hybrid', 'LPG']).withMessage('Invalid fuel type.'),
    body('transmission').isIn(['Automatic', 'Manual']).withMessage('Invalid transmission.'),
    body('city').trim().notEmpty().withMessage('City is required.'),
    body('brandId').isInt({ gt: 0 }).withMessage('Brand is required.'),
    body('modelId').isInt({ gt: 0 }).withMessage('Model is required.'),
    body('vehicleTypeId').isInt({ gt: 0 }).withMessage('Vehicle type is required.'),
    body('engineCapacity').optional().isInt({ gt: 0 }),
    body('color').optional().trim(),
    body('seats').optional().isInt({ gt: 0 }),
    body('condition').optional().isIn(['New', 'Used']),
    body('description').optional().trim(),
  ],
  validate,
  createCar
);

// PUT /api/cars/:id — Edit own listing
router.put('/:id', authenticate, rbac('Seller', 'Admin', 'Super Admin'), updateCar);

// DELETE /api/cars/:id — Soft-delete own listing
router.delete('/:id', authenticate, rbac('Seller', 'Admin', 'Super Admin'), deleteCar);

// POST /api/cars/:id/images — Upload images
router.post(
  '/:id/images',
  authenticate,
  rbac('Seller', 'Admin', 'Super Admin'),
  upload.array('images', 10),
  uploadImages
);

// DELETE /api/cars/images/:imageId — Delete single image
router.delete(
  '/images/:imageId',
  authenticate,
  rbac('Seller', 'Admin', 'Super Admin'),
  deleteImage
);

module.exports = router;
