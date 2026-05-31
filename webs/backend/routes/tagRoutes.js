const express = require('express');
const router = express.Router();
const {
  getAllTags,
  createTag
} = require('../controllers/tagController');

// GET /api/tags - Get all tags
router.get('/', getAllTags);

// POST /api/tags - Create a new tag
router.post('/', createTag);

module.exports = router;
