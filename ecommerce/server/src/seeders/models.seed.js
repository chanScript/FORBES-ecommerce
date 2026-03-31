const prisma = require('../config/db');
const slugify = require('slugify');

const modelData = {
  Toyota: ['Vios', 'Camry', 'Corolla Altis', 'Hilux', 'Fortuner', 'Innova', 'Rush', 'Wigo', 'Avanza', 'Hiace', 'RAV4', 'Land Cruiser'],
  Honda: ['Civic', 'City', 'CR-V', 'HR-V', 'BR-V', 'Jazz', 'Accord', 'Mobilio', 'Brio'],
  Mitsubishi: ['Montero Sport', 'Xpander', 'Mirage', 'Mirage G4', 'Strada', 'Outlander', 'L300', 'Pajero'],
  Nissan: ['Navara', 'Terra', 'Almera', 'Juke', 'X-Trail', 'Urvan', 'Patrol', 'Sylphy', 'NV350'],
  Ford: ['Ranger', 'Everest', 'EcoSport', 'Territory', 'Explorer', 'Expedition', 'Mustang', 'F-150'],
  Hyundai: ['Accent', 'Tucson', 'Santa Fe', 'Kona', 'Starex', 'Creta', 'Staria', 'Elantra', 'Venue'],
  Suzuki: ['Ertiga', 'Swift', 'Celerio', 'Dzire', 'Vitara', 'Jimny', 'S-Presso', 'XL7', 'Ciaz'],
  Kia: ['Seltos', 'Sportage', 'Picanto', 'Stonic', 'Carnival', 'Sorento', 'EV6'],
  Chevrolet: ['Trailblazer', 'Colorado', 'Tracker', 'Malibu', 'Suburban', 'Tahoe'],
  BMW: ['3 Series', '5 Series', 'X1', 'X3', 'X5', '1 Series', '7 Series'],
  'Mercedes-Benz': ['C-Class', 'E-Class', 'A-Class', 'GLC', 'GLE', 'S-Class', 'CLA'],
  Mazda: ['3', 'CX-5', 'CX-30', 'CX-8', '2', '6', 'MX-5'],
  Subaru: ['XV', 'Forester', 'Outback', 'WRX', 'BRZ', 'Levorg'],
  Isuzu: ['D-Max', 'mu-X', 'Traviz', 'NLR', 'NPR'],
};

async function seedModels() {
  for (const [brandName, models] of Object.entries(modelData)) {
    const brand = await prisma.brand.findUnique({
      where: { slug: slugify(brandName, { lower: true, strict: true }) },
    });

    if (!brand) continue;

    for (const modelName of models) {
      const slug = slugify(`${brandName}-${modelName}`, { lower: true, strict: true });
      await prisma.model.upsert({
        where: { slug },
        update: {},
        create: { name: modelName, slug, brandId: brand.id },
      });
    }
  }

  console.log('[Seed] Models seeded.');
}

module.exports = seedModels;
