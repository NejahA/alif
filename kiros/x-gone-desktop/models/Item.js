const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Please provide content.'],
  },
  type: {
    type: String,
    enum: ['note', 'task', 'secret', 'code', 'file'],
    default: 'note',
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 },
  },
});

module.exports = mongoose.models.Item || mongoose.model('Item', ItemSchema);
