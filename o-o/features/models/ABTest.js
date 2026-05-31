const mongoose = require('mongoose');

const abTestSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    percentage: { type: Number, required: true, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('ABTest', abTestSchema);
