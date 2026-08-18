import logger from '../config/logger.js';

const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.userId || 'anonymous',
    };
    
    if (res.statusCode >= 400) {
      logger.warn('Request warning:', logData);
    } else {
      logger.info('Request completed:', logData);
    }
  });
  
  next();
};

const errorLogger = (err, req, res, next) => {
  logger.error('Unhandled error:', {
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    userId: req.userId || 'anonymous',
  });
  
  next(err);
};

export { requestLogger, errorLogger };