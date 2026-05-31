/**
 * GestureController - Manages swipe gesture detection and handling
 * Requirements: 1.2
 */

import React, { useRef } from 'react';
import {
  View,
  PanResponder,
  Animated,
  Dimensions,
  StyleSheet,
  PanResponderGestureState,
} from 'react-native';
import { GestureConfig } from '../models';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface GestureControllerProps {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  children: React.ReactNode;
  config?: Partial<GestureConfig>;
}

const DEFAULT_CONFIG: GestureConfig = {
  minSwipeDistance: 50,
  maxSwipeTime: 300,
  velocityThreshold: 0.3,
};

export const GestureController: React.FC<GestureControllerProps> = ({
  onSwipeLeft,
  onSwipeRight,
  children,
  config = {},
}) => {
  const gestureConfig = { ...DEFAULT_CONFIG, ...config };
  const translateX = useRef(new Animated.Value(0)).current;
  const gestureStartTime = useRef<number>(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: () => {
        gestureStartTime.current = Date.now();
      },

      onPanResponderMove: (_, gestureState: PanResponderGestureState) => {
        // Update card position during swipe
        translateX.setValue(gestureState.dx);
      },

      onPanResponderRelease: (_, gestureState: PanResponderGestureState) => {
        const swipeTime = Date.now() - gestureStartTime.current;
        const distance = Math.abs(gestureState.dx);
        const velocity = Math.abs(gestureState.vx);

        // Check if swipe meets thresholds
        const isValidSwipe =
          distance >= gestureConfig.minSwipeDistance &&
          swipeTime <= gestureConfig.maxSwipeTime &&
          velocity >= gestureConfig.velocityThreshold;

        if (isValidSwipe) {
          // Determine swipe direction
          if (gestureState.dx > 0) {
            // Swipe right
            animateCardOffScreen(SCREEN_WIDTH, onSwipeRight);
          } else {
            // Swipe left
            animateCardOffScreen(-SCREEN_WIDTH, onSwipeLeft);
          }
        } else {
          // Reset card position if swipe not valid
          resetCardPosition();
        }
      },

      onPanResponderTerminate: () => {
        // Reset if gesture is interrupted
        resetCardPosition();
      },
    })
  ).current;

  const animateCardOffScreen = (toValue: number, callback: () => void) => {
    Animated.timing(translateX, {
      toValue,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      // Reset position and trigger callback
      translateX.setValue(0);
      callback();
    });
  };

  const resetCardPosition = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
  };

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            translateX,
          });
        }
        return child;
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
