import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:path_provider/path_provider.dart';
import 'package:starlight/models/star_memory.dart';
import 'package:starlight/theme/starlight_theme.dart';
import 'dart:convert';
import 'package:intl/intl.dart';
import 'package:starlight/providers/achievement_provider.dart';

enum StarPhase { idle, briefing, birth, growth, supernova, rest }
enum StarSpecies { standard, binary, neutron }

class StarState {
  final StarPhase phase;
  final StarSpecies species;
  final Duration timeLeft;
  final Duration totalDuration;
  final int stardust;
  final String? currentIntent;
  final List<StarMemory> history;
  final List<String> unlockedUpgrades;
  final List<String> capturedSnippets;
  final List<String> modifiedFiles;
  final String? currentBranch;
  final bool isPulsing;

  StarState({
    required this.phase,
    this.species = StarSpecies.standard,
    required this.timeLeft,
    required this.totalDuration,
    required this.stardust,
    this.currentIntent,
    required this.history,
    this.unlockedUpgrades = const [],
    this.capturedSnippets = const [],
    this.modifiedFiles = const [],
    this.currentBranch,
    this.isPulsing = false,
  });

  Color get currentColor => StarlightTheme.getTechColor(currentIntent);
  Color get branchColor => StarlightTheme.getBranchColor(currentBranch ?? 'main');
  bool get hasRings => unlockedUpgrades.contains('planetary_rings');

  StarState copyWith({
    StarPhase? phase,
    StarSpecies? species,
    Duration? timeLeft,
    Duration? totalDuration,
    int? stardust,
    String? currentIntent,
    List<StarMemory>? history,
    List<String>? unlockedUpgrades,
    List<String>? capturedSnippets,
    List<String>? modifiedFiles,
    String? currentBranch,
    bool? isPulsing,
  }) {
    return StarState(
      phase: phase ?? this.phase,
      species: species ?? this.species,
      timeLeft: timeLeft ?? this.timeLeft,
      totalDuration: totalDuration ?? this.totalDuration,
      stardust: stardust ?? this.stardust,
      currentIntent: currentIntent ?? this.currentIntent,
      history: history ?? this.history,
      unlockedUpgrades: unlockedUpgrades ?? this.unlockedUpgrades,
      capturedSnippets: capturedSnippets ?? this.capturedSnippets,
      modifiedFiles: modifiedFiles ?? this.modifiedFiles,
      currentBranch: currentBranch ?? this.currentBranch,
      isPulsing: isPulsing ?? this.isPulsing,
    );
  }

  double get progress => totalDuration.inSeconds > 0 
      ? 1.0 - (timeLeft.inSeconds / totalDuration.inSeconds) 
      : 0.0;
}

class StarNotifier extends StateNotifier<StarState> {
  final Ref _ref;
  Timer? _timer;
  Timer? _branchPoller;
  SharedPreferences? _prefs;
  int _lastCommitCount = 0;
  int _sessionStartCommitCount = 0;

  StarNotifier(this._ref) : super(StarState(
    phase: StarPhase.idle,
    timeLeft: Duration.zero,
    totalDuration: Duration.zero,
    stardust: 0,
    history: [],
    unlockedUpgrades: [],
    capturedSnippets: [],
    modifiedFiles: [],
  )) {
    _initPersistence();
    _startBranchPoller();
  }

  void _startBranchPoller() {
    _pollBranch();
    _branchPoller = Timer.periodic(const Duration(seconds: 10), (t) => _pollBranch());
  }

