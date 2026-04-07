const prisma = require('../config/db');
const bcrypt = require('bcryptjs');

async function seedAdmin() {
  const adminRole = await prisma.role.findFirst({ where: { name: 'Admin' } });

  if (!adminRole) {
    console.log('[Seed] Admin role not found. Run roles seeder first.');
    return;
  }

  const hashedPassword = await bcrypt.hash('admin123', 12);

  await prisma.user.upsert({
    where: { email: 'admin@admin.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@admin.com',
      password: hashedPassword,
      roleId: adminRole.id,
    },
  });

  console.log('[Seed] Admin user seeded (admin@admin.com / admin123).');
}

module.exports = seedAdmin;
