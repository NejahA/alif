import { Router } from 'express';

const router = Router();

// Placeholder calendar route – returns empty array
router.get('/', (req, res) => {
  res.json({ events: [] });
});

export default router;
