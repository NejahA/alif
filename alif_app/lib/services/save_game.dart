import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

/// Immutable snapshot of the progress a player would hate to lose.
class SaveSnapshot {
  final int coins;
  final int level;
  final int xp;
  final int streakDay;
  final bool streakClaimedToday;
  final int totalLifeLogs;
  final int lifePointsEarned;
  final int totalGamesPlayed;
  final int totalSnacksFed;
  final int totalPetTaps;
  final String equippedHat;
  final String currentHabitat;
  final List<String> unlockedHats;
  final List<String> unlockedHabitats;
  final Map<String, int> lifeQuestProgress;
  final Map<String, bool> lifeQuestClaimed;
  final List<String> moodHistory;
  final String lastMoodDate;

  const SaveSnapshot({
    required this.coins,
    required this.level,
    required this.xp,
    required this.streakDay,
    required this.streakClaimedToday,
    required this.totalLifeLogs,
    required this.lifePointsEarned,
    required this.totalGamesPlayed,
    required this.totalSnacksFed,
    required this.totalPetTaps,
    required this.equippedHat,
    required this.currentHabitat,
    required this.unlockedHats,
    required this.unlockedHabitats,
    required this.lifeQuestProgress,
    required this.lifeQuestClaimed,
    required this.moodHistory,
    required this.lastMoodDate,
  });

  Map<String, dynamic> toJson() => {
        'coins': coins,
        'level': level,
        'xp': xp,
        'streakDay': streakDay,
        'streakClaimedToday': streakClaimedToday,
        'totalLifeLogs': totalLifeLogs,
        'lifePointsEarned': lifePointsEarned,
        'totalGamesPlayed': totalGamesPlayed,
        'totalSnacksFed': totalSnacksFed,
        'totalPetTaps': totalPetTaps,
        'equippedHat': equippedHat,
        'currentHabitat': currentHabitat,
        'unlockedHats': unlockedHats,
        'unlockedHabitats': unlockedHabitats,
        'lifeQuestProgress': lifeQuestProgress,
        'lifeQuestClaimed': lifeQuestClaimed,
        'moodHistory': moodHistory,
        'lastMoodDate': lastMoodDate,
      };

  static SaveSnapshot fromJson(Map<String, dynamic> json) {
    int readInt(String key, int fallback) =>
        (json[key] as num?)?.toInt() ?? fallback;
    String readString(String key, String fallback) =>
        json[key] as String? ?? fallback;
    List<String> readStringList(String key) =>
        (json[key] as List?)?.whereType<String>().toList() ?? <String>[];
    Map<String, int> readIntMap(String key) {
      final raw = json[key];
      if (raw is! Map) return <String, int>{};
      return raw.map(
        (k, v) => MapEntry(k.toString(), (v as num?)?.toInt() ?? 0),
      );
    }

    Map<String, bool> readBoolMap(String key) {
      final raw = json[key];
      if (raw is! Map) return <String, bool>{};
      return raw.map((k, v) => MapEntry(k.toString(), v == true));
    }

    return SaveSnapshot(
      coins: readInt('coins', 150),
      level: readInt('level', 1),
      xp: readInt('xp', 40),
      streakDay: readInt('streakDay', 1),
      streakClaimedToday: json['streakClaimedToday'] == true,
      totalLifeLogs: readInt('totalLifeLogs', 0),
      lifePointsEarned: readInt('lifePointsEarned', 0),
      totalGamesPlayed: readInt('totalGamesPlayed', 0),
      totalSnacksFed: readInt('totalSnacksFed', 0),
      totalPetTaps: readInt('totalPetTaps', 0),
      equippedHat: readString('equippedHat', 'None'),
      currentHabitat: readString('currentHabitat', 'Deep Space'),
      unlockedHats: readStringList('unlockedHats'),
      unlockedHabitats: readStringList('unlockedHabitats'),
      lifeQuestProgress: readIntMap('lifeQuestProgress'),
      lifeQuestClaimed: readBoolMap('lifeQuestClaimed'),
      moodHistory: readStringList('moodHistory'),
      lastMoodDate: readString('lastMoodDate', ''),
    );
  }
}

/// Thin, failure-tolerant wrapper around [SharedPreferences].
///
/// Every method swallows storage errors: a device without storage (or a widget
/// test without a mocked plugin) must still be able to play the game.
class SaveGame {
  static const String _key = 'pointo.save.v1';

  /// Returns `null` when nothing was stored yet or storage is unavailable.
  static Future<SaveSnapshot?> load() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final raw = prefs.getString(_key);
      if (raw == null || raw.isEmpty) return null;
      final decoded = jsonDecode(raw);
      if (decoded is! Map<String, dynamic>) return null;
      return SaveSnapshot.fromJson(decoded);
    } catch (_) {
      return null;
    }
  }

  static Future<void> save(SaveSnapshot snapshot) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_key, jsonEncode(snapshot.toJson()));
    } catch (_) {
      // Storage failures must never break gameplay.
    }
  }
}
