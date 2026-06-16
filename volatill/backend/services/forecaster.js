const PriceSnapshot = require('../models/PriceSnapshot');
const VolatilityPrediction = require('../models/VolatilityPrediction');
const coingecko = require('./coingecko');

/**
 * Volatility Forecaster
 * 
 * Analyzes historical price data to detect volatility patterns and
 * forecast upcoming high-volatility periods using statistical methods.
 */

// ============ PATTERN DETECTION ============

/**
 * "Calm Before Storm" — Low volatility followed by a likely spike
 */
const detectCalmBeforeStorm = (prices, volatilities) => {
  if (volatilities.length < 8) return null;

  const recent = volatilities.slice(-4);
  const older = volatilities.slice(-8, -4);

  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

  const volatilityDrop = olderAvg > 0 ? (olderAvg - recentAvg) / olderAvg : 0;
  if (volatilityDrop > 0.4 && recentAvg < 3) {
    const recentPrices = prices.slice(-4);
    const priceMean = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
    const priceVariance = recentPrices.reduce((a, b) => a + (b - priceMean) ** 2, 0) / recentPrices.length;
    const normalizedVariance = priceVariance / (priceMean || 1);

    if (normalizedVariance < 0.01) {
      return {
        type: 'calm_before_storm',
        label: 'Calm Before Storm ⚡',
        description: 'Volatility has compressed significantly. Historically, such low-volatility periods are often followed by explosive price moves.',
        confidence: Math.min(0.9, volatilityDrop),
        expectedDuration: Math.round(4 + (1 - volatilityDrop) * 12),
        severity: 'high',
      };
    }
  }
  return null;
};

/**
 * "Breakout Signal" — Price breaking out of a consolidation range
 */
const detectBreakoutSignal = (prices, volatilities) => {
  if (prices.length < 6 || volatilities.length < 6) return null;

  const recentPrices = prices.slice(-3);
  const olderPrices = prices.slice(-6, -3);

  const recentRange = Math.max(...recentPrices) - Math.min(...recentPrices);
  const olderRange = Math.max(...olderPrices) - Math.min(...olderPrices);

  const recentMean = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
  const olderMean = olderPrices.reduce((a, b) => a + b, 0) / olderPrices.length;

  const rangeExpansion = (olderRange || 1) > 0 ? recentRange / olderRange : 1;
  const priceMovement = (olderMean || 1) > 0 ? Math.abs(recentMean - olderMean) / olderMean : 0;

  if (priceMovement > 0.02 && rangeExpansion > 1.5) {
    const direction = recentMean > olderMean ? 'up' : 'down';
    const recentVol = volatilities.slice(-3).reduce((a, b) => a + b, 0) / 3;

    return {
      type: 'breakout_signal',
      label: `Breakout ${direction === 'up' ? '🚀' : '📉'}`,
      description: `Price is breaking ${direction === 'up' ? 'above' : 'below'} the recent range with expanding volatility.`,
      confidence: Math.min(0.8, 0.4 + rangeExpansion * 0.1),
      expectedDuration: Math.round(6 + recentVol * 2),
      severity: recentVol > 10 ? 'extreme' : 'high',
    };
  }
  return null;
};

/**
 * "Momentum Shift" — Sudden change in volatility direction
 */
const detectMomentumShift = (prices, volatilities) => {
  if (volatilities.length < 4) return null;

  const recent = volatilities.slice(-2);
  const prior = volatilities.slice(-4, -2);

  const recentAvg = recent.length > 0 ? recent.reduce((a, b) => a + b, 0) / recent.length : 0;
  const priorAvg = prior.length > 0 ? prior.reduce((a, b) => a + b, 0) / prior.length : 0;

  if (recentAvg > priorAvg * 2 && recentAvg > 4) {
    return {
      type: 'momentum_shift',
      label: 'Momentum Shift ⚡',
      description: 'A sudden surge in volatility after a quieter period. This often signals the start of a new trending phase.',
      confidence: Math.min(0.7, 0.3 + recentAvg * 0.03),
      expectedDuration: Math.round(2 + recentAvg),
      severity: recentAvg > 15 ? 'extreme' : 'high',
    };
  }
  return null;
};

