import { SessionManager } from './SessionManager';

describe('SessionManager', () => {
  let sessionManager: SessionManager;

  beforeEach(() => {
    sessionManager = new SessionManager();
  });

  afterEach(() => {
    sessionManager.destroy();
  });

  describe('generateSessionCode', () => {
    it('should generate a 6-character code', () => {
      const code = sessionManager.generateSessionCode();
      expect(code).toHaveLength(6);
    });

    it('should only use valid characters', () => {
      const code = sessionManager.generateSessionCode();
      const validChars = /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]+$/;
      expect(code).toMatch(validChars);
    });

    it('should generate unique codes', () => {
      const codes = new Set<string>();
      for (let i = 0; i < 100; i++) {
        const code = sessionManager.generateSessionCode();
        expect(codes.has(code)).toBe(false);
        codes.add(code);
      }
    });
  });

  describe('createSession', () => {
    it('should create a new session with host', () => {
      const hostId = 'user1';
      const session = sessionManager.createSession(hostId);

      expect(session).toBeDefined();
      expect(session.sessionId).toBeDefined();
      expect(session.sessionCode).toHaveLength(6);
      expect(session.hostId).toBe(hostId);
      expect(session.guestId).toBeNull();
      expect(session.createdAt).toBeInstanceOf(Date);
      expect(session.lastActivity).toBeInstanceOf(Date);
    });

    it('should make session retrievable by ID', () => {
      const hostId = 'user1';
      const session = sessionManager.createSession(hostId);
      const retrieved = sessionManager.getSession(session.sessionId);

      expect(retrieved).toEqual(session);
    });

    it('should make session retrievable by code', () => {
      const hostId = 'user1';
      const session = sessionManager.createSession(hostId);
      const retrieved = sessionManager.getSessionByCode(session.sessionCode);

      expect(retrieved).toEqual(session);
    });

    it('should make session retrievable by user ID', () => {
      const hostId = 'user1';
      const session = sessionManager.createSession(hostId);
      const retrieved = sessionManager.getSessionByUserId(hostId);

      expect(retrieved).toEqual(session);
    });
  });

  describe('joinSession', () => {
    it('should allow guest to join valid session', () => {
      const hostId = 'user1';
      const guestId = 'user2';
      const session = sessionManager.createSession(hostId);

      const joinedSession = sessionManager.joinSession(session.sessionCode, guestId);

      expect(joinedSession).toBeDefined();
      expect(joinedSession?.guestId).toBe(guestId);
      expect(joinedSession?.hostId).toBe(hostId);
    });

    it('should return null for invalid session code', () => {
      const guestId = 'user2';
      const result = sessionManager.joinSession('INVALID', guestId);

      expect(result).toBeNull();
    });

    it('should not allow joining full session', () => {
      const hostId = 'user1';
      const guestId1 = 'user2';
      const guestId2 = 'user3';
      const session = sessionManager.createSession(hostId);

      sessionManager.joinSession(session.sessionCode, guestId1);
      const result = sessionManager.joinSession(session.sessionCode, guestId2);

      expect(result).toBeNull();
    });

    it('should not allow host to join their own session', () => {
      const hostId = 'user1';
      const session = sessionManager.createSession(hostId);

      const result = sessionManager.joinSession(session.sessionCode, hostId);

      expect(result).toBeNull();
    });

    it('should update last activity when joining', (done) => {
      const hostId = 'user1';
      const guestId = 'user2';
      const session = sessionManager.createSession(hostId);
      const originalActivity = session.lastActivity;

      // Wait a bit to ensure timestamp difference
      setTimeout(() => {
        const joinedSession = sessionManager.joinSession(session.sessionCode, guestId);
        expect(joinedSession?.lastActivity.getTime()).toBeGreaterThanOrEqual(
          originalActivity.getTime()
        );
        done();
      }, 10);
    });
  });

  describe('updateActivity', () => {
    it('should update last activity timestamp', (done) => {
      const hostId = 'user1';
      const session = sessionManager.createSession(hostId);
      const originalActivity = session.lastActivity;

      setTimeout(() => {
        sessionManager.updateActivity(session.sessionId);
        const updated = sessionManager.getSession(session.sessionId);
        expect(updated?.lastActivity.getTime()).toBeGreaterThan(
          originalActivity.getTime()
        );
        done();
      }, 10);
    });
  });

  describe('removeUser', () => {
    it('should remove guest from session', () => {
      const hostId = 'user1';
      const guestId = 'user2';
      const session = sessionManager.createSession(hostId);
      sessionManager.joinSession(session.sessionCode, guestId);

      sessionManager.removeUser(guestId);

      const updated = sessionManager.getSession(session.sessionId);
      expect(updated?.guestId).toBeNull();
      expect(sessionManager.getSessionByUserId(guestId)).toBeNull();
    });

    it('should end session when host leaves', () => {
      const hostId = 'user1';
      const guestId = 'user2';
      const session = sessionManager.createSession(hostId);
      sessionManager.joinSession(session.sessionCode, guestId);

      sessionManager.removeUser(hostId);

      expect(sessionManager.getSession(session.sessionId)).toBeNull();
      expect(sessionManager.getSessionByCode(session.sessionCode)).toBeNull();
      expect(sessionManager.getSessionByUserId(hostId)).toBeNull();
      expect(sessionManager.getSessionByUserId(guestId)).toBeNull();
    });
  });

  describe('endSession', () => {
    it('should remove all session references', () => {
      const hostId = 'user1';
      const guestId = 'user2';
      const session = sessionManager.createSession(hostId);
      sessionManager.joinSession(session.sessionCode, guestId);

      sessionManager.endSession(session.sessionId);

      expect(sessionManager.getSession(session.sessionId)).toBeNull();
      expect(sessionManager.getSessionByCode(session.sessionCode)).toBeNull();
      expect(sessionManager.getSessionByUserId(hostId)).toBeNull();
      expect(sessionManager.getSessionByUserId(guestId)).toBeNull();
    });
  });

  describe('getPartnerId', () => {
    it('should return guest ID when called by host', () => {
      const hostId = 'user1';
      const guestId = 'user2';
      const session = sessionManager.createSession(hostId);
      sessionManager.joinSession(session.sessionCode, guestId);

      const partnerId = sessionManager.getPartnerId(session.sessionId, hostId);
      expect(partnerId).toBe(guestId);
    });

    it('should return host ID when called by guest', () => {
      const hostId = 'user1';
      const guestId = 'user2';
      const session = sessionManager.createSession(hostId);
      sessionManager.joinSession(session.sessionCode, guestId);

      const partnerId = sessionManager.getPartnerId(session.sessionId, guestId);
      expect(partnerId).toBe(hostId);
    });

    it('should return null for invalid session', () => {
      const partnerId = sessionManager.getPartnerId('invalid', 'user1');
      expect(partnerId).toBeNull();
    });

    it('should return null when session has no guest', () => {
      const hostId = 'user1';
      const session = sessionManager.createSession(hostId);

      const partnerId = sessionManager.getPartnerId(session.sessionId, hostId);
      expect(partnerId).toBeNull();
    });
  });

  describe('isSessionFull', () => {
    it('should return false for session with only host', () => {
      const hostId = 'user1';
      const session = sessionManager.createSession(hostId);

      expect(sessionManager.isSessionFull(session.sessionId)).toBe(false);
    });

    it('should return true for session with host and guest', () => {
      const hostId = 'user1';
      const guestId = 'user2';
      const session = sessionManager.createSession(hostId);
      sessionManager.joinSession(session.sessionCode, guestId);

      expect(sessionManager.isSessionFull(session.sessionId)).toBe(true);
    });

    it('should return false for invalid session', () => {
      expect(sessionManager.isSessionFull('invalid')).toBe(false);
    });
  });

  describe('getActiveSessionCount', () => {
    it('should return 0 initially', () => {
      expect(sessionManager.getActiveSessionCount()).toBe(0);
    });

    it('should increment when sessions are created', () => {
      sessionManager.createSession('user1');
      expect(sessionManager.getActiveSessionCount()).toBe(1);

      sessionManager.createSession('user2');
      expect(sessionManager.getActiveSessionCount()).toBe(2);
    });

    it('should decrement when sessions are ended', () => {
      const session1 = sessionManager.createSession('user1');
      const session2 = sessionManager.createSession('user2');
      expect(sessionManager.getActiveSessionCount()).toBe(2);

      sessionManager.endSession(session1.sessionId);
      expect(sessionManager.getActiveSessionCount()).toBe(1);

      sessionManager.endSession(session2.sessionId);
      expect(sessionManager.getActiveSessionCount()).toBe(0);
    });
  });
});
