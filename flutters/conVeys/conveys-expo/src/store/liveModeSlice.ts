import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ConnectionStatus } from '../models';

/**
 * Live mode slice state structure
 * Manages live mode session state including connection status, session info, and partner details
 * Requirements: 3.1, 3.2, 3.3, 3.5, 4.4
 */
export interface LiveModeState {
  isActive: boolean;
  sessionId: string | null;
  sessionCode: string | null;
  isHost: boolean;
  partnerId: string | null;
  connectionStatus: ConnectionStatus;
  lastSyncEventId: string | null;
}

const initialState: LiveModeState = {
  isActive: false,
  sessionId: null,
  sessionCode: null,
  isHost: false,
  partnerId: null,
  connectionStatus: ConnectionStatus.DISCONNECTED,
  lastSyncEventId: null,
};

const liveModeSlice = createSlice({
  name: 'liveMode',
  initialState,
  reducers: {
    setSessionCreated: (
      state,
      action: PayloadAction<{ sessionId: string; sessionCode: string }>
    ) => {
      state.isActive = true;
      state.sessionId = action.payload.sessionId;
      state.sessionCode = action.payload.sessionCode;
      state.isHost = true;
      state.connectionStatus = ConnectionStatus.CONNECTING;
    },
    setSessionJoined: (
      state,
      action: PayloadAction<{ sessionId: string; sessionCode: string }>
    ) => {
      state.isActive = true;
      state.sessionId = action.payload.sessionId;
      state.sessionCode = action.payload.sessionCode;
      state.isHost = false;
      state.connectionStatus = ConnectionStatus.CONNECTING;
    },
    setPartnerJoined: (state, action: PayloadAction<string>) => {
      state.partnerId = action.payload;
      state.connectionStatus = ConnectionStatus.CONNECTED;
    },
    setPartnerLeft: (state) => {
      state.partnerId = null;
      state.connectionStatus = ConnectionStatus.DISCONNECTED;
    },
    setConnectionStatus: (state, action: PayloadAction<ConnectionStatus>) => {
      state.connectionStatus = action.payload;
    },
    setLastSyncEventId: (state, action: PayloadAction<string>) => {
      state.lastSyncEventId = action.payload;
    },
    exitSession: (state) => {
      state.isActive = false;
      state.sessionId = null;
      state.sessionCode = null;
      state.isHost = false;
      state.partnerId = null;
      state.connectionStatus = ConnectionStatus.DISCONNECTED;
      state.lastSyncEventId = null;
    },
  },
});

export const {
  setSessionCreated,
  setSessionJoined,
  setPartnerJoined,
  setPartnerLeft,
  setConnectionStatus,
  setLastSyncEventId,
  exitSession,
} = liveModeSlice.actions;

export default liveModeSlice.reducer;
