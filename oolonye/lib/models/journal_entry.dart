import 'package:flutter/material.dart';

enum MoodSpectrum {
  serene,    // Cyan
  inspired,  // Violet
  gratitude, // Gold
  peaceful,  // Emerald
  energized, // Rose
}

class JournalEntry {
  final String id;
  final String title;
  final String content;
  final DateTime timestamp;
  final MoodSpectrum mood;
  final List<String> tags;
  final String prompt;

  JournalEntry({
    required this.id,
    required this.title,
    required this.content,
    required this.timestamp,
    required this.mood,
    required this.tags,
    required this.prompt,
  });

  Color get moodColor {
    switch (mood) {
      case MoodSpectrum.serene:
        return const Color(0xFF00E5FF);
      case MoodSpectrum.inspired:
        return const Color(0xFF7C4DFF);
      case MoodSpectrum.gratitude:
        return const Color(0xFFFFD700);
      case MoodSpectrum.peaceful:
        return const Color(0xFF00E676);
      case MoodSpectrum.energized:
        return const Color(0xFFFF4081);
    }
  }

  String get moodLabel {
    switch (mood) {
      case MoodSpectrum.serene:
        return "Serene";
      case MoodSpectrum.inspired:
        return "Inspired";
      case MoodSpectrum.gratitude:
        return "Gratitude";
      case MoodSpectrum.peaceful:
        return "Peaceful";
      case MoodSpectrum.energized:
        return "Energized";
    }
  }
}
