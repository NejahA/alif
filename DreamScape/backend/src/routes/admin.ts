import { Router } from 'express';
import prisma from '../prisma';
import { adminMiddleware } from '../middleware/adminMiddleware';

const router = Router();

// List all users (admin only)
router.get('/users', adminMiddleware, async (req, res) => {
  const users = await prisma.user.findMany({ select: { id: true, email: true, role: true, createdAt: true } });
  res.json(users);
});

export default router;

