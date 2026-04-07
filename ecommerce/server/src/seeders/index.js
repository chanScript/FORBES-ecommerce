const seedRoles = require('./roles.seed');
const seedBrands = require('./brands.seed');
const seedVehicleTypes = require('./vehicleTypes.seed');
const seedModels = require('./models.seed');
const seedAdmin = require('./admin.seed');

async function main() {
  console.log('[Seed] Starting database seeding...');

  await seedRoles();
  await seedBrands();
  await seedVehicleTypes();
  await seedModels();
  await seedAdmin();

  console.log('[Seed] All seeders completed.');
  process.exit(0);
}

main().catch((err) => {
  console.error('[Seed] Error:', err);
  process.exit(1);
});
