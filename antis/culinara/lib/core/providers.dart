import 'dart:async';
import 'dart:ui';
import 'package:flutter_riverpod/flutter_riverpod.dart';

// ════════════════════════════════════════════
// Chef Session State
// ════════════════════════════════════════════
enum BrigadeStation {
  gardeManger,
  saucier,
  entremetier,
  rotisseur,
  poissonnier,
  patissier,
  chefDeCuisine,
}

enum PhaseCategory {
  savoury,
  sweet,
}
class WineMetadata {
  final String label;
  final String vintage;
  final String optimalTemp;
  final String tastingNote;
  final double decantProgress;

  WineMetadata({
    required this.label,
    required this.vintage,
    required this.optimalTemp,
    required this.tastingNote,
    this.decantProgress = 0.5,
  });

  WineMetadata copyWith({double? decantProgress}) {
    return WineMetadata(
      label: label,
      vintage: vintage,
      optimalTemp: optimalTemp,
      tastingNote: tastingNote,
      decantProgress: decantProgress ?? this.decantProgress,
    );
  }
}

class RecipeStep {
  final String label;
  final String description;
  final String? chefNotes;
  final List<String> techniques;
  final String? pairingSuggestion;
  final WineMetadata? wineInfo;
  final BrigadeStation station;
  final PhaseCategory category;
  final Map<String, String> substitutions;
  final String nextPhase;

  RecipeStep({
    required this.label,
    required this.description,
    required this.station,
    this.category = PhaseCategory.savoury,
    this.chefNotes,
    this.techniques = const [],
    this.pairingSuggestion,
    this.wineInfo,
    this.substitutions = const {},
    this.nextPhase = "EXECUTE_NEXT_PHASE",
  });

  RecipeStep copyWith({WineMetadata? wineInfo}) {
    return RecipeStep(
      label: label,
      description: description,
      station: station,
      category: category,
      chefNotes: chefNotes,
      techniques: techniques,
      pairingSuggestion: pairingSuggestion,
      wineInfo: wineInfo ?? this.wineInfo,
      substitutions: substitutions,
      nextPhase: nextPhase,
    );
  }
}

class ChefSession {
  final String recipeName;
  final String chefName;
  final int currentStepIndex;
  final List<RecipeStep> steps;

  // Macros
  final int calories;
  final int protein;
  final int fat;
  final int carbs;

  // Executive Achievements
  final List<String> badges;

  ChefSession({
    required this.recipeName,
    required this.chefName,
    required this.currentStepIndex,
    required this.steps,
    this.calories = 850,
    this.protein = 65,
    this.fat = 58,
    this.carbs = 4,
    this.badges = const ["PRECISION"],
  });

  RecipeStep get currentStep => steps[currentStepIndex];
  bool get isFirstStep => currentStepIndex == 0;
  bool get isLastStep => currentStepIndex == steps.length - 1;

  Color get stationColor {
    final s = currentStep.station.name.toLowerCase();
    if (s.contains("saucier")) return const Color(0xFFE8A849); // Saffron
    if (s.contains("grill")) return const Color(0xFFC4704E); // Terracotta
    if (s.contains("garde")) return const Color(0xFF6B7D5E); // Olive
    if (s.contains("dessert")) return const Color(0xFF9B8EC0); // Lavender
    return const Color(0xFFFFF8F0); // Cream
  }

  String get chefTip {
    final tips = [
      "TASTE EVERYTHING. THEN TASTE IT AGAIN.",
      "Mise en place is the foundation of discipline.",
      "Respect the product, and it will respect you.",
      "Clean as you go—a clear station is a clear mind.",
      "Season in layers, not just at the end.",
    ];
    return tips[DateTime.now().second % tips.length];
  }

  ChefSession copyWith({
    String? recipeName,
    String? chefName,
    int? currentStepIndex,
    List<RecipeStep>? steps,
    int? calories,
    int? protein,
    int? fat,
    int? carbs,
    List<String>? badges,
  }) {
    return ChefSession(
      recipeName: recipeName ?? this.recipeName,
      chefName: chefName ?? this.chefName,
      currentStepIndex: currentStepIndex ?? this.currentStepIndex,
      steps: steps ?? this.steps,
      calories: calories ?? this.calories,
      protein: protein ?? this.protein,
      fat: fat ?? this.fat,
      carbs: carbs ?? this.carbs,
      badges: badges ?? this.badges,
    );
  }
}

