import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import logger from '../config/logger.js';
import User from '../models/User.js';

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    // Auto-activate Capacitor Expansion and Efficient Scanner if missing
    if (!user.upgrades || user.upgrades.length === 0) {
      user.upgrades = [
        { name: 'Capacitor Expansion', level: 1, purchasedAt: new Date() },
        { name: 'Efficient Scanner', level: 1, purchasedAt: new Date() }
      ];
      user.energy = 1500;
      await user.save();
    }
    
    req.user = user;
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};

const checkEnergyMiddleware = (requiredEnergy) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      if (user.energy < requiredEnergy) {
        return res.status(400).json({ 
          error: 'Insufficient energy', 
          currentEnergy: user.energy,
          requiredEnergy 
        });
      }
      
      next();
    } catch (error) {
      logger.error('Energy check error:', error);
      return res.status(500).json({ error: 'Energy check failed' });
    }
  };
};

export { authMiddleware, roleMiddleware, checkEnergyMiddleware };