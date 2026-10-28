import 'package:flutter/material.dart';

class PetEvolution {
  final int stage;
  final String title;
  final String formName;
  final String description;
  final int minLevel;
  final Color primaryAura;
  final Color accentAura;
  final String statBonusText;
  final double coinMultiplier;
  final double xpMultiplier;

  const PetEvolution({
    required this.stage,
    required this.title,
    required this.formName,
    required this.description,
    required this.minLevel,
    required this.primaryAura,
    required this.accentAura,
    required this.statBonusText,
    this.coinMultiplier = 1.0,
    this.xpMultiplier = 1.0,
  });

  bool get hasOrbitalRing => stage >= 2;
  bool get hasWings => stage >= 3;
  bool get hasChronometerHalo => stage >= 4;
  bool get isMaxStage => stage >= 4;

  static const List<PetEvolution> stages = allStages;

  static const List<PetEvolution> allStages = [
    PetEvolution(
      stage: 1,
      title: 'Stardust Wisp',
      formName: 'Wisp Form',
      description: 'A curious newborn celestial orb woven from primordial supernova dust.',
      minLevel: 1,
      primaryAura: Color(0xFF8B5CF6),
      accentAura: Color(0xFFC084FC),
      statBonusText: 'Base Harmony',
      coinMultiplier: 1.0,
      xpMultiplier: 1.0,
    ),
    PetEvolution(
      stage: 2,
      title: 'Cosmic Fledgling',
      formName: 'Fledgling Form',
      description: 'Sprouts luminescent stellar horns and a kinetic orbital starlight ring.',
      minLevel: 5,
      primaryAura: Color(0xFFEC4899),
      accentAura: Color(0xFFF472B6),
      statBonusText: '+15% Coins & XP Bonus',
      coinMultiplier: 1.15,
      xpMultiplier: 1.15,
    ),
    PetEvolution(
      stage: 3,
      title: 'Astral Guardian',
      formName: 'Guardian Form',
      description: 'Unfurls shimmering celestial wings, star crest, and radiant nebula tail.',
      minLevel: 10,
      primaryAura: Color(0xFF00E5FF),
      accentAura: Color(0xFF38BDF8),
      statBonusText: '+30% Coins & XP Bonus',
      coinMultiplier: 1.30,
      xpMultiplier: 1.30,
    ),
    PetEvolution(
      stage: 4,
      title: 'Chronos Prime',
      formName: 'Transcendent Form',
      description: 'A mythic temporal entity surrounded by rotating celestial chronometers and prismatic flares.',
      minLevel: 15,
      primaryAura: Color(0xFFFFD700),
      accentAura: Color(0xFFFF8A80),
      statBonusText: '+50% All Rewards & Divine Aura',
      coinMultiplier: 1.50,
      xpMultiplier: 1.50,
    ),
  ];

  static PetEvolution fromLevel(int level) {
    for (int i = allStages.length - 1; i >= 0; i--) {
      if (level >= allStages[i].minLevel) {
        return allStages[i];
      }
    }
    return allStages.first;
  }
}
