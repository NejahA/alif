const Joi = require('joi');

const userRegistration = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 2 characters',
  }),
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Invalid email format',
  }),
  password: Joi.string().min(6).max(128).required().messages({
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 6 characters',
  }),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords do not match',
  }),
  phone: Joi.string().optional(),
});

const userLogin = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Invalid email format',
  }),
  password: Joi.string().min(6).required().messages({
    'string.empty': 'Password is required',
  }),
});

const userUpdate = Joi.object({
  name: Joi.string().min(2).max(100),
  phone: Joi.string().optional(),
  avatar: Joi.string().optional(),
}).min(1).messages({
  'object.min': 'At least one field must be provided',
});

const passwordChange = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Passwords do not match',
  }),
});

module.exports = {
  userRegistration,
  userLogin,
  userUpdate,
  passwordChange,
};
