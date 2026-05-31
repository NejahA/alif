const mongoose = require('mongoose');

const featureSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    desc: { type: String, required: true },
    baseUsers: { type: Number, required: true },
    envs: {
        Production: { type: Boolean, default: false },
        Staging: { type: Boolean, default: false },
        Development: { type: Boolean, default: false }
    }
}, { timestamps: true });

module.exports = mongoose.model('Feature', featureSchema);
