const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  distance: { type: String, required: true },
  duration: { type: String, required: true },
  fare: { type: String, required: true },
  type: {
    type: String,
    enum: ['flight', 'shopping', 'business', 'beach', 'train', 'city', 'historic'],
    default: 'city',
  },
}, { timestamps: true });

module.exports = mongoose.model('Route', routeSchema);