class ChefSessionNotifier extends StateNotifier<ChefSession> {
  final Ref _ref;
  ChefSessionNotifier(this._ref)
      : super(ChefSession(
          recipeName: "Wagyu Symphony with Espresso Reduction",
          chefName: "Chef V de Cuisine",
          currentStepIndex: 0,
          steps: _defaultSteps,
          calories: 850,
          protein: 65,
          fat: 58,
          carbs: 4,
          badges: ["MICHELIN_PRECISION", "SAUCIER_LEAD"],
        ));

  void nextStep() {
    if (state.currentStepIndex < state.steps.length - 1) {
      state = state.copyWith(currentStepIndex: state.currentStepIndex + 1);
    }
  }

  void previousStep() {
    if (state.currentStepIndex > 0) {
      state = state.copyWith(currentStepIndex: state.currentStepIndex - 1);
    }
  }

  void loadRecipe(RecipeCard recipe) {
    state = ChefSession(
      recipeName: recipe.name,
      chefName: "Chef V de Cuisine",
      currentStepIndex: 0,
      steps: recipe.steps,
      calories: recipe.calories,
      protein: recipe.protein ?? 0,
      fat: recipe.fat ?? 0,
      carbs: recipe.carbs ?? 0,
    );
  }

  void boostDecanting() {
    final currentStep = state.currentStep;
    final wine = currentStep.wineInfo;
    if (wine != null && wine.decantProgress < 1.0) {
      final newWine = wine.copyWith(
        decantProgress: (wine.decantProgress + 0.1).clamp(0.0, 1.0),
      );
      final newSteps = [...state.steps];
      newSteps[state.currentStepIndex] =
          currentStep.copyWith(wineInfo: newWine);
      state = state.copyWith(steps: newSteps);

      if (newWine.decantProgress >= 1.0) {
        _ref.read(serviceBellProvider.notifier).addNotification(
            "WINE AERATED — READY FOR SERVICE!");
      }
    }
  }

  void completeService() {
    state = state.copyWith(currentStepIndex: state.steps.length);
    _ref.read(serviceBellProvider.notifier).addNotification("SERVICE COMPLETE — EXCELLENT WORK!");
  }
}

final chefSessionProvider =
    StateNotifierProvider<ChefSessionNotifier, ChefSession>((ref) {
  return ChefSessionNotifier(ref);
});

// ════════════════════════════════════════════
// Kitchen Settings (Units, Modes)
// ════════════════════════════════════════════
enum UnitSystem { metric, imperial }

class KitchenSettings {
  final UnitSystem unitSystem;
  final bool immersiveMode;

  KitchenSettings({
    this.unitSystem = UnitSystem.metric,
    this.immersiveMode = false,
  });

  KitchenSettings copyWith({UnitSystem? unitSystem, bool? immersiveMode}) {
    return KitchenSettings(
      unitSystem: unitSystem ?? this.unitSystem,
      immersiveMode: immersiveMode ?? this.immersiveMode,
    );
  }
}

class KitchenSettingsNotifier extends StateNotifier<KitchenSettings> {
  KitchenSettingsNotifier() : super(KitchenSettings());

  void toggleUnits() {
    state = state.copyWith(
      unitSystem: state.unitSystem == UnitSystem.metric
          ? UnitSystem.imperial
          : UnitSystem.metric,
    );
  }

  void toggleImmersive() {
    state = state.copyWith(immersiveMode: !state.immersiveMode);
  }
}

final kitchenSettingsProvider =
    StateNotifierProvider<KitchenSettingsNotifier, KitchenSettings>((ref) {
  return KitchenSettingsNotifier();
});

// ════════════════════════════════════════════
// Kitchen Clock (High Precision)
// ════════════════════════════════════════════
final clockProvider = StreamProvider<DateTime>((ref) {
  return Stream.periodic(const Duration(seconds: 1), (_) => DateTime.now());
});

// ════════════════════════════════════════════
// Pantry State
// ════════════════════════════════════════════
class PantryItem {
  final String name;
  final bool isStocked;

  PantryItem({required this.name, this.isStocked = false});
}

