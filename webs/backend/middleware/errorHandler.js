// Error handling middleware for consistent error responses

const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error('Error:', err);

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: Object.values(err.errors).map(e => e.message).join(', ')
      }
    });
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: {
        message: 'Invalid ID format',
        code: 'INVALID_ID',
        details: err.message
      }
    });
  }

  // Handle MongoDB duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      error: {
        message: `Duplicate value for ${field}`,
        code: 'DUPLICATE_ERROR',
        details: err.message
      }
    });
  }

  // Handle custom not found errors
  if (err.statusCode === 404) {
    return res.status(404).json({
      error: {
        message: err.message || 'Resource not found',
        code: 'NOT_FOUND'
      }
    });
  }

  // Handle custom validation errors
  if (err.statusCode === 400) {
    return res.status(400).json({
      error: {
        message: err.message || 'Bad request',
        code: err.code || 'BAD_REQUEST',
        details: err.details
      }
    });
  }

  // Default to 500 server error
  res.status(err.statusCode || 500).json({
    error: {
      message: err.message || 'Internal server error',
      code: err.code || 'INTERNAL_ERROR',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }
  });
};

// 404 handler for undefined routes
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    error: {
      message: `Route ${req.originalUrl} not found`,
      code: 'ROUTE_NOT_FOUND'
    }
  });
};

module.exports = errorHandler;
module.exports.notFoundHandler = notFoundHandler;
