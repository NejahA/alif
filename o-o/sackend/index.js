const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = 'mongodb+srv://nejahachref:96176065@cluster0.ajw0g.mongodb.net/href?retryWrites=true&w=majority&appName=jaja';

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to Sisi DB (jaja)'))
  .catch(err => console.error('DB Connection Error:', err));

const throneSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  material: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  royalty: { type: String, required: true },
  powerLevel: { type: Number, default: 50 },
  proclamation: { type: String, default: "Long live the King!" },
  isCursed: { type: Boolean, default: false },
  era: { type: String, default: 'Unknown Era' }
});

const Throne = mongoose.model('Throne', throneSchema);

// Seed if empty
const seedData = async () => {
  const count = await Throne.countDocuments();
  if (count === 0) {
    await Throne.insertMany([
      {
        name: 'The Iron Throne',
        type: 'Throne',
        material: '1,000 Swords',
        description: 'Forged by Aegon the Conqueror from the swords of his defeated enemies.',
        image: 'https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?w=800&auto=format&fit=crop',
        royalty: 'High',
        powerLevel: 95,
        isCursed: false,
        era: 'Age of Conquest'
      },
      {
        name: 'Imperial Golden Throne',
        type: 'Throne',
        material: 'Solid Gold & Rubies',
        description: 'Used by the emperors of old, shining with divine light.',
        image: 'https://images.unsplash.com/photo-1594913785162-e6785b493bd2?w=800&auto=format&fit=crop',
        royalty: 'Supreme',
        powerLevel: 100,
        isCursed: false,
        era: 'Golden Age'
      },
      {
        name: 'The Frozen Throne',
        type: 'Glacial Seat',
        material: 'Enchanted Ice',
        description: 'A seat of pure cold and immense necromantic power.',
        image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop',
        royalty: 'Eldritch',
        powerLevel: 88,
        isCursed: true,
        era: 'Third War'
      },
      {
        name: 'Jade Dragon Throne',
        type: 'Dynastic Seat',
        material: 'Imperial Jade',
        description: 'Carved from a single block of jade, representing eternal harmony.',
        image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&auto=format&fit=crop',
        royalty: 'High',
        powerLevel: 82,
        isCursed: false,
        era: 'Ming Dynasty'
      }
    ]);
    console.log('Seeded initial thrones');
  }
};
seedData();

app.get('/api/thrones', async (req, res) => {
  const thrones = await Throne.find();
  res.json(thrones);
});

app.post('/api/thrones', async (req, res) => {
  const newThrone = new Throne(req.body);
  await newThrone.save();
  res.status(201).json(newThrone);
});

app.put('/api/thrones/:id', async (req, res) => {
  const updated = await Throne.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

app.delete('/api/thrones/:id', async (req, res) => {
  await Throne.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

const PORT = 3005;
app.listen(PORT, () => console.log(`Sisi Backend on http://localhost:${PORT}`));
