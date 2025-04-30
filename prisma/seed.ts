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
      { name: 'KC Jakarta' },
      { name: 'KC Bandung' },
      { name: 'KC Surabaya' },
      { name: 'KC Medan' },
      { name: 'KC Makassar' },
      { name: 'KC Bali' },
      { name: 'KC Semarang' },
      { name: 'KC Palembang' },
      { name: 'KC Batam' },
      { name: 'KC Yogyakarta' },
      { name: 'KC Banjarmasin' },
      { name: 'KC Manado' },
      { name: 'KC Pontianak' },
      { name: 'KC Balikpapan' },
      { name: 'KC Pekanbaru' },
    ],
  });

  console.log('Created 15 branches');
}

async function createAdmins() {
  const password = await argon.hash('Validpassword123#');

  const adminsData = [] as any[];

  for (let i = 0; i < 20; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    const branch_id = (i % 15) + 1;

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

  console.log('Created 20 admin accounts');
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

async function main() {
  await createProfileRisks();
  await createBranches();
  await createAdmins();
  await createTrackingStatuses();

  console.log('Seeding completed');
}

main();
