const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Middleware to check admin role
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Dashboard
router.get('/dashboard', authMiddleware, adminOnly, adminController.getDashboardStats);

// Users management
router.get('/users', authMiddleware, adminOnly, adminController.getAllUsers);
router.get('/users/:userId', authMiddleware, adminOnly, adminController.getUserDetails);
router.put('/users/:userId/role', authMiddleware, adminOnly, adminController.updateUserRole);
router.post('/users/:userId/suspend', authMiddleware, adminOnly, adminController.suspendUser);
router.post('/users/:userId/activate', authMiddleware, adminOnly, adminController.activateUser);

// System logs
router.get('/logs', authMiddleware, adminOnly, adminController.getSystemLogs);

// System health
router.get('/health', authMiddleware, adminOnly, adminController.getSystemHealth);

module.exports = router;
