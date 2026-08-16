const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const Notification = require('../models/Notification');

let io;

exports.initializeWebSocket = (server) => {
  io = socketIO(server, {
    cors: { origin: '*' },
  });

  // Middleware to verify JWT
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication failed'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected`);

    // Join user's personal room
    socket.join(`user:${socket.userId}`);

    // Handle real-time events
    socket.on('subscribe', (events) => {
      events.forEach(event => {
        socket.join(`event:${event}`);
      });
    });

    // Send notification in real-time
    socket.on('send-notification', async (data) => {
      const notification = await Notification.create({
        userId: socket.userId,
        ...data,
      });
      io.to(`user:${socket.userId}`).emit('notification', notification);
    });

    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`);
    });
  });

  return io;
};

// Emit notification to user
exports.emitNotification = (userId, notification) => {
  if (io) {
    io.to(`user:${userId}`).emit('notification', notification);
  }
};

// Broadcast to all users
exports.broadcast = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

// Get io instance
exports.getIO = () => io;
