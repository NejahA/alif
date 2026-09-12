const Joi = require('joi');

// Registration validation schema
const registrationSchema = Joi.object({
  username: Joi.string()
    .min(3)
    .max(30)
    .pattern(/^[a-zA-Z0-9_]+$/)
    .required()
    .messages({
      'string.pattern.base': 'Username can only contain letters, numbers, and underscores',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username cannot exceed 30 characters',
      'any.required': 'Username is required'
    }),
  
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required'
    }),
  
  fullName: Joi.string()
    .max(50)
    .allow('')
    .messages({
      'string.max': 'Full name cannot exceed 50 characters'
    }),
  
  profileImage: Joi.string()
    .uri()
    .allow('', null)
    .messages({
      'string.uri': 'Profile image must be a valid URL'
    })
});

// Login validation schema
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

// Profile update validation schema
const profileUpdateSchema = Joi.object({
  fullName: Joi.string()
    .max(50)
    .allow('')
    .messages({
      'string.max': 'Full name cannot exceed 50 characters'
    }),
  
  bio: Joi.string()
    .max(200)
    .allow('')
    .messages({
      'string.max': 'Bio cannot exceed 200 characters'
    }),
  
  profileImage: Joi.string()
    .uri()
    .allow('', null)
    .messages({
      'string.uri': 'Profile image must be a valid URL'
    }),
  
  settings: Joi.object({
    theme: Joi.string()
      .valid('light', 'dark', 'auto')
      .default('auto'),
    defaultLanguage: Joi.string()
      .default('en'),
    notifications: Joi.object({
      email: Joi.boolean().default(true),
      push: Joi.boolean().default(true)
    })
  }).optional()
});

// Validation middleware
const validateRegistration = (req, res, next) => {
  const { error } = registrationSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path[0],
      message: detail.message
    }));
    
    return res.status(400).json({
      message: 'Validation failed',
      errors
    });
  }
  
  next();
};

const validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path[0],
      message: detail.message
    }));
    
    return res.status(400).json({
      message: 'Validation failed',
      errors
    });
  }
  
  next();
};

const validateProfileUpdate = (req, res, next) => {
  const { error } = profileUpdateSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path[0],
      message: detail.message
    }));
    
    return res.status(400).json({
      message: 'Validation failed',
      errors
    });
  }
  
  next();
};

const jwt = require('jsonwebtoken');

// Auth middleware for protected routes
const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        message: 'Authentication required' 
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '313rifts-secret-key-change-this-in-production');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Invalid token' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expired' 
      });
    }
    
    res.status(401).json({ 
      message: 'Authentication failed' 
    });
  }
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateProfileUpdate,
  authMiddleware,
  registrationSchema,
  loginSchema,
  profileUpdateSchema
};