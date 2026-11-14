import { Router } from 'express';
import prisma from '../prisma';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Register a push notification token
router.post('/register', authMiddleware, async (req, res) => {
  const userId = (req as any).userId;
  const { token, platform } = req.body;
  if (!token || !platform) {
    return res.status(400).json({ error: 'token and platform required' });
  }
  const saved = await prisma.pushToken.upsert({
    where: { token },
    update: { platform },
    create: { userId, token, platform },
  });
  res.json(saved);
});

export default router;

