import 'package:flutter/material.dart';
import '../models/orbit_node.dart';
import '../models/journal_entry.dart';
import '../models/soundscape.dart';

class ColonyeProvider extends ChangeNotifier {
  // Orbital Nodes State
  final List<OrbitNode> _nodes = [
    OrbitNode(
      id: '1',
      title: 'Mind & Meditation',
      category: 'Mindfulness',
      color: const Color(0xFF00E5FF), // Quantum Cyan
      icon: Icons.self_improvement_rounded,
      currentStreak: 12,
      targetDaily: 1,
      completedToday: 1,
      isCompletedToday: true,
      orbitRadiusMultiplier: 0.35,
      baseSpeed: 0.8,
    ),
    OrbitNode(
      id: '2',
      title: 'Deep Creative Focus',
      category: 'Creation',
      color: const Color(0xFF7C4DFF), // Nebula Violet
      icon: Icons.auto_awesome_rounded,
      currentStreak: 7,
      targetDaily: 1,
      completedToday: 0,
      isCompletedToday: false,
      orbitRadiusMultiplier: 0.55,
      baseSpeed: 0.5,
    ),
    OrbitNode(
      id: '3',
      title: 'Vitality & Movement',
      category: 'Vitality',
      color: const Color(0xFFFF4081), // Aurora Rose
      icon: Icons.bolt_rounded,
      currentStreak: 15,
      targetDaily: 1,
      completedToday: 1,
      isCompletedToday: true,
      orbitRadiusMultiplier: 0.72,
      baseSpeed: 0.35,
    ),
    OrbitNode(
      id: '4',
      title: 'Gratitude Reflection',
      category: 'Spirit',
      color: const Color(0xFFFFD700), // Astral Gold
      icon: Icons.favorite_rounded,
      currentStreak: 21,
      targetDaily: 1,
      completedToday: 0,
      isCompletedToday: false,
      orbitRadiusMultiplier: 0.85,
      baseSpeed: 0.25,
    ),
    OrbitNode(
      id: '5',
      title: 'Cosmic Wisdom',
      category: 'Focus',
      color: const Color(0xFF00E676), // Emerald Zen
      icon: Icons.menu_book_rounded,
      currentStreak: 5,
      targetDaily: 1,
      completedToday: 0,
      isCompletedToday: false,
      orbitRadiusMultiplier: 0.95,
      baseSpeed: 0.18,
    ),
  ];

  // Soundscape Tracks State
  final List<AmbientSound> _soundscapes = [
    AmbientSound(
      id: 's1',
      name: '432Hz Deep Resonance',
      description: 'Harmonic frequency for cosmic calm & neural harmony',
      icon: Icons.graphic_eq_rounded,
      accentColor: const Color(0xFF00E5FF),
      volume: 0.7,
      isPlaying: true,
    ),
    AmbientSound(
      id: 's2',
      name: 'Quantum Rain',
      description: 'Gentle atmospheric raindrops over glass sanctuary',
      icon: Icons.water_drop_rounded,
      accentColor: const Color(0xFF7C4DFF),
      volume: 0.5,
      isPlaying: true,
    ),
    AmbientSound(
      id: 's3',
      name: 'Solar Drift',
      description: 'Warm synthesizer drone reminiscent of distant stars',
      icon: Icons.wb_sunny_rounded,
      accentColor: const Color(0xFFFFD700),
      volume: 0.3,
      isPlaying: false,
    ),
    AmbientSound(
      id: 's4',
      name: 'Forest Canopy Wind',
      description: 'Ethereal breeze blowing through ancient emerald leaves',
      icon: Icons.air_rounded,
      accentColor: const Color(0xFF00E676),
      volume: 0.4,
      isPlaying: false,
    ),
  ];

