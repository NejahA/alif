require('dotenv').config();
const mongoose = require('mongoose');

const Feature = require('./models/Feature');
const ABTest = require('./models/ABTest');
const RoadmapItem = require('./models/RoadmapItem');
const AnalyticsData = require('./models/AnalyticsData');

const baseFeatures = [
    { id: 'f1', name: 'Dark Mode Redux', envs: { Production: true, Staging: true, Development: true }, desc: 'The new and improved dark mode aesthetic.', baseUsers: 45 },
    { id: 'f2', name: 'Real-time Collaboration', envs: { Production: false, Staging: true, Development: true }, desc: 'Allow multiple users to edit the same document.', baseUsers: 1.2 },
    { id: 'f3', name: 'AI Auto-Complete', envs: { Production: true, Staging: true, Development: true }, desc: 'Context-aware suggestions powered by large language models.', baseUsers: 8.4 },
    { id: 'f4', name: 'Advanced Analytics', envs: { Production: true, Staging: true, Development: true }, desc: 'Granular user behavior tracking.', baseUsers: 12 },
    { id: 'f5', name: 'OAuth 2.0 Integration', envs: { Production: true, Staging: true, Development: true }, desc: 'Support for Google, GitHub, and Microsoft social logins.', baseUsers: 82 },
    { id: 'f6', name: 'Custom Webhooks', envs: { Production: false, Staging: false, Development: true }, desc: 'Trigger external API calls based on internal events.', baseUsers: 0 },
    { id: 'f7', name: 'New Checkout Flow', envs: { Production: false, Staging: true, Development: true }, desc: 'Streamlined payment processor integration.', baseUsers: 0.5 },
];

const abTests = [
    { id: 'ab1', name: 'Checkout V2', percentage: 20 },
    { id: 'ab2', name: 'Onboarding Modals', percentage: 50 },
    { id: 'ab3', name: 'Search Algorithm Boost', percentage: 5 }
];

const roadmapItems = [
    { date: 'Q3 2026', title: 'Global Edge Caching', desc: 'Deploying static assets to 250+ edge nodes to reduce latency by 40%.' },
    { date: 'Q4 2026', title: 'Desktop Application', desc: 'Launching native wrappers for macOS and Windows with offline support.' },
    { date: 'Q1 2027', title: 'Plugin Marketplace', desc: 'Opening the API for third-party developers to monetize custom extensions.' }
];

const chartData = [
    { label: 'Mon', val: 40 },
    { label: 'Tue', val: 65 },
    { label: 'Wed', val: 45 },
    { label: 'Thu', val: 80 },
    { label: 'Fri', val: 55 },
    { label: 'Sat', val: 95 },
    { label: 'Sun', val: 70 }
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
      console.log('Connected to DB for seeding...');
      
      // Clear existing
      await Feature.deleteMany({});
      await ABTest.deleteMany({});
      await RoadmapItem.deleteMany({});
      await AnalyticsData.deleteMany({});

      // Insert new
      await Feature.insertMany(baseFeatures);
      await ABTest.insertMany(abTests);
      await RoadmapItem.insertMany(roadmapItems);
      await AnalyticsData.insertMany(chartData);

      console.log('Database seeded fully with all dynamic data collections!');
      process.exit(0);
  })
  .catch(err => {
      console.error(err);
      process.exit(1);
  });
