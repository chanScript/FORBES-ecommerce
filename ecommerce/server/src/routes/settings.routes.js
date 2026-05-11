const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { rbac } = require('../middleware/rbac.middleware');
const { getSetting, listSettings, upsertSetting } = require('../controllers/settings.controller');

// All routes require Super Admin
router.use(authenticate, rbac('Super Admin'));

router.get('/', listSettings);
router.get('/:key', getSetting);
router.put('/:key', upsertSetting);

module.exports = router;
