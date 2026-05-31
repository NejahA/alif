// Data models and type definitions

/**
 * Category enum representing the three question categories
 * Requirements: 2.1, 6.2
 */
export enum Category {
  FUN_AND_LIGHT = 'fun_and_light',
  PHILOSOPHICAL = 'philosophical',
  ABOUT_YOUR_PAST = 'about_your_past',
}

/**
 * Connection status for live mode sessions
 * Requirements: 4.4
 */
export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  FAILED = 'failed',
}

/**
 * Question data model
 * Requirements: 6.1, 6.2, 6.3, 6.4
 */
export interface Question {
  id: string;
  text: string;
  category: Category;
  tags: string[];
  createdAt: Date;
}

/**
 * Live mode session state
 * Requirements: 3.1, 3.2, 3.3, 3.5
 */
export interface SessionState {
  sessionId: string | null;
  sessionCode: string | null;
  isHost: boolean;
  partnerId: string | null;
  isConnected: boolean;
  connectionStatus: ConnectionStatus;
}

/**
 * Category metadata information
 * Requirements: 2.1, 2.3
 */
export interface CategoryInfo {
  name: string;
  description: string;
  questionCount: number;
  icon: string;
}

/**
 * Main application state structure
 * Requirements: 1.4, 9.1, 9.3
 */
export interface AppState {
  activeCategory: Category;
  categoryIndices: Map<Category, number>;
  shuffleSeeds: Map<Category, number>;
  viewedQuestions: Map<Category, Set<string>>;
  liveMode: SessionState;
  isLoading: boolean;
  error: string | null;
}

/**
 * Database row structure for questions table
 * Requirements: 8.1
 */
export interface QuestionRow {
  id: string;
  text: string;
  category: string;
  tags: string; // JSON string
  created_at: number; // Unix timestamp
}

/**
 * Database row structure for session state table
 * Requirements: 1.4, 8.1
 */
export interface SessionStateRow {
  category: string;
  current_index: number;
  shuffle_seed: number;
  viewed_questions: string; // JSON string
  last_updated: number; // Unix timestamp
}

/**
 * Gesture configuration for swipe detection
 * Requirements: 1.2
 */
export interface GestureConfig {
  minSwipeDistance: number;  // Default: 50px
  maxSwipeTime: number;      // Default: 300ms
  velocityThreshold: number; // Default: 0.3px/ms
}

/**
 * Progress information for a category
 * Requirements: 1.3
 */
export interface CategoryProgress {
  current: number;
  total: number;
}

/**
 * WebSocket message types for live mode communication
 * Requirements: 3.1, 3.3, 4.1, 4.2, 4.3, 5.1
 */
export type WebSocketMessage =
  | CreateSessionMessage
  | JoinSessionMessage
  | NavigateMessage
  | ChangeCategoryMessage
  | ExitSessionMessage
  | PingMessage
  | SessionCreatedMessage
  | PartnerJoinedMessage
  | SyncNavigateMessage
  | SyncCategoryMessage
  | PartnerLeftMessage
  | SessionEndedMessage
  | ErrorMessage
  | PongMessage;

export interface CreateSessionMessage {
  type: 'CREATE_SESSION';
  userId: string;
}

export interface JoinSessionMessage {
  type: 'JOIN_SESSION';
  sessionCode: string;
  userId: string;
}

export interface NavigateMessage {
  type: 'NAVIGATE';
  direction: 'next' | 'previous';
  sessionId: string;
}

export interface ChangeCategoryMessage {
  type: 'CHANGE_CATEGORY';
  category: Category;
  sessionId: string;
}

export interface ExitSessionMessage {
  type: 'EXIT_SESSION';
  sessionId: string;
  userId: string;
}

export interface PingMessage {
  type: 'PING';
  sessionId: string;
}

export interface SessionCreatedMessage {
  type: 'SESSION_CREATED';
  sessionId: string;
  sessionCode: string;
}

export interface PartnerJoinedMessage {
  type: 'PARTNER_JOINED';
  partnerId: string;
}

export interface SyncNavigateMessage {
  type: 'SYNC_NAVIGATE';
  direction: 'next' | 'previous';
  eventId: string;
}

export interface SyncCategoryMessage {
  type: 'SYNC_CATEGORY';
  category: Category;
  eventId: string;
}

export interface PartnerLeftMessage {
  type: 'PARTNER_LEFT';
}

export interface SessionEndedMessage {
  type: 'SESSION_ENDED';
  reason: string;
}

export interface ErrorMessage {
  type: 'ERROR';
  code: string;
  message: string;
}

export interface PongMessage {
  type: 'PONG';
}
