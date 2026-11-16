import { Router } from 'express';

const router = Router();

// Dummy community posts
const posts = [
  { id: '1', author: 'Alice', content: 'Just dreamed about flying over mountains!' },
  { id: '2', author: 'Bob', content: 'Had a surreal conversation with a talking cat.' },
];

router.get('/', (req, res) => {
  res.json({ posts });
});

export default router;
