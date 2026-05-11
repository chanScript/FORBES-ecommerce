const router = require('express').Router();
const { getFilterOptions } = require('../controllers/filter.controller');

// GET /api/filters/options — Public: dynamic filter metadata
router.get('/options', getFilterOptions);

module.exports = router;
