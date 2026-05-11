const prisma = require('../config/db');
const bcrypt = require('bcryptjs');

/**
 * Seed Super Admin User
 * Super Admin has access to all system features and can manage everything.
 */
async function seedSuperAdmin() {
  const superAdminRole = await prisma.role.findFirst({ where: { name: 'Super Admin' } });

  if (!superAdminRole) {
    console.log('[Seed] Super Admin role not found. Run roles seeder first.');
    return;
  }

  const hashedPassword = await bcrypt.hash('superadmin123', 12);

  await prisma.user.upsert({
    where: { email: 'superadmin@admin.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'superadmin@admin.com',
      password: hashedPassword,
      phone: '+1-800-ADMIN',
      roleId: superAdminRole.id,
    },
  });

  console.log('[Seed] Super Admin user seeded (superadmin@admin.com / superadmin123).');
}

module.exports = seedSuperAdmin;
