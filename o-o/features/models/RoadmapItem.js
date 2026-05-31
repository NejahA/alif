const mongoose = require('mongoose');

const roadmapItemSchema = new mongoose.Schema({
    date: { type: String, required: true },
    title: { type: String, required: true },
    desc: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('RoadmapItem', roadmapItemSchema);
