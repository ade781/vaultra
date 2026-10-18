// Vercel Serverless Function entry point
const path = require('path');
try {
  process.chdir(path.join(__dirname, '../server'));
} catch (e) {
  // Fallback
}
const app = require('../server/src/server');

module.exports = app;
