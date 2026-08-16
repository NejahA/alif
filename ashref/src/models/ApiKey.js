const mongoose = require('mongoose');
const crypto = require('crypto');

const apiKeySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  key: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  maskedKey: String, // Shows only last 4 chars
  permissions: {
    type: [String],
    default: ['read'],
  },
  active: {
    type: Boolean,
    default: true,
  },
  ipWhitelist: [String],
  lastUsed: Date,
  expiresAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Generate API key before saving
apiKeySchema.pre('save', function(next) {
  if (!this.key) {
    this.key = crypto.randomBytes(32).toString('hex');
    this.maskedKey = '****' + this.key.slice(-4);
  }
  next();
});

module.exports = mongoose.model('ApiKey', apiKeySchema);
