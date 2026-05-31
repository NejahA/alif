const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = 'mongodb+srv://nejahachref:96176065@cluster0.ajw0g.mongodb.net/href?retryWrites=true&w=majority&appName=o-o';

mongoose.connect(MONGO_URI)
  .then(() => console.log('[API] Neural Link Established: Connected to Cyber-Gladiator DB'))
  .catch(err => console.error('[API] Link Failed:', err));

const gladiatorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  handle: { type: String, required: true, unique: true },
  level: { type: Number, default: 1 },
  hp: { type: Number, default: 100 },
  maxHp: { type: Number, default: 100 },
  xp: { type: Number, default: 0 },
  aura: { type: String, enum: ['Neon', 'Void', 'Plasma', 'Ghost'], default: 'Neon' },
  gear: [{
    name: String,
    statBonus: Number,
    rarity: { type: String, enum: ['Common', 'Rare', 'Epic', 'Legendary'] }
  }],
  status: { type: String, enum: ['Active', 'Healing', 'Combat'], default: 'Active' }
});

const Gladiator = mongoose.model('Gladiator', gladiatorSchema);

// Initial Seed
const seedGladiators = async () => {
  const count = await Gladiator.countDocuments();
  if (count === 0) {
    await Gladiator.insertMany([
      { name: 'X-9000', handle: 'VOID_WALKER', aura: 'Void', gear: [{ name: 'Phase Blade', statBonus: 15, rarity: 'Epic' }] },
      { name: 'Cyber-Zero', handle: 'PLASMA_REAPER', aura: 'Plasma', level: 5, gear: [{ name: 'Ion Core', statBonus: 20, rarity: 'Legendary' }] },
      { name: 'Neon-Specter', handle: 'GHOST_PROTOCOL', aura: 'Ghost', level: 3 },
      { name: 'Alpha-Prime', handle: 'NEON_KNIGHT', aura: 'Neon', gear: [{ name: 'Basic Shield', statBonus: 5, rarity: 'Common' }] }
    ]);
    console.log('[API] Arena Initialized: Gladiators Spawned.');
  }
};
seedGladiators();

// Routes
app.get('/api/gladiators', async (req, res) => {
  try {
    const gladiators = await Gladiator.find();
    res.json(gladiators);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/gladiators', async (req, res) => {
  try {
    const gladiator = new Gladiator(req.body);
    await gladiator.save();
    res.status(201).json(gladiator);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/gladiators/:id', async (req, res) => {
  try {
    const updated = await Gladiator.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/combat/simulate', async (req, res) => {
  const { fighter1Id, fighter2Id } = req.body;
  // Crazy logic: Simulate a neural battle
  const f1 = await Gladiator.findById(fighter1Id);
  const f2 = await Gladiator.findById(fighter2Id);
  
  if (!f1 || !f2) return res.status(404).json({ message: 'Combatants not found' });

  const winner = Math.random() > 0.5 ? f1 : f2;
  const xpGain = Math.floor(Math.random() * 50) + 10;
  
  winner.xp += xpGain;
  if (winner.xp >= 100) {
    winner.level += 1;
    winner.xp = 0;
    winner.maxHp += 20;
    winner.hp = winner.maxHp;
  }
  
  await winner.save();
  
  res.json({
    winner: winner.handle,
    xpGain,
    combatLog: [
      `${f1.handle} engaged neural link...`,
      `${f2.handle} deployed plasma counter-measures...`,
      `Critical hit by ${winner.handle}!`,
      `Arena stabilized. ${winner.handle} remains standing.`
    ]
  });
});

const PORT = 3006;
app.listen(PORT, () => console.log(`[API] Arena Server on http://localhost:${PORT}`));
