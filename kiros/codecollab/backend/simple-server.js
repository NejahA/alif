import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Store active rooms and connections
const rooms = new Map();
const users = new Map();

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    rooms: rooms.size,
    connections: users.size
  });
});

// API Routes
app.get('/api/rooms', (req, res) => {
  const roomList = Array.from(rooms.entries()).map(([id, room]) => ({
    id,
    name: room.name,
    users: room.users.size,
    language: room.language,
    isPublic: room.isPublic
  }));
  
  res.json({ rooms: roomList });
});

app.post('/api/rooms', (req, res) => {
  const { name, isPublic = true, language = 'javascript' } = req.body;
  const roomId = Math.random().toString(36).substring(7);
  
  const room = {
    id: roomId,
    name: name || `Room ${roomId}`,
    isPublic,
    language,
    users: new Map(),
    code: '// Start coding...\nconsole.log("Hello, World!");',
    messages: []
  };
  
  rooms.set(roomId, room);
  
  res.json({ 
    success: true, 
    roomId, 
    room: { 
      id: roomId, 
      name: room.name,
      language: room.language
    } 
  });
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join-room', (data) => {
    const { roomId, username, userId } = data;
    const roomIdToJoin = roomId || `room_${Math.random().toString(36).substr(2, 9)}`;
    
    if (!rooms.has(roomIdToJoin)) {
      rooms.set(roomIdToJoin, {
        id: roomIdToJoin,
        name: `Room ${roomIdToJoin}`,
        users: new Map(),
        code: '// Start coding...\nconsole.log("Welcome to CodeCollab!");',
        language: 'javascript',
        messages: []
      });
    }
    
    const room = rooms.get(roomIdToJoin);
    const user = {
      id: socket.id,
      username: username || `User${Math.floor(Math.random() * 1000)}`,
      color: getRandomColor(),
      roomId: roomIdToJoin
    };
    
    users.set(socket.id, user);
    room.users.set(socket.id, user);
    
    socket.join(roomIdToJoin);
    socket.roomId = roomIdToJoin;
    socket.user = user;
    
    // Notify room of new user
    socket.to(roomIdToJoin).emit('user-joined', {
      user: { id: socket.id, username: user.username, color: user.color }
    });
    
    // Send room state to new user
    socket.emit('room-joined', {
      roomId: roomIdToJoin,
      users: Array.from(room.users.values()).map(u => ({
        id: u.id,
        username: u.username,
        color: u.color
      })),
      code: room.code,
      language: room.language,
      messages: room.messages.slice(-50) // Last 50 messages
    });
    
    // Notify others in the room
    socket.to(roomIdToJoin).emit('user-joined', {
      user: { id: socket.id, username: user.username, color: user.color }
    });
  });
  
  socket.on('code-change', (data) => {
    const user = users.get(socket.id);
    if (!user || !socket.roomId) return;
    
    const room = rooms.get(socket.roomId);
    if (room) {
      room.code = data.code;
      socket.to(socket.roomId).emit('code-update', {
        code: data.code,
        userId: socket.id,
        username: user?.username
      });
    }
  });
  
  socket.on('chat-message', (data) => {
    const user = users.get(socket.id);
    if (!user || !socket.roomId) return;
    
    const message = {
      id: Date.now().toString(),
      userId: socket.id,
      username: user.username,
      message: data.message,
      timestamp: Date.now(),
      color: user.color
    };
    
    const room = rooms.get(socket.roomId);
    if (room) {
      room.messages.push(message);
      if (room.messages.length > 100) {
        room.messages = room.messages.slice(-100);
      }
    }
    
    io.to(socket.roomId).emit('chat-message', message);
  });
  
  socket.on('cursor-move', (data) => {
    const user = users.get(socket.id);
    if (!user || !socket.roomId) return;
    
    socket.to(socket.roomId).emit('cursor-move', {
      userId: socket.id,
      username: user.username,
      color: user.color,
      position: data.position
    });
  });
  
  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user && socket.roomId) {
      const room = rooms.get(socket.roomId);
      if (room) {
        room.users.delete(socket.id);
        socket.to(socket.roomId).emit('user-left', {
          userId: socket.id,
          username: user.username
        });
        
        if (room.users.size === 0) {
          rooms.delete(socket.roomId);
        }
      }
      users.delete(socket.id);
    }
    console.log('User disconnected:', socket.id);
  });
});

function getRandomColor() {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
    '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9FF3'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`WebSocket ready for connections`);
});