import { configureStore } from '@reduxjs/toolkit';
import questionsReducer from './questionsSlice';
import liveModeReducer from './liveModeSlice';
import uiReducer from './uiSlice';
import networkReducer from './networkSlice';

/**
 * Redux store configuration with all app state slices
 * Requirements: All
 */
export const store = configureStore({
  reducer: {
    questions: questionsReducer,
    liveMode: liveModeReducer,
    ui: uiReducer,
    network: networkReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
