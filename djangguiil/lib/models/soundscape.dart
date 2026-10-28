import 'package:flutter/material.dart';

class SoundChannel {
  final String id;
  final String title;
  final String subtitle;
  final IconData icon;
  final Color accentColor;
  double volume; // 0.0 to 1.0
  bool isMuted;

  SoundChannel({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.accentColor,
    this.volume = 0.5,
    this.isMuted = false,
  });

  double get effectiveVolume => isMuted ? 0.0 : volume;
}

class SoundPreset {
  final String id;
  final String name;
  final String icon;
  final String description;
  final Map<String, double> channelVolumes;

  const SoundPreset({
    required this.id,
    required this.name,
    required this.icon,
    required this.description,
    required this.channelVolumes,
  });
}

class JungleAudioPresets {
  static const List<SoundPreset> presets = [
    SoundPreset(
      id: 'rainy_deluge',
      name: 'Amazonian Deluge',
      icon: '🌧️',
      description: 'Heavy tropical downpour washing over broad monstera leaves with distant river roar.',
      channelVolumes: {
        'rain': 0.85,
        'wind': 0.40,
        'river': 0.60,
        'cicadas': 0.0,
      },
    ),
    SoundPreset(
      id: 'canopy_mist',
      name: 'Canopy Dawn Mist',
      icon: '🍃',
      description: 'Gentle morning breeze swaying giant lianas as cicadas welcome the sunrise.',
      channelVolumes: {
        'rain': 0.15,
        'wind': 0.70,
        'river': 0.25,
        'cicadas': 0.45,
      },
    ),
    SoundPreset(
      id: 'deep_rest',
      name: 'Sacred Lagoon Rest',
      icon: '✨',
      description: 'Lulling rhythmic crystal stream and soft soothing rain for profound calm.',
      channelVolumes: {
        'rain': 0.35,
        'wind': 0.15,
        'river': 0.75,
        'cicadas': 0.10,
      },
    ),
    SoundPreset(
      id: 'nocturnal_pulse',
      name: 'Bioluminescent Night',
      icon: '🌙',
      description: 'Vibrant chorus of nocturnal jungle insects beneath an ancient starlit canopy.',
      channelVolumes: {
        'rain': 0.05,
        'wind': 0.30,
        'river': 0.35,
        'cicadas': 0.85,
      },
    ),
  ];
}
