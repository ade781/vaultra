const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Vaultra database with roles (admin & user)...');

  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);
  const commonPassword = await bcrypt.hash('password123', 10);

  // 1. Seed Initial Admin (temporary seed admin, auto-deleted when a new admin is registered)
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {
      password: adminPassword,
      name: 'Administrator (Seed)',
      role: 'admin',
      isInitial: true,
    },
    create: {
      username: 'admin',
      password: adminPassword,
      name: 'Administrator (Seed)',
      role: 'admin',
      isInitial: true,
    },
  });

  // 2. Seed Default User & Other Sample Users
  const regularUsers = [
    { username: 'user', name: 'Pengguna Vaultra', password: userPassword, role: 'user', isInitial: false },
    { username: 'petugas', name: 'Petugas Vaultra', password: commonPassword, role: 'user', isInitial: false },
    { username: 'budi', name: 'Budi Santoso', password: commonPassword, role: 'user', isInitial: false },
    { username: 'siti', name: 'Siti Rahma', password: commonPassword, role: 'user', isInitial: false },
    { username: 'adit', name: 'Aditya Pratama', password: commonPassword, role: 'user', isInitial: false },
  ];

  for (const u of regularUsers) {
    await prisma.user.upsert({
      where: { username: u.username },
      update: { password: u.password, name: u.name, role: u.role, isInitial: false },
      create: u,
    });
  }
  console.log('Seeded initial admin and users successfully.');

  // 3. Seed Items if empty
  const count = await prisma.item.count();
  if (count === 0) {
    const initialItems = [
      {
        title: 'Folder Google Drive Bahan Skripsi 2026',
        url: 'https://drive.google.com/drive/folders/1ABC_BahanSkripsi2026_Sample',
        creator: 'Budi Santoso',
        sourceEmail: 'budi@kampus.ac.id',
        isPrivate: false,
        sharedWith: null,
      },
      {
        title: 'Master Data Penjualan & Keuangan Q1',
        url: 'https://docs.google.com/spreadsheets/d/1XYZ_DataKeuangan2026_Sample/edit',
        creator: 'Administrator',
        sourceEmail: 'admin@vaultra.local',
        isPrivate: true,
        sharedWith: 'petugas',
      },
      {
        title: 'Slide Presentasi Pitch Deck Investor',
        url: 'https://docs.google.com/presentation/d/1XYZ_PitchDeck2026_Sample/edit',
        creator: 'Aditya Pratama',
        sourceEmail: 'adit@startup.id',
        isPrivate: false,
        sharedWith: null,
      },
    ];

    for (const item of initialItems) {
      await prisma.item.create({ data: item });
    }
    console.log(`Seeded ${initialItems.length} initial items.`);
  }

  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });