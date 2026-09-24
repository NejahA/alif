import 'package:flutter/material.dart';

class AmbientSound {
  final String id;
  final String name;
  final String description;
  final IconData icon;
  final Color accentColor;
  double volume; // 0.0 to 1.0
  bool isPlaying;

  AmbientSound({
    required this.id,
    required this.name,
    required this.description,
    required this.icon,
    required this.accentColor,
    this.volume = 0.5,
    this.isPlaying = false,
  });

  AmbientSound copyWith({
    double? volume,
    bool? isPlaying,
  }) {
    return AmbientSound(
      id: id,
      name: name,
      description: description,
      icon: icon,
      accentColor: accentColor,
      volume: volume ?? this.volume,
      isPlaying: isPlaying ?? this.isPlaying,
    );
  }
}
