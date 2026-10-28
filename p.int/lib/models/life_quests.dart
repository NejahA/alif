import 'package:flutter/material.dart';

/// A real-life habit that can be logged in p.int to earn Points (coins) and XP.
class LifeQuest {
  final String id;
  final String title;
  final String description;
  final String logLabel;
  final int targetProgress;
  final int coinReward;
  final int xpReward;
  final IconData icon;
  final Color themeColor;
  int currentProgress;
  bool isClaimed;

  LifeQuest({
    required this.id,
    required this.title,
    required this.description,
    required this.logLabel,
    required this.targetProgress,
    required this.coinReward,
    required this.xpReward,
    required this.icon,
    required this.themeColor,
    this.currentProgress = 0,
    this.isClaimed = false,
  });

  bool get isCompleted => currentProgress >= targetProgress;
  double get progressPct => (currentProgress / targetProgress).clamp(0.0, 1.0);

  static List<LifeQuest> dailyDefaults() {
    return [
      LifeQuest(
        id: 'hydrate',
        title: 'Hydrate',
        description: 'Drink 8 glasses of water',
        logLabel: 'Log Glass',
        targetProgress: 8,
        coinReward: 30,
        xpReward: 20,
        icon: Icons.water_drop_rounded,
        themeColor: const Color(0xFF38BDF8),
      ),
      LifeQuest(
        id: 'move',
        title: 'Move Your Body',
        description: 'Log 3 movement sessions (walk, gym, stretch)',
        logLabel: 'Log Session',
        targetProgress: 3,
        coinReward: 45,
        xpReward: 30,
        icon: Icons.directions_run_rounded,
        themeColor: const Color(0xFF10B981),
      ),
      LifeQuest(
        id: 'focus',
        title: 'Deep Focus',
        description: 'Finish 2 distraction-free work blocks',
        logLabel: 'Log Block',
        targetProgress: 2,
        coinReward: 60,
        xpReward: 45,
        icon: Icons.center_focus_strong_rounded,
        themeColor: const Color(0xFF8B5CF6),
      ),
      LifeQuest(
        id: 'read',
        title: 'Feed Your Mind',
        description: 'Read 20 pages',
        logLabel: 'Log Reading',
        targetProgress: 1,
        coinReward: 35,
        xpReward: 25,
        icon: Icons.menu_book_rounded,
        themeColor: const Color(0xFFF59E0B),
      ),
      LifeQuest(
        id: 'sleep',
        title: 'Early Night',
        description: 'Lights out before 23:00',
        logLabel: 'Log Sleep',
        targetProgress: 1,
        coinReward: 40,
        xpReward: 30,
        icon: Icons.bedtime_rounded,
        themeColor: const Color(0xFF6366F1),
      ),
      LifeQuest(
        id: 'connect',
        title: 'Real Connection',
        description: 'Talk to someone you care about',
        logLabel: 'Log Moment',
        targetProgress: 1,
        coinReward: 35,
        xpReward: 25,
        icon: Icons.favorite_rounded,
        themeColor: const Color(0xFFEC4899),
      ),
      LifeQuest(
        id: 'tidy',
        title: 'Reset Your Space',
        description: 'Tidy up for 10 minutes',
        logLabel: 'Log Reset',
        targetProgress: 1,
        coinReward: 25,
        xpReward: 15,
        icon: Icons.cleaning_services_rounded,
        themeColor: const Color(0xFF14B8A6),
      ),
      LifeQuest(
        id: 'screen_free',
        title: 'Screen-Free Hour',
        description: 'One hour without doomscrolling',
        logLabel: 'Log Hour',
        targetProgress: 1,
        coinReward: 50,
        xpReward: 40,
        icon: Icons.phonelink_erase_rounded,
        themeColor: const Color(0xFFEF4444),
      ),
    ];
  }
}
