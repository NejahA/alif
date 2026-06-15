const Watchlist = require('../models/Watchlist');

// @desc   Get all watchlists for user
// @route  GET /api/watchlists
const getWatchlists = async (req, res) => {
  try {
    const watchlists = await Watchlist.find({ user: req.user._id })
      .sort({ isDefault: -1, createdAt: 1 });
    res.json(watchlists);
  } catch (error) {
    console.error('Get watchlists error:', error.message);
    res.status(500).json({ message: 'Failed to fetch watchlists' });
  }
};

// @desc   Create a new watchlist
// @route  POST /api/watchlists
const createWatchlist = async (req, res) => {
  try {
    const { name, coins } = req.body;

    const watchlist = await Watchlist.create({
      user: req.user._id,
      name: name || 'New Watchlist',
      coins: coins || [],
    });

    res.status(201).json(watchlist);
  } catch (error) {
    console.error('Create watchlist error:', error.message);
    res.status(500).json({ message: 'Failed to create watchlist' });
  }
};

// @desc   Update a watchlist
// @route  PUT /api/watchlists/:id
const updateWatchlist = async (req, res) => {
  try {
    const { name } = req.body;
    const watchlist = await Watchlist.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!watchlist) {
      return res.status(404).json({ message: 'Watchlist not found' });
    }

    if (name !== undefined) watchlist.name = name;
    await watchlist.save();

    res.json(watchlist);
  } catch (error) {
    console.error('Update watchlist error:', error.message);
    res.status(500).json({ message: 'Failed to update watchlist' });
  }
};

// @desc   Delete a watchlist
// @route  DELETE /api/watchlists/:id
const deleteWatchlist = async (req, res) => {
  try {
    const watchlist = await Watchlist.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!watchlist) {
      return res.status(404).json({ message: 'Watchlist not found' });
    }

    res.json({ message: 'Watchlist deleted' });
  } catch (error) {
    console.error('Delete watchlist error:', error.message);
    res.status(500).json({ message: 'Failed to delete watchlist' });
  }
};

// @desc   Add coin to watchlist
// @route  POST /api/watchlists/:id/coins
const addCoinToWatchlist = async (req, res) => {
  try {
    const { coinId, symbol, name, notes } = req.body;

    if (!coinId || !symbol || !name) {
      return res.status(400).json({ message: 'coinId, symbol, and name are required' });
    }

    const watchlist = await Watchlist.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!watchlist) {
      return res.status(404).json({ message: 'Watchlist not found' });
    }

    // Check if coin already exists
    const exists = watchlist.coins.some(c => c.coinId === coinId);
    if (exists) {
      return res.status(400).json({ message: 'Coin already in watchlist' });
    }

    watchlist.coins.push({ coinId, symbol, name: name.toUpperCase(), notes: notes || '' });
    await watchlist.save();

    res.json(watchlist);
  } catch (error) {
    console.error('Add coin error:', error.message);
    res.status(500).json({ message: 'Failed to add coin to watchlist' });
  }
};

// @desc   Remove coin from watchlist
// @route  DELETE /api/watchlists/:id/coins/:coinId
const removeCoinFromWatchlist = async (req, res) => {
  try {
    const watchlist = await Watchlist.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!watchlist) {
      return res.status(404).json({ message: 'Watchlist not found' });
    }

    watchlist.coins = watchlist.coins.filter(c => c.coinId !== req.params.coinId);
    await watchlist.save();

    res.json(watchlist);
  } catch (error) {
    console.error('Remove coin error:', error.message);
    res.status(500).json({ message: 'Failed to remove coin from watchlist' });
  }
};

// @desc   Update coin notes in watchlist
// @route  PUT /api/watchlists/:id/coins/:coinId
const updateCoinNotes = async (req, res) => {
  try {
    const { notes } = req.body;
    const watchlist = await Watchlist.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!watchlist) {
      return res.status(404).json({ message: 'Watchlist not found' });
    }

    const coin = watchlist.coins.find(c => c.coinId === req.params.coinId);
    if (!coin) {
      return res.status(404).json({ message: 'Coin not found in watchlist' });
    }

    coin.notes = notes || '';
    await watchlist.save();

    res.json(watchlist);
  } catch (error) {
    console.error('Update notes error:', error.message);
    res.status(500).json({ message: 'Failed to update notes' });
  }
};

module.exports = {
  getWatchlists,
  createWatchlist,
  updateWatchlist,
  deleteWatchlist,
  addCoinToWatchlist,
  removeCoinFromWatchlist,
  updateCoinNotes,
};