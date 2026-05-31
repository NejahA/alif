import * as fc from 'fast-check';
import { SessionManager } from './SessionManager';

/**
 * Property-Based Tests for SessionManager
 * Using fast-check to verify universal properties across many inputs
 */

describe('SessionManager - Property Tests', () => {
  let sessionManager: SessionManager;

  beforeEach(() => {
    sessionManager = new SessionManager();
  });

  afterEach(() => {
    sessionManager.destroy();
  });

  /**
   * **Validates: Requirements 7.4**
   * 
   * Property 17: Session Creation Performance
   * 
   * For any session creation request, generating and returning a session code
   * should complete within 200 milliseconds.
   */
  describe('Property 17: Session Creation Performance', () => {
    it('should complete session creation within 200ms', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 50 }),
          (userIds) => {
            const manager = new SessionManager();
            const durations: number[] = [];

            try {
              // Create sessions and measure each creation time
              for (const userId of userIds) {
                const startTime = performance.now();
                const session = manager.createSession(userId);
                const endTime = performance.now();
                const duration = endTime - startTime;

                // Verify session was created successfully
                expect(session).toBeDefined();
                expect(session.sessionCode).toHaveLength(6);
                expect(session.hostId).toBe(userId);

                // Verify duration is within 200ms threshold
                expect(duration).toBeLessThanOrEqual(200);

                durations.push(duration);
              }

              // Verify all durations met the threshold
              expect(durations.every(d => d <= 200)).toBe(true);

              // Calculate and verify average duration
              const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
              expect(avgDuration).toBeLessThanOrEqual(200);
            } finally {
              manager.destroy();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain performance with rapid consecutive session creation', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 10, max: 100 }),
          (count) => {
            const manager = new SessionManager();
            const durations: number[] = [];

            try {
              // Rapidly create sessions
              for (let i = 0; i < count; i++) {
                const startTime = performance.now();
                const session = manager.createSession(`user${i}`);
                const endTime = performance.now();
                const duration = endTime - startTime;

                // Verify session creation
                expect(session).toBeDefined();
                expect(session.sessionCode).toHaveLength(6);

                // Verify duration is within 200ms threshold
                expect(duration).toBeLessThanOrEqual(200);

                durations.push(duration);
              }

              // Verify all durations met the threshold
              expect(durations.every(d => d <= 200)).toBe(true);

              // Calculate statistics
              const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
              const maxDuration = Math.max(...durations);

              // Verify average and max are within threshold
              expect(avgDuration).toBeLessThanOrEqual(200);
              expect(maxDuration).toBeLessThanOrEqual(200);
            } finally {
              manager.destroy();
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should maintain performance even with existing sessions', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 5, max: 50 }),
          fc.integer({ min: 1, max: 20 }),
          (existingSessions, newSessions) => {
            const manager = new SessionManager();

            try {
              // Create existing sessions first
              for (let i = 0; i < existingSessions; i++) {
                manager.createSession(`existing${i}`);
              }

              // Now measure performance of new session creation
              const durations: number[] = [];
              for (let i = 0; i < newSessions; i++) {
                const startTime = performance.now();
                const session = manager.createSession(`new${i}`);
                const endTime = performance.now();
                const duration = endTime - startTime;

                // Verify session creation
                expect(session).toBeDefined();
                expect(session.sessionCode).toHaveLength(6);

                // Verify duration is within 200ms threshold
                expect(duration).toBeLessThanOrEqual(200);

                durations.push(duration);
              }

              // Verify all durations met the threshold
              expect(durations.every(d => d <= 200)).toBe(true);

              // Calculate average duration
              const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
              expect(avgDuration).toBeLessThanOrEqual(200);
            } finally {
              manager.destroy();
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should complete generateSessionCode within performance threshold', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }),
          (count) => {
            const manager = new SessionManager();
            const durations: number[] = [];

            try {
              // Measure just the session code generation
              for (let i = 0; i < count; i++) {
                const startTime = performance.now();
                const code = manager.generateSessionCode();
                const endTime = performance.now();
                const duration = endTime - startTime;

                // Verify code format
                expect(code).toHaveLength(6);
                expect(code).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/);

                // Verify duration is within 200ms threshold
                expect(duration).toBeLessThanOrEqual(200);

                durations.push(duration);
              }

              // Verify all durations met the threshold
              expect(durations.every(d => d <= 200)).toBe(true);

              // Calculate average duration
              const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
              expect(avgDuration).toBeLessThanOrEqual(200);
            } finally {
              manager.destroy();
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * **Validates: Requirements 3.1, 3.2**
   * 
   * Property 6: Session Code Uniqueness
   * 
   * For any sequence of session creation requests, each generated session code
   * should be unique and immediately available in the session state.
   */
  describe('Property 6: Session Code Uniqueness', () => {
    it('should generate unique session codes for multiple session creation requests', () => {
      fc.assert(
        fc.property(
          // Generate an array of 2-50 user IDs
          fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 2, maxLength: 50 }),
          (userIds) => {
            // Create a fresh session manager for each test
            const manager = new SessionManager();
            const sessionCodes = new Set<string>();
            const sessions: Array<{ sessionId: string; sessionCode: string }> = [];

            try {
              // Create sessions for each user
              for (const userId of userIds) {
                const session = manager.createSession(userId);
                
                // Verify session code is unique
                expect(sessionCodes.has(session.sessionCode)).toBe(false);
                sessionCodes.add(session.sessionCode);
                
                // Verify session is immediately available
                const retrieved = manager.getSession(session.sessionId);
                expect(retrieved).toBeDefined();
                expect(retrieved?.sessionCode).toBe(session.sessionCode);
                
                // Verify session is retrievable by code
                const retrievedByCode = manager.getSessionByCode(session.sessionCode);
                expect(retrievedByCode).toBeDefined();
                expect(retrievedByCode?.sessionId).toBe(session.sessionId);
                
                sessions.push(session);
              }

              // Verify all session codes are still unique
              expect(sessionCodes.size).toBe(userIds.length);
              
              // Verify all sessions are still accessible
              for (const session of sessions) {
                const retrieved = manager.getSession(session.sessionId);
                expect(retrieved).toBeDefined();
                expect(retrieved?.sessionCode).toBe(session.sessionCode);
              }
            } finally {
              manager.destroy();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should generate session codes with valid format', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 30 }),
          (userIds) => {
            const manager = new SessionManager();
            const validChars = /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/;

            try {
              for (const userId of userIds) {
                const session = manager.createSession(userId);
                
                // Verify session code format
                expect(session.sessionCode).toMatch(validChars);
                expect(session.sessionCode).toHaveLength(6);
              }
            } finally {
              manager.destroy();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain uniqueness even with concurrent-like creation patterns', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 5, max: 100 }),
          (count) => {
            const manager = new SessionManager();
            const sessionCodes = new Set<string>();

            try {
              // Rapidly create sessions
              for (let i = 0; i < count; i++) {
                const session = manager.createSession(`user${i}`);
                
                // Check uniqueness
                expect(sessionCodes.has(session.sessionCode)).toBe(false);
                sessionCodes.add(session.sessionCode);
              }

              // Verify total uniqueness
              expect(sessionCodes.size).toBe(count);
            } finally {
              manager.destroy();
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
