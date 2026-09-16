import 'dotenv/config';
import prisma from '../src/config/database.js';
import { hashPassword } from '../src/utils/hash.js';

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@medicare.local').toLowerCase().trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@12345';
const ADMIN_PHONE = process.env.ADMIN_PHONE || '+9779800000000';
const ADMIN_NAME = process.env.ADMIN_NAME || 'System Administrator';

async function seedAdmin() {
  const hashedPassword = await hashPassword(ADMIN_PASSWORD);

  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      fullName: ADMIN_NAME,
      phone: ADMIN_PHONE,
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
      isEmailVerified: true,
    },
    create: {
      fullName: ADMIN_NAME,
      email: ADMIN_EMAIL,
      phone: ADMIN_PHONE,
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
      isEmailVerified: true,
    },
  });

  console.log(`Seeded admin login: ${admin.email}`);
}

async function main() {
  await seedAdmin();
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });