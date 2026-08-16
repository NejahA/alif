const User = require('../models/User');
const EmailVerification = require('../models/EmailVerification');
const UserPreferences = require('../models/UserPreferences');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Send verification email
exports.sendVerificationEmail = async (userId, email) => {
  const token = crypto.randomBytes(32).toString('hex');
  const verification = new EmailVerification({
    userId,
    email,
    token,
  });
  await verification.save();
  
  // Send email (configured with nodemailer)
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  // Email sending logic here
  return verificationLink;
};

// Verify email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    const verification = await EmailVerification.findOne({ token });

    if (!verification) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    if (verification.verified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    verification.verified = true;
    await verification.save();

    const user = await User.findById(verification.userId);
    user.emailVerified = true;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user preferences
exports.getPreferences = async (req, res) => {
  try {
    let preferences = await UserPreferences.findOne({ userId: req.user.id });
    
    if (!preferences) {
      preferences = new UserPreferences({ userId: req.user.id });
      await preferences.save();
    }

    res.json(preferences);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user preferences
exports.updatePreferences = async (req, res) => {
  try {
    let preferences = await UserPreferences.findOne({ userId: req.user.id });
    
    if (!preferences) {
      preferences = new UserPreferences({ userId: req.user.id });
    }

    Object.assign(preferences, req.body);
    preferences.updatedAt = new Date();
    await preferences.save();

    res.json({ message: 'Preferences updated', preferences });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete account
exports.deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user.id);

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Soft delete - mark user as deleted
    user.deleted = true;
    user.deletedAt = new Date();
    await user.save();

    // Clean up user data
    await UserPreferences.deleteOne({ userId: req.user.id });
    await EmailVerification.deleteMany({ userId: req.user.id });

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Recover account
exports.recoverAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user.deleted) {
      return res.status(400).json({ message: 'Account is not deleted' });
    }

    user.deleted = false;
    user.deletedAt = null;
    await user.save();

    res.json({ message: 'Account recovered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
