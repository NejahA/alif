import React, { useEffect, useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View, Text } from 'react-native';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { useAppDispatch, useAppSelector } from './store/hooks';
import {
  navigateToNextQuestion,
  navigateToPreviousQuestion,
  switchCategory,
  resetDeck,
  loadCurrentQuestion,
  initializeManagers,
} from './store/actions';
import {
  QuestionCard,
  GestureController,
  CategorySelector,
  ProgressIndicator,
} from './components';
import { Category, CategoryInfo } from './models';
import { questionManager } from './services/QuestionManager';
import { categoryManager } from './services/CategoryManager';

const AppContent = (): React.JSX.Element => {
  const dispatch = useAppDispatch();
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Select state from Redux store
  const currentQuestion = useAppSelector((state) => state.questions.currentQuestion);
  const activeCategory = useAppSelector((state) => state.questions.activeCategory);
  const isLoading = useAppSelector((state) => state.ui.isLoading);
  const error = useAppSelector((state) => state.ui.error);

  useEffect(() => {
    const initializeApp = async () => {
      await questionManager.initialize();
      await categoryManager.initialize();
      
      // Initialize managers in the store actions
      initializeManagers(questionManager, categoryManager);
      
      const categoryInfos = categoryManager.getAllCategoryInfo();
      setCategories(categoryInfos);
      
      // Load initial question
      dispatch(loadCurrentQuestion());
      setInitialized(true);
    };

    initializeApp();
  }, [dispatch]);

  const handleSwipeLeft = () => {
    dispatch(navigateToNextQuestion());
  };

  const handleSwipeRight = () => {
    dispatch(navigateToNextQuestion());
  };

  const handleCategoryChange = (category: Category) => {
    dispatch(switchCategory(category));
  };

  const handleResetDeck = () => {
    dispatch(resetDeck(activeCategory));
  };

  if (!initialized) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const categoryName = categories.find(
    (c) => c.name === getCategoryDisplayName(activeCategory)
  )?.name || '';

  // Calculate progress from Redux state
  const categoryIndex = useAppSelector(
    (state) => state.questions.categoryIndices[activeCategory]
  );
  const viewedCount = useAppSelector(
    (state) => state.questions.viewedQuestions[activeCategory].length
  );
  const categoryInfo = categories.find(
    (c) => c.name === getCategoryDisplayName(activeCategory)
  );
  const totalQuestions = categoryInfo?.questionCount || 0;
  const hasMore = questionManager.hasMoreQuestions(activeCategory);

  const progress = {
    current: categoryIndex + 1,
    total: totalQuestions,
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <CategorySelector
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={handleCategoryChange}
      />

      <GestureController
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
      >
        <QuestionCard
          question={currentQuestion}
          categoryName={categoryName}
        />
      </GestureController>

      <ProgressIndicator
        progress={progress}
        hasMoreQuestions={hasMore}
        onResetDeck={handleResetDeck}
      />
    </SafeAreaView>
  );
};

const getCategoryDisplayName = (category: Category): string => {
  const mapping: Record<Category, string> = {
    [Category.FUN_AND_LIGHT]: 'Fun & Light',
    [Category.PHILOSOPHICAL]: 'Philosophical',
    [Category.ABOUT_YOUR_PAST]: 'About Your Past',
  };
  return mapping[category];
};

const App = (): React.JSX.Element => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    padding: 20,
  },
});

export default App;
