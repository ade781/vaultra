const { PrismaClient } = require('@prisma/client');

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    'postgresql://postgres.bnkvuniwxgqmxxaoodyh:Adeasli781781@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1';
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

module.exports = prisma;
