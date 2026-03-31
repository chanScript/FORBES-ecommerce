const prisma = require('../config/db');
const slugify = require('slugify');

const typeNames = [
  'Sedan', 'SUV', 'Hatchback', 'Pickup Truck', 'MPV',
  'Crossover', 'Van', 'Coupe', 'Convertible', 'Wagon',
  'Minivan', 'Roadster', 'Luxury Vehicle',
];

async function seedVehicleTypes() {
  for (const name of typeNames) {
    const slug = slugify(name, { lower: true, strict: true });
    await prisma.vehicleType.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
  }

  console.log('[Seed] Vehicle types seeded.');
}

module.exports = seedVehicleTypes;
