import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

class Achievement {
  final String id;
  final String title;
  final String description;
  final bool isUnlocked;
  final String emoji;

  Achievement({
    required this.id,
    required this.title,
    required this.description,
    this.isUnlocked = false,
    required this.emoji,
  });

  Achievement copyWith({bool? isUnlocked}) {
    return Achievement(
      id: id,
      title: title,
      description: description,
      isUnlocked: isUnlocked ?? this.isUnlocked,
      emoji: emoji,
    );
  }
}

class AchievementState {
  final List<Achievement> achievements;
  final int totalCommits;
  final int totalSnippets;
  final int totalFocusMinutes;
  final int totalSessions;
  final int currentStreak;
  final int longestStreak;
  final String? newlyUnlocked; // ID of just-unlocked achievement (for overlay)

  AchievementState({
    required this.achievements,
    this.totalCommits = 0,
    this.totalSnippets = 0,
    this.totalFocusMinutes = 0,
    this.totalSessions = 0,
    this.currentStreak = 0,
    this.longestStreak = 0,
    this.newlyUnlocked,
  });

  AchievementState copyWith({
    List<Achievement>? achievements,
    int? totalCommits,
    int? totalSnippets,
    int? totalFocusMinutes,
    int? totalSessions,
    int? currentStreak,
    int? longestStreak,
    String? newlyUnlocked,
    bool clearNewlyUnlocked = false,
  }) {
    return AchievementState(
      achievements: achievements ?? this.achievements,
      totalCommits: totalCommits ?? this.totalCommits,
      totalSnippets: totalSnippets ?? this.totalSnippets,
      totalFocusMinutes: totalFocusMinutes ?? this.totalFocusMinutes,
      totalSessions: totalSessions ?? this.totalSessions,
      currentStreak: currentStreak ?? this.currentStreak,
      longestStreak: longestStreak ?? this.longestStreak,
      newlyUnlocked: clearNewlyUnlocked ? null : (newlyUnlocked ?? this.newlyUnlocked),
    );
  }

  String get stellarRank {
    if (totalFocusMinutes >= 1200) return 'GALACTIC_COMMANDER';
    if (totalFocusMinutes >= 600) return 'NEBULA_ADMIRAL';
    if (totalFocusMinutes >= 300) return 'STAR_CAPTAIN';
    if (totalFocusMinutes >= 120) return 'ORBIT_PILOT';
    if (totalFocusMinutes >= 30) return 'SPACE_CADET';
    return 'NOVICE_ASTRONAUT';
  }
}

class AchievementNotifier extends StateNotifier<AchievementState> {
  SharedPreferences? _prefs;

  AchievementNotifier() : super(AchievementState(achievements: [
    Achievement(id: 'first_light',  title: 'FIRST_LIGHT',       description: 'Complete your first session',      emoji: '🌟'),
    Achievement(id: 'ghost_shell',  title: 'GHOST_IN_THE_SHELL', description: 'Complete 10 sessions',            emoji: '👻'),
    Achievement(id: 'commit_zen',   title: 'COMMIT_ZEN',         description: 'Make 25 commits during focus',    emoji: '⚡'),
    Achievement(id: 'deep_space',   title: 'DEEP_SPACE_DIVER',   description: 'Complete a 90-min session',       emoji: '🚀'),
    Achievement(id: 'snippet_king', title: 'NEURAL_ARCHITECT',   description: 'Capture 50 neural snippets',      emoji: '🧠'),
    Achievement(id: 'streak_5',     title: 'CONSISTENT_STAR',    description: 'Maintain a 5-day streak',         emoji: '🔥'),
    Achievement(id: 'streak_30',    title: 'ETERNAL_FLAME',      description: 'Maintain a 30-day streak',        emoji: '☀️'),
    Achievement(id: 'marathon',     title: 'MARATHON_CODER',     description: '1000 total focus minutes',        emoji: '🏆'),
  ])) {
    _initPersistence();
  }

