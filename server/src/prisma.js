const { PrismaClient } = require('@prisma/client');

const dbUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  'postgresql://postgres:Adeasli781781@db.bnkvuniwxgqmxxaoodyh.supabase.co:5432/postgres';

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = dbUrl;
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl,
    },
  },
});

module.exports = prisma;
