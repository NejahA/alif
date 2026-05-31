require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const Feature = require('./models/Feature');
const ABTest = require('./models/ABTest');
const RoadmapItem = require('./models/RoadmapItem');
const AnalyticsData = require('./models/AnalyticsData');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB via Mongoose'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- API Routes ---

// Features
app.get('/api/features', async (req, res) => {
    try {
        const data = await Feature.find({});
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.patch('/api/features/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { envs } = req.body;
        const feature = await Feature.findOneAndUpdate({ id }, { $set: { envs } }, { new: true });
        if (!feature) return res.status(404).json({ message: 'Not found' });
        res.json(feature);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// A/B Tests
app.get('/api/abtests', async (req, res) => {
    try {
        const data = await ABTest.find({});
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.patch('/api/abtests/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { percentage } = req.body;
        const abTest = await ABTest.findOneAndUpdate({ id }, { $set: { percentage } }, { new: true });
        if (!abTest) return res.status(404).json({ message: 'Not found' });
        res.json(abTest);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Roadmap Items
app.get('/api/roadmap', async (req, res) => {
    try {
        // Find all and sort by creation timestamp
        const data = await RoadmapItem.find({}).sort({ createdAt: 1 });
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Analytics Data
app.get('/api/analytics', async (req, res) => {
    try {
        const data = await AnalyticsData.find({}).sort({ createdAt: 1 });
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Serve frontend for any other route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
