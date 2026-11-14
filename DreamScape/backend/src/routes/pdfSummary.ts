import { Router, Request, Response } from 'express';
import prisma from '../prisma';
import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authMiddleware, async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const dreams = await prisma.dream.findMany({ where: { userId } });

  const doc = new PDFDocument({ margin: 40 });
  const stream = new PassThrough();

  doc.pipe(stream);
  doc.fontSize(20).text('GraBubblE – Dream Summary', { align: 'center' });
  doc.moveDown();

  for (const d of dreams) {
    doc.fontSize(14).text(`Title: ${d.title}`, { underline: true });
    doc.fontSize(12).text(`Created: ${d.createdAt.toISOString()}`);
    if (d.tags) doc.text(`Tags: ${d.tags}`);
    if ((d as any).emotion) doc.text(`Emotion: ${(d as any).emotion}`);
    doc.moveDown();
    doc.fontSize(12).text(d.content);
    doc.moveDown(2);
  }

  doc.end();

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="dreams-summary.pdf"');
  stream.pipe(res);
});

export default router;

