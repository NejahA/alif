const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getWatchlists,
  createWatchlist,
  updateWatchlist,
  deleteWatchlist,
  addCoinToWatchlist,
  removeCoinFromWatchlist,
  updateCoinNotes,
} = require('../controllers/watchlistController');

// All watchlist routes require authentication
router.use(protect);

router.get('/', getWatchlists);
router.post('/', createWatchlist);
router.put('/:id', updateWatchlist);
router.delete('/:id', deleteWatchlist);
router.post('/:id/coins', addCoinToWatchlist);
router.delete('/:id/coins/:coinId', removeCoinFromWatchlist);
router.put('/:id/coins/:coinId', updateCoinNotes);

module.exports = router;