class PantryNotifier extends StateNotifier<Map<String, bool>> {
  PantryNotifier() : super({
    'Salt': true,
    'Pepper': true,
    'Olive Oil': true,
    'Butter': false,
    'Wagyu': false,
  });

  void toggleStock(String name) {
    state = {...state, name: !(state[name] ?? false)};
  }
}

final pantryProvider =
    StateNotifierProvider<PantryNotifier, Map<String, bool>>((ref) {
  return PantryNotifier();
});

// Default recipe steps
final List<RecipeStep> _defaultSteps = [
  RecipeStep(
    label: "LE_SAISIR",
    description: "Sear Wagyu for 120s at high precision.",
    station: BrigadeStation.saucier,
    chefNotes:
        "Ensure the copper sautoir is shimmering; listen for the frequency.",
    techniques: ["Saisir", "Maillard Reaction"],
    pairingSuggestion: "Vintage Bordeaux, 2015",
    wineInfo: WineMetadata(
      label: "Chateau Margaux",
      vintage: "2015",
      optimalTemp: "18°C",
      tastingNote:
          "Deep ruby with notes of blackcurrant, cedar, and violets.",
      decantProgress: 0.8,
    ),
    substitutions: {
      "Wagyu": "USDA Prime Ribeye",
      "Copper Sautoir": "Cast Iron Skillet"
    },
  ),
  RecipeStep(
    label: "DEGLACER",
    description: "Deglaze with Espresso reduction & aromatics.",
    station: BrigadeStation.saucier,
    chefNotes: "Keep the heat steady; avoiding burning the coffee tannins.",
    techniques: ["Deglacer", "Reduction"],
    pairingSuggestion: "Roasted Espresso Stout",
    substitutions: {"Espresso": "Strong Dark Roast Coffee"},
  ),
  RecipeStep(
    label: "LE_REPOS",
    description: "Rest protein for 300s under linen and parchment.",
    station: BrigadeStation.gardeManger,
    chefNotes: "The residual heat will carry the core to perfection.",
    techniques: ["Repos", "Resonance Management"],
    pairingSuggestion: "Resting Red Wine",
  ),
  RecipeStep(
    label: "SUCRE_FILÉ",
    description: "Prepare Saffron threads and spun sugar nests.",
    station: BrigadeStation.patissier,
    category: PhaseCategory.sweet,
    chefNotes: "Maintain 154°C precisely for the caramel fracture.",
    techniques: ["Caramelisation", "Sucre Filé"],
    pairingSuggestion: "Late Harvest Riesling",
    wineInfo: WineMetadata(
      label: "Joh. Jos. Prüm Riesling",
      vintage: "2018",
      optimalTemp: "8°C",
      tastingNote: "Luminous gold, apricots, and honeyed minerals.",
      decantProgress: 0.2,
    ),
    substitutions: {"Saffron": "Turmeric-infused sugar (for color)"},
  ),
  RecipeStep(
    label: "DRESSAGE",
    description: "Shave black truffle & plate with fresh sage.",
    station: BrigadeStation.chefDeCuisine,
    chefNotes: "Visual balance is as critical as flavor profiles.",
    techniques: ["Dressage", "Tuber Melanosporum Shaving"],
    pairingSuggestion: "White Wine Spritzer",
    substitutions: {"Black Truffle": "Porcini Dust (1:2 ratio)"},
  ),
];

// ════════════════════════════════════════════
// Ingredient Manifest & Prep
// ════════════════════════════════════════════
class Ingredient {
  final String id;
  final String name;
  final String qty;
  final bool isPrepped;
  final String category;

  Ingredient({
    required this.id,
    required this.name,
    required this.qty,
    this.isPrepped = false,
    this.category = 'General',
  });

  Ingredient copyWith({bool? isPrepped}) {
    return Ingredient(
      id: id,
      name: name,
      qty: qty,
      isPrepped: isPrepped ?? this.isPrepped,
      category: category,
    );
  }
}

