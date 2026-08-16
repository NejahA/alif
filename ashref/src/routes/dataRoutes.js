const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Users with pagination, filtering, sorting
router.get('/users', authMiddleware, dataController.getUsers);
router.post('/users/filter', authMiddleware, dataController.filterUsers);
router.get('/users/export', authMiddleware, dataController.exportUsers);

// Audit logs
router.get('/audit-logs', authMiddleware, dataController.getAuditLogs);

// Usage analytics
router.get('/analytics', authMiddleware, dataController.getUsageAnalytics);
router.get('/analytics/summary', authMiddleware, dataController.getAnalyticsSummary);

// Notifications
router.get('/notifications', authMiddleware, dataController.getUserNotifications);

module.exports = router;
