const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');
const { authenticate, optionalAuth } = require('../middleware/auth.middleware');
const { rbac } = require('../middleware/rbac.middleware');
const { upload } = require('../middleware/upload.middleware');
const {
  listListings,
  getListingBySlug,
  createListing,
  getMyListings,
  updateListing,
  deleteListing,
  uploadImages,
  deleteImage,
  getSellerProfile,
  getSimilarListings,
} = require('../controllers/listing.controller');

// ---- Public Routes ----
router.get('/', optionalAuth, listListings);
router.get('/my-listings', authenticate, rbac('Seller', 'Admin', 'Super Admin'), getMyListings);
router.get('/seller/:sellerId', getSellerProfile);
router.get('/:id/similar', getSimilarListings);
router.get('/:slug', optionalAuth, getListingBySlug);

// ---- Seller / Admin Routes ----
router.post(
  '/',
  authenticate,
  rbac('Seller', 'Admin', 'Super Admin'),
  [
    body('category').isIn(['Vehicle', 'RealEstate']),
    body('price').isFloat({ gt: 0 }),
    body('city').trim().notEmpty(),
    body('vehicleSubtype').optional().isIn(['Car', 'Motorcycle', 'Truck']),
    body('realEstateSubtype').optional().isIn(['HouseAndLot', 'VacantLot', 'CommercialProperty']),
    body('condition').optional().isIn(['New', 'Used']),
    body('description').optional().trim(),
    // Vehicle optional fields
    body('year').optional().isInt({ min: 1900, max: new Date().getFullYear() + 1 }),
    body('mileage').optional().isInt({ min: 0 }),
    body('fuelType').optional().isIn(['Gasoline', 'Diesel', 'Electric', 'Hybrid', 'LPG']),
    body('transmission').optional().isIn(['Automatic', 'Manual']),
    body('brand').optional().trim(),
    body('model').optional().trim(),
    body('bodyType').optional().trim(),
    body('engineCapacity').optional().isInt({ gt: 0 }),
    body('color').optional().trim(),
    body('seats').optional().isInt({ gt: 0 }),
    body('engineType').optional().trim(),
    body('horsepower').optional().isInt({ min: 0 }),
    body('torque').optional().isInt({ min: 0 }),
    body('fuelEconomy').optional().isFloat({ min: 0 }),
    body('topSpeed').optional().isInt({ min: 0 }),
    body('variant').optional().trim(),
    body('interiorColor').optional().trim(),
    body('drivetrain').optional().isIn(['FWD', 'RWD', 'AWD', '4WD']),
    body('plateNumber').optional().trim(),
    body('vinNumber').optional().trim(),
    body('overallCondition').optional().isIn(['Excellent', 'Good', 'Fair', 'Poor']),
    body('previousOwners').optional().isInt({ min: 0 }),
    body('lastMaintenanceDate').optional().trim(),
    body('tiresCondition').optional().trim(),
    body('knownIssues').optional().trim(),
    body('negotiable').optional().isBoolean(),
    body('reasonForSelling').optional().trim(),
    body('viewingAvailability').optional().trim(),
    // Real estate optional fields
    body('lotArea').optional().isFloat({ gt: 0 }),
    body('floorArea').optional().isFloat({ gt: 0 }),
    body('bedrooms').optional().isInt({ min: 0 }),
    body('bathrooms').optional().isInt({ min: 0 }),
    body('parkingSpaces').optional().isInt({ min: 0 }),
    body('furnishingStatus').optional().isIn(['Unfurnished', 'SemiFurnished', 'FullyFurnished']),
    body('amenities').optional().trim(),
    body('propertyAge').optional().isInt({ min: 0 }),
    body('titleType').optional().trim(),
  ],
  validate,
  createListing
);

router.put('/:id', authenticate, rbac('Seller', 'Admin', 'Super Admin'), updateListing);
router.delete('/:id', authenticate, rbac('Seller', 'Admin', 'Super Admin'), deleteListing);

router.post(
  '/:id/images',
  authenticate,
  rbac('Seller', 'Admin', 'Super Admin'),
  upload.array('images', 10),
  uploadImages
);

router.delete(
  '/images/:imageId',
  authenticate,
  rbac('Seller', 'Admin', 'Super Admin'),
  deleteImage
);

module.exports = router;
