const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getAlerts,
  createAlert,
  updateAlert,
  deleteAlert,
  dismissAll,
} = require('../controllers/alertController');

router.use(protect);

router.get('/', getAlerts);
router.post('/', createAlert);
router.put('/:id', updateAlert);
router.delete('/:id', deleteAlert);
router.post('/dismiss-all', dismissAll);

module.exports = router;