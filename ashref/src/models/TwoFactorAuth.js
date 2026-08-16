const mongoose = require('mongoose');

const twoFactorAuthSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  enabled: {
    type: Boolean,
    default: false,
  },
  secret: {
    type: String,
  },
  backupCodes: [{
    code: String,
    used: {
      type: Boolean,
      default: false,
    },
    usedAt: Date,
  }],
  verifiedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('TwoFactorAuth', twoFactorAuthSchema);
