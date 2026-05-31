/**
 * CategorySelector component - Displays and allows selection of question categories
 * Requirements: 2.1, 2.2, 2.4
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Category, CategoryInfo } from '../models';

interface CategorySelectorProps {
  categories: CategoryInfo[];
  activeCategory: Category;
  onSelectCategory: (category: Category) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
}) => {
  const getCategoryEnum = (name: string): Category => {
    const mapping: Record<string, Category> = {
      'Fun & Light': Category.FUN_AND_LIGHT,
      'Philosophical': Category.PHILOSOPHICAL,
      'About Your Past': Category.ABOUT_YOUR_PAST,
    };
    return mapping[name] || Category.FUN_AND_LIGHT;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose a Category</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((categoryInfo) => {
          const categoryEnum = getCategoryEnum(categoryInfo.name);
          const isActive = categoryEnum === activeCategory;

          return (
            <TouchableOpacity
              key={categoryEnum}
              style={[styles.categoryCard, isActive && styles.activeCard]}
              onPress={() => onSelectCategory(categoryEnum)}
              activeOpacity={0.7}
            >
              <Text style={styles.icon}>{categoryInfo.icon}</Text>
              <Text style={[styles.categoryName, isActive && styles.activeName]}>
                {categoryInfo.name}
              </Text>
              <Text style={styles.questionCount}>
                {categoryInfo.questionCount} questions
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    padding: 16,
    minWidth: 140,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeCard: {
    backgroundColor: '#e8f4ff',
    borderColor: '#4a90e2',
  },
  icon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  activeName: {
    color: '#4a90e2',
  },
  questionCount: {
    fontSize: 12,
    color: '#999',
  },
});
