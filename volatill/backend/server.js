require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Route imports
const authRoutes = require('./routes/authRoutes');
const marketRoutes = require('./routes/marketRoutes');
const watchlistRoutes = require('./routes/watchlistRoutes');
const alertRoutes = require('./routes/alertRoutes');
const forecastRoutes = require('./routes/forecastRoutes');

// Scheduler imports
const { scheduleSnapshots, scheduleAlertCheck, scheduleForecastAnalysis, runInitialForecast } = require('./services/scheduler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/watchlists', watchlistRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/forecast', forecastRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
const startServer = async () => {
  await connectDB();

  // Start scheduled tasks
  scheduleSnapshots();
  scheduleAlertCheck();
  scheduleForecastAnalysis();

  // Run initial forecast after 10 seconds (to allow snapshot data to exist)
  setTimeout(() => {
    runInitialForecast();
  }, 10000);

  app.listen(PORT, () => {
    console.log(`\n🚀 Volatill API Server running on http://localhost:${PORT}`);
    console.log(`📊 Market data endpoints at /api/market`);
    console.log(`🔐 Auth endpoints at /api/auth`);
    console.log(`📋 Watchlist endpoints at /api/watchlists`);
    console.log(`🔔 Alert endpoints at /api/alerts`);
    console.log(`❤️  Health check at /api/health\n`);
  });
};

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});