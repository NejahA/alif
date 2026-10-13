class UserProfile {
  final String name;
  final int level;
  final int xp;
  final int nextLevelXp;
  final String title;
  final Map<String, int> stats;
  final List<String> badges;

  UserProfile({
    required this.name,
    required this.level,
    required this.xp,
    required this.nextLevelXp,
    required this.title,
    required this.stats,
    required this.badges,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      name: json['name'] ?? 'Traveler',
      level: json['level'] ?? 1,
      xp: json['xp'] ?? 0,
      nextLevelXp: json['nextLevelXp'] ?? 1000,
      title: json['title'] ?? 'Novice',
      stats: Map<String, int>.from(json['stats'] ?? {}),
      badges: List<String>.from(json['badges'] ?? []),
    );
  }
}

class Quest {
  final String id;
  final String title;
  final String description;
  final String stat;
  final int xpReward;
  bool completed;
  final String category;
  final String difficulty;

  Quest({
    required this.id,
    required this.title,
    required this.description,
    required this.stat,
    required this.xpReward,
    required this.completed,
    required this.category,
    required this.difficulty,
  });

  factory Quest.fromJson(Map<String, dynamic> json) {
    return Quest(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      stat: json['stat'] ?? 'focus',
      xpReward: json['xpReward'] ?? 100,
      completed: json['completed'] ?? false,
      category: json['category'] ?? 'Quest',
      difficulty: json['difficulty'] ?? 'Easy',
    );
  }
}

class LoungeChannel {
  final String id;
  final String name;
  final String genre;
  final int listeners;
  final String audioUrl;
  final String color;

  LoungeChannel({
    required this.id,
    required this.name,
    required this.genre,
    required this.listeners,
    required this.audioUrl,
    required this.color,
  });

  factory LoungeChannel.fromJson(Map<String, dynamic> json) {
    return LoungeChannel(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      genre: json['genre'] ?? '',
      listeners: json['listeners'] ?? 0,
      audioUrl: json['audioUrl'] ?? '',
      color: json['color'] ?? '#00F5FF',
    );
  }
}

class TimeCapsule {
  final String id;
  final String title;
  final String content;
  final String unlockDate;
  final int requiredLevel;
  final bool isUnlocked;
  final String createdAt;

  TimeCapsule({
    required this.id,
    required this.title,
    required this.content,
    required this.unlockDate,
    required this.requiredLevel,
    required this.isUnlocked,
    required this.createdAt,
  });

  factory TimeCapsule.fromJson(Map<String, dynamic> json) {
    return TimeCapsule(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      content: json['content'] ?? '',
      unlockDate: json['unlockDate'] ?? '',
      requiredLevel: json['requiredLevel'] ?? 1,
      isUnlocked: json['isUnlocked'] ?? false,
      createdAt: json['createdAt'] ?? '',
    );
  }
}
