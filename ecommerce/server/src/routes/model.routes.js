const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const { rbac } = require('../middleware/rbac.middleware');
const { listModels, createModel, deleteModel } = require('../controllers/model.controller');

// GET /api/models
router.get('/', listModels);

// POST /api/models (Admin + Seller)
router.post(
  '/',
  authenticate,
  rbac('Admin', 'Super Admin', 'Seller'),
  [
    body('name').trim().notEmpty().withMessage('Model name is required.'),
    body('brandId').isInt({ gt: 0 }).withMessage('Brand is required.'),
  ],
  validate,
  createModel
);

// DELETE /api/models/:id (Admin + Seller)
router.delete(
  '/:id',
  authenticate,
  rbac('Admin', 'Super Admin', 'Seller'),
  deleteModel
);

module.exports = router;
