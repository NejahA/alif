/**
 * QuestionCard component - Displays a question in card format with swipe gesture support
 * Requirements: 1.1, 2.3
 */

import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Question, Category } from '../models';

interface QuestionCardProps {
  question: Question | null;
  categoryName: string;
  translateX?: Animated.Value;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  categoryName,
  translateX,
}) => {
  const animatedStyle = translateX
    ? {
        transform: [{ translateX }],
      }
    : {};

  if (!question) {
    return (
      <View style={styles.card}>
        <Text style={styles.noQuestion}>No questions available</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <View style={styles.categoryBadge}>
        <Text style={styles.categoryText}>{categoryName}</Text>
      </View>
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{question.text}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    margin: 16,
    minHeight: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    justifyContent: 'space-between',
  },
  categoryBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  questionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionText: {
    fontSize: 24,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    lineHeight: 36,
  },
  noQuestion: {
    fontSize: 18,
    color: '#999',
    textAlign: 'center',
  },
});
