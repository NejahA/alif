const mongoose = require('mongoose');

const watchlistItemSchema = new mongoose.Schema({
  coinId: {
    type: String,
    required: [true, 'Coin ID is required'],
  },
  symbol: {
    type: String,
    required: [true, 'Symbol is required'],
    uppercase: true,
  },
  name: {
    type: String,
    required: [true, 'Coin name is required'],
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
    default: '',
  },
});

const watchlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    default: 'Default Watchlist',
    trim: true,
    maxlength: 100,
  },
  coins: [watchlistItemSchema],
  isDefault: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

watchlistSchema.index({ user: 1, isDefault: 1 });

module.exports = mongoose.model('Watchlist', watchlistSchema);