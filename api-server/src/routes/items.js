import { Router } from 'express';
import { 
  getAllItems, 
  getItemById, 
  createItem, 
  updateItem, 
  deleteItem 
} from '../controllers/itemController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// All item routes require authentication
router.use(authenticate);

// GET /api/items - Get all items (with filtering and pagination)
router.get('/', getAllItems);

// GET /api/items/:id - Get item by ID
router.get('/:id', getItemById);

// POST /api/items - Create new item
router.post('/', createItem);

// PUT /api/items/:id - Update item
router.put('/:id', updateItem);

// DELETE /api/items/:id - Delete item (admin only)
router.delete('/:id', authorize(['admin']), deleteItem);

export default router;