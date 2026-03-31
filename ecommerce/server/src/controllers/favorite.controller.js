const prisma = require('../config/db');

/**
 * GET /api/favorites — User's favorites list.
 */
async function listFavorites(req, res, next) {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        car: {
          include: {
            brand: true,
            model: true,
            vehicleType: true,
            images: { where: { isPrimary: true }, take: 1 },
          },
        },
      },
    });

    // Filter out deleted/unapproved cars from favorites view
    const activeFavorites = favorites.filter(
      f => !f.car.isDeleted && f.car.status === 'Approved'
    );

    res.json(activeFavorites);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/favorites/:carId — Add to favorites.
 */
async function addFavorite(req, res, next) {
  try {
    const car = await prisma.car.findUnique({ where: { id: req.params.carId } });

    if (!car || car.isDeleted || car.status !== 'Approved') {
      return res.status(404).json({ error: 'Car not found.' });
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId: req.user.id,
        carId: req.params.carId,
      },
    });

    res.status(201).json(favorite);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Already in favorites.' });
    }
    next(err);
  }
}

/**
 * DELETE /api/favorites/:carId — Remove from favorites.
 */
async function removeFavorite(req, res, next) {
  try {
    await prisma.favorite.delete({
      where: {
        userId_carId: {
          userId: req.user.id,
          carId: req.params.carId,
        },
      },
    });

    res.json({ message: 'Removed from favorites.' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Not in favorites.' });
    }
    next(err);
  }
}

module.exports = { listFavorites, addFavorite, removeFavorite };
