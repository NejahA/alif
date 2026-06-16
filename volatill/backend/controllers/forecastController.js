const forecaster = require('../services/forecaster');
const VolatilityPrediction = require('../models/VolatilityPrediction');

// @desc   Get forecast for a specific coin
// @route  GET /api/forecast/coin/:coinId
const getCoinForecast = async (req, res) => {
  try {
    const { coinId } = req.params;
    const hours = parseInt(req.query.hours) || 168;
    const forecast = await forecaster.getCoinForecast(coinId, hours);
    if (!forecast) {
      return res.status(404).json({ message: 'Insufficient data to generate forecast for this coin.' });
    }
    res.json(forecast);
  } catch (error) {
    console.error('Get coin forecast error:', error.message);
    res.status(500).json({ message: 'Failed to fetch forecast' });
  }
};

// @desc   Get all forecasts (sorted by volatility score)
// @route  GET /api/forecast
const getAllForecasts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const forecasts = await forecaster.getAllForecasts(limit);
    
    // If no forecasts exist yet, trigger a seed and return empty
    if (!forecasts || forecasts.length === 0) {
      // Fire and forget seed - next request will have data
      forecaster.seedAllForecasts(limit).catch(err => {
        console.error('Auto-seed error:', err.message);
      });
      return res.json([]);
    }
    
    res.json(forecasts);
  } catch (error) {
    console.error('Get all forecasts error:', error.message);
    res.status(500).json({ message: 'Failed to fetch forecasts' });
  }
};

// @desc   Get hot forecasts for dashboard widget
// @route  GET /api/forecast/hot
const getHotForecasts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    let forecasts = await forecaster.getHotForecasts(limit);
    
    // If no hot forecasts, try seeding and return empty for now
    if (!forecasts || forecasts.length === 0) {
      // Check if there are any forecasts at all
      const totalForecasts = await VolatilityPrediction.countDocuments();
      if (totalForecasts === 0) {
        // Fire and forget seed
        forecaster.seedAllForecasts(50).catch(err => {
          console.error('Auto-seed (hot) error:', err.message);
        });
      }
    }
    
    res.json(forecasts);
  } catch (error) {
    console.error('Get hot forecasts error:', error.message);
    res.status(500).json({ message: 'Failed to fetch hot forecasts' });
  }
};

// @desc   Trigger analysis for top coins (manual refresh)
// @route  POST /api/forecast/analyze
const triggerAnalysis = async (req, res) => {
  try {
    const limit = parseInt(req.body.limit) || 30;
    res.json({ message: `Analysis started for top ${limit} coins...` });

    // Run in background
    forecaster.analyzeTopCoins(limit).catch(err => {
      console.error('Background analysis error:', err.message);
    });
  } catch (error) {
    console.error('Trigger analysis error:', error.message);
    res.status(500).json({ message: 'Failed to trigger analysis' });
  }
};

// @desc   Seed forecasts from CoinGecko directly
// @route  POST /api/forecast/seed
const seedForecasts = async (req, res) => {
  try {
    const limit = parseInt(req.body.limit) || 50;
    res.json({ message: `Seeding forecasts for top ${limit} coins...` });

    // Run in background
    forecaster.seedAllForecasts(limit).catch(err => {
      console.error('Background seed error:', err.message);
    });
  } catch (error) {
    console.error('Seed error:', error.message);
    res.status(500).json({ message: 'Failed to seed forecasts' });
  }
};

module.exports = {
  getCoinForecast,
  getAllForecasts,
  getHotForecasts,
  triggerAnalysis,
  seedForecasts,
};