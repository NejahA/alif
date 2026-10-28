import 'package:flutter/material.dart';

class StreakReward {
  final int day;
  final int coins;
  final int xp;
  final String? bonusHat;
  final IconData icon;

  const StreakReward({
    required this.day,
    required this.coins,
    required this.xp,
    this.bonusHat,
    required this.icon,
  });

  static const List<StreakReward> sevenDays = [
    StreakReward(day: 1, coins: 30, xp: 15, icon: Icons.stars_rounded),
    StreakReward(day: 2, coins: 45, xp: 25, icon: Icons.monetization_on_rounded),
    StreakReward(day: 3, coins: 65, xp: 35, icon: Icons.cake_rounded),
    StreakReward(day: 4, coins: 90, xp: 45, icon: Icons.auto_awesome_rounded),
    StreakReward(day: 5, coins: 120, xp: 60, icon: Icons.diamond_rounded),
    StreakReward(day: 6, coins: 160, xp: 80, icon: Icons.rocket_launch_rounded),
    StreakReward(day: 7, coins: 300, xp: 150, bonusHat: 'Crown', icon: Icons.workspace_premium_rounded),
  ];
}

class PetAchievement {
  final String id;
  final String title;
  final String description;
  final IconData icon;
  final Color themeColor;
  final int targetValue;
  int currentValue;
  final int coinReward;
  final int xpReward;
  bool isClaimed;

  PetAchievement({
    required this.id,
    required this.title,
    required this.description,
    required this.icon,
    required this.themeColor,
    required this.targetValue,
    this.currentValue = 0,
    required this.coinReward,
    required this.xpReward,
    this.isClaimed = false,
  });

  bool get isCompleted => currentValue >= targetValue;
  double get progressPct => (currentValue / targetValue).clamp(0.0, 1.0);

  static List<PetAchievement> initialList() {
    return [
      PetAchievement(
        id: 'tap_master',
        title: 'Affectionate Companion',
        description: 'Tap Alifi 15 times to share affection',
        icon: Icons.favorite_rounded,
        themeColor: const Color(0xFFEC4899),
        targetValue: 15,
        coinReward: 40,
        xpReward: 30,
      ),
      PetAchievement(
        id: 'gourmet',
        title: 'Cosmic Feast Master',
        description: 'Feed Alifi 10 celestial snacks',
        icon: Icons.fastfood_rounded,
        themeColor: const Color(0xFF10B981),
        targetValue: 10,
        coinReward: 50,
        xpReward: 40,
      ),
      PetAchievement(
        id: 'arcade_champion',
        title: 'Arcade Virtuoso',
        description: 'Play 6 arcade mini-games',
        icon: Icons.sports_esports_rounded,
        themeColor: const Color(0xFF8B5CF6),
        targetValue: 6,
        coinReward: 70,
        xpReward: 50,
      ),
      PetAchievement(
        id: 'fashion_icon',
        title: 'Cosmic Runway',
        description: 'Unlock 3 accessories from the wardrobe',
        icon: Icons.checkroom_rounded,
        themeColor: const Color(0xFFF59E0B),
        targetValue: 3,
        coinReward: 80,
        xpReward: 60,
      ),
      PetAchievement(
        id: 'evolution_leap',
        title: 'Celestial Metamorphosis',
        description: 'Reach Level 5 to evolve Alifi to Cosmic Fledgling',
        icon: Icons.auto_awesome_rounded,
        themeColor: const Color(0xFF00E5FF),
        targetValue: 5,
        coinReward: 100,
        xpReward: 80,
      ),
      PetAchievement(
        id: 'meteor_survivor',
        title: 'Meteor Ace',
        description: 'Score 15+ in Void Meteor Rush',
        icon: Icons.flight_takeoff_rounded,
        themeColor: const Color(0xFFFF5252),
        targetValue: 15,
        coinReward: 120,
        xpReward: 90,
      ),
    ];
  }
}
