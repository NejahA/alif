export interface Session {
  sessionId: string;
  sessionCode: string;
  hostId: string;
  guestId: string | null;
  createdAt: Date;
  lastActivity: Date;
}

export interface ClientToServerEvents {
  CREATE_SESSION: (data: { userId: string }) => void;
  JOIN_SESSION: (data: { sessionCode: string; userId: string }) => void;
  NAVIGATE: (data: { direction: 'next' | 'previous'; sessionId: string }) => void;
  CHANGE_CATEGORY: (data: { category: string; sessionId: string }) => void;
  EXIT_SESSION: (data: { sessionId: string; userId: string }) => void;
  PING: (data: { sessionId: string }) => void;
}

export interface ServerToClientEvents {
  SESSION_CREATED: (data: { sessionId: string; sessionCode: string }) => void;
  PARTNER_JOINED: (data: { partnerId: string }) => void;
  SYNC_NAVIGATE: (data: { direction: 'next' | 'previous'; eventId: string }) => void;
  SYNC_CATEGORY: (data: { category: string; eventId: string }) => void;
  PARTNER_LEFT: () => void;
  SESSION_ENDED: (data: { reason: string }) => void;
  ERROR: (data: { code: string; message: string }) => void;
  PONG: () => void;
}

export interface InterServerEvents {
  // For future scaling with multiple server instances
}

export interface SocketData {
  userId: string;
  sessionId: string | null;
}
