import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import agentsRouter from './routes/agents.js';
import workflowsRouter from './routes/workflows.js';
import promptsRouter from './routes/prompts.js';
import documentsRouter from './routes/documents.js';
import telemetryRouter from './routes/telemetry.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'BrandNew AI Workflow Hub & Prompt Workbench API',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/agents', agentsRouter);
app.use('/api/workflows', workflowsRouter);
app.use('/api/prompts', promptsRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/telemetry', telemetryRouter);

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
});

// Start Server
const server = app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 BrandNew AI Hub Server active on http://localhost:${PORT}`);
  console.log(`📡 Healthcheck: http://localhost:${PORT}/api/health`);
  console.log(`======================================================\n`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    const ALT_PORT = Number(PORT) + 1;
    console.warn(`Port ${PORT} in use, attempting fallback to ${ALT_PORT}...`);
    app.listen(ALT_PORT, () => {
      console.log(`🚀 BrandNew AI Hub Server active on http://localhost:${ALT_PORT}`);
    });
  } else {
    console.error('Server listen error:', err);
  }
});
