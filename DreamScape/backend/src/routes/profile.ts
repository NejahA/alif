import { Router } from 'express';
import prisma from '../prisma';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Get current user's profile
router.get('/', authMiddleware, async (req, res) => {
  const userId = (req as any).userId;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, role: true, language: true, darkMode: true } });
  res.json(user);
});

// Update profile (e.g., darkMode, language)
router.patch('/', authMiddleware, async (req, res) => {
  const userId = (req as any).userId;
  const { darkMode, language } = req.body;
  const updated = await prisma.user.update({ where: { id: userId }, data: { darkMode, language } });
  res.json(updated);
});

export default router;

