const mongoose = require('mongoose');

const patternSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['calm_before_storm', 'volatility_cluster', 'breakout_signal', 'reversal_pending', 'momentum_shift', 'stability_phase'],
    required: true,
  },
  label: String,
  description: String,
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.5,
  },
  detectedAt: {
    type: Date,
    default: Date.now,
  },
  expectedDuration: Number, // hours until pattern likely resolves
  severity: {
    type: String,
    enum: ['low', 'moderate', 'high', 'extreme'],
    default: 'moderate',
  },
});

const forecastedPeriodSchema = new mongoose.Schema({
  startTime: Date,
  endTime: Date,
  expectedVolatility: {
    type: Number,
    min: 0,
    max: 100,
    default: 50,
  },
  expectedVolatilityLabel: {
    type: String,
    enum: ['very_low', 'low', 'moderate', 'high', 'extreme'],
    default: 'moderate',
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.5,
  },
  primaryDriver: String,
});

const volatilityPredictionSchema = new mongoose.Schema({
  coinId: {
    type: String,
    required: true,
    index: true,
  },
  symbol: {
    type: String,
    required: true,
    uppercase: true,
  },
  name: String,
  currentPrice: Number,
  priceChangePercent24h: Number,

  // Overall forecast
  forecastScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50,
  },
  forecastLabel: {
    type: String,
    enum: ['very_low', 'low', 'moderate', 'high', 'extreme'],
    default: 'moderate',
  },
  forecastDirection: {
    type: String,
    enum: ['up', 'down', 'sideways', 'unclear'],
    default: 'unclear',
  },

  // Detected patterns
  patterns: [patternSchema],

  // Upcoming forecast periods
  upcomingPeriods: [forecastedPeriodSchema],

  // Next predicted event
  nextEvent: {
    type: {
      type: String,
      enum: ['volatility_spike', 'calm_period', 'breakout', 'reversal', 'none'],
      default: 'none',
    },
    probability: {
      type: Number,
      min: 0,
      max: 1,
    },
    estimatedIn: Number, // hours from now
    description: String,
  },

  // Historical accuracy tracking
  historicalAccuracy: {
    predictionsMade: { type: Number, default: 0 },
    predictionsCorrect: { type: Number, default: 0 },
    lastCorrectPrediction: Date,
    lastIncorrectPrediction: Date,
  },

  // Analysis metadata
  dataPointsUsed: Number,
  analysisWindow: {
    type: Number, // hours of data used
    default: 168, // 7 days
  },
  lastAnalyzed: {
    type: Date,
    default: Date.now,
  },
  nextScheduledAnalysis: Date,
});

volatilityPredictionSchema.index({ coinId: 1, lastAnalyzed: -1 });
volatilityPredictionSchema.index({ forecastScore: -1 });

module.exports = mongoose.model('VolatilityPrediction', volatilityPredictionSchema);