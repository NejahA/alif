import { Router, Request, Response } from 'express';

const router = Router();

// Dummy news items
const news = [
  { id: 1, title: 'Alpalin reaches 10k users!', date: '2026-11-01' },
  { id: 2, title: 'New AR features released', date: '2026-11-05' },
  { id: 3, title: 'Community dream showcase', date: '2026-11-10' },
];

router.get('/news', (req: Request, res: Response) => {
  res.json({ news });
});

export default router;
