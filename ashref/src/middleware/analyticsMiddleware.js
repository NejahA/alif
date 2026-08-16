const UsageAnalytics = require('../models/UsageAnalytics');
const AuditLog = require('../models/AuditLog');

// Track API usage
exports.usageTracker = async (req, res, next) => {
  const startTime = Date.now();

  // Override res.json to capture response status
  const originalJson = res.json;
  res.json = function(data) {
    const responseTime = Date.now() - startTime;

    // Track analytics
    if (req.user) {
      UsageAnalytics.create({
        userId: req.user.id,
        endpoint: req.path,
        method: req.method,
        statusCode: res.statusCode,
        responseTime,
        dataSize: JSON.stringify(data).length,
        userAgent: req.get('user-agent'),
        ipAddress: req.ip,
      }).catch(err => console.error('Error logging analytics:', err));
    }

    return originalJson.call(this, data);
  };

  next();
};

// Audit logging
exports.auditLogger = async (req, res, next) => {
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method) && req.user) {
    try {
      let action = 'CREATE';
      if (req.method === 'PUT' || req.method === 'PATCH') action = 'UPDATE';
      if (req.method === 'DELETE') action = 'DELETE';

      await AuditLog.create({
        userId: req.user.id,
        action,
        resource: req.path,
        resourceId: req.params.id || req.body.id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        description: `${req.method} ${req.path}`,
      });
    } catch (error) {
      console.error('Error creating audit log:', error);
    }
  }

  next();
};