class IngredientNotifier extends StateNotifier<List<Ingredient>> {
  IngredientNotifier()
      : super([
          Ingredient(id: '1', name: "A5 Wagyu Ribeye", qty: "400g", category: 'Proteins'),
          Ingredient(id: '2', name: "Black Winter Truffle", qty: "10g", category: 'Produce'),
          Ingredient(id: '3', name: "Single-Origin Espresso", qty: "30ml", category: 'Pantry'),
          Ingredient(id: '4', name: "Saffron Strands", qty: "1g", category: 'Spices'),
          Ingredient(id: '5', name: "Fresh Sage Leaves", qty: "4 pcs", category: 'Produce'),
          Ingredient(id: '6', name: "Beurre Noisette", qty: "50g", category: 'Dairy'),
        ]);

  void togglePrep(String id) {
    state = [
      for (final ing in state)
        if (ing.id == id)
          ing.copyWith(isPrepped: !ing.isPrepped)
        else
          ing
    ];
  }

  double get prepProgress =>
      state.where((ing) => ing.isPrepped).length / state.length;
}

final ingredientProvider =
    StateNotifierProvider<IngredientNotifier, List<Ingredient>>((ref) {
  return IngredientNotifier();
});

// ════════════════════════════════════════════
// The Flame Symphony (Hearth & Dynamics)
// ════════════════════════════════════════════
class HearthState {
  final double flameTemper;
  final double perfectionApex;
  final String culinaryTool;

  HearthState({
    required this.flameTemper,
    required this.perfectionApex,
    required this.culinaryTool,
  });

  bool get isAtTemperature => (flameTemper - perfectionApex).abs() < 0.05;

  HearthState copyWith(
      {double? flameTemper, double? perfectionApex, String? culinaryTool}) {
    return HearthState(
      flameTemper: flameTemper ?? this.flameTemper,
      perfectionApex: perfectionApex ?? this.perfectionApex,
      culinaryTool: culinaryTool ?? this.culinaryTool,
    );
  }
}

class HearthNotifier extends StateNotifier<HearthState> {
  Timer? _tempTimer;

  HearthNotifier()
      : super(HearthState(
            flameTemper: 0.2,
            perfectionApex: 0.85,
            culinaryTool: "COPPER_SAUTOIR_24")) {
    _startTempSimulation();
  }

  void _startTempSimulation() {
    _tempTimer = Timer.periodic(const Duration(milliseconds: 500), (timer) {
      if (state.flameTemper < state.perfectionApex) {
        state = state.copyWith(
            flameTemper: (state.flameTemper + 0.01).clamp(0.0, 1.0));
      } else if (state.flameTemper > state.perfectionApex) {
        state = state.copyWith(
            flameTemper: (state.flameTemper - 0.005).clamp(0.0, 1.0));
      }
    });
  }

  void updatePerfectionApex(double value) {
    state = state.copyWith(perfectionApex: value);
  }

  @override
  void dispose() {
    _tempTimer?.cancel();
    super.dispose();
  }
}

final hearthProvider =
    StateNotifierProvider<HearthNotifier, HearthState>((ref) {
  return HearthNotifier();
});

// ════════════════════════════════════════════
// Taste Telemetry
// ════════════════════════════════════════════
class TasteTelemetry {
  final double sweet;
  final double sour;
  final double salt;
  final double bitter;
  final double umami;
  final double spice;
  final double aroma;

  TasteTelemetry({
    this.sweet = 0.5,
    this.sour = 0.3,
    this.salt = 0.4,
    this.bitter = 0.1,
    this.umami = 0.8,
    this.spice = 0.6,
    this.aroma = 0.7,
  });

  TasteTelemetry copyWith({
    double? sweet,
    double? sour,
    double? salt,
    double? bitter,
    double? umami,
    double? spice,
    double? aroma,
  }) {
    return TasteTelemetry(
      sweet: sweet ?? this.sweet,
      sour: sour ?? this.sour,
      salt: salt ?? this.salt,
      bitter: bitter ?? this.bitter,
      umami: umami ?? this.umami,
      spice: spice ?? this.spice,
      aroma: aroma ?? this.aroma,
    );
  }
}

class TasteTelemetryNotifier extends StateNotifier<TasteTelemetry> {
  TasteTelemetryNotifier() : super(TasteTelemetry());

