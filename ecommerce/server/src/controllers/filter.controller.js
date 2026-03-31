const prisma = require('../config/db');

/**
 * GET /api/filters/options — Dynamic filter metadata for the sidebar.
 * Returns brands, vehicle types, cities, fuel types, etc. with counts.
 */
async function getFilterOptions(req, res, next) {
  try {
    const baseWhere = { isDeleted: false, status: 'Approved' };

    const [
      brands,
      vehicleTypes,
      priceRange,
      yearRange,
      cities,
      fuelCounts,
      transmissionCounts,
      totalCount,
    ] = await Promise.all([
      // Brands with count
      prisma.brand.findMany({
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          slug: true,
          _count: { select: { cars: { where: baseWhere } } },
        },
      }),

      // Vehicle types with count
      prisma.vehicleType.findMany({
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          slug: true,
          _count: { select: { cars: { where: baseWhere } } },
        },
      }),

      // Price range
      prisma.car.aggregate({
        where: baseWhere,
        _min: { price: true },
        _max: { price: true },
      }),

      // Year range
      prisma.car.aggregate({
        where: baseWhere,
        _min: { year: true },
        _max: { year: true },
      }),

      // Cities with count
      prisma.car.groupBy({
        by: ['city'],
        where: baseWhere,
        _count: { city: true },
        orderBy: { _count: { city: 'desc' } },
      }),

      // Fuel type counts
      prisma.car.groupBy({
        by: ['fuelType'],
        where: baseWhere,
        _count: { fuelType: true },
      }),

      // Transmission counts
      prisma.car.groupBy({
        by: ['transmission'],
        where: baseWhere,
        _count: { transmission: true },
      }),

      // Total approved count
      prisma.car.count({ where: baseWhere }),
    ]);

    res.json({
      totalCount,
      brands: brands.filter(b => b._count.cars > 0),
      vehicleTypes: vehicleTypes.filter(vt => vt._count.cars > 0),
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
