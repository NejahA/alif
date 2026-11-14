import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma';

export const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Expect JWT already validated; userId is attached by authMiddleware
  const userId = (req as any).userId;
  if (!userId) {
    return res.status(401).json({ error: 'Missing user' });
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

