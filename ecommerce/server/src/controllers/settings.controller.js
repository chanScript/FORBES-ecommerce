const prisma = require('../config/db');

/**
 * GET /api/settings/:key — Get a system setting by key.
 */
async function getSetting(req, res, next) {
  try {
    const { key } = req.params;
    const setting = await prisma.systemSetting.findUnique({ where: { key } });

    if (!setting) {
      return res.status(404).json({ error: 'Setting not found.' });
    }

    res.json(setting);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/settings — List all system settings.
 */
async function listSettings(req, res, next) {
  try {
    const settings = await prisma.systemSetting.findMany({
      orderBy: { key: 'asc' },
    });
    res.json(settings);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/settings/:key — Create or update a system setting.
 */
async function upsertSetting(req, res, next) {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (typeof value !== 'string') {
      return res.status(400).json({ error: 'Value must be a string.' });
    }

    const setting = await prisma.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    res.json(setting);
  } catch (err) {
    next(err);
  }
}

module.exports = { getSetting, listSettings, upsertSetting };
