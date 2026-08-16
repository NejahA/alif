const mongoose = require('mongoose');

const userPreferencesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  theme: {
    type: String,
    enum: ['light', 'dark', 'auto'],
    default: 'auto',
  },
  language: {
    type: String,
    default: 'en',
  },
  timezone: {
    type: String,
    default: 'UTC',
  },
  notifications: {
    email: {
      enabled: { type: Boolean, default: true },
      marketing: { type: Boolean, default: true },
      updates: { type: Boolean, default: true },
    },
    inApp: {
      enabled: { type: Boolean, default: true },
    },
    sms: {
      enabled: { type: Boolean, default: false },
      phone: String,
    },
  },
  privacy: {
    profilePublic: { type: Boolean, default: false },
    showEmail: { type: Boolean, default: false },
    dataCollection: { type: Boolean, default: true },
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('UserPreferences', userPreferencesSchema);
