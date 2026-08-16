const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Subscriptions
router.post('/subscribe', authMiddleware, paymentController.createSubscription);
router.get('/subscription', authMiddleware, paymentController.getSubscription);
router.post('/subscription/cancel', authMiddleware, paymentController.cancelSubscription);

// Payments
router.post('/payment', authMiddleware, paymentController.createPayment);
router.get('/payments', authMiddleware, paymentController.getPaymentHistory);
router.post('/payments/:paymentId/refund', authMiddleware, paymentController.refundPayment);

module.exports = router;