/**
 * "Stability Phase" — Volatility decreasing, price stabilizing
 */
const detectStabilityPhase = (prices, volatilities) => {
  if (volatilities.length < 6) return null;

  const recent = volatilities.slice(-3);
  const older = volatilities.slice(-6, -3);

  const recentAvg = recent.length > 0 ? recent.reduce((a, b) => a + b, 0) / recent.length : 0;
  const olderAvg = older.length > 0 ? older.reduce((a, b) => a + b, 0) / older.length : 0;

  if (olderAvg > 4 && recentAvg < olderAvg * 0.5 && recentAvg < 4) {
    return {
      type: 'stability_phase',
      label: 'Stability Phase 🌊',
      description: 'Volatility is subsiding after a turbulent period. The market may be entering a consolidation phase.',
      confidence: Math.min(0.7, 0.3 + (olderAvg - recentAvg) / olderAvg),
      expectedDuration: Math.round(12 + recentAvg * 4),
      severity: 'low',
    };
  }
  return null;
};

// ============ FORECAST ENGINE ============

/**
 * Generate upcoming volatility forecast periods
 */
const generateForecastPeriods = (prices, volatilities, detectedPatterns) => {
  const periods = [];
  const now = new Date();
  const avgVolatility = volatilities.length > 0
    ? volatilities.reduce((a, b) => a + b, 0) / volatilities.length
    : 5;

  const hasHighVol = detectedPatterns.some(p => p.severity === 'high' || p.severity === 'extreme');
  const hasCalm = detectedPatterns.some(p => p.type === 'stability_phase');

  for (let i = 0; i < 8; i++) {
    const periodStart = new Date(now.getTime() + i * 6 * 60 * 60 * 1000);
    const periodEnd = new Date(periodStart.getTime() + 6 * 60 * 60 * 1000);

    let expectedVol = avgVolatility * (100 / 15);
    let confidence = 0.6 - (i * 0.05);
    let driver = 'historical_average';

    if (i < 3) {
      if (hasHighVol) {
        expectedVol = Math.min(90, expectedVol + 20);
        confidence = Math.min(0.8, confidence + 0.15);
        driver = 'elevated_volatility';
      }
      if (hasCalm) {
        expectedVol = Math.max(10, expectedVol - 15);
        confidence = Math.min(0.75, confidence + 0.1);
        driver = 'stabilizing';
      }
    }

    expectedVol = Math.max(5, Math.min(100, expectedVol));

    const label = expectedVol > 80 ? 'extreme'
      : expectedVol > 60 ? 'high'
      : expectedVol > 40 ? 'moderate'
      : expectedVol > 20 ? 'low'
      : 'very_low';

    periods.push({
      startTime: periodStart,
      endTime: periodEnd,
      expectedVolatility: Math.round(expectedVol),
      expectedVolatilityLabel: label,
      confidence: Math.round(confidence * 100) / 100,
      primaryDriver: driver,
    });
  }

  return periods;
};

/**
 * Determine the next predicted event
 */
const predictNextEvent = (detectedPatterns, forecastPeriods) => {
  const criticalPatterns = detectedPatterns.filter(p =>
    ['calm_before_storm', 'breakout_signal', 'momentum_shift'].includes(p.type)
  );

  if (criticalPatterns.length > 0) {
    criticalPatterns.sort((a, b) => {
      const severityOrder = { low: 0, moderate: 1, high: 2, extreme: 3 };
      const aScore = a.confidence + (severityOrder[a.severity] || 0) * 0.1;
      const bScore = b.confidence + (severityOrder[b.severity] || 0) * 0.1;
      return bScore - aScore;
    });

    const top = criticalPatterns[0];
    const typeMap = {
      calm_before_storm: 'volatility_spike',
      breakout_signal: 'breakout',
      reversal_pending: 'reversal',
      momentum_shift: 'volatility_spike',
      stability_phase: 'calm_period',
    };

    return {
      type: typeMap[top.type] || 'volatility_spike',
      probability: Math.round(top.confidence * 100) / 100,
      estimatedIn: top.expectedDuration,
      description: top.description,
    };
  }

  return {
    type: 'none',
    probability: 0,
    estimatedIn: 0,
    description: 'No significant patterns detected. Market conditions appear normal.',
  };
};

