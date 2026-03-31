const prisma = require('../config/db');
const slugify = require('slugify');

/**
 * GET /api/vehicle-types — List all types with approved car count.
 */
async function listVehicleTypes(req, res, next) {
  try {
    const types = await prisma.vehicleType.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            cars: { where: { isDeleted: false, status: 'Approved' } },
          },
        },
      },
    });

    res.json(types);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/vehicle-types — Admin: create a vehicle type.
 */
async function createVehicleType(req, res, next) {
  try {
    const { name } = req.body;
    const slug = slugify(name, { lower: true, strict: true });

    const type = await prisma.vehicleType.create({
      data: { name, slug },
    });

    res.status(201).json(type);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Vehicle type already exists.' });
    }
    next(err);
  }
}

/**
 * DELETE /api/vehicle-types/:id — Admin/Seller: delete a vehicle type (only if no cars reference it).
 */
async function deleteVehicleType(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const carCount = await prisma.car.count({ where: { vehicleTypeId: id } });
    if (carCount > 0) {
      return res.status(400).json({ error: 'Cannot delete type — it has associated car listings.' });
    }
    await prisma.vehicleType.delete({ where: { id } });
    res.json({ message: 'Vehicle type deleted.' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Vehicle type not found.' });
    }
    next(err);
  }
}

module.exports = { listVehicleTypes, createVehicleType, deleteVehicleType };
