import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import config from './config/index.js';
import { getHealth } from './controllers/health.js';
import toasterRouter from './routes/toaster.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

app.use(cors({ origin: config.cors.origin }));
app.use(morgan(config.env === 'production' ? 'combined' : 'dev'));
app.use(express.json());

const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  limit: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.get('/health', getHealth);
app.use('/api/toaster', toasterRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.use(errorHandler);

export default app;