  void updateTaste(String type, double value) {
    switch (type) {
      case 'SWEET':
        state = state.copyWith(sweet: value);
        break;
      case 'SOUR':
        state = state.copyWith(sour: value);
        break;
      case 'SALT':
        state = state.copyWith(salt: value);
        break;
      case 'BITTER':
        state = state.copyWith(bitter: value);
        break;
      case 'UMAMI':
        state = state.copyWith(umami: value);
        break;
      case 'SPICE':
        state = state.copyWith(spice: value);
        break;
      case 'AROMA':
        state = state.copyWith(aroma: value);
        break;
    }
  }
}

final tasteTelemetryProvider =
    StateNotifierProvider<TasteTelemetryNotifier, TasteTelemetry>((ref) {
  return TasteTelemetryNotifier();
});

// ════════════════════════════════════════════
// Multi-Timer Symphony
// ════════════════════════════════════════════
class TimerModel {
  final String id;
  final String label;
  final int totalSeconds;
  final int remainingSeconds;
  final bool isActive;

  TimerModel({
    required this.id,
    required this.label,
    required this.totalSeconds,
    required this.remainingSeconds,
    this.isActive = false,
  });

  double get progress => remainingSeconds / totalSeconds;

  TimerModel copyWith({
    int? remainingSeconds,
    bool? isActive,
  }) {
    return TimerModel(
      id: id,
      label: label,
      totalSeconds: totalSeconds,
      remainingSeconds: remainingSeconds ?? this.remainingSeconds,
      isActive: isActive ?? this.isActive,
    );
  }
}

class SymphonyTimerNotifier extends StateNotifier<List<TimerModel>> {
  Timer? _ticker;
  final Ref _ref;

  SymphonyTimerNotifier(this._ref)
      : super([
          TimerModel(
              id: 'sear',
              label: 'WAGYU_SEAR',
              totalSeconds: 120,
              remainingSeconds: 120),
          TimerModel(
              id: 'rest',
              label: 'PROTEIN_REST',
              totalSeconds: 300,
              remainingSeconds: 300),
          TimerModel(
              id: 'reduction',
              label: 'ESPRESSO_REDUCE',
              totalSeconds: 480,
              remainingSeconds: 480),
        ]);

  void toggleTimer(String id) {
    state = [
      for (final timer in state)
        if (timer.id == id)
          timer.copyWith(isActive: !timer.isActive)
        else
          timer
    ];
    _manageTicker();
  }

  void _manageTicker() {
    final anyActive = state.any((t) => t.isActive && t.remainingSeconds > 0);
    if (anyActive && _ticker == null) {
      _ticker = Timer.periodic(const Duration(seconds: 1), (timer) {
        final newState = <TimerModel>[];
        for (final t in state) {
          if (t.isActive && t.remainingSeconds > 0) {
            final updated =
                t.copyWith(remainingSeconds: t.remainingSeconds - 1);
            if (updated.remainingSeconds == 0) {
              _ref
                  .read(serviceBellProvider.notifier)
                  .addNotification("${t.label} COMPLETE — SERVICE!");
              newState.add(updated.copyWith(isActive: false));
            } else {
              newState.add(updated);
            }
          } else if (t.remainingSeconds == 0) {
            newState.add(t.copyWith(isActive: false));
          } else {
            newState.add(t);
          }
        }
        state = newState;
        if (!state.any((t) => t.isActive)) {
          _ticker?.cancel();
          _ticker = null;
        }
      });
    } else if (!anyActive) {
      _ticker?.cancel();
      _ticker = null;
    }
  }

  @override
  void dispose() {
    _ticker?.cancel();
    super.dispose();
  }
}

final symphonyTimerProvider =
    StateNotifierProvider<SymphonyTimerNotifier, List<TimerModel>>((ref) {
  return SymphonyTimerNotifier(ref);
});

// ════════════════════════════════════════════
// Kitchen Notes
// ════════════════════════════════════════════
enum NoteCategory { technique, flavor, procedure, ingredient }

class KitchenNote {
  final String text;
  final NoteCategory category;
  final DateTime timestamp;

  KitchenNote({
    required this.text,
    this.category = NoteCategory.procedure,
    DateTime? timestamp,
  }) : timestamp = timestamp ?? DateTime.now();
}

class KitchenNotesNotifier extends StateNotifier<Map<int, KitchenNote>> {
  KitchenNotesNotifier() : super({});

