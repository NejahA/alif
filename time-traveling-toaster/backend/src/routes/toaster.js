import { Router } from 'express';
import {
  getInfo,
  toastBread,
  travelThroughTime,
  getHistory,
  resetHistory,
} from '../controllers/toaster.js';
import { validateToastRequest, validateTimeTravelRequest } from '../middleware/validate.js';

const router = Router();

router.get('/', getInfo);
router.post('/toast', validateToastRequest, toastBread);
router.post('/time-travel', validateTimeTravelRequest, travelThroughTime);
router.get('/history', getHistory);
router.delete('/history', resetHistory);

export default router;
