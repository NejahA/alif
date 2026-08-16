const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

const SECRET_KEY = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'No token provided',
      });
    }

    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Please login again',
      });
    }
    logger.error('Auth middleware error:', error.message);
    return res.status(403).json({
      error: 'Invalid token',
    });
  }
};

const adminMiddleware = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'User not authenticated',
      });
    }

    // For demo purposes, checking if user ID contains 'admin'
    // In production, check the user's role from database
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Admin access required',
      });
    }

    next();
  } catch (error) {
    logger.error('Admin middleware error:', error.message);
    return res.status(500).json({
      error: 'Server error',
    });
  }
};

module.exports = {
  authMiddleware,
  adminMiddleware,
};
