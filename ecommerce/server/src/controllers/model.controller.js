const prisma = require('../config/db');
const slugify = require('slugify');

/**
 * GET /api/models — List all models (optional brandId filter).
 */
async function listModels(req, res, next) {
  try {
    const where = {};
    if (req.query.brandId) {
      where.brandId = parseInt(req.query.brandId, 10);
    }

    const models = await prisma.model.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        brand: { select: { id: true, name: true, slug: true } },
       
      },
    });

    res.json(models);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/models — Admin: create a model.
 */
async function createModel(req, res, next) {
  try {
    const { name, brandId } = req.body;

    const brand = await prisma.brand.findUnique({ where: { id: parseInt(brandId, 10) } });
    if (!brand) {
      return res.status(400).json({ error: 'Invalid brand.' });
    }

    const slug = slugify(`${brand.name}-${name}`, { lower: true, strict: true });

    const model = await prisma.model.create({
      data: {
        name,
        slug,
        brandId: parseInt(brandId, 10),
      },
      include: { brand: true },
    });

    res.status(201).json(model);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Model already exists.' });
    }
    next(err);
  }
}

/**
 * DELETE /api/models/:id — Admin/Seller: delete a model (only if no listings reference it).
 */
async function deleteModel(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const listingCount = await prisma.listing.count({ where: { modelId: id } });
    if (listingCount > 0) {
      return res.status(400).json({ error: 'Cannot delete model — it has associated listings.' });
    }
    await prisma.model.delete({ where: { id } });
    res.json({ message: 'Model deleted.' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Model not found.' });
    }
    next(err);
  }
}

module.exports = { listModels, createModel, deleteModel };
