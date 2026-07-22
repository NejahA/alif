import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import config from './config/index.js';
import routes from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

// Trust proxy for rate limiting behind reverse proxies
app.set('trust proxy', 1);

// CORS
app.use(cors({ origin: config.cors.origin }));

// Request logging
app.use(morgan(config.env === 'production' ? 'combined' : 'dev'));

// Parse JSON bodies
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// Routes
app.use('/api', routes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port} in ${config.env} mode`);
});
