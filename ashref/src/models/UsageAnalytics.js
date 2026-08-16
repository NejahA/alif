const mongoose = require('mongoose');

const usageAnalyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  endpoint: String,
  method: String,
  statusCode: Number,
  responseTime: Number, // in ms
  dataSize: Number, // in bytes
  userAgent: String,
  ipAddress: String,
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// TTL index to keep only 90 days of data
usageAnalyticsSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

module.exports = mongoose.model('UsageAnalytics', usageAnalyticsSchema);
