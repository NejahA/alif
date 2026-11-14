import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Update dream content (title, content, tags) – used for collaborative editing
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { title, content, tags } = req.body;
  const dream = await prisma.dream.findFirst({ where: { id: req.params.id, userId } });
  if (!dream) return res.status(404).json({ error: 'Dream not found' });

  const updated = await prisma.dream.update({
    where: { id: dream.id },
    data: { title, content, tags },
  });

  // Broadcast the updated dream to all connected clients
  const io = (req as any).io;
  io?.emit('dreamEdited', updated);

  res.json(updated);
});

export default router;