  void updateNote(int stepIndex, String text, {NoteCategory? category}) {
    final existing = state[stepIndex];
    state = {
      ...state,
      stepIndex: KitchenNote(
        text: text,
        category: category ?? (existing?.category ?? NoteCategory.procedure),
      )
    };
  }

  void updateCategory(int stepIndex, NoteCategory category) {
    final existing = state[stepIndex];
    if (existing == null) return;
    state = {
      ...state,
      stepIndex: KitchenNote(
        text: existing.text,
        category: category,
        timestamp: existing.timestamp,
      )
    };
  }

  KitchenNote? getNote(int stepIndex) => state[stepIndex];
}

final kitchenNotesProvider =
    StateNotifierProvider<KitchenNotesNotifier, Map<int, KitchenNote>>((ref) {
  return KitchenNotesNotifier();
});

// ════════════════════════════════════════════
// Service Bell Notifications
// ════════════════════════════════════════════
class ServiceBellNotification {
  final String message;
  final DateTime timestamp;
  final bool isRead;

  ServiceBellNotification({
    required this.message,
    DateTime? timestamp,
    this.isRead = false,
  }) : timestamp = timestamp ?? DateTime.now();
}

class ServiceBellNotifier
    extends StateNotifier<List<ServiceBellNotification>> {
  ServiceBellNotifier() : super([]);

  void addNotification(String message) {
    state = [ServiceBellNotification(message: message), ...state];
  }

  void markAllRead() {
    state = [
      for (final n in state)
        ServiceBellNotification(
            message: n.message, timestamp: n.timestamp, isRead: true)
    ];
  }

  void clear() {
    state = [];
  }

  int get unreadCount => state.where((n) => !n.isRead).length;
}

final serviceBellProvider =
    StateNotifierProvider<ServiceBellNotifier, List<ServiceBellNotification>>(
        (ref) {
  return ServiceBellNotifier();
});

// ════════════════════════════════════════════
// Recipe Library & Cards
// ════════════════════════════════════════════
enum RecipeDifficulty { apprenti, commis, souschef, executive }

enum CuisineType { french, japanese, italian, fusion, patisserie }

class RecipeCard {
  final String id;
  final String name;
  final String subtitle;
  final RecipeDifficulty difficulty;
  final CuisineType cuisine;
  final int servings;
  final int prepMinutes;
  final List<Color> gradientColors;
  final List<RecipeStep> steps;
  final int calories;
  final int? protein;
  final int? fat;
  final int? carbs;

  RecipeCard({
    required this.id,
    required this.name,
    required this.subtitle,
    required this.difficulty,
    required this.cuisine,
    required this.servings,
    required this.prepMinutes,
    required this.gradientColors,
    required this.steps,
    this.calories = 0,
    this.protein,
    this.fat,
    this.carbs,
  });
}

// ════════════════════════════════════════════
// Favorites System
// ════════════════════════════════════════════
class FavoritesNotifier extends StateNotifier<Set<String>> {
  FavoritesNotifier() : super({});

  void toggleFavorite(String recipeId) {
    if (state.contains(recipeId)) {
      state = {...state}..remove(recipeId);
    } else {
      state = {...state, recipeId};
    }
  }

  bool isFavorite(String recipeId) => state.contains(recipeId);
}

final favoritesProvider =
    StateNotifierProvider<FavoritesNotifier, Set<String>>((ref) {
  return FavoritesNotifier();
});

// ════════════════════════════════════════════
// Navigation
// ════════════════════════════════════════════
class NavigationNotifier extends StateNotifier<int> {
  NavigationNotifier() : super(0);

  void setTab(int index) {
    state = index;
  }
}

final navigationProvider =
    StateNotifierProvider<NavigationNotifier, int>((ref) {
  return NavigationNotifier();
});

// ════════════════════════════════════════════
// Meal Planner
// ════════════════════════════════════════════
enum MealSlot { breakfast, lunch, dinner }

class MealAssignment {
  final String dayKey; // e.g. "mon", "tue"
  final MealSlot slot;
  final RecipeCard? recipe;

  MealAssignment({
    required this.dayKey,
    required this.slot,
    this.recipe,
  });

  MealAssignment copyWith({RecipeCard? recipe, bool clearRecipe = false}) {
    return MealAssignment(
      dayKey: dayKey,
      slot: slot,
      recipe: clearRecipe ? null : (recipe ?? this.recipe),
    );
  }

