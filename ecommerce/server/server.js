require('dotenv').config();

const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');
const { verifyToken } = require('./src/utils/jwt');
const { initUploadDirs } = require('./src/config/storage');

const authRoutes = require('./src/routes/auth.routes');
const listingRoutes = require('./src/routes/listing.routes');
const adminRoutes = require('./src/routes/admin.routes');
const favoriteRoutes = require('./src/routes/favorite.routes');
const filterRoutes = require('./src/routes/filter.routes');
const submissionRoutes = require('./src/routes/submission.routes');
const inquiryRoutes = require('./src/routes/inquiry.routes');
const applicationRoutes = require('./src/routes/application.routes');
const documentRoutes = require('./src/routes/document.routes');
const notificationRoutes = require('./src/routes/notification.routes');
const settingsRoutes = require('./src/routes/settings.routes');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// ----------------------------------------------------------
// CORS Origins (shared between Express & Socket.io)
// ----------------------------------------------------------
const corsOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://192.168.34.86:5173',
  'http://192.168.34.86:8080',
  'http://localhost:5173/',
];

// ----------------------------------------------------------
// Socket.io — Real-Time Notifications
// ----------------------------------------------------------
const io = new Server(server, {
  cors: { origin: corsOrigins, credentials: true },
});

// Authenticate socket connections via JWT
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Authentication required'));
  try {
    const decoded = verifyToken(token);
    socket.userId = decoded.userId;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  // Join a personal room so we can target notifications per-user
  socket.join(`user:${socket.userId}`);
});

// Make io available to controllers via req.app
app.set('io', io);

// ----------------------------------------------------------
// Security Middleware
// ----------------------------------------------------------
app.use(helmet());

app.use(cors({
  origin: corsOrigins,
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
// Local File Storage — Serve optimized images & documents
// ----------------------------------------------------------
initUploadDirs();
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '30d',
  immutable: true,
  etag: true,
  lastModified: true,
}));

// ----------------------------------------------------------
// API Routes
// ----------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/filters', filterRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);

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
// Start Server (HTTP server for Express + Socket.io)
// ----------------------------------------------------------
server.listen(PORT, '0.0.0.0', () => {
  console.log(`[Server] Running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
  console.log(`[Server] Network access: http://192.168.34.86:${PORT}`);
});

module.exports = app;
