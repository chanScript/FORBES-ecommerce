const prisma = require('../config/db');
const slugify = require('slugify');

const brandNames = [
  'Toyota', 'Honda', 'Mitsubishi', 'Nissan', 'Ford',
  'Hyundai', 'Suzuki', 'Kia', 'Chevrolet', 'BMW',
  'Mercedes-Benz', 'Mazda', 'Subaru', 'Isuzu', 'Volkswagen',
  'Audi', 'Lexus', 'Volvo', 'Porsche', 'Jeep',
  'Land Rover', 'Jaguar', 'MINI', 'Peugeot', 'MG',
  'Geely', 'BYD', 'Chery', 'Foton', 'Maxus',
];

async function seedBrands() {
  for (const name of brandNames) {
    const slug = slugify(name, { lower: true, strict: true });
    await prisma.brand.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
  }

  console.log('[Seed] Brands seeded.');
}

module.exports = seedBrands;
