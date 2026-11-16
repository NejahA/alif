import { Router, Request, Response } from 'express';

const router = Router();

// Dummy favorite dreams for the user
const favorites = [
  { id: 101, title: 'Flying over mountains', content: 'I was soaring above peaks...' },
  { id: 102, title: "Ocean's whisper", content: 'The sea spoke to me in colors.' },
];

router.get('/favorites', (req: Request, res: Response) => {
  res.json({ favorites });
});

export default router;
