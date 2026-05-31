const request = require('supertest');
const express = require('express');
const errorHandler = require('./errorHandler');
const { notFoundHandler } = require('./errorHandler');

describe('Error Handler Integration', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  it('should handle validation errors from routes', async () => {
    // Create a route that throws a validation error
    app.get('/test-validation', (req, res, next) => {
      const err = new Error('Validation failed');
      err.name = 'ValidationError';
      err.errors = {
        field: { message: 'Field is required' }
      };
      next(err);
    });

    app.use(errorHandler);

    const response = await request(app).get('/test-validation');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should handle CastError from routes', async () => {
    app.get('/test-cast', (req, res, next) => {
      const err = new Error('Cast failed');
      err.name = 'CastError';
      next(err);
    });

    app.use(errorHandler);

    const response = await request(app).get('/test-cast');

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('INVALID_ID');
  });

  it('should handle 404 for undefined routes', async () => {
    app.use(notFoundHandler);

    const response = await request(app).get('/nonexistent-route');

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('ROUTE_NOT_FOUND');
    expect(response.body.error.message).toContain('/nonexistent-route');
  });

  it('should handle generic errors with 500 status', async () => {
    app.get('/test-error', (req, res, next) => {
      next(new Error('Something went wrong'));
    });

    app.use(errorHandler);

    const response = await request(app).get('/test-error');

    expect(response.status).toBe(500);
    expect(response.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('should return consistent error format', async () => {
    app.get('/test', (req, res, next) => {
      const err = new Error('Test error');
      err.statusCode = 400;
      err.code = 'TEST_ERROR';
      next(err);
    });

    app.use(errorHandler);

    const response = await request(app).get('/test');

    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toHaveProperty('message');
    expect(response.body.error).toHaveProperty('code');
    expect(response.body.error.message).toBe('Test error');
    expect(response.body.error.code).toBe('TEST_ERROR');
  });
});
