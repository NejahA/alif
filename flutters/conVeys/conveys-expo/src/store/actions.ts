import { createAsyncThunk } from '@reduxjs/toolkit';
import { Category } from '../models';
import { QuestionManager } from '../services/QuestionManager';
import { CategoryManager } from '../services/CategoryManager';
import {
  setCurrentQuestion,
  incrementCategoryIndex,
  decrementCategoryIndex,
  addViewedQuestion,
  setActiveCategory,
  resetCategoryState,
  setShuffleSeed,
} from './questionsSlice';
import { setLoading, setError, setNotification } from './uiSlice';
import type { RootState } from './store';

/**
 * Thunk actions for complex state operations
 * These actions handle business logic that involves multiple state updates or async operations
 * Requirements: 1.2, 1.4, 2.2, 2.4, 9.2, 9.4
 */

let questionManager: QuestionManager | null = null;
let categoryManager: CategoryManager | null = null;

/**
 * Initialize managers (should be called on app startup)
 */
export const initializeManagers = (
  qm: QuestionManager,
  cm: CategoryManager
) => {
  questionManager = qm;
  categoryManager = cm;
};

/**
 * Navigate to the next question in the current category
 * Requirements: 1.2
 */
export const navigateToNextQuestion = createAsyncThunk<
  void,
  void,
  { state: RootState }
>('questions/navigateNext', async (_, { dispatch, getState }) => {
  if (!questionManager) {
    throw new Error('QuestionManager not initialized');
  }

  const state = getState();
  const category = state.questions.activeCategory;

  try {
    const hasNext = await questionManager.nextQuestion(category);

    if (hasNext) {
      const question = questionManager.getCurrentQuestion(category);
      dispatch(incrementCategoryIndex(category));
      dispatch(setCurrentQuestion(question));
      if (question) {
        dispatch(addViewedQuestion({ category, questionId: question.id }));
      }
    } else {
      dispatch(
        setNotification('No more questions in this category. Reset deck to continue.')
      );
    }
  } catch (error) {
    dispatch(setError((error as Error).message));
  }
});

/**
 * Navigate to the previous question in the current category
 * Requirements: 1.2
 */
export const navigateToPreviousQuestion = createAsyncThunk<
  void,
  void,
  { state: RootState }
>('questions/navigatePrevious', async (_, { dispatch, getState }) => {
  if (!questionManager) {
    throw new Error('QuestionManager not initialized');
  }

  const state = getState();
  const category = state.questions.activeCategory;

  try {
    const hasPrevious = await questionManager.previousQuestion(category);

    if (hasPrevious) {
      const question = questionManager.getCurrentQuestion(category);
      dispatch(decrementCategoryIndex(category));
      dispatch(setCurrentQuestion(question));
    }
  } catch (error) {
    dispatch(setError((error as Error).message));
  }
});

/**
 * Switch to a different category
 * Requirements: 2.2, 2.4
 */
export const switchCategory = createAsyncThunk<
  void,
  Category,
  { state: RootState }
>('questions/switchCategory', async (category, { dispatch }) => {
  if (!questionManager) {
    throw new Error('QuestionManager not initialized');
  }

  try {
    dispatch(setLoading(true));
    dispatch(setActiveCategory(category));
    const question = questionManager.getCurrentQuestion(category);
    dispatch(setCurrentQuestion(question));
  } catch (error) {
    dispatch(setError((error as Error).message));
  } finally {
    dispatch(setLoading(false));
  }
});

/**
 * Reset the question deck for a category (shuffle and start over)
 * Requirements: 9.2, 9.4
 */
export const resetDeck = createAsyncThunk<void, Category, { state: RootState }>(
  'questions/resetDeck',
  async (category, { dispatch }) => {
    if (!questionManager) {
      throw new Error('QuestionManager not initialized');
    }

    try {
      dispatch(setLoading(true));
      
      // Generate new shuffle seed
      const newSeed = Math.floor(Math.random() * 1000000);
      dispatch(setShuffleSeed({ category, seed: newSeed }));
      
      // Reset the deck in the manager
      questionManager.resetDeck(category);
      
      // Reset state
      dispatch(resetCategoryState(category));
      
      // Load first question
      const question = questionManager.getCurrentQuestion(category);
      dispatch(setCurrentQuestion(question));
      
      dispatch(setNotification('Deck reset! Questions have been reshuffled.'));
    } catch (error) {
      dispatch(setError((error as Error).message));
    } finally {
      dispatch(setLoading(false));
    }
  }
);

/**
 * Load the current question (useful for initialization)
 * Requirements: 1.1
 */
export const loadCurrentQuestion = createAsyncThunk<
  void,
  void,
  { state: RootState }
>('questions/loadCurrent', async (_, { dispatch, getState }) => {
  if (!questionManager) {
    throw new Error('QuestionManager not initialized');
  }

  const state = getState();
  const category = state.questions.activeCategory;

  try {
    const question = questionManager.getCurrentQuestion(category);
    dispatch(setCurrentQuestion(question));
  } catch (error) {
    dispatch(setError((error as Error).message));
  }
});
