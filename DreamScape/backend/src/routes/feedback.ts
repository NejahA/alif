import { Router } from 'express';

const router = Router();

// Simple feedback endpoint – echoes a thank‑you reply
router.post('/', (req, res) => {
  const { message } = req.body;
  console.log('Feedback received:', message);
  res.json({ reply: 'Thanks for your feedback!' });
});

export default router;
