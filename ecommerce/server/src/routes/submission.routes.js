const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');
const { upload } = require('../middleware/upload.middleware');
const { createSubmission } = require('../controllers/submission.controller');

// POST /api/submissions — Public: anonymous seller submission
router.post(
  '/',
  upload.array('images', 10),
  [
    body('fullName').trim().notEmpty().withMessage('Full name is required.'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
    body('phone').trim().notEmpty().withMessage('Phone number is required.'),
    body('category').isIn(['Vehicle', 'RealEstate']).withMessage('Valid category is required.'),
    body('vehicleSubtype').optional().isIn(['Car', 'Motorcycle', 'Truck']),
    body('realEstateSubtype').optional().isIn(['HouseAndLot', 'VacantLot', 'CommercialProperty']),
    body('propertyDetails').trim().notEmpty().withMessage('Property details are required.'),
    body('price').optional().isFloat({ gt: 0 }),
  ],
  validate,
  createSubmission
);

module.exports = router;
