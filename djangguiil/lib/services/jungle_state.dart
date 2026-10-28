import 'package:flutter/material.dart';
import '../models/quest.dart';
import '../models/soundscape.dart';
import '../theme/jungle_theme.dart';
import 'audio_bridge.dart';

enum AtmosphereMode {
  morningMist,
  tropicalDownpour,
  goldenHour,
  bioluminescentNight,
}

class JungleState extends ChangeNotifier {
  AtmosphereMode _atmosphere = AtmosphereMode.morningMist;
  int _vitalityXP = 340;
  final int _streakDays = 5;
  int _totalMeditationMinutes = 24;
  bool _isPlayingSoundscape = false;

  final Set<String> _discoveredCreatureIds = {'jaguar', 'frog'};
  final List<JungleQuest> _quests = InitialJungleQuests.dailyQuests;

  final List<SoundChannel> _channels = [
    SoundChannel(
      id: 'rain',
      title: 'Monstera Rain',
      subtitle: 'Gentle canopy droplets',
      icon: Icons.water_drop_rounded,
      accentColor: JungleColors.azureLagoon,
      volume: 0.65,
    ),
    SoundChannel(
      id: 'wind',
      title: 'Canopy Breeze',
      subtitle: 'Swaying ancient boughs',
      icon: Icons.air_rounded,
      accentColor: JungleColors.neonJade,
      volume: 0.40,
    ),
    SoundChannel(
      id: 'river',
      title: 'Jade River',
      subtitle: 'Cascading lagoon waters',
      icon: Icons.waves_rounded,
      accentColor: JungleColors.emerald,
      volume: 0.50,
    ),
    SoundChannel(
      id: 'cicadas',
      title: 'Night Cicadas',
      subtitle: 'Nocturnal bio-chorus',
      icon: Icons.bug_report_rounded,
      accentColor: JungleColors.sunAmber,
      volume: 0.20,
    ),
  ];

  AtmosphereMode get atmosphere => _atmosphere;
  int get vitalityXP => _vitalityXP;
  int get streakDays => _streakDays;
  int get totalMeditationMinutes => _totalMeditationMinutes;
  bool get isPlayingSoundscape => _isPlayingSoundscape;
  List<SoundChannel> get channels => _channels;
  List<JungleQuest> get quests => _quests;
  Set<String> get discoveredCreatureIds => _discoveredCreatureIds;

  // Tree growth calculation
  String get treeStageName {
    if (_vitalityXP < 200) return 'Sacred Seedling';
    if (_vitalityXP < 450) return 'Verdant Sapling';
    if (_vitalityXP < 800) return 'Canopy Guardian';
    return 'Emergent Sacred Ceiba';
  }

  double get treeProgressPercentage {
    return (_vitalityXP / 1000.0).clamp(0.0, 1.0);
  }

  void setAtmosphere(AtmosphereMode mode) {
    _atmosphere = mode;
    notifyListeners();
  }

  void toggleSoundscape() {
    _isPlayingSoundscape = !_isPlayingSoundscape;
    if (_isPlayingSoundscape) {
      _syncAllAudio();
      AudioBridge.playBirdChirp();
    } else {
      AudioBridge.stopAll();
    }
    notifyListeners();
  }

  void setChannelVolume(String channelId, double vol) {
    final idx = _channels.indexWhere((c) => c.id == channelId);
    if (idx != -1) {
      _channels[idx].volume = vol;
      _channels[idx].isMuted = false;
      if (_isPlayingSoundscape) {
        AudioBridge.setChannel(channelId, vol);
      }
      notifyListeners();
    }
  }

  void toggleMute(String channelId) {
    final idx = _channels.indexWhere((c) => c.id == channelId);
    if (idx != -1) {
      _channels[idx].isMuted = !_channels[idx].isMuted;
      if (_isPlayingSoundscape) {
        AudioBridge.setChannel(
          channelId,
          _channels[idx].isMuted ? 0.0 : _channels[idx].volume,
        );
      }
      notifyListeners();
    }
  }

  void applyPreset(SoundPreset preset) {
    preset.channelVolumes.forEach((channelId, vol) {
      final idx = _channels.indexWhere((c) => c.id == channelId);
      if (idx != -1) {
        _channels[idx].volume = vol;
        _channels[idx].isMuted = false;
      }
    });

    _isPlayingSoundscape = true;
    _syncAllAudio();
    AudioBridge.playBirdChirp();
    notifyListeners();
  }

  void _syncAllAudio() {
    for (final ch in _channels) {
      AudioBridge.setChannel(ch.id, ch.effectiveVolume);
    }
  }

  void nourishSanctuary() {
    _vitalityXP = (_vitalityXP + 25).clamp(0, 1000);
    AudioBridge.playBowlChime();

    // Update quest if applicable
    final quest = _quests.firstWhere(
      (q) => q.id == 'vitality_boost',
      orElse: () => _quests.first,
    );
    if (!quest.isCompleted && quest.currentValue < quest.targetValue) {
      quest.currentValue++;
      if (quest.currentValue >= quest.targetValue) {
        quest.isCompleted = true;
        _vitalityXP = (_vitalityXP + quest.vitalityReward).clamp(0, 1000);
      }
    }

    notifyListeners();
  }

  void inspectCreature(String id) {
    _discoveredCreatureIds.add(id);

    // Update catalog quest
    final quest = _quests.firstWhere(
      (q) => q.id == 'catalog',
      orElse: () => _quests.first,
    );
    if (!quest.isCompleted && quest.currentValue < quest.targetValue) {
      quest.currentValue = _discoveredCreatureIds.length;
      if (quest.currentValue >= quest.targetValue) {
        quest.isCompleted = true;
        _vitalityXP = (_vitalityXP + quest.vitalityReward).clamp(0, 1000);
      }
    }

    notifyListeners();
  }

  void completeBreathworkSession(int minutes) {
    _totalMeditationMinutes += minutes;
    _vitalityXP = (_vitalityXP + (minutes * 30)).clamp(0, 1000);

    final quest = _quests.firstWhere(
      (q) => q.id == 'breathwork',
      orElse: () => _quests.first,
    );
    if (!quest.isCompleted) {
      quest.currentValue = 1;
      quest.isCompleted = true;
      _vitalityXP = (_vitalityXP + quest.vitalityReward).clamp(0, 1000);
    }

    AudioBridge.playBowlChime();
    notifyListeners();
  }

  void triggerBirdChirp() {
    AudioBridge.playBirdChirp();
  }

  void triggerBowlChime() {
    AudioBridge.playBowlChime();
  }
}
