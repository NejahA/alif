const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  }
}, {
  timestamps: true  // Adds createdAt and updatedAt
});

const Tag = mongoose.model('Tag', tagSchema);

module.exports = Tag;
