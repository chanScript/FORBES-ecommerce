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
        listing: {
          include: {
            brand: true,
            model: true,
            vehicleType: true,
            images: { where: { isPrimary: true }, take: 1 },
          },
        },
      },
    });

    const activeFavorites = favorites.filter(
      f => !f.listing.isDeleted && f.listing.status === 'Approved'
    );

    res.json(activeFavorites);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/favorites/:listingId — Add to favorites.
 */
async function addFavorite(req, res, next) {
  try {
    const listing = await prisma.listing.findUnique({ where: { id: req.params.listingId } });

    if (!listing || listing.isDeleted || listing.status !== 'Approved') {
      return res.status(404).json({ error: 'Listing not found.' });
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId: req.user.id,
        listingId: req.params.listingId,
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
 * DELETE /api/favorites/:listingId — Remove from favorites.
 */
async function removeFavorite(req, res, next) {
  try {
    await prisma.favorite.delete({
      where: {
        userId_listingId: {
          userId: req.user.id,
          listingId: req.params.listingId,
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
