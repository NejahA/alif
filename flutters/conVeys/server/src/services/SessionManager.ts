import { v4 as uuidv4 } from 'uuid';
import { Session } from '../types';

export class SessionManager {
  private sessions: Map<string, Session> = new Map();
  private sessionCodeToId: Map<string, string> = new Map();
  private userToSession: Map<string, string> = new Map();
  private readonly SESSION_TIMEOUT = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Run cleanup every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanupExpiredSessions(), 5 * 60 * 1000);
  }

  /**
   * Generate a unique 6-character session code
   * Uses alphanumeric characters excluding similar-looking ones (I, O, 0, 1)
   */
  generateSessionCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code: string;
    
    // Keep generating until we get a unique code
    do {
      code = '';
      for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
      }
    } while (this.sessionCodeToId.has(code));
    
    return code;
  }

  /**
   * Create a new session with a host user
   */
  createSession(hostId: string): Session {
    const sessionId = uuidv4();
    const sessionCode = this.generateSessionCode();
    const now = new Date();

    const session: Session = {
      sessionId,
      sessionCode,
      hostId,
      guestId: null,
      createdAt: now,
      lastActivity: now,
    };

    this.sessions.set(sessionId, session);
    this.sessionCodeToId.set(sessionCode, sessionId);
    this.userToSession.set(hostId, sessionId);

    return session;
  }

  /**
   * Join an existing session as a guest
   */
  joinSession(sessionCode: string, guestId: string): Session | null {
    const sessionId = this.sessionCodeToId.get(sessionCode);
    if (!sessionId) {
      return null;
    }

    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }

    // Check if session is already full
    if (session.guestId !== null) {
      return null;
    }

    // Check if user is trying to join their own session
    if (session.hostId === guestId) {
      return null;
    }

    // Add guest to session
    session.guestId = guestId;
    session.lastActivity = new Date();
    this.userToSession.set(guestId, sessionId);

    return session;
  }

  /**
   * Get session by session ID
   */
  getSession(sessionId: string): Session | null {
    return this.sessions.get(sessionId) || null;
  }

  /**
   * Get session by session code
   */
  getSessionByCode(sessionCode: string): Session | null {
    const sessionId = this.sessionCodeToId.get(sessionCode);
    return sessionId ? this.sessions.get(sessionId) || null : null;
  }

  /**
   * Get session by user ID
   */
  getSessionByUserId(userId: string): Session | null {
    const sessionId = this.userToSession.get(userId);
    return sessionId ? this.sessions.get(sessionId) || null : null;
  }

  /**
   * Update last activity timestamp for a session
   */
  updateActivity(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivity = new Date();
    }
  }

  /**
   * Remove a user from their session
   */
  removeUser(userId: string): Session | null {
    const sessionId = this.userToSession.get(userId);
    if (!sessionId) {
      return null;
    }

    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }

    // Remove user from session
    if (session.hostId === userId) {
      // Host is leaving, end the session
      this.endSession(sessionId);
    } else if (session.guestId === userId) {
      // Guest is leaving, just remove them
      session.guestId = null;
      this.userToSession.delete(userId);
    }

    return session;
  }

  /**
   * End a session and clean up all references
   */
  endSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }

    // Remove all references
    this.sessions.delete(sessionId);
    this.sessionCodeToId.delete(session.sessionCode);
    this.userToSession.delete(session.hostId);
    if (session.guestId) {
      this.userToSession.delete(session.guestId);
    }
  }

  /**
   * Clean up expired sessions (inactive for more than SESSION_TIMEOUT)
   */
  private cleanupExpiredSessions(): void {
    const now = new Date();
    const expiredSessions: string[] = [];

    for (const [sessionId, session] of this.sessions.entries()) {
      const inactiveTime = now.getTime() - session.lastActivity.getTime();
      if (inactiveTime > this.SESSION_TIMEOUT) {
        expiredSessions.push(sessionId);
      }
    }

    for (const sessionId of expiredSessions) {
      this.endSession(sessionId);
    }

    if (expiredSessions.length > 0) {
      console.log(`Cleaned up ${expiredSessions.length} expired sessions`);
    }
  }

  /**
   * Get the partner's user ID in a session
   */
  getPartnerId(sessionId: string, userId: string): string | null {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }

    if (session.hostId === userId) {
      return session.guestId;
    } else if (session.guestId === userId) {
      return session.hostId;
    }

    return null;
  }

  /**
   * Check if a session is full (has both host and guest)
   */
  isSessionFull(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    return session ? session.guestId !== null : false;
  }

  /**
   * Get total number of active sessions
   */
  getActiveSessionCount(): number {
    return this.sessions.size;
  }

  /**
   * Cleanup on shutdown
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.sessions.clear();
    this.sessionCodeToId.clear();
    this.userToSession.clear();
  }
}
