import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import { authMiddleware } from '../middleware/authMiddleware';
import { generateInsight } from '../utils/gemini';
import { upload } from '../middleware/upload';

const router = Router();

// Get all dreams for authenticated user
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const dreams = await prisma.dream.findMany({ where: { userId } });
  res.json(dreams);
});

// Search dreams by tag
router.get('/search', authMiddleware, async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const tag = (req.query.tag as string) ?? '';
  const dreams = await prisma.dream.findMany({
    where: { userId, tags: { contains: tag } },
  });
  res.json(dreams);
});

// Create a new dream
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { title, content, tags } = req.body;
  const dream = await prisma.dream.create({
    data: { title, content, tags, user: { connect: { id: userId } } },
  });
  // Notify via socket.io
  const io = (req as any).io;
  io?.emit('dreamCreated', dream);
  res.status(201).json(dream);
});

// Upload audio for a dream
router.post('/:id/audio', authMiddleware, upload.single('audio'), async (req, res) => {
  const userId = (req as any).userId;
  const dream = await prisma.dream.findFirst({ where: { id: req.params.id, userId } });
  if (!dream) return res.status(404).json({ error: 'Dream not found' });
  const audioUrl = `/uploads/${req.file?.filename}`;
  const updated = await prisma.dream.update({
    where: { id: dream.id },
    data: { audioUrl },
  });
  const io = (req as any).io;
  io?.emit('dreamUpdated', updated);
  res.json(updated);
});

// Generate AI insight for a specific dream (Gemini)
router.post('/:id/insight', authMiddleware, async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const dream = await prisma.dream.findFirst({ where: { id: req.params.id, userId } });
  if (!dream) return res.status(404).json({ error: 'Dream not found' });

  const { summary, emotion } = await generateInsight(dream.title, dream.content);
  // Save insight and emotion
  const insight = await prisma.insight.upsert({
    where: { dreamId: dream.id },
    update: { summary },
    create: { dreamId: dream.id, summary },
  });
  await prisma.dream.update({ where: { id: dream.id }, data: { emotion } });
  const io = (req as any).io;
  io?.emit('insightReady', { dreamId: dream.id, insight, emotion });
  res.json({ insight, emotion });
});

// Generate PDF for a dream
router.get('/:id/pdf', authMiddleware, async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const dream = await prisma.dream.findFirst({ where: { id: req.params.id, userId } });
  if (!dream) return res.status(404).json({ error: 'Dream not found' });
  const { dreamToPdf } = await import('../utils/pdf');
  const pdfStream = dreamToPdf(dream);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${dream.title}.pdf"`);
  pdfStream.pipe(res);
});

export default router;

