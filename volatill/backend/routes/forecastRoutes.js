const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getCoinForecast,
  getAllForecasts,
  getHotForecasts,
  triggerAnalysis,
  seedForecasts,
} = require('../controllers/forecastController');

// All routes require authentication
router.use(protect);

// GET /api/forecast - Get all forecasts
router.get('/', getAllForecasts);

// GET /api/forecast/hot - Get hot forecasts for dashboard
router.get('/hot', getHotForecasts);

// GET /api/forecast/coin/:coinId - Get forecast for specific coin
router.get('/coin/:coinId', getCoinForecast);

// POST /api/forecast/analyze - Trigger analysis
router.post('/analyze', triggerAnalysis);

// POST /api/forecast/seed - Seed forecasts from CoinGecko
router.post('/seed', seedForecasts);

module.exports = router;
