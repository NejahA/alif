// Public read‑only API with rate‑limit
import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';

const router = Router();
const limiter = rateLimit({ windowMs: 60_000, max: 30 }); // 30 req/min per IP

router.get('/public/dreams', limiter, (_req: Request, res: Response) => {
  // TODO: replace with real DB call
  res.json({ dreams: [{ id: 1, title: 'Fly over the city' }] });
});

export default router;
