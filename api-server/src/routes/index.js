import { Router } from 'express';
import { getHealth } from '../controllers/health.js';
import itemsRouter from './items.js';
import usersRouter from './users.js';

const router = Router();

router.get('/health', getHealth);
router.use('/items', itemsRouter);
router.use('/users', usersRouter);

export default router;
