import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Category, Question } from '../models';

/**
 * Questions slice state structure
 * Manages question browsing state including active category, indices, shuffle seeds, and viewed questions
 * Requirements: 1.2, 1.4, 9.1, 9.3
 */
export interface QuestionsState {
  activeCategory: Category;
  categoryIndices: Record<Category, number>;
  shuffleSeeds: Record<Category, number>;
  viewedQuestions: Record<Category, string[]>;
  currentQuestion: Question | null;
}

const initialState: QuestionsState = {
  activeCategory: Category.FUN_AND_LIGHT,
  categoryIndices: {
    [Category.FUN_AND_LIGHT]: 0,
    [Category.PHILOSOPHICAL]: 0,
    [Category.ABOUT_YOUR_PAST]: 0,
  },
  shuffleSeeds: {
    [Category.FUN_AND_LIGHT]: 0,
    [Category.PHILOSOPHICAL]: 0,
    [Category.ABOUT_YOUR_PAST]: 0,
  },
  viewedQuestions: {
    [Category.FUN_AND_LIGHT]: [],
    [Category.PHILOSOPHICAL]: [],
    [Category.ABOUT_YOUR_PAST]: [],
  },
  currentQuestion: null,
};

const questionsSlice = createSlice({
  name: 'questions',
  initialState,
  reducers: {
    setActiveCategory: (state, action: PayloadAction<Category>) => {
      state.activeCategory = action.payload;
    },
    setCategoryIndex: (
      state,
      action: PayloadAction<{ category: Category; index: number }>
    ) => {
      state.categoryIndices[action.payload.category] = action.payload.index;
    },
    incrementCategoryIndex: (state, action: PayloadAction<Category>) => {
      state.categoryIndices[action.payload] += 1;
    },
    decrementCategoryIndex: (state, action: PayloadAction<Category>) => {
      const currentIndex = state.categoryIndices[action.payload];
      if (currentIndex > 0) {
        state.categoryIndices[action.payload] -= 1;
      }
    },
    setShuffleSeed: (
      state,
      action: PayloadAction<{ category: Category; seed: number }>
    ) => {
      state.shuffleSeeds[action.payload.category] = action.payload.seed;
    },
    addViewedQuestion: (
      state,
      action: PayloadAction<{ category: Category; questionId: string }>
    ) => {
      const { category, questionId } = action.payload;
      if (!state.viewedQuestions[category].includes(questionId)) {
        state.viewedQuestions[category].push(questionId);
      }
    },
    resetViewedQuestions: (state, action: PayloadAction<Category>) => {
      state.viewedQuestions[action.payload] = [];
    },
    setCurrentQuestion: (state, action: PayloadAction<Question | null>) => {
      state.currentQuestion = action.payload;
    },
    resetCategoryState: (state, action: PayloadAction<Category>) => {
      const category = action.payload;
      state.categoryIndices[category] = 0;
      state.viewedQuestions[category] = [];
      state.shuffleSeeds[category] = Math.floor(Math.random() * 1000000);
    },
  },
});

export const {
  setActiveCategory,
  setCategoryIndex,
  incrementCategoryIndex,
  decrementCategoryIndex,
  setShuffleSeed,
  addViewedQuestion,
  resetViewedQuestions,
  setCurrentQuestion,
  resetCategoryState,
} = questionsSlice.actions;

export default questionsSlice.reducer;
