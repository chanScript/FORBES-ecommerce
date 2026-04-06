require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./src/routes/auth.routes');
const carRoutes = require('./src/routes/car.routes');
const brandRoutes = require('./src/routes/brand.routes');
const modelRoutes = require('./src/routes/model.routes');
const vehicleTypeRoutes = require('./src/routes/vehicleType.routes');
const adminRoutes = require('./src/routes/admin.routes');
const favoriteRoutes = require('./src/routes/favorite.routes');
const filterRoutes = require('./src/routes/filter.routes');
const sellerRequestRoutes = require('./src/routes/sellerRequest.routes');
const inquiryRoutes = require('./src/routes/inquiry.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// ----------------------------------------------------------
// Security Middleware
// ----------------------------------------------------------
app.use(helmet());

app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'http://192.168.34.86:5173',
    'http://192.168.34.86:8080',
  ],
  credentials: true,
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// ----------------------------------------------------------
// Body Parsing
// ----------------------------------------------------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ----------------------------------------------------------
// API Routes
// ----------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/models', modelRoutes);
app.use('/api/vehicle-types', vehicleTypeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/filters', filterRoutes);
app.use('/api/seller-requests', sellerRequestRoutes);
app.use('/api/inquiries', inquiryRoutes);

// ----------------------------------------------------------
// Health Check
// ----------------------------------------------------------
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ----------------------------------------------------------
// Global Error Handler
// ----------------------------------------------------------
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  const status = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;

  res.status(status).json({ error: message });
});

// ----------------------------------------------------------
// Start Server
// ----------------------------------------------------------
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Server] Running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
  console.log(`[Server] Network access: http://192.168.34.86:${PORT}`);
});

module.exports = app;
