import Joi from 'joi';

const registerSchema = Joi.object({
  username: Joi.string()
    .pattern(/^[a-zA-Z0-9_-]+$/)
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.pattern.base': 'Username can only contain letters, numbers, underscores, and hyphens',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username cannot exceed 30 characters',
      'any.required': 'Username is required',
    }),
    
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
    
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required',
    }),
    
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Please confirm your password',
    }),
});

const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
    
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required',
    }),
});

const updateProfileSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .optional(),
    
  energy: Joi.number()
    .min(0)
    .max(1000)
    .optional(),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Current password is required',
    }),
    
  newPassword: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'New password must be at least 6 characters long',
      'any.required': 'New password is required',
    }),
    
  confirmNewPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'New passwords do not match',
      'any.required': 'Please confirm your new password',
    }),
});

const timeTravelSchema = Joi.object({
  targetPeriod: Joi.string()
    .valid('prehistoric', 'medieval', 'renaissance', 'industrial', 'modern', 'futuristic')
    .required()
    .messages({
      'any.only': 'Invalid time period',
      'any.required': 'Target time period is required',
    }),
    
  coordinates: Joi.object({
    x: Joi.number().required(),
    y: Joi.number().required(),
    z: Joi.number().default(0),
  }).optional(),
});

export {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  timeTravelSchema,
};