import { Request, Response, NextFunction } from 'express';

// Simple i18n handler placeholder – just passes through
export default function i18nHandler(req: Request, res: Response, next: NextFunction) {
  // In a real app you would set req.language, req.t etc.
  // For now just continue.
  next();
}
