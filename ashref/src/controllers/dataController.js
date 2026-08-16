const User = require('../models/User');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const UsageAnalytics = require('../models/UsageAnalytics');
const json2csv = require('json2csv').parse;

// Get paginated users
exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const sort = req.query.sort || '-createdAt';

    const query = {
      $or: [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ],
    };

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    res.json({
      users,
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

// Filter users
exports.filterUsers = async (req, res) => {
  try {
    const {
      role,
      status,
      emailVerified,
      createdAfter,
      createdBefore,
      limit = 10,
    } = req.query;

    const query = {};
    if (role) query.role = role;
    if (status) query.status = status;
    if (emailVerified !== undefined) query.emailVerified = emailVerified === 'true';

    if (createdAfter || createdBefore) {
      query.createdAt = {};
      if (createdAfter) query.createdAt.$gte = new Date(createdAfter);
      if (createdBefore) query.createdAt.$lte = new Date(createdBefore);
    }

    const users = await User.find(query)
      .select('-password')
      .limit(parseInt(limit));

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export users to CSV
exports.exportUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').lean();

    const fields = ['_id', 'email', 'name', 'role', 'emailVerified', 'createdAt'];
    const csv = json2csv(users, { fields });

    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename=users.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get audit logs
exports.getAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const userId = req.query.userId;
    const action = req.query.action;

    const query = {};
    if (userId) query.userId = userId;
    if (action) query.action = action;

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'email name');

    res.json({
      logs,
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

// Get usage analytics
exports.getUsageAnalytics = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const userId = req.query.userId;
    const endpoint = req.query.endpoint;

    const query = {};
    if (userId) query.userId = userId;
    if (endpoint) query.endpoint = endpoint;

    const total = await UsageAnalytics.countDocuments(query);
    const analytics = await UsageAnalytics.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      analytics,
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

// Get analytics summary
exports.getAnalyticsSummary = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const summary = await UsageAnalytics.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          avgResponseTime: { $avg: '$responseTime' },
          totalData: { $sum: '$dataSize' },
          errorCount: {
            $sum: { $cond: [{ $gte: ['$statusCode', 400] }, 1, 0] },
          },
        },
      },
    ]);

    res.json(summary[0] || {});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user notifications
exports.getUserNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const unreadOnly = req.query.unreadOnly === 'true';

    const query = { userId: req.user.id };
    if (unreadOnly) query.read = false;

    const total = await Notification.countDocuments(query);
    const notifications = await Notification.find(query)
      .sort({ sentAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      notifications,
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
