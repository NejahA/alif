import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = "mongodb+srv://nejahachref:96176065@cluster0.ajw0g.mongodb.net/href?retryWrites=true&w=majority&appName=domoiq";

// Models
const InsightSchema = new mongoose.Schema({
  text: String,
  category: { type: String, default: 'General' },
  timeline: { type: String, default: 'PRIME' },
  timestamp: { type: Date, default: Date.now },
  upvotes: { type: Number, default: 0 },
  stakes: { type: Number, default: 0 },
  visualUrl: { type: String, default: '' }
});

const PredictionSchema = new mongoose.Schema({
  keyword: String,
  response: String
});

const QueryLogSchema = new mongoose.Schema({
  query: String,
  response: String,
  timestamp: { type: Date, default: Date.now }
});

const Insight = mongoose.model('Insight', InsightSchema);
const Prediction = mongoose.model('Prediction', PredictionSchema);
const QueryLog = mongoose.model('QueryLog', QueryLogSchema);

const BroadcastSchema = new mongoose.Schema({
  sender: String,
  message: String,
  timestamp: { type: Date, default: Date.now }
});
const Broadcast = mongoose.model('Broadcast', BroadcastSchema);

const AnomalySchema = new mongoose.Schema({
  type: String,
  severity: { type: Number, default: 1 },
  location: String,
  stabilized: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});
const Anomaly = mongoose.model('Anomaly', AnomalySchema);

const SeerSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  credits: { type: Number, default: 1000 },
  rank: { type: String, default: 'Initiate' },
  divergence: { type: Number, default: 0 },
  lastSeen: { type: Date, default: Date.now },
  artifacts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artifact' }],
  achievements: [String],
  faction: { type: String, default: 'None' },
  upgrades: { type: Map, of: Number, default: {} },
  missionProgress: { type: Map, of: Number, default: {} }
});
const Seer = mongoose.model('Seer', SeerSchema);

const MissionSchema = new mongoose.Schema({
  title: String,
  description: String,
  reward: Number,
  targetType: String,
  targetCount: Number
});
const Mission = mongoose.model('Mission', MissionSchema);

const ArtifactSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  rarity: { type: String, default: 'Common' },
  icon: String
});
const Artifact = mongoose.model('Artifact', ArtifactSchema);

const SystemStateSchema = new mongoose.Schema({
  singularityProgress: { type: Number, default: 0 },
  lastEvent: Date
});
const SystemState = mongoose.model('SystemState', SystemStateSchema);

const SystemEventSchema = new mongoose.Schema({
  title: String,
  description: String,
  type: { type: String, default: 'Info' }, // Info, Warning, Critical, Discovery
  timeline: { type: String, default: 'PRIME' },
  timestamp: { type: Date, default: Date.now }
});
const SystemEvent = mongoose.model('SystemEvent', SystemEventSchema);

const NewsSchema = new mongoose.Schema({
  timeline: String,
  headline: String,
  timestamp: { type: Date, default: Date.now }
});
const News = mongoose.model('News', NewsSchema);

const WeatherSchema = new mongoose.Schema({
  type: String,
  icon: String,
  entropyBoost: Number,
  msg: String,
  active: { type: Boolean, default: true }
});
const Weather = mongoose.model('Weather', WeatherSchema);


// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to Aether Nexus (MongoDB)'))
  .catch(err => console.error('Connection failed:', err));

