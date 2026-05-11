const prisma = require('../config/db');

async function seedRoles() {
  const roles = ['Super Admin', 'Admin', 'Seller', 'User'];

  for (const name of roles) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log('[Seed] Roles seeded.');
}

module.exports = seedRoles;
