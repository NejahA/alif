import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../models/models.dart';

class AetherPet {
  final String id;
  final String name;
  final String species;
  final String icon;
  int level;
  int happiness;
  final String auraBuff;
  String stage;
  bool isSelected;

  AetherPet({
    required this.id,
    required this.name,
    required this.species,
    required this.icon,
    required this.level,
    required this.happiness,
    required this.auraBuff,
    required this.stage,
    required this.isSelected,
  });

  factory AetherPet.fromJson(Map<String, dynamic> json) {
    return AetherPet(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      species: json['species'] ?? '',
      icon: json['icon'] ?? '🦊',
      level: json['level'] ?? 1,
      happiness: json['happiness'] ?? 50,
      auraBuff: json['auraBuff'] ?? '+10% XP',
      stage: json['stage'] ?? 'Hatchling',
      isSelected: json['isSelected'] ?? false,
    );
  }
}

class TravelerGuild {
  final String id;
  final String name;
  final String tag;
  int membersCount;
  final int totalFocusHours;
  final int guildLevel;
  final String motto;
  bool isJoined;

  TravelerGuild({
    required this.id,
    required this.name,
    required this.tag,
    required this.membersCount,
    required this.totalFocusHours,
    required this.guildLevel,
    required this.motto,
    required this.isJoined,
  });

  factory TravelerGuild.fromJson(Map<String, dynamic> json) {
    return TravelerGuild(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      tag: json['tag'] ?? '[GUILD]',
      membersCount: json['membersCount'] ?? 1,
      totalFocusHours: json['totalFocusHours'] ?? 0,
      guildLevel: json['guildLevel'] ?? 1,
      motto: json['motto'] ?? '',
      isJoined: json['isJoined'] ?? false,
    );
  }
}

class InventoryRelic {
  final String id;
  final String name;
  final String description;
  final String statBoost;
  final String rarity;
  final String icon;
  bool isEquipped;

  InventoryRelic({
    required this.id,
    required this.name,
    required this.description,
    required this.statBoost,
    required this.rarity,
    required this.icon,
    required this.isEquipped,
  });

  factory InventoryRelic.fromJson(Map<String, dynamic> json) {
    return InventoryRelic(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      statBoost: json['statBoost'] ?? '',
      rarity: json['rarity'] ?? 'Common',
      icon: json['icon'] ?? '✨',
      isEquipped: json['isEquipped'] ?? false,
    );
  }
}

class AchievementItem {
  final String id;
  final String title;
  final String desc;
  final int rewardXp;
  final bool unlocked;
  final String icon;

  AchievementItem({
    required this.id,
    required this.title,
    required this.desc,
    required this.rewardXp,
    required this.unlocked,
    required this.icon,
  });

  factory AchievementItem.fromJson(Map<String, dynamic> json) {
    return AchievementItem(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      desc: json['desc'] ?? '',
      rewardXp: json['rewardXp'] ?? 100,
      unlocked: json['unlocked'] ?? false,
      icon: json['icon'] ?? '🏆',
    );
  }
}

class LeaderboardUser {
  final int rank;
  final String name;
  final int level;
  final int xp;
  final String title;
  final String badge;

  LeaderboardUser({
    required this.rank,
    required this.name,
    required this.level,
    required this.xp,
    required this.title,
    required this.badge,
  });

  factory LeaderboardUser.fromJson(Map<String, dynamic> json) {
    return LeaderboardUser(
      rank: json['rank'] ?? 0,
      name: json['name'] ?? '',
      level: json['level'] ?? 1,
      xp: json['xp'] ?? 0,
      title: json['title'] ?? '',
      badge: json['badge'] ?? '✨',
    );
  }
}

class WorldBoss {
  final String id;
  final String name;
  final int maxHp;
  final int currentHp;
  final int raidersCount;
  final int rewardXp;
  final String bossImage;

  WorldBoss({
    required this.id,
    required this.name,
    required this.maxHp,
    required this.currentHp,
    required this.raidersCount,
    required this.rewardXp,
    required this.bossImage,
  });

