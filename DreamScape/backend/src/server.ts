import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';

import authRoutes from './routes/auth';
import dreamRoutes from './routes/dreams';
import adminRoutes from './routes/admin';
import exportRoutes from './routes/export';
import oauthExtraRoutes from './routes/oauthExtra';
import wordcloudRoutes from './routes/wordcloud';
import pdfSummaryRoutes from './routes/pdfSummary';
import notificationRoutes from './routes/notifications';
import profileRoutes from './routes/profile';
import pushRoutes from './routes/push';
import calendarRoutes from './routes/calendar';
import newsRoutes from './routes/news';
import favoritesRoutes from './routes/favorites';
import { apiLimiter } from './middleware/rateLimiter';
import { initSocket } from './socket';
import { scheduleDigest } from './tasks/digest';
import publicRoutes from './routes/public';
import i18nHandler from './middleware/i18nHandler';
import { scheduleEmailReminder } from './tasks/emailReminder';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Global rate limiting
app.use(apiLimiter);

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// i18n middleware
app.use(i18nHandler);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dreams', dreamRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/auth/google', oauthExtraRoutes); // OAuth routes
app.use('/api/profile', profileRoutes);
app.use('/api/push', pushRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/favorites', favoritesRoutes);

// Create HTTP server for Socket.io integration
const httpServer = http.createServer(app);
const io = initSocket(httpServer);

// Make Socket.io instance available to request handlers
app.use((req, _, next) => { (req as any).io = io; next(); });

// Schedule background jobs
scheduleDigest(io);
scheduleEmailReminder(io);

httpServer.listen(PORT, () => {
  console.log(`🛸 DreamScape backend listening on http://localhost:${PORT}`);
});
