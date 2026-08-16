const jwt = require('jsonwebtoken');
const logger = require('./logger');

const SECRET_KEY = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';
const TOKEN_EXPIRY = process.env.JWT_EXPIRY || '7d';
const REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '30d';

const generateToken = (userId) => {
  try {
    const token = jwt.sign({ id: userId }, SECRET_KEY, {
      expiresIn: TOKEN_EXPIRY,
    });
    return token;
  } catch (error) {
    logger.error('Error generating token:', error);
    throw error;
  }
};

const generateRefreshToken = (userId) => {
  try {
    const refreshToken = jwt.sign({ id: userId }, SECRET_KEY, {
      expiresIn: REFRESH_TOKEN_EXPIRY,
    });
    return refreshToken;
  } catch (error) {
    logger.error('Error generating refresh token:', error);
    throw error;
  }
};

const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    return decoded;
  } catch (error) {
    logger.error('Token verification failed:', error.message);
    throw error;
  }
};

const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    logger.error('Token decode failed:', error.message);
    throw error;
  }
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  decodeToken,
};
