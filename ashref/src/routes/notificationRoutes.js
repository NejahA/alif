const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Get notifications
router.get('/', authMiddleware, notificationController.getNotifications);

// Mark as read
router.put('/:notificationId/read', authMiddleware, notificationController.markAsRead);
router.put('/mark-all-read', authMiddleware, notificationController.markAllAsRead);

// Delete
router.delete('/:notificationId', authMiddleware, notificationController.deleteNotification);
router.delete('/', authMiddleware, notificationController.clearAll);

// Subscribe to events
router.post('/subscribe-events', authMiddleware, notificationController.subscribeToEvents);

module.exports = router;
