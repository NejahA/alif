const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import configurations and middleware
const logger = require('./config/logger');
const { connectDB } = require('./config/database');
const { errorHandler, asyncHandler } = require('./middleware/errorHandler');
const loggingMiddleware = require('./middleware/loggingMiddleware');
const swaggerRouter = require('./utils/swagger');

// Import routes
const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs
  message: 'Too many login attempts, please try again later.',
});

// Global Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('uploads')); // Serve uploaded files

// Apply rate limiting
app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Logging middleware
app.use(loggingMiddleware);

// API Documentation
/**
 * @swagger
 * /api:
 *   get:
 *     summary: Welcome endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API information
 */
app.get('/api', (req, res) => {
  res.json({
    name: 'ashref',
    version: '1.0.0',
    description: 'original idea - A powerful Node.js backend',
    features: [
      'JWT Authentication',
      'MongoDB Database',
      'Rate Limiting',
      'File Upload Support',
      'Request Validation',
      'Comprehensive Logging',
      'Email Service',
      'Swagger Documentation',
    ],
    endpoints: {
      auth: '/api/auth',
      uploads: '/api/uploads',
      health: '/api/health',
      docs: '/api/docs',
    },
  });
});

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is running
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'ashref backend is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Documentation
app.use('/api/docs', swaggerRouter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/uploads', uploadRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Endpoint ${req.method} ${req.path} not found`,
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    app.listen(PORT, () => {
      logger.info(`✨ ashref server is running on port ${PORT}`);
      logger.info(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 API endpoint: http://localhost:${PORT}/api`);
      logger.info(`📚 API Docs: http://localhost:${PORT}/api/docs`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
