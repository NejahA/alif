import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';

const DEFAULT_MONGO_URI =
  'mongodb+srv://achrefhamdi:21960975@cluster0.qd9v5k1.mongodb.net/hidro?retryWrites=true&w=majority&appName=hidro';
const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_URI_2 || DEFAULT_MONGO_URI;
const DB_NAME = process.env.DB_NAME || 'hidro';
const COLLECTION = process.env.COLLECTION || 'gardens';

const app = express();

// Full wildcard CORS support for Vercel web apps, Flutter web, localhost, and mobile clients
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Client-Id',
      'Cache-Control',
      'X-Requested-With',
    ],
  })
);

app.use(express.json({ limit: '25mb' }));

// Normalize request path for Vercel serverless rewrites
app.use((req, _res, next) => {
  if (req.query && req.query.path) {
    const subpath = Array.isArray(req.query.path)
      ? req.query.path.join('/')
      : String(req.query.path);
    req.url = '/api/' + subpath.replace(/^\/+/, '');
  } else if (req.url === '/api/index.js') {
    req.url = '/';
  }
  next();
});

// Cached MongoDB Connection for Serverless Lambdas & Local Server
let cachedClient = null;
let cachedDb = null;
let connectionPromise = null;

async function getDatabase() {
  if (cachedDb && cachedClient) {
    return cachedDb;
  }

  if (!connectionPromise) {
    connectionPromise = (async () => {
      const client = new MongoClient(MONGO_URI, {
        serverSelectionTimeoutMS: 15000,
      });
      await client.connect();
      cachedClient = client;
      cachedDb = client.db(DB_NAME);
      console.log(`✅ Connected to MongoDB Atlas [DB: ${DB_NAME}, Collection: ${COLLECTION}]`);
      return cachedDb;
    })().catch((err) => {
      connectionPromise = null;
      console.error('❌ MongoDB connection error:', err.message);
      throw err;
    });
  }

  return connectionPromise;
}

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

// Keep-alive heartbeat every 15s so serverless/mobile connections don't drop
setInterval(() => {
  for (const clientRes of sseClients) {
    try {
      clientRes.write(':keepalive\n\n');
    } catch {
      sseClients.delete(clientRes);
    }
  }
}, 15000);

// Root route
app.get(['/', '/api'], (_req, res) => {
  res.json({
    status: 'online',
    service: 'hi§ro-live-server',
    database: DB_NAME,
    collection: COLLECTION,
    sseActiveClients: sseClients.size,
    endpoints: {
      data: '/api/hiro/data',
      health: '/api/hiro/health',
      events: '/api/events',
    },
    timestamp: new Date().toISOString(),
  });
});

// SSE Event Stream routes
const eventRoutes = [
  '/api/events',
  '/api/hiro/events',
  '/api/hi§ro/events',
  '/api/hi%C2%A7ro/events',
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

  res.write(`data: {"type":"connected","db":"${DB_NAME}"}\n\n`);
  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// Health check routes
const healthRoutes = [
  '/api/health',
  '/api/hiro/health',
  '/api/hi§ro/health',
  '/api/hi%C2%A7ro/health',
];

app.get(healthRoutes, async (_req, res) => {
  try {
    const db = await getDatabase();
    await db.command({ ping: 1 });
    res.json({
      ok: true,
      connected: true,
      db: DB_NAME,
      collection: COLLECTION,
      liveClients: sseClients.size,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.json({ ok: false, connected: false, error: err.message });
  }
});

// Garden data routes
const dataRoutes = [
  '/api/hiro/data',
  '/api/hi§ro/data',
  '/api/hi%C2%A7ro/data',
  '/api/data',
];

app.get(dataRoutes, async (_req, res) => {
  try {
    const db = await getDatabase();
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

app.post(dataRoutes, async (req, res) => {
  try {
    const db = await getDatabase();
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

export default app;
