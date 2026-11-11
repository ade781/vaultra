const path = require('path');
const dotenv = require('dotenv');

// Ensure environment variables are loaded
if (!process.env.DATABASE_URL) {
  const nodeEnv = process.env.NODE_ENV || 'development';
  dotenv.config({ path: path.resolve(__dirname, '../.env') });
  dotenv.config({ path: path.resolve(__dirname, `../.env.${nodeEnv}`) });
  dotenv.config();
}

const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL;

if (!databaseUrl) {
  throw new Error(
    'CRITICAL: DATABASE_URL is not defined in environment variables. Please set DATABASE_URL in your .env file or environment settings.'
  );
}

process.env.DATABASE_URL = databaseUrl;

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

module.exports = prisma;
