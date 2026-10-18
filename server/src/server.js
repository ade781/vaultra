// Guaranteed environment defaults for Supabase Cloud
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://postgres:Adeasli781781@db.bnkvuniwxgqmxxaoodyh.supabase.co:5432/postgres';
}
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'vaultra_jwt_secret_wood_key_2026';
}

const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment files: .env.{NODE_ENV} first, then .env
const nodeEnv = process.env.NODE_ENV || 'development';
dotenv.config({ path: path.resolve(__dirname, `../.env.${nodeEnv}`) });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const itemRoutes = require('./routes/itemRoutes');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middlewares/errorHandler');
const { ensureTablesExist } = require('./config/initDb');
ensureTablesExist().catch(err => console.error('Table init:', err.message));

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend Vite client and deployed domains (Vercel, custom domain)
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5175',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, mobile, serverless internal)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        /^http:\/\/(localhost|127\.0\.0\.1):(517\d|518\d|3000)$/.test(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.includes('vercel.app')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());

// Request logger
if (process.env.NODE_ENV !== 'test') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Mount Resource Routes
app.use('/api/items', itemRoutes);
app.use('/api/auth', authRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.originalUrl}` });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Start server if not imported
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Vaultra backend server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
