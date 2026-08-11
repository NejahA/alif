import 'dart:math';
import 'package:flutter/foundation.dart';
import 'package:uuid/uuid.dart';
import '../models/bloom.dart';
import '../models/flight_path.dart';
import 'storage_service.dart';

/// Central state manager for the meadow.
class HiveController extends ChangeNotifier {
  final StorageService _storage;
  final _uuid = const Uuid();

  List<Bloom> _blooms = [];
  List<FlightPath> _paths = [];
  bool _loaded = false;

  HiveController(this._storage);

  List<Bloom> get blooms => List.unmodifiable(_blooms);
  List<FlightPath> get paths => List.unmodifiable(_paths);
  bool get loaded => _loaded;

  Bloom? bloomById(String id) {
    for (final b in _blooms) {
      if (b.id == id) return b;
    }
    return null;
  }

  List<FlightPath> pathsFor(String bloomId) =>
      _paths.where((p) => p.fromId == bloomId || p.toId == bloomId).toList();

  /// Load persisted data, seeding demo content on first run.
  Future<void> load() async {
    _blooms = await _storage.loadBlooms();
    _paths = await _storage.loadPaths();
    if (_blooms.isEmpty) {
      _seedDemo();
      await persist();
    }
    _loaded = true;
    notifyListeners();
  }

  Future<void> persist() async {
    await _storage.saveBlooms(_blooms);
    await _storage.savePaths(_paths);
  }

  Bloom addBloom({
    required String title,
    String body = '',
    List<String> tags = const [],
    int nectar = 3,
  }) {
    final now = DateTime.now();
    final bloom = Bloom(
      id: _uuid.v4(),
      title: title,
      body: body,
      tags: tags,
      nectar: nectar,
      createdAt: now,
      updatedAt: now,
      x: 0.2 + Random().nextDouble() * 0.6,
      y: 0.2 + Random().nextDouble() * 0.6,
      size: 0.7 + Random().nextDouble() * 0.8,
    );
    _blooms.add(bloom);
    notifyListeners();
    persist();
    return bloom;
  }

  Future<void> updateBloom(Bloom updated) async {
    final idx = _blooms.indexWhere((b) => b.id == updated.id);
    if (idx == -1) return;
    _blooms[idx] = updated.copyWith(updatedAt: DateTime.now());
    notifyListeners();
    await persist();
  }

  Future<void> moveBloom(String id, double x, double y) async {
    final idx = _blooms.indexWhere((b) => b.id == id);
    if (idx == -1) return;
    _blooms[idx] = _blooms[idx].copyWith(
      x: x.clamp(0.0, 1.0),
      y: y.clamp(0.0, 1.0),
      updatedAt: DateTime.now(),
    );
    notifyListeners();
    await persist();
  }

  Future<void> deleteBloom(String id) async {
    _blooms.removeWhere((b) => b.id == id);
    _paths.removeWhere((p) => p.fromId == id || p.toId == id);
    notifyListeners();
    await persist();
  }

  FlightPath addPath({
    required String fromId,
    required String toId,
    String label = 'visits',
    double strength = 0.5,
  }) {
    // Avoid duplicates (either direction).
    final exists = _paths.any(
      (p) =>
          (p.fromId == fromId && p.toId == toId) ||
          (p.fromId == toId && p.toId == fromId),
    );
    if (exists) {
      throw StateError('A flight path already exists between these blooms.');
    }
    final path = FlightPath(
      id: _uuid.v4(),
      fromId: fromId,
      toId: toId,
      label: label,
      strength: strength,
      createdAt: DateTime.now(),
    );
    _paths.add(path);
    notifyListeners();
    persist();
    return path;
  }

  Future<void> updatePath(FlightPath updated) async {
    final idx = _paths.indexWhere((p) => p.id == updated.id);
    if (idx == -1) return;
    _paths[idx] = updated;
    notifyListeners();
    await persist();
  }

  Future<void> deletePath(String id) async {
    _paths.removeWhere((p) => p.id == id);
    notifyListeners();
    await persist();
  }

  // ---- Insights ----

  /// The most-connected bloom (the "queen bee" hub).
  Bloom? get queenHub {
    if (_blooms.isEmpty) return null;
    Bloom? best;
    var bestCount = -1;
    for (final b in _blooms) {
      final c = pathsFor(b.id).length;
      if (c > bestCount) {
        bestCount = c;
        best = b;
      }
    }
    return best;
  }

  /// Average nectar across all blooms (1..5).
  double get averageNectar {
    if (_blooms.isEmpty) return 0;
    return _blooms.map((b) => b.nectar).reduce((a, b) => a + b) / _blooms.length;
  }

  /// Most common tag.
  String? get dominantTag {
    final counts = <String, int>{};
    for (final b in _blooms) {
      for (final tag in b.tags) {
        counts[tag] = (counts[tag] ?? 0) + 1;
      }
    }
    String? best;
    var bestCount = 0;
    counts.forEach((tag, count) {
      if (count > bestCount) {
        bestCount = count;
        best = tag;
      }
    });
    return best;
  }

  /// Blooms with no flight paths — "unvisited blooms".
  List<Bloom> get unvisitedBlooms =>
      _blooms.where((b) => pathsFor(b.id).isEmpty).toList();

  /// Total "honey" = sum of path strengths.
  double get totalHoney =>
      _paths.fold(0.0, (sum, p) => sum + p.strength);

  void _seedDemo() {
    final now = DateTime.now();
    Bloom mk(String title, String body, List<String> tags, int nectar,
        double x, double y, double size) {
      return Bloom(
        id: _uuid.v4(),
        title: title,
        body: body,
        tags: tags,
        nectar: nectar,
        createdAt: now.subtract(Duration(days: Random().nextInt(30))),
        updatedAt: now,
        x: x,
        y: y,
        size: size,
      );
    }

    final b1 = mk(
        'Morning lavender patch',
        'The first stop of the day — dew on the petals and a quiet hum.',
        ['routine', 'calm'],
        4,
        0.3,
        0.25,
        1.1);
    final b2 = mk(
        'Idea: hive journaling',
        'What if we mapped our memories as a meadow? That became Hive.',
        ['idea', 'creation'],
        5,
        0.7,
        0.3,
        1.4);
    final b3 = mk(
        'Rainy clover field',
        'The smell of wet earth and the sound of drops on leaves.',
        ['nature', 'senses'],
        4,
        0.2,
        0.7,
        0.9);
    final b4 = mk(
        'Overthinking before sleep',
        'A loop of what-ifs that keeps me awake. Need to break the cycle.',
        ['anxiety', 'sleep'],
        1,
        0.75,
        0.75,
        1.0);
    final b5 = mk(
        'Sunflower with an old friend',
        'Three hours vanished. We picked up exactly where we left off.',
        ['friendship', 'joy'],
        5,
        0.5,
        0.5,
        1.2);

    _blooms = [b1, b2, b3, b4, b5];

    FlightPath mkPath(String a, String b, String label, double strength) =>
        FlightPath(
          id: _uuid.v4(),
          fromId: a,
          toId: b,
          label: label,
          strength: strength,
          createdAt: now,
        );

    _paths = [
      mkPath(b1.id, b3.id, 'reminds me of', 0.6),
      mkPath(b2.id, b1.id, 'born from', 0.8),
      mkPath(b4.id, b3.id, 'contrasts with', 0.5),
      mkPath(b5.id, b1.id, 'shares nectar', 0.7),
      mkPath(b5.id, b2.id, 'inspired', 0.9),
    ];
  }
}