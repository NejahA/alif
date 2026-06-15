const Alert = require('../models/Alert');
const coingecko = require('../services/coingecko');

// @desc   Get all alerts for user
// @route  GET /api/alerts
const getAlerts = async (req, res) => {
  try {
    const { triggered, dismissed } = req.query;
    const filter = { user: req.user._id };

    if (triggered !== undefined) filter.triggered = triggered === 'true';
    if (dismissed !== undefined) filter.dismissed = dismissed === 'true';

    const alerts = await Alert.find(filter).sort({ createdAt: -1 });
    res.json(alerts);
  } catch (error) {
    console.error('Get alerts error:', error.message);
    res.status(500).json({ message: 'Failed to fetch alerts' });
  }
};

// @desc   Create a new alert
// @route  POST /api/alerts
const createAlert = async (req, res) => {
  try {
    const { coinId, symbol, coinName, type, condition } = req.body;

    if (!coinId || !symbol || !type || condition === undefined) {
      return res.status(400).json({ message: 'coinId, symbol, type, and condition are required' });
    }

    const validTypes = ['price_above', 'price_below', 'volatility', 'percent_change'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        message: `Invalid alert type. Must be one of: ${validTypes.join(', ')}`,
      });
    }

    // Fetch current price
    let currentPrice = 0;
    try {
      const prices = await coingecko.getSimplePrice([coinId]);
      currentPrice = prices[coinId]?.usd || 0;
    } catch {
      // Non-critical, use 0
    }

    const alert = await Alert.create({
      user: req.user._id,
      coinId,
      symbol,
      coinName: coinName || symbol.toUpperCase(),
      type,
      condition,
      currentPrice,
    });

    res.status(201).json(alert);
  } catch (error) {
    console.error('Create alert error:', error.message);
    res.status(500).json({ message: 'Failed to create alert' });
  }
};

// @desc   Update alert (e.g., dismiss)
// @route  PUT /api/alerts/:id
const updateAlert = async (req, res) => {
  try {
    const { dismissed, condition, type } = req.body;
    const alert = await Alert.findOne({ _id: req.params.id, user: req.user._id });

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    if (dismissed !== undefined) alert.dismissed = dismissed;
    if (condition !== undefined) alert.condition = condition;
    if (type !== undefined) {
      const validTypes = ['price_above', 'price_below', 'volatility', 'percent_change'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ message: 'Invalid alert type' });
      }
      alert.type = type;
    }

    // Reset triggered state if updating
    alert.triggered = false;
    alert.triggeredAt = null;
    alert.notificationSent = false;

    await alert.save();
    res.json(alert);
  } catch (error) {
    console.error('Update alert error:', error.message);
    res.status(500).json({ message: 'Failed to update alert' });
  }
};

// @desc   Delete an alert
// @route  DELETE /api/alerts/:id
const deleteAlert = async (req, res) => {
  try {
    const alert = await Alert.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    res.json({ message: 'Alert deleted' });
  } catch (error) {
    console.error('Delete alert error:', error.message);
    res.status(500).json({ message: 'Failed to delete alert' });
  }
};

// @desc   Dismiss all triggered alerts
// @route  POST /api/alerts/dismiss-all
const dismissAll = async (req, res) => {
  try {
    await Alert.updateMany(
      { user: req.user._id, triggered: true, dismissed: false },
      { $set: { dismissed: true } }
    );
    res.json({ message: 'All triggered alerts dismissed' });
  } catch (error) {
    console.error('Dismiss all error:', error.message);
    res.status(500).json({ message: 'Failed to dismiss alerts' });
  }
};

module.exports = { getAlerts, createAlert, updateAlert, deleteAlert, dismissAll };