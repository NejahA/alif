import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * Network slice state structure
 * Manages network connectivity state and live mode availability
 * Requirements: 8.3, 8.4
 */
export interface NetworkState {
  isOnline: boolean;
  liveModeAvailable: boolean;
}

const initialState: NetworkState = {
  isOnline: true,
  liveModeAvailable: true,
};

const networkSlice = createSlice({
  name: 'network',
  initialState,
  reducers: {
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
      // Live mode is only available when online
      state.liveModeAvailable = action.payload;
    },
    setLiveModeAvailable: (state, action: PayloadAction<boolean>) => {
      state.liveModeAvailable = action.payload;
    },
  },
});

export const { setOnlineStatus, setLiveModeAvailable } = networkSlice.actions;

export default networkSlice.reducer;