  Future<void> _initPersistence() async {
    _prefs = await SharedPreferences.getInstance();
    final jsonStr = _prefs?.getString('star_achievements');
    final commits  = _prefs?.getInt('stat_total_commits')  ?? 0;
    final snippets = _prefs?.getInt('stat_total_snippets') ?? 0;
    final minutes  = _prefs?.getInt('stat_total_minutes')  ?? 0;
    final sessions = _prefs?.getInt('stat_total_sessions') ?? 0;
    final streak   = _prefs?.getInt('stat_current_streak') ?? 0;
    final longest  = _prefs?.getInt('stat_longest_streak') ?? 0;

    List<Achievement> achievements = state.achievements;
    if (jsonStr != null) {
      final List<dynamic> unlockedIds = json.decode(jsonStr);
      achievements = state.achievements.map((a) => a.copyWith(isUnlocked: unlockedIds.contains(a.id))).toList();
    }

    state = state.copyWith(
      achievements:       achievements,
      totalCommits:       commits,
      totalSnippets:      snippets,
      totalFocusMinutes:  minutes,
      totalSessions:      sessions,
      currentStreak:      streak,
      longestStreak:      longest,
    );
  }

  void updateStats({int? commits, int? snippets, int? minutes}) {
    final now = DateTime.now();
    final lastSessionStr = _prefs?.getString('stat_last_session_date');
    int newStreak = state.currentStreak;
    int newLongest = state.longestStreak;

    if (lastSessionStr != null) {
      final lastSession = DateTime.parse(lastSessionStr);
      final diff = now.difference(lastSession).inDays;
      if (diff == 1) {
        newStreak++;
      } else if (diff > 1) {
        newStreak = 1; // Reset streak
      }
      // diff == 0 → same day, no change to streak
    } else {
      newStreak = 1; // Very first session
    }

    if (newStreak > newLongest) newLongest = newStreak;

    state = state.copyWith(
      totalCommits:      state.totalCommits      + (commits  ?? 0),
      totalSnippets:     state.totalSnippets     + (snippets ?? 0),
      totalFocusMinutes: state.totalFocusMinutes + (minutes  ?? 0),
      totalSessions:     state.totalSessions     + 1,
      currentStreak:     newStreak,
      longestStreak:     newLongest,
    );

    _prefs?.setString('stat_last_session_date', now.toIso8601String());
    _checkUnlocks();
    _saveStats();
  }

  void clearNewlyUnlocked() {
    state = state.copyWith(clearNewlyUnlocked: true);
  }

  void _checkUnlocks() {
    String? justUnlocked;
    final newAchievements = state.achievements.map((a) {
      if (a.isUnlocked) return a;
      bool unlock = false;
      if (a.id == 'first_light'  && state.totalSessions     >= 1)    unlock = true;
      if (a.id == 'ghost_shell'  && state.totalSessions     >= 10)   unlock = true;
      if (a.id == 'commit_zen'   && state.totalCommits      >= 25)   unlock = true;
      if (a.id == 'deep_space'   && state.totalFocusMinutes >= 90)   unlock = true;
      if (a.id == 'snippet_king' && state.totalSnippets     >= 50)   unlock = true;
      if (a.id == 'streak_5'     && state.currentStreak     >= 5)    unlock = true;
      if (a.id == 'streak_30'    && state.currentStreak     >= 30)   unlock = true;
      if (a.id == 'marathon'     && state.totalFocusMinutes >= 1000) unlock = true;
      if (unlock) justUnlocked = a.id;
      return a.copyWith(isUnlocked: unlock);
    }).toList();

    state = state.copyWith(achievements: newAchievements, newlyUnlocked: justUnlocked);
    _saveAchievements();
  }

  Future<void> _saveAchievements() async {
    final unlockedIds = state.achievements.where((a) => a.isUnlocked).map((a) => a.id).toList();
    await _prefs?.setString('star_achievements', json.encode(unlockedIds));
  }

  Future<void> _saveStats() async {
    await _prefs?.setInt('stat_total_commits',  state.totalCommits);
    await _prefs?.setInt('stat_total_snippets', state.totalSnippets);
    await _prefs?.setInt('stat_total_minutes',  state.totalFocusMinutes);
    await _prefs?.setInt('stat_total_sessions', state.totalSessions);
    await _prefs?.setInt('stat_current_streak', state.currentStreak);
    await _prefs?.setInt('stat_longest_streak', state.longestStreak);
  }
}

final achievementProvider = StateNotifierProvider<AchievementNotifier, AchievementState>((ref) {
  return AchievementNotifier();
});
