const AdminUser = require('../models/User');
const AuditLog = require('../models/AuditLog');
const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment');

// Dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await AdminUser.countDocuments({ deleted: false });
    const verifiedUsers = await AdminUser.countDocuments({ emailVerified: true, deleted: false });

    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'COMPLETED' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const subscriptionStats = await Subscription.aggregate([
      { $group: { _id: '$plan', count: { $sum: 1 } } },
    ]);

    const recentUsers = await AdminUser.find({ deleted: false })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('email name createdAt emailVerified');

    res.json({
      totalUsers,
      verifiedUsers,
      totalRevenue: totalRevenue[0]?.total || 0,
      subscriptionStats,
      recentUsers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all users (admin)
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    const query = {
      $or: [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ],
    };

    const total = await AdminUser.countDocuments(query);
    const users = await AdminUser.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      users,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user details
exports.getUserDetails = async (req, res) => {
  try {
    const user = await AdminUser.findById(req.params.userId).select('-password');
    const subscription = await Subscription.findOne({ userId: req.params.userId });
    const recentAuditLogs = await AuditLog.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      user,
      subscription,
      recentActivity: recentAuditLogs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user role
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await AdminUser.findByIdAndUpdate(
      req.params.userId,
      { role },
      { new: true }
    ).select('-password');

    await AuditLog.create({
      userId: req.user.id,
      action: 'UPDATE',
      resource: 'User',
      resourceId: req.params.userId,
      changes: { role },
      description: `User role updated to ${role}`,
    });

    res.json({ message: 'User role updated', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Suspend user
exports.suspendUser = async (req, res) => {
  try {
    const user = await AdminUser.findByIdAndUpdate(
      req.params.userId,
      { status: 'SUSPENDED' },
      { new: true }
    ).select('-password');

    await AuditLog.create({
      userId: req.user.id,
      action: 'UPDATE',
      resource: 'User',
      resourceId: req.params.userId,
      description: 'User suspended',
    });

    res.json({ message: 'User suspended', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Activate user
exports.activateUser = async (req, res) => {
  try {
    const user = await AdminUser.findByIdAndUpdate(
      req.params.userId,
      { status: 'ACTIVE' },
      { new: true }
    ).select('-password');

    await AuditLog.create({
      userId: req.user.id,
      action: 'UPDATE',
      resource: 'User',
      resourceId: req.params.userId,
      description: 'User activated',
    });

    res.json({ message: 'User activated', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// View system logs
exports.getSystemLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const action = req.query.action;

    const query = {};
    if (action) query.action = action;

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'email name');

    res.json({
      logs,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get system health
exports.getSystemHealth = async (req, res) => {
  try {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    const stats = {
      uptime: Math.floor(uptime / 60) + ' minutes',
      memory: {
        heapUsed: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2) + ' MB',
        heapTotal: (memoryUsage.heapTotal / 1024 / 1024).toFixed(2) + ' MB',
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
      },
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
