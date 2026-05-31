const errorHandler = require('./errorHandler');
const { notFoundHandler } = require('./errorHandler');

describe('Error Handler Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    console.error = jest.fn(); // Mock console.error
  });

  describe('Validation Errors', () => {
    it('should handle Mongoose ValidationError', () => {
      const err = {
        name: 'ValidationError',
        errors: {
          title: { message: 'Title is required' },
          priority: { message: 'Invalid priority value' }
        }
      };

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: expect.stringContaining('Title is required')
        }
      });
    });
  });

  describe('CastError (Invalid ID)', () => {
    it('should handle Mongoose CastError', () => {
      const err = {
        name: 'CastError',
        message: 'Cast to ObjectId failed'
      };

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          message: 'Invalid ID format',
          code: 'INVALID_ID',
          details: 'Cast to ObjectId failed'
        }
      });
    });
  });

  describe('Duplicate Key Errors', () => {
    it('should handle MongoDB duplicate key error', () => {
      const err = {
        code: 11000,
        keyPattern: { name: 1 },
        message: 'Duplicate key error'
      };

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          message: 'Duplicate value for name',
          code: 'DUPLICATE_ERROR',
          details: 'Duplicate key error'
        }
      });
    });
  });

  describe('Not Found Errors', () => {
    it('should handle custom 404 errors', () => {
      const err = {
        statusCode: 404,
        message: 'Task not found'
      };

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          message: 'Task not found',
          code: 'NOT_FOUND'
        }
      });
    });
  });

  describe('Bad Request Errors', () => {
    it('should handle custom 400 errors', () => {
      const err = {
        statusCode: 400,
        message: 'Invalid input',
        code: 'INVALID_INPUT',
        details: 'Title cannot be empty'
      };

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          message: 'Invalid input',
          code: 'INVALID_INPUT',
          details: 'Title cannot be empty'
        }
      });
    });
  });

  describe('Generic Server Errors', () => {
    it('should handle generic errors with 500 status', () => {
      const err = {
        message: 'Something went wrong'
      };

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          message: 'Something went wrong',
          code: 'INTERNAL_ERROR',
          details: undefined
        }
      });
    });

    it('should use default message for errors without message', () => {
      const err = {};

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
          details: undefined
        }
      });
    });
  });

  describe('Not Found Handler', () => {
    it('should handle undefined routes', () => {
      req.originalUrl = '/api/nonexistent';

      notFoundHandler(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          message: 'Route /api/nonexistent not found',
          code: 'ROUTE_NOT_FOUND'
        }
      });
    });
  });

  describe('Consistent Error Format', () => {
    it('should always return error object with message and code', () => {
      const testCases = [
        { name: 'ValidationError', errors: { field: { message: 'error' } } },
        { name: 'CastError', message: 'cast error' },
        { code: 11000, keyPattern: { field: 1 }, message: 'duplicate' },
        { statusCode: 404, message: 'not found' },
        { statusCode: 400, message: 'bad request' },
        { message: 'generic error' }
      ];

      testCases.forEach(err => {
        res.json.mockClear();
        errorHandler(err, req, res, next);
        
        const response = res.json.mock.calls[0][0];
        expect(response).toHaveProperty('error');
        expect(response.error).toHaveProperty('message');
        expect(response.error).toHaveProperty('code');
      });
    });
  });
});
