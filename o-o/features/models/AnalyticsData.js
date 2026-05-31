const mongoose = require('mongoose');

const analyticsDataSchema = new mongoose.Schema({
    label: { type: String, required: true },
    val: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('AnalyticsData', analyticsDataSchema);
