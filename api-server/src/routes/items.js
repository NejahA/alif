import { Router } from 'express';
import { getAll, getById, create, update, remove } from '../controllers/items.js';
import { validateItem, validateItemId } from '../middleware/validate.js';

const router = Router();

router.get('/', getAll);
router.get('/:id', validateItemId, getById);
router.post('/', validateItem, create);
router.put('/:id', [validateItemId, validateItem], update);
router.delete('/:id', validateItemId, remove);

export default router;