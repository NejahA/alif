import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Return recent push tokens and calendar-linked dreams for the authenticated user
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const pushTokens = await prisma.pushToken.findMany({ where: { userId } });
  const calendarDreams = await prisma.dream.findMany({
    where: { userId, calendarEventId: { not: null } },
    select: { id: true, title: true, calendarEventId: true },
  });
  res.json({ pushTokens, calendarDreams });
});

export default router;

