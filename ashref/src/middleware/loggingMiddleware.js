const logger = require('../config/logger');

const loggingMiddleware = (req, res, next) => {
  const start = Date.now();

  // Log response when it's finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';

    logger[logLevel](`${req.method} ${req.path}`, {
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userId: req.user?.id || 'anonymous',
    });
  });

  next();
};

module.exports = loggingMiddleware;