  factory WorldBoss.fromJson(Map<String, dynamic> json) {
    return WorldBoss(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      maxHp: json['maxHp'] ?? 1000,
      currentHp: json['currentHp'] ?? 1000,
      raidersCount: json['raidersCount'] ?? 0,
      rewardXp: json['rewardXp'] ?? 500,
      bossImage: json['bossImage'] ?? '🌋',
    );
  }
}

class ConstellationStar {
  final String id;
  final String name;
  final String mood;
  final String color;
  final double x;
  final double y;
  final String date;

  ConstellationStar({
    required this.id,
    required this.name,
    required this.mood,
    required this.color,
    required this.x,
    required this.y,
    required this.date,
  });

  factory ConstellationStar.fromJson(Map<String, dynamic> json) {
    return ConstellationStar(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      mood: json['mood'] ?? 'Calm',
      color: json['color'] ?? '#00F5FF',
      x: (json['x'] as num?)?.toDouble() ?? 0.5,
      y: (json['y'] as num?)?.toDouble() ?? 0.5,
      date: json['date'] ?? '',
    );
  }
}

class ApiService {
  static const String baseUrl = 'http://localhost:4000/api';

  static Future<UserProfile?> fetchProfile() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/user/profile'));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          return UserProfile.fromJson(data['profile']);
        }
      }
    } catch (e) {
      debugPrint('API Error fetchProfile: $e');
    }
    return null;
  }

  static Future<List<AetherPet>> fetchPets() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/pets'));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          final List list = data['pets'];
          return list.map((p) => AetherPet.fromJson(p)).toList();
        }
      }
    } catch (e) {
      debugPrint('API Error fetchPets: $e');
    }
    return [];
  }

  static Future<List<AetherPet>> feedPet(String petId) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/pets/feed'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'petId': petId}),
      );
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          final List list = data['pets'];
          return list.map((p) => AetherPet.fromJson(p)).toList();
        }
      }
    } catch (e) {
      debugPrint('API Error feedPet: $e');
    }
    return [];
  }

  static Future<List<AetherPet>> selectPet(String petId) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/pets/select'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'petId': petId}),
      );
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          final List list = data['pets'];
          return list.map((p) => AetherPet.fromJson(p)).toList();
        }
      }
    } catch (e) {
      debugPrint('API Error selectPet: $e');
    }
    return [];
  }

  static Future<List<TravelerGuild>> fetchGuilds() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/guilds'));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          final List list = data['guilds'];
          return list.map((g) => TravelerGuild.fromJson(g)).toList();
        }
      }
    } catch (e) {
      debugPrint('API Error fetchGuilds: $e');
    }
    return [];
  }

  static Future<List<TravelerGuild>> joinGuild(String guildId) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/guilds/join'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'guildId': guildId}),
      );
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          final List list = data['guilds'];
          return list.map((g) => TravelerGuild.fromJson(g)).toList();
        }
      }
    } catch (e) {
      debugPrint('API Error joinGuild: $e');
    }
    return [];
  }

  static Future<List<AchievementItem>> fetchAchievements() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/achievements'));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          final List list = data['achievements'];
          return list.map((a) => AchievementItem.fromJson(a)).toList();
        }
      }
    } catch (e) {
      debugPrint('API Error fetchAchievements: $e');
    }
    return [];
  }

  static Future<InventoryRelic?> craftAlchemyRelic(String item1Id, String item2Id) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/alchemy/craft'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'item1Id': item1Id, 'item2Id': item2Id}),
      );
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          return InventoryRelic.fromJson(data['relic']);
        }
      }
    } catch (e) {
      debugPrint('API Error craftAlchemyRelic: $e');
    }
    return null;
  }

  static Future<int> submitMinigameScore(int score) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/minigame/score'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'score': score}),
      );
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          return data['xpEarned'] ?? 0;
        }
      }
    } catch (e) {
      debugPrint('API Error submitMinigameScore: $e');
    }
    return 0;
  }

  static Future<WorldBoss?> fetchWorldBoss() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/bosses/active'));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          return WorldBoss.fromJson(data['boss']);
        }
      }
    } catch (e) {
      debugPrint('API Error fetchWorldBoss: $e');
    }
    return null;
  }

  static Future<WorldBoss?> attackWorldBoss(int damage) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/bosses/attack'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'damage': damage}),
      );
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          return WorldBoss.fromJson(data['boss']);
        }
      }
    } catch (e) {
      debugPrint('API Error attackWorldBoss: $e');
    }
    return null;
  }

  static Future<List<ConstellationStar>> fetchConstellations() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/constellations'));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          final List list = data['constellations'];
          return list.map((s) => ConstellationStar.fromJson(s)).toList();
        }
      }
    } catch (e) {
      debugPrint('API Error fetchConstellations: $e');
    }
    return [];
  }

  static Future<List<ConstellationStar>> addConstellationStar(
    String name,
    String mood,
    String color,
    double x,
    double y,
  ) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/constellations/add'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'name': name,
          'mood': mood,
          'color': color,
          'x': x,
          'y': y,
        }),
      );
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          final List list = data['constellations'];
          return list.map((s) => ConstellationStar.fromJson(s)).toList();
        }
      }
    } catch (e) {
      debugPrint('API Error addConstellationStar: $e');
    }
    return [];
  }

  static Future<Map<String, dynamic>?> fetchArcanaCard() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/oracle/card'));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          return data['card'];
        }
      }
    } catch (e) {
      debugPrint('API Error fetchArcanaCard: $e');
    }
    return null;
  }

  static Future<List<Quest>> fetchQuests() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/quests'));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          final List list = data['quests'];
          return list.map((q) => Quest.fromJson(q)).toList();
        }
      }
    } catch (e) {
      debugPrint('API Error fetchQuests: $e');
    }
    return [];
  }

  static Future<UserProfile?> completeQuest(String questId) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/quests/complete'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'questId': questId}),
      );
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          return UserProfile.fromJson(data['profile']);
        }
      }
    } catch (e) {
      debugPrint('API Error completeQuest: $e');
    }
    return null;
  }

  static Future<Quest?> addQuest(String title, String description, String stat, int xpReward) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/quests/add'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'title': title,
          'description': description,
          'stat': stat,
          'xpReward': xpReward,
        }),
      );
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          return Quest.fromJson(data['quest']);
        }
      }
    } catch (e) {
      debugPrint('API Error addQuest: $e');
    }
    return null;
  }

  static Future<List<InventoryRelic>> fetchInventory() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/inventory'));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          final List list = data['inventory'];
          return list.map((i) => InventoryRelic.fromJson(i)).toList();
        }
      }
    } catch (e) {
      debugPrint('API Error fetchInventory: $e');
    }
    return [];
  }

  static Future<bool> equipRelic(String relicId) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/inventory/equip'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'relicId': relicId}),
      );
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data['success'] == true;
      }
    } catch (e) {
      debugPrint('API Error equipRelic: $e');
    }
    return false;
  }

  static Future<List<LeaderboardUser>> fetchLeaderboard() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/leaderboard'));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          final List list = data['leaderboard'];
          return list.map((l) => LeaderboardUser.fromJson(l)).toList();
        }
      }
    } catch (e) {
      debugPrint('API Error fetchLeaderboard: $e');
    }
    return [];
  }

  static Future<Map<String, dynamic>?> fetchOracleVibe() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/oracle/vibe'));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          return data['oracle'];
        }
      }
    } catch (e) {
      debugPrint('API Error fetchOracleVibe: $e');
    }
    return null;
  }

  static Future<List<LoungeChannel>> fetchChannels() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/lounge/channels'));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          final List list = data['channels'];
          return list.map((c) => LoungeChannel.fromJson(c)).toList();
        }
      }
    } catch (e) {
      debugPrint('API Error fetchChannels: $e');
    }
    return [];
  }

  static Future<List<TimeCapsule>> fetchTimeCapsules() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/capsules'));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          final List list = data['capsules'];
          return list.map((c) => TimeCapsule.fromJson(c)).toList();
        }
      }
    } catch (e) {
      debugPrint('API Error fetchTimeCapsules: $e');
    }
    return [];
  }

  static Future<TimeCapsule?> createCapsule(String title, String content, int reqLevel) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/capsules/create'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'title': title,
          'content': content,
          'requiredLevel': reqLevel,
        }),
      );
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          return TimeCapsule.fromJson(data['capsule']);
        }
      }
    } catch (e) {
      debugPrint('API Error createCapsule: $e');
    }
    return null;
  }
}
