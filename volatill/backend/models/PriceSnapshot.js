const mongoose = require('mongoose');

const priceSnapshotSchema = new mongoose.Schema({
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
  name: {
    type: String,
    required: true,
  },
  currentPrice: {
    type: Number,
    required: true,
  },
  priceChange24h: Number,
  priceChangePercent24h: Number,
  high24h: Number,
  low24h: Number,
  marketCap: Number,
  totalVolume: Number,
  circulatingSupply: Number,
  volatilityScore: {
    type: Number,
    default: 0,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// TTL index — auto-delete snapshots older than 30 days (also serves as index)
priceSnapshotSchema.index({ timestamp: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

priceSnapshotSchema.index({ coinId: 1, timestamp: -1 });

module.exports = mongoose.model('PriceSnapshot', priceSnapshotSchema);