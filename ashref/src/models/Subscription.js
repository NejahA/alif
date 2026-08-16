const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  plan: {
    type: String,
    enum: ['FREE', 'BASIC', 'PRO', 'ENTERPRISE'],
    default: 'FREE',
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'CANCELED', 'EXPIRED', 'PENDING'],
    default: 'ACTIVE',
  },
  stripeCustomerId: String,
  stripeSubscriptionId: String,
  price: {
    type: Number,
    default: 0,
  },
  currency: {
    type: String,
    default: 'USD',
  },
  billingCycle: {
    type: String,
    enum: ['MONTHLY', 'YEARLY'],
    default: 'MONTHLY',
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: Date,
  renewalDate: Date,
  autoRenew: {
    type: Boolean,
    default: true,
  },
  features: [String],
  usageStats: {
    apiCalls: { type: Number, default: 0 },
    storage: { type: Number, default: 0 },
    users: { type: Number, default: 0 },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
