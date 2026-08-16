const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'USD',
  },
  status: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
    default: 'PENDING',
  },
  paymentMethod: {
    type: String,
    enum: ['CARD', 'PAYPAL', 'BANK_TRANSFER', 'OTHER'],
  },
  stripePaymentIntentId: String,
  transactionId: String,
  invoiceNumber: String,
  description: String,
  metadata: mongoose.Schema.Types.Mixed,
  failureReason: String,
  refundedAmount: {
    type: Number,
    default: 0,
  },
  refundedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  paidAt: Date,
});

module.exports = mongoose.model('Payment', paymentSchema);
