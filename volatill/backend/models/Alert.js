const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  coinId: {
    type: String,
    required: [true, 'Coin ID is required'],
  },
  symbol: {
    type: String,
    required: [true, 'Symbol is required'],
    uppercase: true,
  },
  coinName: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['price_above', 'price_below', 'volatility', 'percent_change'],
    required: [true, 'Alert type is required'],
  },
  condition: {
    type: Number,
    required: [true, 'Condition value is required'],
  },
  currentPrice: {
    type: Number,
    default: 0,
  },
  triggered: {
    type: Boolean,
    default: false,
  },
  triggeredAt: {
    type: Date,
    default: null,
  },
  dismissed: {
    type: Boolean,
    default: false,
  },
  notificationSent: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

alertSchema.index({ user: 1, triggered: 1, dismissed: 1 });
alertSchema.index({ coinId: 1, type: 1 });

module.exports = mongoose.model('Alert', alertSchema);