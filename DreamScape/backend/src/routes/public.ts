import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';

const router = Router();

// Simple rate limiter: max 100 requests per hour per IP
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.',
});

router.use(limiter);

// Public health check
router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Example read‑only data endpoint (static JSON)
router.get('/info', (req: Request, res: Response) => {
  res.json({
    app: 'Alpalin',
    version: '1.0.0',
    description: 'Public read‑only API for DreamScape backend',
  });
});

export default router;
