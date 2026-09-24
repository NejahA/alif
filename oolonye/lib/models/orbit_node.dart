import 'package:flutter/material.dart';

class OrbitNode {
  final String id;
  final String title;
  final String category; // e.g. "Mind", "Vitality", "Spirit", "Creation", "Focus"
  final Color color;
  final IconData icon;
  int currentStreak;
  int targetDaily;
  int completedToday;
  bool isCompletedToday;
  final double orbitRadiusMultiplier; // position on screen canvas
  final double baseSpeed;

  OrbitNode({
    required this.id,
    required this.title,
    required this.category,
    required this.color,
    required this.icon,
    this.currentStreak = 0,
    this.targetDaily = 1,
    this.completedToday = 0,
    this.isCompletedToday = false,
    required this.orbitRadiusMultiplier,
    required this.baseSpeed,
  });

  OrbitNode copyWith({
    int? currentStreak,
    int? completedToday,
    bool? isCompletedToday,
  }) {
    return OrbitNode(
      id: id,
      title: title,
      category: category,
      color: color,
      icon: icon,
      currentStreak: currentStreak ?? this.currentStreak,
      targetDaily: targetDaily,
      completedToday: completedToday ?? this.completedToday,
      isCompletedToday: isCompletedToday ?? this.isCompletedToday,
      orbitRadiusMultiplier: orbitRadiusMultiplier,
      baseSpeed: baseSpeed,
    );
  }
}
