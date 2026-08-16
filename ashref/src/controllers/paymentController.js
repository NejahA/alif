const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment');
const User = require('../models/User');

// Create or update stripe customer
exports.createOrUpdateCustomer = async (userId) => {
  try {
    const user = await User.findById(userId);
    let subscription = await Subscription.findOne({ userId });

    if (!subscription) {
      subscription = new Subscription({ userId });
    }

    if (!subscription.stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: userId.toString() },
      });

      subscription.stripeCustomerId = customer.id;
      await subscription.save();

      return customer.id;
    }

    return subscription.stripeCustomerId;
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
};

// Create subscription
exports.createSubscription = async (req, res) => {
  try {
    const { plan, billingCycle, paymentMethodId } = req.body;

    const customerId = await exports.createOrUpdateCustomer(req.user.id);

    const prices = {
      FREE: 0,
      BASIC: billingCycle === 'MONTHLY' ? 999 : 9999,
      PRO: billingCycle === 'MONTHLY' ? 2999 : 29999,
      ENTERPRISE: billingCycle === 'MONTHLY' ? 9999 : 99999,
    };

    if (plan === 'FREE') {
      const subscription = await Subscription.findOneAndUpdate(
        { userId: req.user.id },
        {
          plan: 'FREE',
          status: 'ACTIVE',
          startDate: new Date(),
        },
        { upsert: true, new: true }
      );

      return res.json({ message: 'Subscription created', subscription });
    }

    // Create Stripe subscription
    const stripeSubscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: process.env[`STRIPE_${plan}_${billingCycle}_PRICE_ID`] }],
      payment_settings: {
        payment_method_types: ['card'],
      },
    });

    const subscription = await Subscription.findOneAndUpdate(
      { userId: req.user.id },
      {
        plan,
        status: 'ACTIVE',
        stripeSubscriptionId: stripeSubscription.id,
        price: prices[plan],
        billingCycle,
        startDate: new Date(stripeSubscription.current_period_start * 1000),
        renewalDate: new Date(stripeSubscription.current_period_end * 1000),
      },
      { upsert: true, new: true }
    );

    res.json({ message: 'Subscription created', subscription });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel subscription
exports.cancelSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ userId: req.user.id });

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    if (subscription.stripeSubscriptionId) {
      await stripe.subscriptions.del(subscription.stripeSubscriptionId);
    }

    subscription.status = 'CANCELED';
    subscription.endDate = new Date();
    await subscription.save();

    res.json({ message: 'Subscription canceled', subscription });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get subscription
exports.getSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ userId: req.user.id });

    if (!subscription) {
      return res.json({
        plan: 'FREE',
        status: 'ACTIVE',
        features: [],
      });
    }

    res.json(subscription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create payment
exports.createPayment = async (req, res) => {
  try {
    const { amount, paymentMethodId, description } = req.body;

    const customerId = await exports.createOrUpdateCustomer(req.user.id);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      customer: customerId,
      payment_method: paymentMethodId,
      confirm: true,
    });

    const payment = new Payment({
      userId: req.user.id,
      amount,
      status: paymentIntent.status === 'succeeded' ? 'COMPLETED' : 'PENDING',
      stripePaymentIntentId: paymentIntent.id,
      transactionId: paymentIntent.charges.data[0]?.id,
      description,
    });

    if (paymentIntent.status === 'succeeded') {
      payment.paidAt = new Date();
    }

    await payment.save();

    res.json({ message: 'Payment processed', payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get payment history
exports.getPaymentHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Payment.countDocuments({ userId: req.user.id });
    const payments = await Payment.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      payments,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Refund payment
exports.refundPayment = async (req, res) => {
  try {
    const { paymentId, amount } = req.body;
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    const refund = await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
    });

    payment.status = 'REFUNDED';
    payment.refundedAmount = amount || payment.amount;
    payment.refundedAt = new Date();
    await payment.save();

    res.json({ message: 'Payment refunded', payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