  // Journal Entries State
  final List<JournalEntry> _journalEntries = [
    JournalEntry(
      id: 'j1',
      title: 'Moments of Stillness in Motion',
      content: 'Felt a sudden clarity during morning reflection. The noise of the city transformed into a rhythmic pulse of life.',
      timestamp: DateTime.now().subtract(const Duration(hours: 3)),
      mood: MoodSpectrum.serene,
      tags: ['Clarity', 'Mindfulness', 'Morning'],
      prompt: 'What subtle beauty did you notice today that usually slips past?',
    ),
    JournalEntry(
      id: 'j2',
      title: 'Unlocking Creative Synthesis',
      content: 'Designed the core architecture for Colonye. The glowing particles feel alive and responsive.',
      timestamp: DateTime.now().subtract(const Duration(days: 1)),
      mood: MoodSpectrum.inspired,
      tags: ['Creation', 'Code', 'Aesthetics'],
      prompt: 'What spark of inspiration ignited your focus today?',
    ),
    JournalEntry(
      id: 'j3',
      title: 'Grateful for Connection',
      content: 'Shared deep conversations under the night sky. Connection anchors the soul.',
      timestamp: DateTime.now().subtract(const Duration(days: 2)),
      mood: MoodSpectrum.gratitude,
      tags: ['Soul', 'Friends', 'Night'],
      prompt: 'Who or what brought genuine warmth to your heart?',
    ),
  ];

  // Breathwork State
  String _selectedBreathTechnique = "Box Breathing (4-4-4-4)";
  final int _breathSessionDurationMinutes = 5;
  int _breathCompletedCount = 14;

  // Getters
  List<OrbitNode> get nodes => _nodes;
  List<AmbientSound> get soundscapes => _soundscapes;
  List<JournalEntry> get journalEntries => _journalEntries;
  String get selectedBreathTechnique => _selectedBreathTechnique;
  int get breathSessionDurationMinutes => _breathSessionDurationMinutes;
  int get breathCompletedCount => _breathCompletedCount;

  int get totalCompletedToday => _nodes.where((n) => n.isCompletedToday).length;
  int get totalNodesCount => _nodes.length;
  double get dailyCompletionPercentage => _nodes.isEmpty ? 0.0 : totalCompletedToday / totalNodesCount;

  // Methods
  void addCustomNode({
    required String title,
    required String category,
    required Color color,
    required IconData icon,
  }) {
    final newNode = OrbitNode(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      title: title,
      category: category,
      color: color,
      icon: icon,
      currentStreak: 1,
      targetDaily: 1,
      completedToday: 0,
      isCompletedToday: false,
      orbitRadiusMultiplier: 0.4 + (_nodes.length * 0.12),
      baseSpeed: 0.6 - (_nodes.length * 0.05),
    );
    _nodes.add(newNode);
    notifyListeners();
  }

  void toggleNodeCompletion(String id) {
    final index = _nodes.indexWhere((n) => n.id == id);
    if (index != -1) {
      final node = _nodes[index];
      final newStatus = !node.isCompletedToday;
      final newStreak = newStatus ? node.currentStreak + 1 : (node.currentStreak > 0 ? node.currentStreak - 1 : 0);
      final newCompleted = newStatus ? node.targetDaily : 0;
      
      _nodes[index] = node.copyWith(
        isCompletedToday: newStatus,
        currentStreak: newStreak,
        completedToday: newCompleted,
      );
      notifyListeners();
    }
  }

  void toggleSoundscapePlay(String id) {
    final index = _soundscapes.indexWhere((s) => s.id == id);
    if (index != -1) {
      _soundscapes[index] = _soundscapes[index].copyWith(
        isPlaying: !_soundscapes[index].isPlaying,
      );
      notifyListeners();
    }
  }

  void updateSoundscapeVolume(String id, double volume) {
    final index = _soundscapes.indexWhere((s) => s.id == id);
    if (index != -1) {
      _soundscapes[index] = _soundscapes[index].copyWith(
        volume: volume,
      );
      notifyListeners();
    }
  }

  void addJournalEntry({
    required String title,
    required String content,
    required MoodSpectrum mood,
    required List<String> tags,
    required String prompt,
  }) {
    final entry = JournalEntry(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      title: title,
      content: content,
      timestamp: DateTime.now(),
      mood: mood,
      tags: tags,
      prompt: prompt,
    );
    _journalEntries.insert(0, entry);
    notifyListeners();
  }

  void setBreathTechnique(String technique) {
    _selectedBreathTechnique = technique;
    notifyListeners();
  }

  void recordCompletedBreathSession() {
    _breathCompletedCount++;
    notifyListeners();
  }
}
