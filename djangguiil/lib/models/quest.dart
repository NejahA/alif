class JungleQuest {
  final String id;
  final String title;
  final String subtitle;
  final String icon;
  final int targetValue;
  int currentValue;
  final int vitalityReward;
  bool isCompleted;

  JungleQuest({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.targetValue,
    this.currentValue = 0,
    required this.vitalityReward,
    this.isCompleted = false,
  });

  double get progress => (currentValue / targetValue).clamp(0.0, 1.0);
}

class InitialJungleQuests {
  static List<JungleQuest> get dailyQuests => [
        JungleQuest(
          id: 'breathwork',
          title: 'Mayan Altar Breathwork',
          subtitle: 'Complete 1 mindful respiration cycle at the Stone Altar',
          icon: '🪨',
          targetValue: 1,
          currentValue: 0,
          vitalityReward: 120,
        ),
        JungleQuest(
          id: 'soundscape',
          title: 'Tune into Canopy Frequencies',
          subtitle: 'Immerse in the rainforest soundscape mixer',
          icon: '🎧',
          targetValue: 1,
          currentValue: 0,
          vitalityReward: 80,
        ),
        JungleQuest(
          id: 'catalog',
          title: 'Catalog Jungle Fauna',
          subtitle: 'Inspect specimens in the Bestiary field guide',
          icon: '🐆',
          targetValue: 2,
          currentValue: 1,
          vitalityReward: 100,
        ),
        JungleQuest(
          id: 'vitality_boost',
          title: 'Nourish the Sacred Ceiba',
          subtitle: 'Collect sunlight & rain droplets from the sanctuary',
          icon: '🌱',
          targetValue: 3,
          currentValue: 1,
          vitalityReward: 150,
        ),
      ];
}
