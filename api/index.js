// Vercel Serverless Function entry point
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://postgres:Adeasli781781@db.bnkvuniwxgqmxxaoodyh.supabase.co:5432/postgres';
}
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'vaultra_jwt_secret_wood_key_2026';
}

const app = require('../server/src/server');

module.exports = app;