/**
 * Get forecast label from score
 */
const getForecastLabel = (score) => {
  if (score > 80) return 'extreme';
  if (score > 60) return 'high';
  if (score > 40) return 'moderate';
  if (score > 20) return 'low';
  return 'very_low';
};

// ============ SEED / BOOTSTRAP ============

/**
 * Generate an initial forecast using CoinGecko live data directly
 * (used when insufficient snapshots exist)
 */
const seedForecastFromCoingecko = async (coinId, symbol, name, coinData) => {
  const priceChange24h = coinData.price_change_percentage_24h || 0;
  const currentPrice = coinData.current_price || 0;
  const high24h = coinData.high_24h || currentPrice;
  const low24h = coinData.low_24h || currentPrice;

  // Estimate volatility from 24h price range
  const rangePercent = currentPrice > 0 ? ((high24h - low24h) / currentPrice) * 100 : 0;
  const volatilityScore = Math.min(100, Math.round(rangePercent * 3 + Math.abs(priceChange24h) * 0.5));

  // Generate some price points for pattern detection
  const fakePrices = [];
  for (let i = 0; i < 20; i++) {
    fakePrices.push(currentPrice * (1 + (priceChange24h / 100) * (i / 20 - 0.5)));
  }
  if (fakePrices.length === 0) fakePrices.push(currentPrice);

  const fakeVolatilities = [];
  for (let i = 0; i < Math.min(8, fakePrices.length - 1); i++) {
    fakeVolatilities.push(i < 4 ? 5 : Math.max(2, volatilityScore / 10));
  }

  const patterns = [
    detectBreakoutSignal(fakePrices, fakeVolatilities),
    detectMomentumShift(fakePrices, fakeVolatilities),
    detectStabilityPhase(fakePrices, fakeVolatilities),
  ].filter(Boolean);

  // If no patterns detected from limited data, create a basic one based on 24h change
  if (patterns.length === 0 && Math.abs(priceChange24h) > 3) {
    patterns.push({
      type: 'momentum_shift',
      label: `${Math.abs(priceChange24h) > 8 ? 'Strong ' : ''}Price Movement ${priceChange24h > 0 ? '📈' : '📉'}`,
      description: `${symbol.toUpperCase()} has moved ${Math.abs(priceChange24h).toFixed(1)}% in the last 24 hours, indicating active trading conditions.`,
      confidence: Math.min(0.65, Math.abs(priceChange24h) / 20),
      expectedDuration: Math.round(4 + Math.abs(priceChange24h) / 2),
      severity: Math.abs(priceChange24h) > 10 ? 'extreme' : Math.abs(priceChange24h) > 5 ? 'high' : 'moderate',
    });
  }

  // Calculate forecast score
  let forecastScore = Math.min(100, volatilityScore);
  patterns.forEach(p => {
    const severityBoost = { low: 0, moderate: 5, high: 10, extreme: 18 };
    forecastScore += (severityBoost[p.severity] || 0) * p.confidence;
  });
  forecastScore = Math.max(5, Math.min(100, Math.round(forecastScore)));

  const forecastDirection = priceChange24h > 1 ? 'up' : priceChange24h < -1 ? 'down' : 'sideways';
  const nextEvent = predictNextEvent(patterns, []);
  const upcomingPeriods = generateForecastPeriods(fakePrices, fakeVolatilities, patterns);

  const prediction = {
    coinId,
    symbol,
    name,
    currentPrice,
    priceChangePercent24h: priceChange24h,
    forecastScore,
    forecastLabel: getForecastLabel(forecastScore),
    forecastDirection,
    patterns,
    upcomingPeriods,
    nextEvent,
    dataPointsUsed: 1, // seeded from live data
    analysisWindow: 24,
    lastAnalyzed: new Date(),
    nextScheduledAnalysis: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour for bootstrap
  };

  await VolatilityPrediction.findOneAndUpdate(
    { coinId },
    prediction,
    { upsert: true, new: true }
  );

  return prediction;
};

