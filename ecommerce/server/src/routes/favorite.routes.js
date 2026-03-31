const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { listFavorites, addFavorite, removeFavorite } = require('../controllers/favorite.controller');

// All favorite routes require authentication
router.use(authenticate);

// GET /api/favorites
router.get('/', listFavorites);

// POST /api/favorites/:carId
router.post('/:carId', addFavorite);

// DELETE /api/favorites/:carId
router.delete('/:carId', removeFavorite);

module.exports = router;
