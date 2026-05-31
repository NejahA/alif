import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

// Store active rooms and connections
const rooms = new Map();
const users = new Map();
const codeStates = new Map(); // roomId -> { code, language, cursorPositions }

export const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    // User joins a room
    socket.on('join-room', (data) => {
      const { roomId, username, userId } = data;
      const room = roomId || uuidv4();
      
      socket.join(room);
      socket.room = room;
      socket.username = username || `User-${socket.id.slice(0, 6)}`;
      socket.userId = userId || socket.id;
      
      // Initialize room if it doesn't exist
      if (!rooms.has(room)) {
        rooms.set(room, {
          id: room,
          users: new Map(),
          code: '// Start coding...\nconsole.log("Hello, World!");',
          language: 'javascript',
          cursorPositions: new Map(),
          aiAssistant: null
        });
      }
      
      // Add user to room
      const roomData = rooms.get(room);
      roomData.users.set(socket.id, {
        id: socket.id,
        username: socket.username,
        color: getRandomColor(),
        cursor: { line: 0, ch: 0 }
      });
      
      // Notify others in the room
      socket.to(room).emit('user-joined', {
        userId: socket.id,
        username: socket.username,
        users: Array.from(roomData.users.values())
      });
      
      // Send current room state to new user
      socket.emit('room-joined', {
        roomId: room,
        users: Array.from(roomData.users.values()),
        code: roomData.code,
        language: roomData.language,
        cursorPositions: Array.from(roomData.cursorPositions.entries())
      });
      
      console.log(`${socket.username} joined room ${room}`);
    });
    
    // Handle code changes
    socket.on('code-change', (data) => {
      const { room, changes, version } = data;
      
      if (rooms.has(room)) {
        const roomData = rooms.get(room);
        
        // Apply changes to code
        if (changes) {
          // Apply the changes to the code
          // In a real implementation, you'd use Operational Transformation (OT) or CRDT
          // For now, we'll do a simple replace
          if (changes.type === 'insert') {
            roomData.code = roomData.code.slice(0, changes.position) + 
                          changes.text + 
                          roomData.code.slice(changes.position);
          } else if (changes.type === 'delete') {
            roomData.code = roomData.code.slice(0, changes.position) + 
                          roomData.code.slice(changes.position + changes.length);
          }
        }
        
        // Broadcast to other users in the room
        socket.to(room).emit('code-update', {
          changes,
          version,
          userId: socket.id,
          timestamp: Date.now()
        });
        
        // Update cursor position
        if (data.cursor) {
          roomData.cursorPositions.set(socket.id, {
            ...data.cursor,
            userId: socket.id,
            username: socket.username
          });
          
          // Broadcast cursor position
          socket.to(room).emit('cursor-update', {
            userId: socket.id,
            cursor: data.cursor,
            username: socket.username
          });
        }
      }
    });
    
    // Handle language change
    socket.on('change-language', (data) => {
      const { room, language } = data;
      
      if (rooms.has(room)) {
        rooms.get(room).language = language;
        socket.to(room).emit('language-changed', { language });
      }
    });
    
    // Handle AI assistance requests
    socket.on('ai-assist', async (data) => {
      const { room, prompt, context } = data;
      
      // In a real implementation, you would call an AI service here
      // For now, we'll simulate an AI response
      const aiResponse = {
        id: uuidv4(),
        type: 'ai-response',
        content: `I can help you with that! Based on your code, I suggest...`,
        timestamp: Date.now()
      };
      
      socket.emit('ai-response', aiResponse);
      
      // Broadcast to room if it's a shared AI session
      if (data.shareWithRoom) {
        socket.to(room).emit('ai-response', {
          ...aiResponse,
          from: socket.username
        });
      }
    });
    
    // Handle cursor movement
    socket.on('cursor-move', (data) => {
      const { room, cursor } = data;
      
      if (rooms.has(room)) {
        const roomData = rooms.get(room);
        roomData.cursorPositions.set(socket.id, {
          ...cursor,
          userId: socket.id,
          username: socket.username
        });
        
        // Broadcast to others in the room
        socket.to(room).emit('cursor-moved', {
          userId: socket.id,
          cursor,
          username: socket.username
        });
      }
    });
    
    // Handle chat messages
    socket.on('chat-message', (data) => {
      const { room, message } = data;
      
      const messageData = {
        id: uuidv4(),
        userId: socket.id,
        username: socket.username,
        message,
        timestamp: Date.now(),
        type: 'message'
      };
      
      // Broadcast to everyone in the room including sender
      io.to(room).emit('chat-message', messageData);
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      
      if (socket.room) {
        const roomData = rooms.get(socket.room);
        if (roomData) {
          roomData.users.delete(socket.id);
          roomData.cursorPositions.delete(socket.id);
          
          // Notify others in the room
          socket.to(socket.room).emit('user-left', {
            userId: socket.id,
            username: socket.username,
            users: Array.from(roomData.users.values())
          });
          
          // Clean up empty rooms
          if (roomData.users.size === 0) {
            rooms.delete(socket.room);
          }
        }
      }
    });
  });
};

// Helper function to generate random color for user
function getRandomColor() {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
    '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9FF3'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}