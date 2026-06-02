import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';

// --- Chef Session State ---
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
}

class ChefSession {
  final String recipeName;
  final String chefName;
  final int currentStepIndex;
  final List<RecipeStep> steps;

  ChefSession({
    required this.recipeName,
    required this.chefName,
    required this.currentStepIndex,
    required this.steps,
  });

  RecipeStep get currentStep => steps[currentStepIndex];
  bool get isFirstStep => currentStepIndex == 0;
  bool get isLastStep => currentStepIndex == steps.length - 1;

  ChefSession copyWith({
    int? currentStepIndex,
  }) {
    return ChefSession(
      recipeName: recipeName,
      chefName: chefName,
      currentStepIndex: currentStepIndex ?? this.currentStepIndex,
      steps: steps,
    );
  }
}

class ChefSessionNotifier extends StateNotifier<ChefSession> {
  ChefSessionNotifier()
      : super(ChefSession(
          recipeName: "Wagyu Symphony with Espresso Reduction",
          chefName: "Chef V de Cuisine",
          currentStepIndex: 0,
          steps: [
            RecipeStep(
              label: "LE_SAISIR", 
              description: "Sear Wagyu for 120s at high precision.",
              station: BrigadeStation.saucier,
              chefNotes: "Ensure the copper sautoir is shimmering; listen for the frequency.",
              techniques: ["Saisir", "Maillard Reaction"],
              pairingSuggestion: "Vintage Bordeaux, 2015",
              wineInfo: WineMetadata(
                label: "Chateau Margaux",
                vintage: "2015",
                optimalTemp: "18°C",
                tastingNote: "Deep ruby with notes of blackcurrant, cedar, and violets.",
                decantProgress: 0.8,
              ),
              substitutions: {"Wagyu": "USDA Prime Ribeye", "Copper Sautoir": "Cast Iron Skillet"},
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
          ],
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
}

final chefSessionProvider = StateNotifierProvider<ChefSessionNotifier, ChefSession>((ref) {
  return ChefSessionNotifier();
});

// --- Ingredient Manifest & Prep ---
class Ingredient {
  final String id;
  final String name;
  final String qty;
  final bool isPrepped;

  Ingredient({
    required this.id,
    required this.name,
    required this.qty,
    this.isPrepped = false,
  });

  Ingredient copyWith({bool? isPrepped}) {
    return Ingredient(
      id: id,
      name: name,
      qty: qty,
      isPrepped: isPrepped ?? this.isPrepped,
    );
  }
}

class IngredientNotifier extends StateNotifier<List<Ingredient>> {
  IngredientNotifier()
      : super([
          Ingredient(id: '1', name: "A5 Wagyu Ribeye", qty: "400g"),
          Ingredient(id: '2', name: "Black Winter Truffle", qty: "10g"),
          Ingredient(id: '3', name: "Single-Origin Espresso", qty: "30ml"),
          Ingredient(id: '4', name: "Saffron Strands", qty: "1g"),
          Ingredient(id: '5', name: "Fresh Sage Leaves", qty: "4 pcs"),
          Ingredient(id: '6', name: "Beurre Noisette", qty: "50g"),
        ]);

  void togglePrep(String id) {
    state = [
      for (final ing in state)
        if (ing.id == id) ing.copyWith(isPrepped: !ing.isPrepped) else ing
    ];
  }

  double get prepProgress => state.where((ing) => ing.isPrepped).length / state.length;
}

final ingredientProvider = StateNotifierProvider<IngredientNotifier, List<Ingredient>>((ref) {
  return IngredientNotifier();
});

// --- The Flame Symphony (Hearth & Dynamics) ---
class HearthState {
  final double flameTemper; // 0.0 to 1.0 (simulated)
  final double perfectionApex;
  final String culinaryTool;

  HearthState({
    required this.flameTemper,
    required this.perfectionApex,
    required this.culinaryTool,
  });

  bool get isAtTemperature => (flameTemper - perfectionApex).abs() < 0.05;

  HearthState copyWith({double? flameTemper, double? perfectionApex, String? culinaryTool}) {
    return HearthState(
      flameTemper: flameTemper ?? this.flameTemper,
      perfectionApex: perfectionApex ?? this.perfectionApex,
      culinaryTool: culinaryTool ?? this.culinaryTool,
    );
  }
}

class HearthNotifier extends StateNotifier<HearthState> {
  Timer? _tempTimer;

  HearthNotifier() : super(HearthState(flameTemper: 0.2, perfectionApex: 0.85, culinaryTool: "COPPER_SAUTOIR_24")) {
    _startTempSimulation();
  }

  void _startTempSimulation() {
    _tempTimer = Timer.periodic(const Duration(milliseconds: 500), (timer) {
      if (state.flameTemper < state.perfectionApex) {
        state = state.copyWith(flameTemper: (state.flameTemper + 0.01).clamp(0.0, 1.0));
      } else if (state.flameTemper > state.perfectionApex) {
        state = state.copyWith(flameTemper: (state.flameTemper - 0.005).clamp(0.0, 1.0));
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

final hearthProvider = StateNotifierProvider<HearthNotifier, HearthState>((ref) {
  return HearthNotifier();
});

// --- Taste Telemetry ---
class TasteTelemetry {
  final double sweet;
  final double sour;
  final double salt;
  final double bitter;
  final double umami;
  final double spice;
  final double aroma; // NEW v5 axis

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
      case 'SWEET': state = state.copyWith(sweet: value); break;
      case 'SOUR': state = state.copyWith(sour: value); break;
      case 'SALT': state = state.copyWith(salt: value); break;
      case 'BITTER': state = state.copyWith(bitter: value); break;
      case 'UMAMI': state = state.copyWith(umami: value); break;
      case 'SPICE': state = state.copyWith(spice: value); break;
      case 'AROMA': state = state.copyWith(aroma: value); break;
    }
  }
}

final tasteTelemetryProvider = StateNotifierProvider<TasteTelemetryNotifier, TasteTelemetry>((ref) {
  return TasteTelemetryNotifier();
});

// --- Multi-Timer Symphony ---
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

  SymphonyTimerNotifier()
      : super([
          TimerModel(id: 'sear', label: 'WAGYU_SEAR', totalSeconds: 120, remainingSeconds: 120),
          TimerModel(id: 'rest', label: 'PROTEIN_REST', totalSeconds: 300, remainingSeconds: 300),
          TimerModel(id: 'reduction', label: 'ESPRESSO_REDUCE', totalSeconds: 480, remainingSeconds: 480),
        ]);

  void toggleTimer(String id) {
    state = [
      for (final timer in state)
        if (timer.id == id) timer.copyWith(isActive: !timer.isActive) else timer
    ];
    _manageTicker();
  }

  void _manageTicker() {
    final anyActive = state.any((t) => t.isActive && t.remainingSeconds > 0);
    if (anyActive && _ticker == null) {
      _ticker = Timer.periodic(const Duration(seconds: 1), (timer) {
        state = [
          for (final t in state)
            if (t.isActive && t.remainingSeconds > 0)
              t.copyWith(remainingSeconds: t.remainingSeconds - 1)
            else if (t.remainingSeconds == 0)
              t.copyWith(isActive: false)
            else
              t
        ];
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

final symphonyTimerProvider = StateNotifierProvider<SymphonyTimerNotifier, List<TimerModel>>((ref) {
  return SymphonyTimerNotifier();
});
