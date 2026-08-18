import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import config from './config/index.js';
import logger from './config/logger.js';
import { requestLogger, errorLogger } from './middleware/loggingMiddleware.js';
import { getHealth } from './controllers/health.js';
import errorHandler from './middleware/errorHandler.js';

// Import routers
import authRouter from './routes/auth.js';
import userRouter from './routes/user.js';
import toasterRouter from './routes/toaster.js';
import gameRouter from './routes/game.js';

const app = express();

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Time Traveling Toaster API',
      version: '2.0.0',
      description: 'API for the revolutionary Time Traveling Toaster with ALL features',
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(cors({ origin: config.cors.origin }));
app.use(requestLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  limit: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use(limiter);

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/health', getHealth);
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Time Traveling Toaster API!',
    version: '2.0.0',
    docs: `/api-docs`,
    features: [
      'JWT Authentication',
      'User Management',
      'Time Travel Mechanics',
      'Toaster Discovery',
      'Energy System',
      'Game Progression',
      'Real-time Updates',
      'File Uploads',
      'Email Notifications',
      'Comprehensive Logging',
    ],
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/toasters', toasterRouter);
app.use('/api/game', gameRouter);

// 404 handler
app.use((req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Not Found',
    message: 'The requested resource was not found.',
    availableRoutes: ['/api/auth', '/api/users', '/api/toasters', '/api/game', '/api-docs']
  });
});

// Error handling
app.use(errorLogger);
app.use(errorHandler);

export default app;
