const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { listFavorites, addFavorite, removeFavorite } = require('../controllers/favorite.controller');

// All favorite routes require authentication
router.use(authenticate);

// GET /api/favorites
router.get('/', listFavorites);

// POST /api/favorites/:listingId
router.post('/:listingId', addFavorite);

// DELETE /api/favorites/:listingId
router.delete('/:listingId', removeFavorite);

module.exports = router;
