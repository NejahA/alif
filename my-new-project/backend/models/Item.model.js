const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    trim: true
  },
  quantity: {
    type: Number,
    default: 1,
    min: 0,
    index: true
  },
  price: {
    type: Number,
    min: 0,
    default: 0
  },
  category: {
    type: String,
    trim: true,
    default: 'Uncategorized',
    index: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'out_of_stock', 'low_stock'],
    default: 'active'
  },
  tags: [{
    type: String,
    trim: true
  }],
  location: {
    type: String,
    trim: true
  },
  reorderLevel: {
    type: Number,
    default: 10,
    min: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Update lastUpdated timestamp on save
itemSchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  
  // Auto-update status based on quantity
  if (this.quantity === 0) {
    this.status = 'out_of_stock';
  } else if (this.quantity <= this.reorderLevel) {
    this.status = 'low_stock';
  } else {
    this.status = 'active';
  }
  
  next();
});

// Text index for search
itemSchema.index({
  name: 'text',
  description: 'text',
  category: 'text',
  tags: 'text'
});

module.exports = mongoose.model('Item', itemSchema);