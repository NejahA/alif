import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * UI slice state structure
 * Manages UI-related state including loading states, errors, and notifications
 * Requirements: All (UI state management)
 */
export interface UIState {
  isLoading: boolean;
  error: string | null;
  showCategorySelector: boolean;
  showSessionCodeInput: boolean;
  notification: string | null;
}

const initialState: UIState = {
  isLoading: false,
  error: null,
  showCategorySelector: false,
  showSessionCodeInput: false,
  notification: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setShowCategorySelector: (state, action: PayloadAction<boolean>) => {
      state.showCategorySelector = action.payload;
    },
    setShowSessionCodeInput: (state, action: PayloadAction<boolean>) => {
      state.showSessionCodeInput = action.payload;
    },
    setNotification: (state, action: PayloadAction<string | null>) => {
      state.notification = action.payload;
    },
    clearNotification: (state) => {
      state.notification = null;
    },
  },
});

export const {
  setLoading,
  setError,
  clearError,
  setShowCategorySelector,
  setShowSessionCodeInput,
  setNotification,
  clearNotification,
} = uiSlice.actions;

export default uiSlice.reducer;