  String get key => '${dayKey}_${slot.name}';
}

class MealPlanNotifier extends StateNotifier<Map<String, MealAssignment>> {
  MealPlanNotifier() : super(_initPlan());

  static Map<String, MealAssignment> _initPlan() {
    final days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    final plan = <String, MealAssignment>{};
    for (final day in days) {
      for (final slot in MealSlot.values) {
        final a = MealAssignment(dayKey: day, slot: slot);
        plan[a.key] = a;
      }
    }
    return plan;
  }

  void assignRecipe(String dayKey, MealSlot slot, RecipeCard recipe) {
    final key = '${dayKey}_${slot.name}';
    state = {
      ...state,
      key: MealAssignment(dayKey: dayKey, slot: slot, recipe: recipe),
    };
  }

  void clearSlot(String dayKey, MealSlot slot) {
    final key = '${dayKey}_${slot.name}';
    state = {
      ...state,
      key: MealAssignment(dayKey: dayKey, slot: slot),
    };
  }

  List<RecipeCard> get assignedRecipes {
    return state.values
        .where((a) => a.recipe != null)
        .map((a) => a.recipe!)
        .toList();
  }
}

final mealPlanProvider =
    StateNotifierProvider<MealPlanNotifier, Map<String, MealAssignment>>((ref) {
  return MealPlanNotifier();
});

// ════════════════════════════════════════════
// Shopping List
// ════════════════════════════════════════════
class ShoppingItem {
  final String id;
  final String name;
  final String qty;
  final String category;
  final bool isChecked;
  final bool isCustom;

  ShoppingItem({
    required this.id,
    required this.name,
    required this.qty,
    required this.category,
    this.isChecked = false,
    this.isCustom = false,
  });

  ShoppingItem copyWith({bool? isChecked}) {
    return ShoppingItem(
      id: id,
      name: name,
      qty: qty,
      category: category,
      isChecked: isChecked ?? this.isChecked,
      isCustom: isCustom,
    );
  }
}

class ShoppingListNotifier extends StateNotifier<List<ShoppingItem>> {
  final Ref _ref;
  ShoppingListNotifier(this._ref) : super([]);

  void toggleCheck(String id) {
    state = [
      for (final item in state)
        if (item.id == id) item.copyWith(isChecked: !item.isChecked) else item
    ];
  }

  void addCustomItem(String name, String qty, String category) {
    state = [
      ...state,
      ShoppingItem(
        id: 'custom_${DateTime.now().millisecondsSinceEpoch}',
        name: name,
        qty: qty,
        category: category,
        isCustom: true,
      ),
    ];
  }

  void removeItem(String id) {
    state = state.where((item) => item.id != id).toList();
  }

  void generateFromMealPlan(List<RecipeCard> recipes) {
    final customItems = state.where((i) => i.isCustom).toList();
    final pantry = _ref.read(pantryProvider);
    final Set<String> products = {};
    final List<ShoppingItem> generated = [];
    int idx = 0;

    for (final recipe in recipes) {
      // Logic for Wagyu specifically as the hero demo
      if (recipe.name.contains("Wagyu")) {
        products.addAll(["Wagyu Ribeye", "Pink Salt", "Black Pepper", "Rosemary", "Garlic", "Butter"]);
      }
    }

    for (final name in products) {
      final isStocked = pantry[name] ?? false;
      generated.add(ShoppingItem(
        id: 'gen_${idx++}',
        name: name,
        qty: "As needed",
        category: _getCategory(name),
        isChecked: isStocked,
      ));
    }

    state = [...customItems, ...generated];
  }

  String _getCategory(String name) {
    if (["Wagyu Ribeye", "Bone-in Ribeye"].contains(name)) return "Proteins";
    if (["Rosemary", "Garlic", "Sage"].contains(name)) return "Produce";
    if (["Butter", "Milk", "Cream"].contains(name)) return "Dairy";
    if (["Pink Salt", "Black Pepper", "Fleur de Sel"].contains(name)) return "Spices";
    return "Pantry";
  }

  void clearAll() {
    state = [];
  }
}

final shoppingListProvider =
    StateNotifierProvider<ShoppingListNotifier, List<ShoppingItem>>((ref) {
  return ShoppingListNotifier(ref);
});
