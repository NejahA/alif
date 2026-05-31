/**
 * ProgressIndicator component - Displays progress through question deck
 * Requirements: 1.3, 9.2
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CategoryProgress } from '../models';

interface ProgressIndicatorProps {
  progress: CategoryProgress;
  hasMoreQuestions: boolean;
  onResetDeck?: () => void;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  hasMoreQuestions,
  onResetDeck,
}) => {
  const progressPercentage = progress.total > 0
    ? (progress.current / progress.total) * 100
    : 0;

  const isAtEnd = !hasMoreQuestions && progress.current === progress.total;

  return (
    <View style={styles.container}>
      <View style={styles.progressInfo}>
        <Text style={styles.progressText}>
          {progress.current} of {progress.total}
        </Text>
        {isAtEnd && (
          <Text style={styles.endMessage}>
            You've reached the end of this category
          </Text>
        )}
      </View>

      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            { width: `${progressPercentage}%` },
          ]}
        />
      </View>

      {isAtEnd && onResetDeck && (
        <TouchableOpacity
          style={styles.resetButton}
          onPress={onResetDeck}
          activeOpacity={0.7}
        >
          <Text style={styles.resetButtonText}>Reset Deck</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  progressInfo: {
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  endMessage: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4a90e2',
    borderRadius: 3,
  },
  resetButton: {
    marginTop: 12,
    backgroundColor: '#4a90e2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
