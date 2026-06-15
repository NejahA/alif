const PriceSnapshot = require('../models/PriceSnapshot');

/**
 * Calculate volatility score for a coin based on recent snapshots
 * Score = standard deviation of price changes * 100
 */
const calculateVolatilityScore = (prices) => {
  if (!prices || prices.length < 2) return 0;

  const changes = [];
  for (let i = 1; i < prices.length; i++) {
    const change = (prices[i] - prices[i - 1]) / prices[i - 1];
    changes.push(change);
  }

  const mean = changes.reduce((a, b) => a + b, 0) / changes.length;
  const variance = changes.reduce((a, b) => a + (b - mean) ** 2, 0) / changes.length;
  const stdDev = Math.sqrt(variance);

  return Math.round(stdDev * 100 * 100) / 100; // Return as percentage * 100 for display
};

/**
 * Classify volatility level
 */
const classifyVolatility = (score) => {
  if (score < 1) return { level: 'Very Low', color: '#22c55e' };
  if (score < 3) return { level: 'Low', color: '#4ade80' };
  if (score < 7) return { level: 'Moderate', color: '#facc15' };
  if (score < 15) return { level: 'High', color: '#fb923c' };
  return { level: 'Extreme', color: '#ef4444' };
};

/**
 * Get volatility data for a specific coin
 */
const getCoinVolatility = async (coinId, hours = 24) => {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  const snapshots = await PriceSnapshot.find({
    coinId,
    timestamp: { $gte: since },
  }).sort({ timestamp: 1 });

  const prices = snapshots.map(s => s.currentPrice);
  const score = calculateVolatilityScore(prices);
  const classification = classifyVolatility(score);

  return {
    coinId,
    score,
    ...classification,
    dataPoints: prices.length,
    snapshots,
  };
};

/**
 * Get top volatile coins
 */
const getTopVolatileCoins = async (limit = 20, hours = 24) => {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  // Aggregate: get latest snapshot per coin and compute volatility
  const pipeline = [
    { $match: { timestamp: { $gte: since } } },
    { $sort: { coinId: 1, timestamp: 1 } },
    {
      $group: {
        _id: '$coinId',
        symbol: { $last: '$symbol' },
        name: { $last: '$name' },
        currentPrice: { $last: '$currentPrice' },
        priceChangePercent24h: { $last: '$priceChangePercent24h' },
        marketCap: { $last: '$marketCap' },
        totalVolume: { $last: '$totalVolume' },
        prices: { $push: '$currentPrice' },
        count: { $sum: 1 },
      },
    },
    { $match: { count: { $gte: 2 } } },
    { $limit: 100 },
  ];

  const results = await PriceSnapshot.aggregate(pipeline);
  if (!results.length) return [];

  // Calculate volatility for each coin
  const withVolatility = results
    .map(r => {
      const score = calculateVolatilityScore(r.prices);
      const classification = classifyVolatility(score);
      return {
        coinId: r._id,
        symbol: r.symbol,
        name: r.name,
        currentPrice: r.currentPrice,
        priceChangePercent24h: r.priceChangePercent24h,
        marketCap: r.marketCap,
        totalVolume: r.totalVolume,
        volatilityScore: score,
        ...classification,
        dataPoints: r.count,
      };
    })
    .sort((a, b) => b.volatilityScore - a.volatilityScore)
    .slice(0, limit);

  return withVolatility;
};

module.exports = {
  calculateVolatilityScore,
  classifyVolatility,
  getCoinVolatility,
  getTopVolatileCoins,
};