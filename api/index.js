// Vercel Serverless Function entry point
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://postgres.bnkvuniwxgqmxxaoodyh:Adeasli781781@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres';
}
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'vaultra_jwt_secret_wood_key_2026';
}

const app = require('../server/src/server');

module.exports = app;
