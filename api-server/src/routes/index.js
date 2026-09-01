import { Router } from 'express';
import { getHealth } from '../controllers/health.js';
import itemsRouter from './items.js';
import usersRouter from './users.js';
import authRouter from './auth.js';

const router = Router();

router.get('/health', getHealth);
router.use('/auth', authRouter);
router.use('/items', itemsRouter);
router.use('/users', usersRouter); // Keep for backward compatibility

export default router;
