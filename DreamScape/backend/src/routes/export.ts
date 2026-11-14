import { Router } from 'express';
import prisma from '../prisma';
import { authMiddleware } from '../middleware/authMiddleware';
import { createObjectCsvStringifier } from 'csv-writer';

const router = Router();

// Export user's dreams as JSON
router.get('/json', authMiddleware, async (req, res) => {
  const userId = (req as any).userId;
  const dreams = await prisma.dream.findMany({ where: { userId } });
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(dreams, null, 2));
});

// Export user's dreams as CSV
router.get('/csv', authMiddleware, async (req, res) => {
  const userId = (req as any).userId;
  const dreams = await prisma.dream.findMany({ where: { userId } });
  const csvStringifier = createObjectCsvStringifier({
    header: [
      { id: 'id', title: 'ID' },
      { id: 'title', title: 'Title' },
      { id: 'content', title: 'Content' },
      { id: 'tags', title: 'Tags' },
      { id: 'emotion', title: 'Emotion' },
      { id: 'createdAt', title: 'Created At' },
    ],
  });
  const header = csvStringifier.getHeaderString();
  const records = csvStringifier.stringifyRecords(dreams.map(d => ({
    id: d.id,
    title: d.title,
    content: d.content,
    tags: d.tags ?? '',
    emotion: (d as any).emotion ?? '',
    createdAt: d.createdAt.toISOString(),
  })));
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="dreams.csv"');
  res.send(header + records);
});

export default router;

