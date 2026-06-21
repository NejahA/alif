import 'package:shared_preferences/shared_preferences.dart';

class SharedPrefsService {
  static SharedPrefsService? _instance;
  static SharedPreferences? _prefs;

  SharedPrefsService._internal();

  factory SharedPrefsService() {
    _instance ??= SharedPrefsService._internal();
    return _instance!;
  }

  Future<SharedPreferences> get prefs async {
    _prefs ??= await SharedPreferences.getInstance();
    return _prefs!;
  }

  // Dark Mode
  Future<bool> getDarkMode() async {
    final p = await prefs;
    return p.getBool('darkMode') ?? false;
  }

  Future<void> setDarkMode(bool value) async {
    final p = await prefs;
    await p.setBool('darkMode', value);
  }

  // Shuffle toggle
  Future<bool> getShuffleEnabled() async {
    final p = await prefs;
    return p.getBool('shuffleEnabled') ?? true;
  }

  Future<void> setShuffleEnabled(bool value) async {
    final p = await prefs;
    await p.setBool('shuffleEnabled', value);
  }

  // Current deck ID
  Future<String?> getCurrentDeckId() async {
    final p = await prefs;
    return p.getString('currentDeckId');
  }

  Future<void> setCurrentDeckId(String? value) async {
    final p = await prefs;
    if (value != null) {
      await p.setString('currentDeckId', value);
    } else {
      await p.remove('currentDeckId');
    }
  }
}