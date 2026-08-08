import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';

// MongoDB Atlas connection strings (loaded from .env - never hardcode credentials)
const MONGO_URI = process.env.MONGO_URI;
const MONGO_URI_2 = process.env.MONGO_URI_2;
const DB_NAME = process.env.DB_NAME || 'hi§ro';
const COLLECTION = process.env.COLLECTION || 'gardens';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

let db;
let client;
let db2;
let client2;

async function connectDB() {
  try {
    client = new MongoClient(MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
    });
    await client.connect();
    db = client.db(DB_NAME);
    console.log('✅ Connected to MongoDB Atlas (primary)');
  } catch (err) {
    console.error('❌ MongoDB primary connection error:', err.message);
    console.log('🔄 Retrying in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
}

async function connectDB2() {
  try {
    client2 = new MongoClient(MONGO_URI_2, {
      serverSelectionTimeoutMS: 30000,
    });
    await client2.connect();
    db2 = client2.db(DB_NAME);
    console.log('✅ Connected to MongoDB Atlas (secondary)');
  } catch (err) {
    console.error('❌ MongoDB secondary connection error:', err.message);
    console.log('🔄 Retrying in 5 seconds...');
    setTimeout(connectDB2, 5000);
  }
}

// Health check
app.get('/api/hi§ro/health', async (_req, res) => {
  try {
    const primaryConnected = !!(client && db);
    const secondaryConnected = !!(client2 && db2);
    if (primaryConnected) {
      await client.db(DB_NAME).command({ ping: 1 });
    }
    if (secondaryConnected) {
      await client2.db(DB_NAME).command({ ping: 1 });
    }
    res.json({ ok: true, connected: primaryConnected, secondaryConnected });
  } catch {
    res.json({ ok: true, connected: false, secondaryConnected: false });
  }
});

// Load all garden data
app.get('/api/hi§ro/data', async (_req, res) => {
  try {
    if (!client || !db) {
      return res.json({ ok: true, data: null, connected: false });
    }
    const doc = await db.collection(COLLECTION).findOne({ key: 'main' });
    if (!doc) {
      return res.json({ ok: true, data: null, connected: true });
    }
    res.json({ ok: true, data: doc.data, connected: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Save garden data
app.post('/api/hi§ro/data', async (req, res) => {
  try {
    if (!client || !db) {
      return res.status(503).json({ ok: false, error: 'Database not connected' });
    }
    const { data } = req.body;
    if (!data) {
      return res.status(400).json({ ok: false, error: 'Missing data payload' });
    }
    const doc = { key: 'main', data, updatedAt: new Date() };
    await db.collection(COLLECTION).updateOne(
      { key: 'main' },
      { $set: doc },
      { upsert: true }
    );
    // Also save to secondary database if connected
    if (client2 && db2) {
      try {
        await db2.collection(COLLECTION).updateOne(
          { key: 'main' },
          { $set: doc },
          { upsert: true }
        );
      } catch (err2) {
        console.error('⚠️ Secondary database save error:', err2.message);
      }
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Serve static frontend
app.use(express.static('.'));
app.get('/', (_req, res) => {
  res.sendFile(new URL('./index.html', import.meta.url).pathname);
});

const PORT = process.env.PORT || 3456;

connectDB().then(() => {
  connectDB2();
  app.listen(PORT, () => {
    console.log(`🌱 hi§ro server running at http://localhost:${PORT}`);
  });
});
