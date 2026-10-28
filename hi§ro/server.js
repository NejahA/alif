import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';

// MongoDB Atlas connection string
const DEFAULT_MONGO_URI = 'mongodb+srv://achrefhamdi:21960975@cluster0.qd9v5k1.mongodb.net/hidro?retryWrites=true&w=majority&appName=hidro';
const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_URI_2 || DEFAULT_MONGO_URI;
const DB_NAME = process.env.DB_NAME || 'hidro';
const COLLECTION = process.env.COLLECTION || 'gardens';

const app = express();

// Enable CORS for all origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Client-Id'],
}));

app.use(express.json({ limit: '25mb' }));

let db;
let client;
let isConnecting = false;

// Active SSE client connections for real-time live sync
const sseClients = new Set();

function broadcastLiveUpdate(senderId, updatedAt) {
  const payload = JSON.stringify({
    type: 'update',
    updatedAt: updatedAt || new Date().toISOString(),
    senderId: senderId || 'anonymous',
  });

  const eventMessage = `data: ${payload}\n\n`;
  for (const clientRes of sseClients) {
    try {
      clientRes.write(eventMessage);
    } catch {
      sseClients.delete(clientRes);
    }
  }
}

// Keep-alive heartbeat every 20s so mobile/browser streams don't timeout
setInterval(() => {
  for (const clientRes of sseClients) {
    try {
      clientRes.write(':keepalive\n\n');
    } catch {
      sseClients.delete(clientRes);
    }
  }
}, 20000);

async function connectDB() {
  if (isConnecting) return;
  isConnecting = true;
  try {
    client = new MongoClient(MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
    });
    await client.connect();
    db = client.db(DB_NAME);
    console.log(`✅ Connected to MongoDB Atlas [DB: ${DB_NAME}, Collection: ${COLLECTION}]`);
    isConnecting = false;
  } catch (err) {
    isConnecting = false;
    console.error('❌ MongoDB connection error:', err.message);
    console.log('🔄 Retrying MongoDB connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
}

// Real-Time Server-Sent Events (SSE) Stream
const eventRoutes = [
  '/api/hi§ro/events',
  '/api/hi%C2%A7ro/events',
  '/api/hiro/events',
  '/api/events',
  '/api/stream',
];

app.get(eventRoutes, (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
    'Access-Control-Allow-Origin': '*',
  });

  res.write('data: {"type":"connected","db":"' + DB_NAME + '"}\n\n');
  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// Health check routes
const healthRoutes = [
  '/api/hi§ro/health',
  '/api/hi%C2%A7ro/health',
  '/api/hiro/health',
  '/api/health',
];

app.get(healthRoutes, async (_req, res) => {
  try {
    const connected = !!(client && db);
    let pingOk = false;
    if (connected) {
      await db.command({ ping: 1 });
      pingOk = true;
    }
    res.json({
      ok: true,
      connected: pingOk,
      db: DB_NAME,
      collection: COLLECTION,
      liveClients: sseClients.size,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.json({ ok: true, connected: false, error: err.message });
  }
});

// Load garden data routes
const dataRoutes = [
  '/api/hi§ro/data',
  '/api/hi%C2%A7ro/data',
  '/api/hiro/data',
  '/api/data',
];

app.get(dataRoutes, async (_req, res) => {
  try {
    if (!client || !db) {
      return res.json({ ok: true, data: null, connected: false });
    }
    const doc = await db.collection(COLLECTION).findOne({ key: 'main' });
    if (!doc) {
      return res.json({ ok: true, data: null, connected: true });
    }
    res.json({ ok: true, data: doc.data, connected: true, updatedAt: doc.updatedAt });
  } catch (err) {
    console.error('Error fetching garden data:', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Save garden data routes
app.post(dataRoutes, async (req, res) => {
  try {
    if (!client || !db) {
      return res.status(503).json({ ok: false, error: 'Database not connected' });
    }
    const { data } = req.body;
    if (!data) {
      return res.status(400).json({ ok: false, error: 'Missing data payload' });
    }
    const updatedAt = new Date();
    const doc = { key: 'main', data, updatedAt };
    await db.collection(COLLECTION).updateOne(
      { key: 'main' },
      { $set: doc },
      { upsert: true }
    );

    // Broadcast live event to all other clients immediately!
    const senderId = req.headers['x-client-id'] || 'unknown';
    broadcastLiveUpdate(senderId, updatedAt.toISOString());

    res.json({ ok: true, updatedAt });
  } catch (err) {
    console.error('Error saving garden data:', err.message);
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
  app.listen(PORT, () => {
    console.log(`🌱 hi§ro unified live server running at http://localhost:${PORT}`);
    console.log(`⚡ Real-time SSE stream active at /api/events`);
    console.log(`🔗 Connected to MongoDB cluster: ${MONGO_URI.split('@')[1] || 'Atlas'}`);
  });
});
