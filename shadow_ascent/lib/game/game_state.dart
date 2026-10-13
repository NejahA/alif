import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/ninja_skin.dart';
import '../models/katana_effect.dart';
import '../audio/sound_effects.dart';

enum GameMode { campaign, endless }

class GameStateNotifier extends ChangeNotifier {
  int coins = 250; // Initial starter coins for instant fun!
  int highScore = 0;
  int currentScore = 0;
  int floorLevel = 1;
  int maxFloorReached = 1;
  int comboStreak = 0;
  int enemiesKilled = 0;
  int stealthTakedowns = 0;

  GameMode selectedMode = GameMode.campaign;
  String equippedSkinId = 'shadow_shinobi';
  String equippedKatanaId = 'void_blade';
  List<String> unlockedSkinIds = ['shadow_shinobi'];
  List<String> unlockedKatanaIds = ['void_blade'];

  bool isMuted = false;
  bool isPaused = false;
  bool isGameOver = false;
  bool isVictory = false;

  final SoundSynth synth = SoundSynth();

  GameStateNotifier() {
    loadSavedData();
  }

  NinjaSkin get currentSkin {
    return NinjaSkin.allSkins.firstWhere(
      (s) => s.id == equippedSkinId,
      orElse: () => NinjaSkin.allSkins.first,
    );
  }

  KatanaEffect get currentKatana {
    return KatanaEffect.allEffects.firstWhere(
      (k) => k.id == equippedKatanaId,
      orElse: () => KatanaEffect.allEffects.first,
    );
  }

  Future<void> loadSavedData() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      coins = prefs.getInt('coins') ?? 250;
      highScore = prefs.getInt('highScore') ?? 0;
      maxFloorReached = prefs.getInt('maxFloorReached') ?? 1;
      equippedSkinId = prefs.getString('equippedSkin') ?? 'shadow_shinobi';
      equippedKatanaId = prefs.getString('equippedKatana') ?? 'void_blade';
      unlockedSkinIds = prefs.getStringList('unlockedSkins') ?? ['shadow_shinobi'];
      unlockedKatanaIds = prefs.getStringList('unlockedKatanas') ?? ['void_blade'];
      isMuted = prefs.getBool('isMuted') ?? false;
      synth.isMuted = isMuted;
      notifyListeners();
    } catch (e) {
      debugPrint('Error loading saved state: $e');
    }
  }

  Future<void> saveData() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setInt('coins', coins);
      await prefs.setInt('highScore', highScore);
      await prefs.setInt('maxFloorReached', maxFloorReached);
      await prefs.setString('equippedSkin', equippedSkinId);
      await prefs.setString('equippedKatana', equippedKatanaId);
      await prefs.setStringList('unlockedSkins', unlockedSkinIds);
      await prefs.setStringList('unlockedKatanas', unlockedKatanaIds);
      await prefs.setBool('isMuted', isMuted);
    } catch (e) {
      debugPrint('Error saving state: $e');
    }
  }

  void toggleAudio() {
    isMuted = !isMuted;
    synth.isMuted = isMuted;
    notifyListeners();
    saveData();
  }

  void addCoins(int amount) {
    coins += amount;
    notifyListeners();
    saveData();
  }

  bool buySkin(NinjaSkin skin) {
    if (coins >= skin.cost && !unlockedSkinIds.contains(skin.id)) {
      coins -= skin.cost;
      unlockedSkinIds.add(skin.id);
      equippedSkinId = skin.id;
      synth.playCoin();
      notifyListeners();
      saveData();
      return true;
    }
    return false;
  }

  bool buyKatana(KatanaEffect katana) {
    if (coins >= katana.cost && !unlockedKatanaIds.contains(katana.id)) {
      coins -= katana.cost;
      unlockedKatanaIds.add(katana.id);
      equippedKatanaId = katana.id;
      synth.playCoin();
      notifyListeners();
      saveData();
      return true;
    }
    return false;
  }

  void equipSkin(String id) {
    if (unlockedSkinIds.contains(id)) {
      equippedSkinId = id;
      notifyListeners();
      saveData();
    }
  }

  void equipKatana(String id) {
    if (unlockedKatanaIds.contains(id)) {
      equippedKatanaId = id;
      notifyListeners();
      saveData();
    }
  }

  void startNewGame(GameMode mode) {
    selectedMode = mode;
    currentScore = 0;
    floorLevel = 1;
    comboStreak = 0;
    enemiesKilled = 0;
    stealthTakedowns = 0;
    isGameOver = false;
    isVictory = false;
    isPaused = false;
    notifyListeners();
  }

  void addScore(int points) {
    currentScore += points;
    if (currentScore > highScore) {
      highScore = currentScore;
    }
    notifyListeners();
  }

  void incrementCombo() {
    comboStreak++;
    addScore(10 * comboStreak);
    notifyListeners();
  }

  void resetCombo() {
    comboStreak = 0;
    notifyListeners();
  }

  void triggerGameOver({bool victory = false}) {
    isGameOver = true;
    isVictory = victory;
    if (currentScore > highScore) {
      highScore = currentScore;
    }
    if (floorLevel > maxFloorReached) {
      maxFloorReached = floorLevel;
    }
    saveData();
    notifyListeners();
  }
}
