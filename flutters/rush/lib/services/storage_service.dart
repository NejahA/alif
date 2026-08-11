import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/bloom.dart';
import '../models/flight_path.dart';

/// Persists the meadow (blooms + flight paths) locally via shared_preferences.
class StorageService {
  static const _bloomsKey = 'hive.blooms';
  static const _pathsKey = 'hive.paths';

  Future<List<Bloom>> loadBlooms() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_bloomsKey);
    if (raw == null) return [];
    final list = jsonDecode(raw) as List<dynamic>;
    return list
        .map((e) => Bloom.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<void> saveBlooms(List<Bloom> blooms) async {
    final prefs = await SharedPreferences.getInstance();
    final raw = jsonEncode(blooms.map((t) => t.toJson()).toList());
    await prefs.setString(_bloomsKey, raw);
  }

  Future<List<FlightPath>> loadPaths() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_pathsKey);
    if (raw == null) return [];
    final list = jsonDecode(raw) as List<dynamic>;
    return list.map((e) => FlightPath.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<void> savePaths(List<FlightPath> paths) async {
    final prefs = await SharedPreferences.getInstance();
    final raw = jsonEncode(paths.map((t) => t.toJson()).toList());
    await prefs.setString(_pathsKey, raw);
  }
}
