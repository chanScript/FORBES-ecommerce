const seedRoles = require('./roles.seed');
const seedAdmin = require('./admin.seed');

async function main() {
  console.log('[Seed] Starting database seeding...');

  await seedRoles();
  await seedAdmin();

  console.log('[Seed] All seeders completed.');
  process.exit(0);
}

main().catch((err) => {
  console.error('[Seed] Error:', err);
  process.exit(1);
});
