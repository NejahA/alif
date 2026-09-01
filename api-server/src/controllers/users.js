// This file is deprecated - use authController.js instead
// Keeping it for backward compatibility with existing routes

export const register = (req, res) => {
  res.status(410).json({ error: 'This endpoint is deprecated. Use /api/auth/register instead' });
};

export const login = (req, res) => {
  res.status(410).json({ error: 'This endpoint is deprecated. Use /api/auth/login instead' });
};

export const getProfile = (req, res) => {
  res.status(410).json({ error: 'This endpoint is deprecated. Use /api/auth/profile instead' });
};

export const updateProfile = (req, res) => {
  res.status(410).json({ error: 'This endpoint is deprecated. Use /api/auth/profile (PUT) instead' });
};