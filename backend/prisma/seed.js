import 'dotenv/config';
import prisma from '../src/config/database.js';
import { hashPassword } from '../src/utils/hash.js';

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@medicare.local').toLowerCase().trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@12345';
const ADMIN_PHONE = process.env.ADMIN_PHONE || '+9779800000000';
const ADMIN_NAME = process.env.ADMIN_NAME || 'System Administrator';

const DEPARTMENTS = [
  {
    name: 'Cardiology',
    description: 'Diagnosis and treatment of heart and cardiovascular conditions.',
    hospital: 'MediCare Hospital',
    location: 'First floor',
  },
  {
    name: 'Neurology',
    description: 'Care for the brain, spine, nerves, and related conditions.',
    hospital: 'MediCare Hospital',
    location: 'First floor',
  },
  {
    name: 'Dermatology',
    description: 'Medical and surgical care for skin, hair, and nail conditions.',
    hospital: 'MediCare Hospital',
    location: 'Second floor',
  },
  {
    name: 'General Medicine',
    description: 'Primary care, preventive medicine, and general adult health services.',
    hospital: 'MediCare Hospital',
    location: 'Ground floor',
  },
  {
    name: 'Pediatrics',
    description: 'Healthcare for infants, children, and adolescents.',
    hospital: 'MediCare Hospital',
    location: 'Ground floor',
  },
];

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

async function seedDepartments() {
  for (const department of DEPARTMENTS) {
    await prisma.department.upsert({
      where: { name: department.name },
      update: department,
      create: department,
    });
  }

  console.log(`Seeded departments: ${DEPARTMENTS.map(({ name }) => name).join(', ')}`);
}

async function main() {
  await seedAdmin();
  await seedDepartments();
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });