import express from 'express';
import { getAllFiles } from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const files = await getAllFiles();
    res.json(files);
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

export default router;
