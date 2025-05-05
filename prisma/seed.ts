import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as argon from 'argon2';

const prisma = new PrismaClient();

async function createProfileRisks() {
  await prisma.profileRisk.createMany({
    data: [{ name: 'Good' }, { name: 'Standard' }, { name: 'Poor' }],
  });

  console.log('Created 3 profile risks');
}

async function createBranches() {
  await prisma.branch.createMany({
    data: [
      { name: 'KC Jakarta Selatan' },
      { name: 'KC Tangerang' },
      { name: 'KC Bandung' },
      { name: 'KC Jakarta Barat' },
      { name: 'KC Jakarta Utara' },
      { name: 'KC Surabaya' },
      { name: 'KC Jakarta Timur' },
      { name: 'KC Bekasi' },
      { name: 'KC Tangerang Selatan' },
      { name: 'KC Bogor' },
      { name: 'KC Depok' },
      { name: 'KC Denpasar' }, // Covers Badung & Denpasar
      { name: 'KC Semarang' },
      { name: 'KC Jakarta Pusat' },
      { name: 'KC Malang' },
      { name: 'KC Sidoarjo' },
      { name: 'KC Yogyakarta' }, // Covers Sleman & Yogyakarta
      { name: 'KC Solo' },
      { name: 'KC Batam' },
      { name: 'KC Bandung Barat' }, // Covers Cimahi & Bandung Barat
      { name: 'KC Makassar' },
      { name: 'KC Cikarang' },
    ],
  });

  console.log('Created 22 branches');
}

async function createAdmins() {
  const password = await argon.hash('Validpassword123#');

  const adminsData = [] as any[];
  const branchCount = 22; // Updated to match our new branch count

  for (let i = 0; i < 44; i++) {
    // Creating 2 admins per branch
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    const branch_id = (i % branchCount) + 1;

    adminsData.push({
      name: `${firstName} ${lastName}`,
      email: faker.internet
        .email({
          firstName,
          lastName,
          provider: 'bankbsi.co.id',
          allowSpecialCharacters: false,
        })
        .toLowerCase(),
      password: password,
      branch_id: branch_id,
    });
  }

  await prisma.admin.createMany({
    data: adminsData,
  });

  console.log('Created 44 admin accounts');
}

async function createTrackingStatuses() {
  await prisma.trackingStatus.createMany({
    data: [
      { name: 'WAITING_FOR_SALES' },
      { name: 'CONTACTED' },
      { name: 'COLLECT_DOCUMENTS' },
      { name: 'WAITING_FOR_APPROVAL' },
      { name: 'APPROVED' },
      { name: 'REJECTED' },
      { name: 'CANCELED' },
    ],
  });

  console.log('Created 7 tracking statuses');
}

function main() {
  // await createProfileRisks();
  // await createBranches();
  // await createAdmins();
  // await createTrackingStatuses();

  console.log('Seeding completed');
}

main();
