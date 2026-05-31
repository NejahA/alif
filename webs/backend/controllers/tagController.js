const Tag = require('../models/Tag');

// Get all tags
const getAllTags = async (req, res) => {
  try {
    const tags = await Tag.find().sort({ name: 1 });
    res.status(200).json(tags);
  } catch (error) {
    res.status(500).json({
      error: {
        message: 'Failed to fetch tags',
        code: 'FETCH_FAILED',
        details: error.message
      }
    });
  }
};

// Create a new tag
const createTag = async (req, res) => {
  try {
    const { name } = req.body;

    // Validate name
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        error: {
          message: 'Tag name is required and cannot be empty',
          code: 'INVALID_NAME'
        }
      });
    }

    const tag = new Tag({
      name: name.trim()
    });

    const savedTag = await tag.save();
    res.status(201).json(savedTag);
  } catch (error) {
    // Handle duplicate tag name error
    if (error.code === 11000) {
      return res.status(400).json({
        error: {
          message: 'Tag name already exists',
          code: 'DUPLICATE_NAME'
        }
      });
    }

    res.status(500).json({
      error: {
        message: 'Failed to create tag',
        code: 'CREATE_FAILED',
        details: error.message
      }
    });
  }
};

module.exports = {
  getAllTags,
  createTag
};
