const prisma = require('../config/db');

/**
 * GET /api/brands — List all brands with approved car count.
 */
async function listBrands(req, res, next) {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            cars: { where: { isDeleted: false, status: 'Approved' } },
          },
        },
      },
    });

    res.json(brands);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/brands/:slug/models — Models for a brand.
 */
async function getModelsByBrand(req, res, next) {
  try {
    const brand = await prisma.brand.findUnique({
      where: { slug: req.params.slug },
    });

    if (!brand) {
      return res.status(404).json({ error: 'Brand not found.' });
    }

    const models = await prisma.model.findMany({
      where: { brandId: brand.id },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            cars: { where: { isDeleted: false, status: 'Approved' } },
          },
        },
      },
    });

    res.json(models);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/brands — Admin: create a brand.
 */
async function createBrand(req, res, next) {
  try {
    const { name, logoUrl } = req.body;
    const slugify = require('slugify');
    const slug = slugify(name, { lower: true, strict: true });

    const brand = await prisma.brand.create({
      data: { name, slug, logoUrl: logoUrl || null },
    });

    res.status(201).json(brand);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Brand already exists.' });
    }
    next(err);
  }
}

/**
 * PUT /api/brands/:id — Admin: update a brand.
 */
async function updateBrand(req, res, next) {
  try {
    const { name, logoUrl } = req.body;
    const slugify = require('slugify');

    const data = {};
    if (name) {
      data.name = name;
      data.slug = slugify(name, { lower: true, strict: true });
    }
    if (logoUrl !== undefined) data.logoUrl = logoUrl;

    const brand = await prisma.brand.update({
      where: { id: parseInt(req.params.id, 10) },
      data,
    });

    res.json(brand);
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Brand not found.' });
    }
    next(err);
  }
}

/**
 * DELETE /api/brands/:id — Admin: delete a brand (only if no cars reference it).
 */
async function deleteBrand(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const carCount = await prisma.car.count({ where: { brandId: id } });
    if (carCount > 0) {
      return res.status(400).json({ error: 'Cannot delete brand — it has associated car listings.' });
    }
    // Delete child models first
    await prisma.model.deleteMany({ where: { brandId: id } });
    await prisma.brand.delete({ where: { id } });
    res.json({ message: 'Brand deleted.' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Brand not found.' });
    }
    next(err);
  }
}

module.exports = { listBrands, getModelsByBrand, createBrand, updateBrand, deleteBrand };
