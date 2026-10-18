const prisma = require('../prisma');

let isInitialized = false;

async function ensureTablesExist() {
  if (isInitialized) return;
  try {
    // 1. Create User table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" SERIAL PRIMARY KEY,
        "username" TEXT UNIQUE NOT NULL,
        "password" TEXT NOT NULL,
        "name" TEXT,
        "role" TEXT NOT NULL DEFAULT 'user',
        "isInitial" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Create Item table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Item" (
        "id" SERIAL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "url" TEXT NOT NULL,
        "creator" TEXT DEFAULT 'Anonim',
        "sourceEmail" TEXT,
        "isPrivate" BOOLEAN NOT NULL DEFAULT false,
        "sharedWith" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Ensure seed admin exists
    const adminCount = await prisma.user.count({ where: { role: 'admin' } });
    if (adminCount === 0) {
      await prisma.$executeRawUnsafe(`
        INSERT INTO "User" ("username", "password", "name", "role", "isInitial")
        VALUES ('admin', '$2b$10$MBwPC9BT/J6T9bJfEfUcNu4.3k5Aegp5ra4Fd7OKbQzyPwgyeOPbS', 'Administrator (Seed)', 'admin', true)
        ON CONFLICT ("username") DO NOTHING;
      `);
      console.log('Automated seed admin created successfully');
    }

    isInitialized = true;
  } catch (err) {
    console.error('ensureTablesExist error:', err.message);
  }
}

module.exports = { ensureTablesExist };
