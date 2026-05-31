import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { SessionManager } from '../services/SessionManager';
import {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from '../types';

type TypedServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

type TypedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export function setupSocketHandlers(
  io: TypedServer,
  sessionManager: SessionManager
): void {
  io.on('connection', (socket: TypedSocket) => {
    console.log(`Client connected: ${socket.id}`);

    // Handle CREATE_SESSION event
    socket.on('CREATE_SESSION', ({ userId }) => {
      try {
        const startTime = Date.now();
        
        // Create new session
        const session = sessionManager.createSession(userId);
        
        // Store user data in socket
        socket.data.userId = userId;
        socket.data.sessionId = session.sessionId;
        
        // Join socket room for this session
        socket.join(session.sessionId);
        
        const duration = Date.now() - startTime;
        console.log(`Session created: ${session.sessionCode} (${duration}ms)`);
        
        // Send response to client
        socket.emit('SESSION_CREATED', {
          sessionId: session.sessionId,
          sessionCode: session.sessionCode,
        });
      } catch (error) {
        console.error('Error creating session:', error);
        socket.emit('ERROR', {
          code: 'SESSION_CREATE_FAILED',
          message: 'Failed to create session',
        });
      }
    });

    // Handle JOIN_SESSION event
    socket.on('JOIN_SESSION', ({ sessionCode, userId }) => {
      try {
        // Attempt to join session
        const session = sessionManager.joinSession(sessionCode, userId);
        
        if (!session) {
          // Session not found or invalid
          socket.emit('ERROR', {
            code: 'INVALID_SESSION_CODE',
            message: 'Session not found or already full',
          });
          return;
        }
        
        // Store user data in socket
        socket.data.userId = userId;
        socket.data.sessionId = session.sessionId;
        
        // Join socket room for this session
        socket.join(session.sessionId);
        
        console.log(`User ${userId} joined session: ${session.sessionCode}`);
        
        // Notify both users that partner has joined
        socket.emit('SESSION_CREATED', {
          sessionId: session.sessionId,
          sessionCode: session.sessionCode,
        });
        
        // Notify host that guest has joined
        socket.to(session.sessionId).emit('PARTNER_JOINED', {
          partnerId: userId,
        });
        
        // Notify guest about host
        socket.emit('PARTNER_JOINED', {
          partnerId: session.hostId,
        });
      } catch (error) {
        console.error('Error joining session:', error);
        socket.emit('ERROR', {
          code: 'SESSION_JOIN_FAILED',
          message: 'Failed to join session',
        });
      }
    });

    // Handle NAVIGATE event
    socket.on('NAVIGATE', ({ direction, sessionId }) => {
      try {
        const session = sessionManager.getSession(sessionId);
        if (!session) {
          socket.emit('ERROR', {
            code: 'SESSION_NOT_FOUND',
            message: 'Session not found',
          });
          return;
        }
        
        // Update activity timestamp
        sessionManager.updateActivity(sessionId);
        
        // Generate unique event ID
        const eventId = uuidv4();
        
        // Broadcast navigation to all clients in session
        io.to(sessionId).emit('SYNC_NAVIGATE', {
          direction,
          eventId,
        });
        
        console.log(`Navigation in session ${sessionId}: ${direction}`);
      } catch (error) {
        console.error('Error handling navigation:', error);
        socket.emit('ERROR', {
          code: 'NAVIGATION_FAILED',
          message: 'Failed to sync navigation',
        });
      }
    });

    // Handle CHANGE_CATEGORY event
    socket.on('CHANGE_CATEGORY', ({ category, sessionId }) => {
      try {
        const session = sessionManager.getSession(sessionId);
        if (!session) {
          socket.emit('ERROR', {
            code: 'SESSION_NOT_FOUND',
            message: 'Session not found',
          });
          return;
        }
        
        // Update activity timestamp
        sessionManager.updateActivity(sessionId);
        
        // Generate unique event ID
        const eventId = uuidv4();
        
        // Broadcast category change to all clients in session
        io.to(sessionId).emit('SYNC_CATEGORY', {
          category,
          eventId,
        });
        
        console.log(`Category change in session ${sessionId}: ${category}`);
      } catch (error) {
        console.error('Error handling category change:', error);
        socket.emit('ERROR', {
          code: 'CATEGORY_CHANGE_FAILED',
          message: 'Failed to sync category change',
        });
      }
    });

    // Handle EXIT_SESSION event
    socket.on('EXIT_SESSION', ({ sessionId, userId }) => {
      try {
        const session = sessionManager.getSession(sessionId);
        if (!session) {
          return;
        }
        
        // Get partner ID before removing user
        const partnerId = sessionManager.getPartnerId(sessionId, userId);
        
        // Remove user from session
        sessionManager.removeUser(userId);
        
        // Leave socket room
        socket.leave(sessionId);
        socket.data.sessionId = null;
        
        // Notify partner that user left
        if (partnerId) {
          io.to(sessionId).emit('PARTNER_LEFT');
        }
        
        // Notify user that session ended
        socket.emit('SESSION_ENDED', {
          reason: 'User exited session',
        });
        
        console.log(`User ${userId} exited session ${sessionId}`);
      } catch (error) {
        console.error('Error handling exit session:', error);
        socket.emit('ERROR', {
          code: 'EXIT_SESSION_FAILED',
          message: 'Failed to exit session',
        });
      }
    });

    // Handle PING event (heartbeat)
    socket.on('PING', ({ sessionId }) => {
      try {
        const session = sessionManager.getSession(sessionId);
        if (session) {
          sessionManager.updateActivity(sessionId);
          socket.emit('PONG');
        }
      } catch (error) {
        console.error('Error handling ping:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
      
      const { userId, sessionId } = socket.data;
      
      if (userId && sessionId) {
        try {
          const session = sessionManager.getSession(sessionId);
          if (session) {
            // Get partner ID before removing user
            const partnerId = sessionManager.getPartnerId(sessionId, userId);
            
            // Remove user from session
            sessionManager.removeUser(userId);
            
            // Notify partner that user left
            if (partnerId) {
              io.to(sessionId).emit('PARTNER_LEFT');
            }
            
            console.log(`User ${userId} disconnected from session ${sessionId}`);
          }
        } catch (error) {
          console.error('Error handling disconnect:', error);
        }
      }
    });
  });
}
