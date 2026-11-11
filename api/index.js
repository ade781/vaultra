// Vercel Serverless Function entry point
const path = require('path');
const dotenv = require('dotenv');

if (!process.env.DATABASE_URL) {
  const nodeEnv = process.env.NODE_ENV || 'production';
  dotenv.config({ path: path.resolve(__dirname, `../server/.env.${nodeEnv}`) });
  dotenv.config({ path: path.resolve(__dirname, '../server/.env') });
  dotenv.config();
}

const app = require('../server/src/server');

module.exports = app;
