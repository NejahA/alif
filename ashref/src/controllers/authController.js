const User = require('../models/User');
const { generateToken, generateRefreshToken } = require('../config/jwt');
const { sendWelcomeEmail } = require('../config/email');
const logger = require('../config/logger');

const authController = {
  // Register new user
  register: async (req, res, next) => {
    try {
      const { name, email, password, phone } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          error: 'User already exists',
          message: 'Email is already registered',
        });
      }

      // Create new user
      const user = new User({ name, email, password, phone });
      await user.save();

      // Send welcome email
      try {
        await sendWelcomeEmail(email, name);
      } catch (emailError) {
        logger.error('Failed to send welcome email:', emailError.message);
      }

      // Generate tokens
      const token = generateToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      logger.info(`User registered: ${email}`);

      res.status(201).json({
        message: 'User registered successfully',
        user: user.toJSON(),
        token,
        refreshToken,
      });
    } catch (error) {
      next(error);
    }
  },

  // Login user
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ email }).select('+password');
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({
          error: 'Invalid credentials',
          message: 'Email or password is incorrect',
        });
      }

      if (!user.isActive) {
        return res.status(403).json({
          error: 'Account disabled',
          message: 'Your account has been disabled',
        });
      }

      // Generate tokens
      const token = generateToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      logger.info(`User logged in: ${email}`);

      res.json({
        message: 'Login successful',
        user: user.toJSON(),
        token,
        refreshToken,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get current user profile
  getProfile: async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          error: 'User not found',
        });
      }

      res.json({
        user: user.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  },

  // Update user profile
  updateProfile: async (req, res, next) => {
    try {
      const { name, phone, avatar } = req.body;

      const user = await User.findByIdAndUpdate(
        req.user.id,
        { name, phone, avatar },
        { new: true, runValidators: true }
      );

      if (!user) {
        return res.status(404).json({
          error: 'User not found',
        });
      }

      logger.info(`User profile updated: ${user.email}`);

      res.json({
        message: 'Profile updated successfully',
        user: user.toJSON(),
      });
    } catch (error) {
      next(error);
    }
  },

  // Change password
  changePassword: async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(req.user.id).select('+password');
      if (!user) {
        return res.status(404).json({
          error: 'User not found',
        });
      }

      // Verify current password
      if (!(await user.comparePassword(currentPassword))) {
        return res.status(401).json({
          error: 'Invalid current password',
        });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      logger.info(`User changed password: ${user.email}`);

      res.json({
        message: 'Password changed successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  // List all users (admin only)
  getAllUsers: async (req, res, next) => {
    try {
      const { page = 1, limit = 10 } = req.query;

      const users = await User.find()
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const count = await User.countDocuments();

      res.json({
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = authController;