  Future<void> _pollBranch() async {
    try {
      final branchResult = await Process.run('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
      final branch = branchResult.stdout.toString().trim();
      
      final commitResult = await Process.run('git', ['rev-list', '--count', 'HEAD']);
      final count = int.tryParse(commitResult.stdout.toString().trim()) ?? 0;
      
      bool pulse = false;
      if (count > _lastCommitCount && _lastCommitCount > 0) {
        pulse = true;
      }
      _lastCommitCount = count;

      if (branch != state.currentBranch || pulse) {
        state = state.copyWith(currentBranch: branch, isPulsing: pulse);
        if (pulse) {
          Future.delayed(const Duration(seconds: 2), () {
            if (mounted) state = state.copyWith(isPulsing: false);
          });
        }
      }
    } catch (e) {}
  }

  Future<void> _initPersistence() async {
    _prefs = await SharedPreferences.getInstance();
    final historyJson = _prefs?.getString('star_history');
    final stardust = _prefs?.getInt('total_stardust') ?? 0;
    final upgrades = _prefs?.getStringList('star_upgrades') ?? [];
    
    if (historyJson != null) {
      final List<dynamic> decoded = json.decode(historyJson);
      final history = decoded.map((item) => StarMemory.fromMap(item)).toList();
      state = state.copyWith(history: history, stardust: stardust, unlockedUpgrades: upgrades);
    } else {
      state = state.copyWith(stardust: stardust, unlockedUpgrades: upgrades);
    }
  }

  void buyUpgrade(String id, int cost) {
    if (state.stardust >= cost && !state.unlockedUpgrades.contains(id)) {
      final newUpgrades = [...state.unlockedUpgrades, id];
      final newStardust = state.stardust - cost;
      state = state.copyWith(stardust: newStardust, unlockedUpgrades: newUpgrades);
      _saveUpgrades(newUpgrades, newStardust);
    }
  }

  Future<void> _saveUpgrades(List<String> upgrades, int stardust) async {
    await _prefs?.setStringList('star_upgrades', upgrades);
    await _prefs?.setInt('total_stardust', stardust);
  }

  void openBriefing(Duration duration) {
    state = state.copyWith(phase: StarPhase.briefing, totalDuration: duration);
  }

  Future<void> startFocus(String intent) async {
    _sessionStartCommitCount = await _getGitCommitCount();
    
    state = state.copyWith(
      phase: StarPhase.birth,
      timeLeft: state.totalDuration,
      currentIntent: intent,
      capturedSnippets: [],
    );

    // Initial delay for "Star Birth" animation
    Future.delayed(const Duration(seconds: 2), () {
      if (state.phase == StarPhase.birth) {
        state = state.copyWith(phase: StarPhase.growth);
        _startTimer();
      }
    });
  }

  /// Smart engage — sets duration then triggers focus. Called from /engage in StellarShell.
  Future<void> startFocusWithDuration(String intent, int minutes) async {
    state = state.copyWith(totalDuration: Duration(minutes: minutes));
    await startFocus(intent);
  }

  Future<int> _getGitCommitCount() async {
    try {
      final result = await Process.run('git', ['rev-list', '--count', 'HEAD']);
      return int.tryParse(result.stdout.toString().trim()) ?? 0;
    } catch (e) {
      return 0;
    }
  }

  Future<void> captureSnippet() async {
    final data = await Clipboard.getData('text/plain');
    if (data?.text != null && !state.capturedSnippets.contains(data!.text)) {
      state = state.copyWith(capturedSnippets: [...state.capturedSnippets, data.text!]);
    }
  }

  void _startTimer() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (state.timeLeft.inSeconds > 0) {
        state = state.copyWith(timeLeft: state.timeLeft - const Duration(seconds: 1));
      } else {
        _completeFocus();
      }
    });
  }

  Future<void> _completeFocus() async {
    _timer?.cancel();
    final endCommitCount = await _getGitCommitCount();
    final sessionCommits = (endCommitCount - _sessionStartCommitCount).clamp(0, 10);
    
    // Fetch modified files via git
    List<String> modifiedFiles = [];
    try {
      final diffResult = await Process.run('git', ['diff', '--name-only']);
      modifiedFiles = diffResult.stdout.toString().split('\n').where((s) => s.isNotEmpty).toList();
    } catch (e) {}

    final earned = (state.totalDuration.inMinutes * 10) + (sessionCommits * 50);
    
    final memory = StarMemory(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      intent: state.currentIntent ?? 'NEURAL_STABILIZATION',
      duration: state.totalDuration,
      timestamp: DateTime.now(),
      stardustEarned: earned,
    );

    final newHistory = [memory, ...state.history];
    final totalStardust = state.stardust + earned;

    state = state.copyWith(
      phase: StarPhase.supernova,
      stardust: totalStardust,
      history: newHistory,
      modifiedFiles: modifiedFiles,
    );

    _saveToDisk(newHistory, totalStardust);
    _logToMarkdown(memory, state.capturedSnippets, modifiedFiles);

    // Update Achievement Stats - Phase 10
    _ref.read(achievementProvider.notifier).updateStats(
      commits: sessionCommits,
      snippets: state.capturedSnippets.length,
      minutes: state.totalDuration.inMinutes,
    );

    // Supernova delay before returning to idle/rest
    Future.delayed(const Duration(seconds: 5), () {
      state = state.copyWith(phase: StarPhase.rest, currentIntent: null);
    });
  }

  Future<void> _logToMarkdown(StarMemory memory, [List<String>? snippets, List<String>? files]) async {
    try {
      final directory = await getApplicationDocumentsDirectory();
      final file = File('${directory.path}/starlight_logs.md');
      final date = DateFormat('yyyy-MM-dd HH:mm').format(memory.timestamp);
      
      String snippetMarkdown = '';
      if (snippets != null && snippets.isNotEmpty) {
        snippetMarkdown = '\n### NEURAL_SNIPPETS\n' + 
          snippets.map((s) => '```\n$s\n```').join('\n');
      }

      String fileMarkdown = '';
      if (files != null && files.isNotEmpty) {
        fileMarkdown = '\n### MODIFIED_FILES\n' + files.map((f) => '- `$f`').join('\n');
      }

      final entry = '\n## $date\n- **INTENT**: ${memory.intent}\n- **DURATION**: ${memory.duration.inMinutes}M\n- **STARDUST**: +${memory.stardustEarned}$snippetMarkdown$fileMarkdown\n---\n';
      
      if (!await file.exists()) {
        await file.writeAsString('# STAR_LIGHT_NEURAL_LOGS\n$entry');
      } else {
        await file.writeAsString(entry, mode: FileMode.append);
      }
    } catch (e) {
      // Silent fail on I/O error
    }
  }

  Future<void> _saveToDisk(List<StarMemory> history, int stardust) async {
    final historyJson = json.encode(history.map((m) => m.toMap()).toList());
    await _prefs?.setString('star_history', historyJson);
    await _prefs?.setInt('total_stardust', stardust);
  }

  void reset() {
    _timer?.cancel();
    state = state.copyWith(phase: StarPhase.idle, timeLeft: Duration.zero, currentIntent: null, capturedSnippets: []);
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }
}

final starProvider = StateNotifierProvider<StarNotifier, StarState>((ref) {
  return StarNotifier(ref);
});
