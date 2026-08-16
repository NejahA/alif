const Notification = require('../models/Notification');
const User = require('../models/User');
const UserPreferences = require('../models/UserPreferences');

// Create notification
exports.createNotification = async (userId, notification) => {
  try {
    const newNotification = new Notification({
      userId,
      ...notification,
    });
    return await newNotification.save();
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// Send email notification
exports.sendEmailNotification = async (userId, subject, message) => {
  try {
    const user = await User.findById(userId);
    const preferences = await UserPreferences.findOne({ userId });

    if (preferences && !preferences.notifications.email.enabled) {
      return;
    }

    // Integration with nodemailer
    const notification = await Notification.create({
      userId,
      type: 'EMAIL',
      title: subject,
      message,
    });

    // Send email here using nodemailer
    return notification;
  } catch (error) {
    console.error('Error sending email notification:', error);
  }
};

// Send SMS notification
exports.sendSmsNotification = async (userId, message) => {
  try {
    const preferences = await UserPreferences.findOne({ userId });

    if (!preferences || !preferences.notifications.sms.enabled || !preferences.notifications.sms.phone) {
      return;
    }

    const notification = await Notification.create({
      userId,
      type: 'SMS',
      message,
    });

    // Integration with Twilio or similar SMS service
    return notification;
  } catch (error) {
    console.error('Error sending SMS notification:', error);
  }
};

// Create in-app notification
exports.createInAppNotification = async (userId, title, message, actionUrl) => {
  try {
    const preferences = await UserPreferences.findOne({ userId });

    if (preferences && !preferences.notifications.inApp.enabled) {
      return;
    }

    return await Notification.create({
      userId,
      type: 'IN_APP',
      title,
      message,
      actionUrl,
    });
  } catch (error) {
    console.error('Error creating in-app notification:', error);
  }
};

// Get user notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ sentAt: -1 })
      .limit(50);

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findById(notificationId);

    if (!notification || notification.userId.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.read = true;
    notification.readAt = new Date();
    await notification.save();

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark all as read
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, read: false },
      { read: true, readAt: new Date() }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findById(notificationId);

    if (!notification || notification.userId.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await Notification.deleteOne({ _id: notificationId });
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Clear all notifications
exports.clearAll = async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.user.id });
    res.json({ message: 'All notifications cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Subscribe to event notifications
exports.subscribeToEvents = async (req, res) => {
  try {
    const { events } = req.body; // ['ORDER_PLACED', 'PAYMENT_RECEIVED', etc.]
    const preferences = await UserPreferences.findOne({ userId: req.user.id });

    if (preferences) {
      preferences.notifications.events = events;
      await preferences.save();
    }

    res.json({ message: 'Subscribed to events', events });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
