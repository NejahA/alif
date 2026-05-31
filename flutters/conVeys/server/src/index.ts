import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { SessionManager } from './services/SessionManager';
import { setupSocketHandlers } from './handlers/socketHandlers';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3000;

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize session manager
const sessionManager = new SessionManager();

// Setup WebSocket handlers
setupSocketHandlers(io, sessionManager);

// Start server
httpServer.listen(PORT, () => {
  console.log(`CONvEYS server listening on port ${PORT}`);
});

export { app, httpServer, io, sessionManager };
