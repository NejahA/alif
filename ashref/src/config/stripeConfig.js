// Stripe configuration
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.stripe = stripe;

// Stripe webhook handler
exports.handleStripeWebhook = async (body, signature) => {
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(event.data.object);
        break;
    }

    return event;
  } catch (error) {
    console.error('Webhook error:', error);
    throw error;
  }
};

// Handle payment success
async function handlePaymentSuccess(paymentIntent) {
  // Update payment record in database
  console.log('Payment succeeded:', paymentIntent.id);
}

// Handle payment failure
async function handlePaymentFailure(paymentIntent) {
  // Update payment record in database
  console.log('Payment failed:', paymentIntent.id);
}

// Handle invoice paid
async function handleInvoicePaid(invoice) {
  // Update subscription or send notification
  console.log('Invoice paid:', invoice.id);
}

// Handle subscription canceled
async function handleSubscriptionCanceled(subscription) {
  // Update subscription record in database
  console.log('Subscription canceled:', subscription.id);
}

module.exports = exports;