/**
 * Analyze a single coin and generate forecast
 */
const analyzeCoin = async (coinId, symbol, name, hours = 168) => {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  const snapshots = await PriceSnapshot.find({
    coinId,
    timestamp: { $gte: since },
  }).sort({ timestamp: 1 });

  // If we have enough snapshots, do full analysis
  if (snapshots.length >= 4) {
    const prices = snapshots.map(s => s.currentPrice);
    const currentPrice = prices[prices.length - 1];
    const latestSnapshot = snapshots[snapshots.length - 1];
    const priceChangePercent24h = latestSnapshot.priceChangePercent24h || 0;

    // Calculate volatility per time window
    const windowSize = Math.max(1, Math.floor(snapshots.length / 10));
    const volatilities = [];
    for (let i = 0; i < prices.length; i += windowSize) {
      const windowPrices = prices.slice(Math.max(0, i - windowSize), i + windowSize);
      if (windowPrices.length >= 2) {
        const changes = [];
        for (let j = 1; j < windowPrices.length; j++) {
          changes.push((windowPrices[j] - windowPrices[j - 1]) / windowPrices[j - 1]);
        }
        const mean = changes.reduce((a, b) => a + b, 0) / changes.length;
        const variance = changes.reduce((a, b) => a + (b - mean) ** 2, 0) / changes.length;
        volatilities.push(Math.sqrt(variance) * 2500);
      }
    }

    // Detect patterns
    const patterns = [
      detectCalmBeforeStorm(prices, volatilities),
      detectBreakoutSignal(prices, volatilities),
      detectMomentumShift(prices, volatilities),
      detectStabilityPhase(prices, volatilities),
    ].filter(Boolean);

    // Calculate forecast score
    const avgVolatility = volatilities.length > 0 ? volatilities.reduce((a, b) => a + b, 0) / volatilities.length : 5;
    let forecastScore = Math.min(100, avgVolatility * (100 / 15));

    patterns.forEach(p => {
      const severityBoost = { low: 0, moderate: 5, high: 12, extreme: 20 };
      forecastScore += (severityBoost[p.severity] || 0) * p.confidence;
    });

    forecastScore = Math.max(5, Math.min(100, Math.round(forecastScore)));

    const upcomingPeriods = generateForecastPeriods(prices, volatilities, patterns);
    const nextEvent = predictNextEvent(patterns, upcomingPeriods);

    const recentPrices = prices.slice(-3);
    const forecastDirection = recentPrices.length >= 2
      ? (recentPrices[recentPrices.length - 1] > recentPrices[0] ? 'up' : 'down')
      : 'sideways';

    const prediction = {
      coinId,
      symbol,
      name,
      currentPrice: currentPrice || 0,
      priceChangePercent24h,
      forecastScore,
      forecastLabel: getForecastLabel(forecastScore),
      forecastDirection,
      patterns,
      upcomingPeriods,
      nextEvent,
      dataPointsUsed: snapshots.length,
      analysisWindow: hours,
      lastAnalyzed: new Date(),
      nextScheduledAnalysis: new Date(Date.now() + 4 * 60 * 60 * 1000),
    };

    await VolatilityPrediction.findOneAndUpdate(
      { coinId },
      prediction,
      { upsert: true, new: true }
    );

    return prediction;
  }

  // Not enough snapshots — try to seed from CoinGecko
  try {
    const topCoins = await coingecko.getTopCoins(50);
    const coinData = topCoins.find(c => c.id === coinId);
    if (coinData) {
      return await seedForecastFromCoingecko(coinId, symbol, name, coinData);
    }
  } catch (err) {
    console.log(`[${coinId}] Could not seed from CoinGecko: ${err.message}`);
  }

  return null;
};

/**
 * Analyze top coins for forecasting
 */
