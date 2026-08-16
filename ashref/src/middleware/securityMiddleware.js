const ApiKey = require('../models/ApiKey');

// Verify API key middleware
exports.apiKeyMiddleware = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return res.status(401).json({ message: 'API key required' });
    }

    const key = await ApiKey.findOne({ key: apiKey });

    if (!key) {
      return res.status(401).json({ message: 'Invalid API key' });
    }

    if (!key.active) {
      return res.status(401).json({ message: 'API key is inactive' });
    }

    if (key.expiresAt && new Date() > key.expiresAt) {
      return res.status(401).json({ message: 'API key has expired' });
    }

    // Check IP whitelist
    if (key.ipWhitelist && key.ipWhitelist.length > 0) {
      const clientIp = req.ip;
      if (!key.ipWhitelist.includes(clientIp)) {
        return res.status(403).json({ message: 'IP not whitelisted' });
      }
    }

    // Check permissions
    const method = req.method.toLowerCase();
    if (!key.permissions.includes(method)) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    // Update last used
    key.lastUsed = new Date();
    await key.save();

    req.apiKey = key;
    req.user = { id: key.userId };
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CSRF token middleware
exports.csrfProtection = (req, res, next) => {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const csrfToken = req.headers['x-csrf-token'] || req.body._csrf;

    if (!csrfToken) {
      return res.status(403).json({ message: 'CSRF token missing' });
    }

    // Verify CSRF token (implementation depends on your session management)
    // This is a basic example
    const storedToken = req.session?.csrfToken;
    if (csrfToken !== storedToken) {
      return res.status(403).json({ message: 'Invalid CSRF token' });
    }
  }

  next();
};
