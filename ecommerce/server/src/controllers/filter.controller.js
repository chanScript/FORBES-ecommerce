const prisma = require('../config/db');

/**
 * GET /api/filters/options — Dynamic filter metadata for the sidebar.
 */
async function getFilterOptions(req, res, next) {
  try {
    const baseWhere = { isDeleted: false, status: 'Approved' };

    // Apply category filter if provided
    if (req.query.category) baseWhere.category = req.query.category;
    if (req.query.vehicleSubtype) baseWhere.vehicleSubtype = req.query.vehicleSubtype;
    if (req.query.realEstateSubtype) baseWhere.realEstateSubtype = req.query.realEstateSubtype;

    const [
      brandCounts,
      bodyTypeCounts,
      priceRange,
      yearRange,
      cities,
      fuelCounts,
      transmissionCounts,
      categoryCounts,
      totalCount,
    ] = await Promise.all([
      prisma.listing.groupBy({
        by: ['brand'],
        where: { ...baseWhere, brand: { not: null } },
        _count: { brand: true },
        orderBy: { _count: { brand: 'desc' } },
      }),

      prisma.listing.groupBy({
        by: ['bodyType'],
        where: { ...baseWhere, bodyType: { not: null } },
        _count: { bodyType: true },
        orderBy: { _count: { bodyType: 'desc' } },
      }),

      prisma.listing.aggregate({
        where: baseWhere,
        _min: { price: true },
        _max: { price: true },
      }),

      prisma.listing.aggregate({
        where: baseWhere,
        _min: { year: true },
        _max: { year: true },
      }),

      prisma.listing.groupBy({
        by: ['city'],
        where: baseWhere,
        _count: { city: true },
        orderBy: { _count: { city: 'desc' } },
      }),

      prisma.listing.groupBy({
        by: ['fuelType'],
        where: { ...baseWhere, fuelType: { not: null } },
        _count: { fuelType: true },
      }),

      prisma.listing.groupBy({
        by: ['transmission'],
        where: { ...baseWhere, transmission: { not: null } },
        _count: { transmission: true },
      }),

      prisma.listing.groupBy({
        by: ['category'],
        where: { isDeleted: false, status: 'Approved' },
        _count: { category: true },
      }),

      prisma.listing.count({ where: baseWhere }),
    ]);

    res.json({
      totalCount,
      categories: categoryCounts.map(c => ({ name: c.category, count: c._count.category })),
      brands: brandCounts.map(b => ({ name: b.brand, count: b._count.brand })),
      vehicleTypes: bodyTypeCounts.map(bt => ({ name: bt.bodyType, count: bt._count.bodyType })),
      priceRange: {
        min: priceRange._min.price ? Number(priceRange._min.price) : 0,
        max: priceRange._max.price ? Number(priceRange._max.price) : 0,
      },
      yearRange: {
        min: yearRange._min.year || new Date().getFullYear(),
        max: yearRange._max.year || new Date().getFullYear(),
      },
      cities: cities.map(c => ({ name: c.city, count: c._count.city })),
      fuelTypes: fuelCounts.map(f => ({ name: f.fuelType, count: f._count.fuelType })),
      transmissions: transmissionCounts.map(t => ({
        name: t.transmission,
        count: t._count.transmission,
      })),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getFilterOptions };
