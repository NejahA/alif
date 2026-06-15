const coingecko = require('../services/coingecko');
const volatility = require('../services/volatility');
const PriceSnapshot = require('../models/PriceSnapshot');

// @desc   Get top coins by market cap
// @route  GET /api/market/top
const getTopCoins = async (req, res) => {
  try {
    const count = parseInt(req.query.count) || 50;
    const coins = await coingecko.getTopCoins(count);
    res.json(coins);
  } catch (error) {
    console.error('Get top coins error:', error.message);
    res.status(500).json({ message: 'Failed to fetch top coins' });
  }
};

// @desc   Get coin details
// @route  GET /api/market/coin/:coinId
const getCoinDetails = async (req, res) => {
  try {
    const { coinId } = req.params;
    const details = await coingecko.getCoinDetails(coinId);

    // Also get volatility for this coin
    const volData = await volatility.getCoinVolatility(coinId);

    res.json({
      ...details,
      volatility: volData,
    });
  } catch (error) {
    console.error('Get coin details error:', error.message);
    res.status(500).json({ message: 'Failed to fetch coin details' });
  }
};

// @desc   Get coin chart data
// @route  GET /api/market/coin/:coinId/chart
const getCoinChart = async (req, res) => {
  try {
    const { coinId } = req.params;
    const days = parseInt(req.query.days) || 7;
    const chart = await coingecko.getCoinChart(coinId, days);
    res.json(chart);
  } catch (error) {
    console.error('Get chart error:', error.message);
    res.status(500).json({ message: 'Failed to fetch chart data' });
  }
};

// @desc   Search coins
// @route  GET /api/market/search
const searchCoins = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    const results = await coingecko.searchCoins(q);
    res.json(results);
  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).json({ message: 'Failed to search coins' });
  }
};

// @desc   Get volatility rankings
// @route  GET /api/market/volatility
const getVolatilityRankings = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const hours = parseInt(req.query.hours) || 24;
    const rankings = await volatility.getTopVolatileCoins(limit, hours);
    res.json(rankings);
  } catch (error) {
    console.error('Volatility rankings error:', error.message);
    res.status(500).json({ message: 'Failed to fetch volatility rankings' });
  }
};

// @desc   Get simple price for specific coins
// @route  POST /api/market/prices
const getPrices = async (req, res) => {
  try {
    const { coinIds } = req.body;
    if (!coinIds || !Array.isArray(coinIds) || coinIds.length === 0) {
      return res.status(400).json({ message: 'coinIds array is required' });
    }
    const prices = await coingecko.getSimplePrice(coinIds);
    res.json(prices);
  } catch (error) {
    console.error('Get prices error:', error.message);
    res.status(500).json({ message: 'Failed to fetch prices' });
  }
};

module.exports = {
  getTopCoins,
  getCoinDetails,
  getCoinChart,
  searchCoins,
  getVolatilityRankings,
  getPrices,
};