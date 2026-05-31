import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

export default function SisiIcon({ size = 40, color = '#d4af37' }) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* A bridge icon representing the infrastructure boom */}
      <MaterialCommunityIcons name="bridge" size={size * 0.8} color={color} />
      
      {/* A small star or military-like badge overlay */}
      <View style={styles.overlay}>
        <FontAwesome5 name="medal" size={size * 0.4} color={color} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 2,
  },
});