const analyzeTopCoins = async (limit = 30) => {
  // First try to get coins with enough snapshots
  const topSnapshots = await PriceSnapshot.aggregate([
    { $sort: { coinId: 1, timestamp: -1 } },
    { $group: { _id: '$coinId', doc: { $first: '$$ROOT' } } },
    { $replaceRoot: { newRoot: '$doc' } },
    { $sort: { marketCap: -1 } },
    { $limit: limit },
  ]);

  const results = [];

  // Process coins that have snapshots
  for (const snap of topSnapshots) {
    try {
      const result = await analyzeCoin(snap.coinId, snap.symbol, snap.name);
      if (result) results.push(result);
    } catch (err) {
      console.error(`Forecast error for ${snap.coinId}:`, err.message);
    }
  }

  // If we got fewer than `limit` results, seed the rest from CoinGecko
  if (results.length < limit) {
    try {
      console.log(`🔮 Seeding ${limit - results.length} additional forecasts from live data...`);
      const topCoins = await coingecko.getTopCoins(limit);
      const alreadyDone = new Set(results.map(r => r.coinId));

      for (const coin of topCoins) {
        if (alreadyDone.has(coin.id)) continue;
        if (results.length >= limit) break;

        try {
          const result = await seedForecastFromCoingecko(coin.id, coin.symbol, coin.name, coin);
          if (result) {
            results.push(result);
          }
        } catch (err) {
          console.error(`Seed error for ${coin.id}:`, err.message);
        }
      }
    } catch (err) {
      console.error('Seed from CoinGecko error:', err.message);
    }
  }

  console.log(`✅ Forecast analysis complete: ${results.length} coins analyzed`);
  return results;
};

/**
 * Seed forecasts for all top coins from CoinGecko directly
 * (for initial setup when no snapshots exist)
 */
const seedAllForecasts = async (limit = 50) => {
  try {
    const topCoins = await coingecko.getTopCoins(limit);
    const results = [];

    for (const coin of topCoins) {
      try {
        const result = await seedForecastFromCoingecko(coin.id, coin.symbol, coin.name, coin);
        if (result) results.push(result);
      } catch (err) {
        console.error(`Seed error for ${coin.id}:`, err.message);
      }
    }

    console.log(`✅ Seeded ${results.length} forecasts from CoinGecko`);
    return results;
  } catch (err) {
    console.error('Seed all forecasts error:', err.message);
    return [];
  }
};

/**
 * Get forecasts for a specific coin
 */
const getCoinForecast = async (coinId, hours = 168) => {
  // Try to get existing forecast first
  let prediction = await VolatilityPrediction.findOne({ coinId });

  // If no forecast exists or it's stale, generate a new one
  if (!prediction || (Date.now() - new Date(prediction.lastAnalyzed).getTime()) > 4 * 60 * 60 * 1000) {
    const snapshot = await PriceSnapshot.findOne({ coinId }).sort({ timestamp: -1 });
    if (snapshot) {
      prediction = await analyzeCoin(coinId, snapshot.symbol, snapshot.name, hours);
    } else {
      // No snapshot at all — try to seed from CoinGecko
      try {
        const topCoins = await coingecko.getTopCoins(50);
        const coinData = topCoins.find(c => c.id === coinId);
        if (coinData) {
          prediction = await seedForecastFromCoingecko(coinId, coinData.symbol, coinData.name, coinData);
        }
      } catch (err) {
        console.error(`Seed forecast for ${coinId} error:`, err.message);
      }
    }
  }

  return prediction;
};

/**
 * Get all available forecasts (sorted by highest forecast score)
 */
const getAllForecasts = async (limit = 50) => {
  return VolatilityPrediction.find()
    .sort({ forecastScore: -1 })
    .limit(limit)
    .select('-upcomingPeriods');
};

/**
 * Get hot coins (high volatility forecast) for dashboard widget
 */
const getHotForecasts = async (limit = 6) => {
  return VolatilityPrediction.find({
    forecastScore: { $gte: 40 },
    'nextEvent.type': { $ne: 'none' },
  })
    .sort({ forecastScore: -1 })
    .limit(limit);
};

module.exports = {
  analyzeCoin,
  analyzeTopCoins,
  getCoinForecast,
  getAllForecasts,
  getHotForecasts,
  seedAllForecasts,
  // Exported for testing
  detectCalmBeforeStorm,
  detectBreakoutSignal,
  detectMomentumShift,
  detectStabilityPhase,
};