// Routes
app.get('/api/insights', async (req, res) => {
  try {
    const { category, timeline } = req.query;
    let query = {};
    if (category) query.category = category;
    if (timeline) query.timeline = timeline;
    const insights = await Insight.find(query).sort({ timestamp: -1 });
    res.json(insights);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/insights', async (req, res) => {
  try {
    const { text, category } = req.body;
    const newInsight = new Insight({ text, category });
    await newInsight.save();
    res.status(201).json(newInsight);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/insights/:id/upvote', async (req, res) => {
  try {
    const insight = await Insight.findByIdAndUpdate(
      req.params.id, 
      { $inc: { upvotes: 1 } }, 
      { new: true }
    );
    res.json(insight);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/insights/:id/stake', async (req, res) => {
  try {
    const { amount } = req.body;
    const insight = await Insight.findByIdAndUpdate(
      req.params.id, 
      { $inc: { stakes: amount } }, 
      { new: true }
    );
    res.json(insight);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const counts = await Insight.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);
    const total = await Insight.countDocuments();
    const upvotes = await Insight.aggregate([
      { $group: { _id: null, total: { $sum: "$upvotes" } } }
    ]);
    
    res.json({
      distribution: counts,
      totalInsights: total,
      totalEndorsements: upvotes[0]?.total || 0,
      systemEntropy: (Math.random() * 0.5 + 0.1).toFixed(4),
      coreStability: (Math.random() * 0.4 + 0.6).toFixed(4)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/heatmap', async (req, res) => {
  try {
    const insights = await Insight.find();
    const decades = {};
    insights.forEach(ins => {
      const yearMatch = ins.text.match(/\d{4}/);
      if (yearMatch) {
        const decade = Math.floor(yearMatch[0] / 10) * 10;
        decades[decade] = (decades[decade] || 0) + 1;
      }
    });
    res.json(decades);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/dominance', async (req, res) => {
  try {
    const dominance = await Insight.aggregate([
      { $group: { _id: "$timeline", totalStakes: { $sum: "$stakes" } } }
    ]);
    res.json(dominance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/hotspots', async (req, res) => {
  try {
    const hotspots = Array.from({ length: 5 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      intensity: Math.random(),
      label: ["Neural Spike", "Timeline Rift", "Data Storm", "Nexus Convergence"][Math.floor(Math.random() * 4)]
    }));
    res.json(hotspots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/weather', async (req, res) => {
  try {
    let weather = await Weather.findOne({ active: true });
    if (!weather) {
      weather = { type: 'Stable', icon: 'Sun', entropyBoost: 0, msg: "Temporal stream normalized." };
    }
    res.json(weather);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/seers', (req, res) => {
  const seers = [
    { name: 'User_442', divergence: 12.5, credits: 1500 },
    { name: 'Neo_Seer', divergence: 8.2, credits: 2400 },
    { name: 'Cortex_Link', divergence: 15.1, credits: 800 },
    { name: 'System_Admin', divergence: 0.1, credits: 99999 }
  ];
  res.json(seers.sort((a, b) => b.credits - a.credits));
});

app.get('/api/news', async (req, res) => {
  try {
    const { timeline } = req.query;
    let query = {};
    if (timeline) query.timeline = timeline;
    const news = await News.find(query).sort({ timestamp: -1 });
    if (news.length === 0) {
      // Return defaults if none in DB
      const defaults = {
        PRIME: ["2035: Mars Settlement reaches 10k population.", "2048: First AI-human marriage legally recognized."],
        VOID: ["2040: Digital Blackout persists.", "2075: Oxygen Riots spread."],
        NEON: ["2045: UBI 2.0 eliminates poverty.", "2080: Vertical Forest Cities cover 30%."]
      };
      return res.json(defaults[timeline] || defaults.PRIME);
    }
    res.json(news.map(n => n.headline));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Anomaly Routes
app.get('/api/anomalies', async (req, res) => {
  try {
    const anomalies = await Anomaly.find({ stabilized: false }).sort({ timestamp: -1 });
    res.json(anomalies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/anomalies', async (req, res) => {
  try {
    const { type, severity, location } = req.body;
    const anomaly = new Anomaly({ type, severity, location });
    await anomaly.save();
    res.status(201).json(anomaly);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/anomalies/:id/stabilize', async (req, res) => {
  try {
    const anomaly = await Anomaly.findByIdAndUpdate(req.params.id, { stabilized: true }, { new: true });
    res.json(anomaly);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Seer Routes
app.get('/api/seers/:name', async (req, res) => {
  try {
    let seer = await Seer.findOne({ name: req.params.name });
    if (!seer) {
      seer = new Seer({ name: req.params.name });
      await seer.save();
    }
    res.json(seer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Market Routes
app.get('/api/market', async (req, res) => {
  try {
    let artifacts = await Artifact.find();
    if (artifacts.length === 0) {
      const initial = [
        { name: "Digital Soul", description: "A fragment of a lost AI consciousness.", price: 500, rarity: "Rare", icon: "Sparkles" },
        { name: "Chrono-Key", description: "Unlocks encrypted timeline data.", price: 1200, rarity: "Legendary", icon: "Key" },
        { name: "Neural Dampener", description: "Reduces stress during high-divergence events.", price: 300, rarity: "Uncommon", icon: "Shield" }
      ];
      await Artifact.insertMany(initial);
      artifacts = initial;
    }
    res.json(artifacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/market/buy', async (req, res) => {
  try {
    const { userName, artifactId } = req.body;
    const seer = await Seer.findOne({ name: userName });
    const artifact = await Artifact.findById(artifactId);
    
    if (!seer || !artifact) return res.status(404).json({ error: "Not found" });
    if (seer.credits < artifact.price) return res.status(400).json({ error: "Insufficient credits" });
    
    seer.credits -= artifact.price;
    seer.artifacts.push(artifact._id);
    await seer.save();
    
    res.json({ seer, artifact });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Faction Routes
app.patch('/api/seers/:name/faction', async (req, res) => {
  try {
    const { faction } = req.body;
    const seer = await Seer.findOneAndUpdate({ name: req.params.name }, { faction }, { new: true });
    res.json(seer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mission Routes
app.get('/api/missions', async (req, res) => {
  try {
    let missions = await Mission.find();
    if (missions.length === 0) {
      const initial = [
        { title: "Timeline Guardian", description: "Stabilize 3 anomalies.", reward: 500, targetType: "anomaly", targetCount: 3 },
        { title: "Archivist", description: "Endorse 10 insights.", reward: 300, targetType: "upvote", targetCount: 10 },
        { title: "High Roller", description: "Stake 2000 credits.", reward: 1000, targetType: "stake", targetCount: 2000 }
      ];
      await Mission.insertMany(initial);
      missions = initial;
    }
    res.json(missions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/seers/:name/upgrade', async (req, res) => {
  try {
    const { upgrade, cost } = req.body;
    const seer = await Seer.findOne({ name: req.params.name });
    if (seer.credits < cost) return res.status(400).json({ error: "Insufficient credits" });
    
    seer.credits -= cost;
    const currentVal = seer.upgrades.get(upgrade) || 0;
    seer.upgrades.set(upgrade, currentVal + 1);
    await seer.save();
    res.json(seer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// System Routes
app.get('/api/system', async (req, res) => {
  try {
    let state = await SystemState.findOne();
    if (!state) {
      state = new SystemState({ singularityProgress: 0 });
      await state.save();
    }
    res.json(state);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/system/trigger', async (req, res) => {
  try {
    const { amount } = req.body;
    let state = await SystemState.findOne();
    if (!state) state = new SystemState({ singularityProgress: 0 });
    state.singularityProgress = Math.min(100, state.singularityProgress + amount);
    await state.save();
    res.json(state);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/events', async (req, res) => {
  try {
    const { timeline } = req.query;
    let query = {};
    if (timeline) query.timeline = timeline;
    const events = await SystemEvent.find(query).sort({ timestamp: -1 }).limit(20);
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/market/fuse', async (req, res) => {
  try {
    const { userName, artifactIds } = req.body;
    const seer = await Seer.findOne({ name: userName });
    
    // Remove the fused artifacts
    seer.artifacts = seer.artifacts.filter(id => !artifactIds.includes(id.toString()));
    
    // Create mythic artifact
    const mythic = new Artifact({
      name: "Mythic Soul Core",
      description: "A stabilized singularity in physical form.",
      price: 0,
      rarity: "Mythic",
      icon: "Infinity"
    });
    await mythic.save();
    
    seer.artifacts.push(mythic._id);
    await seer.save();
    res.json({ seer, mythic });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/broadcasts', async (req, res) => {
  try {
    const broadcasts = await Broadcast.find().sort({ timestamp: -1 }).limit(5);
    res.json(broadcasts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/broadcasts', async (req, res) => {
  try {
    const { sender, message } = req.body;
    const broadcast = new Broadcast({ sender, message });
    await broadcast.save();
    res.status(201).json(broadcast);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/insights/:id/visual', async (req, res) => {
  try {
    const { visualUrl } = req.body;
    const insight = await Insight.findByIdAndUpdate(
      req.params.id, 
      { visualUrl }, 
      { new: true }
    );
    res.json(insight);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/history', async (req, res) => {
  try {
    const logs = await QueryLog.find().sort({ timestamp: -1 }).limit(10);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/oracle', async (req, res) => {
  try {
    const { query, mode } = req.body;
    const queryLower = query.toLowerCase();
    
    const predictions = await Prediction.find();
    let response = "The quantum field is stable. The future remains unwritten but full of potential.";
    
    for (const p of predictions) {
      if (queryLower.includes(p.keyword.toLowerCase())) {
        response = p.response;
        break;
      }
    }

    // Apply Personality Protocls
    if (mode === 'Cryptic') {
      response = `Fragments of a shattered mirror show... ${response.substring(0, 40)}... Seek the silence between.`;
    } else if (mode === 'Visionary') {
      response = `I see a blinding light where ${response}. The ascension is near.`;
    } else if (mode === 'Analytical') {
      response = `Probability matrix confirms with 94.2% certainty: ${response}`;
    }

    const log = new QueryLog({ query, response });
    await log.save();

    res.json({ response });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin/Customization Routes
app.get('/api/admin/news', async (req, res) => {
  const news = await News.find().sort({ timestamp: -1 });
  res.json(news);
});

app.post('/api/admin/news', async (req, res) => {
  const news = new News(req.body);
  await news.save();
  res.status(201).json(news);
});

app.delete('/api/admin/news/:id', async (req, res) => {
  await News.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

app.get('/api/admin/weather', async (req, res) => {
  const weather = await Weather.find();
  res.json(weather);
});

app.post('/api/admin/weather', async (req, res) => {
  // Deactivate others if this is active
  if (req.body.active) {
    await Weather.updateMany({}, { active: false });
  }
  const weather = new Weather(req.body);
  await weather.save();
  res.status(201).json(weather);
});

app.patch('/api/admin/weather/:id', async (req, res) => {
  if (req.body.active) {
    await Weather.updateMany({}, { active: false });
  }
  const weather = await Weather.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(weather);
});

app.delete('/api/admin/weather/:id', async (req, res) => {
  await Weather.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

app.get('/api/admin/artifacts', async (req, res) => {
  const artifacts = await Artifact.find();
  res.json(artifacts);
});

app.post('/api/admin/artifacts', async (req, res) => {
  const artifact = new Artifact(req.body);
  await artifact.save();
  res.status(201).json(artifact);
});

app.patch('/api/admin/artifacts/:id', async (req, res) => {
  const artifact = await Artifact.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(artifact);
});

app.delete('/api/admin/artifacts/:id', async (req, res) => {
  await Artifact.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

app.get('/api/admin/missions', async (req, res) => {
  const missions = await Mission.find();
  res.json(missions);
});

app.post('/api/admin/missions', async (req, res) => {
  const mission = new Mission(req.body);
  await mission.save();
  res.status(201).json(mission);
});

app.patch('/api/admin/missions/:id', async (req, res) => {
  const mission = await Mission.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(mission);
});

app.delete('/api/admin/missions/:id', async (req, res) => {
  await Mission.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

app.get('/api/admin/predictions', async (req, res) => {
  const predictions = await Prediction.find();
  res.json(predictions);
});

app.post('/api/admin/predictions', async (req, res) => {
  const prediction = new Prediction(req.body);
  await prediction.save();
  res.status(201).json(prediction);
});

app.patch('/api/admin/predictions/:id', async (req, res) => {
  const prediction = await Prediction.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(prediction);
});

app.delete('/api/admin/predictions/:id', async (req, res) => {
  await Prediction.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

// New Admin CRUD routes
app.get('/api/admin/insights', async (req, res) => {
  const insights = await Insight.find().sort({ timestamp: -1 });
  res.json(insights);
});

app.patch('/api/admin/insights/:id', async (req, res) => {
  const insight = await Insight.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(insight);
});

app.delete('/api/admin/insights/:id', async (req, res) => {
  await Insight.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

app.get('/api/admin/broadcasts', async (req, res) => {
  const broadcasts = await Broadcast.find().sort({ timestamp: -1 });
  res.json(broadcasts);
});

app.patch('/api/admin/broadcasts/:id', async (req, res) => {
  const broadcast = await Broadcast.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(broadcast);
});

app.delete('/api/admin/broadcasts/:id', async (req, res) => {
  await Broadcast.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

app.get('/api/admin/seers', async (req, res) => {
  const seers = await Seer.find().sort({ lastSeen: -1 });
  res.json(seers);
});

app.patch('/api/admin/seers/:id', async (req, res) => {
  const seer = await Seer.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(seer);
});

app.delete('/api/admin/seers/:id', async (req, res) => {
  await Seer.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

app.get('/api/admin/events', async (req, res) => {
  const events = await SystemEvent.find().sort({ timestamp: -1 });
  res.json(events);
});

app.post('/api/admin/events', async (req, res) => {
  const event = new SystemEvent(req.body);
  await event.save();
  res.status(201).json(event);
});

app.patch('/api/admin/events/:id', async (req, res) => {
  const event = await SystemEvent.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(event);
});

app.delete('/api/admin/events/:id', async (req, res) => {
  await SystemEvent.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Oracle server running on port ${PORT}`);
});
