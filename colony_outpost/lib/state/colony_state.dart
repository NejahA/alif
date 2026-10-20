import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import '../models/resource.dart';
import '../models/module_type.dart';
import '../models/colony_sector.dart';
import '../models/tech_node.dart';
import '../models/crisis_event.dart';
import '../models/colony_log.dart';

class ColonyState extends ChangeNotifier {
  // Sol and Time Management
  int sol = 1;
  double solProgress = 0.15; // 0.0 to 1.0 (0.7-1.0 is planetary night)
  double gameSpeed = 1.0; // 0.0, 1.0, 2.0, 5.0
  Timer? _tickTimer;
  final Random _random = Random();

  // Colony Vitals
  int population = 12;
  double morale = 85.0; // 0 to 100%
  int engineers = 4;
  int scientists = 3;
  int botanists = 3;
  int medics = 2;

  // Policies / Directives
  bool powerOverdrive = false;
  bool foodRationing = false;
  bool researchFocus = false;
  bool defenseProtocol = false;

  // Trading Ship
  bool merchantFrigateDocked = true;
  double frigateDepartureCountdown = 120.0; // seconds

  // Active Crisis
  CrisisEvent? activeCrisis;
  double _timeUntilNextCrisis = 45.0;

  // Resources
  late final Map<ResourceType, ColonyResource> resources;

  // Sectors Grid (4x4 = 16 sectors)
  late final List<ColonySector> sectors;

  // Tech Tree
  late final List<TechNode> techTree;
  String? activeResearchId;

  // Event Log Feed
  final List<ColonyLogEntry> logs = [];

  ColonyState() {
    _initResources();
    _initSectors();
    _initTechTree();
    _initStartingLogs();
    _startSimulationLoop();
  }

  bool get isNight => solProgress >= 0.7;

  int get maxHousing {
    int cap = 0;
    for (var s in sectors) {
      if (s.module != null && s.module!.isOnline) {
        cap += s.module!.def.housingCapacity * s.module!.level;
      }
    }
    return max(cap, 4);
  }

  void _initResources() {
    resources = {
      ResourceType.energy: ColonyResource(
        type: ResourceType.energy,
        current: 120.0,
        maxCapacity: 300.0,
      ),
      ResourceType.oxygen: ColonyResource(
        type: ResourceType.oxygen,
        current: 95.0,
        maxCapacity: 200.0,
      ),
      ResourceType.water: ColonyResource(
        type: ResourceType.water,
        current: 85.0,
        maxCapacity: 200.0,
      ),
      ResourceType.food: ColonyResource(
        type: ResourceType.food,
        current: 75.0,
        maxCapacity: 200.0,
      ),
      ResourceType.alloys: ColonyResource(
        type: ResourceType.alloys,
        current: 110.0,
        maxCapacity: 250.0,
      ),
      ResourceType.science: ColonyResource(
        type: ResourceType.science,
        current: 20.0,
        maxCapacity: 400.0,
      ),
      ResourceType.credits: ColonyResource(
        type: ResourceType.credits,
        current: 350.0,
        maxCapacity: 2000.0,
      ),
    };
  }

  void _initSectors() {
    sectors = [];
    int index = 0;
    for (int y = 0; y < 4; y++) {
      for (int x = 0; x < 4; x++) {
        SectorTerrain terrain = SectorTerrain.barrenRegolith;
        if (x == 2 && y == 0) terrain = SectorTerrain.geothermalVent;
        if (x == 0 && y == 2) terrain = SectorTerrain.subterraneanAquifer;
        if (x == 3 && y == 1) terrain = SectorTerrain.crystallineDeposit;
        if (x == 2 && y == 3) terrain = SectorTerrain.radioactiveOutcrop;
        if (x == 3 && y == 3) terrain = SectorTerrain.fertileBiocrust;

        final sector = ColonySector(
          id: index,
          x: x,
          y: y,
          terrain: terrain,
          isSurveyed: (x <= 1 && y <= 1),
        );

        // Pre-place starting modules
        if (x == 1 && y == 1) {
          sector.module = InstalledModule(
            def: ModuleDef.byId(ModuleId.commandHub),
            level: 1,
          );
        } else if (x == 0 && y == 1) {
          sector.module = InstalledModule(
            def: ModuleDef.byId(ModuleId.solarCollector),
            level: 1,
          );
        } else if (x == 1 && y == 0) {
          sector.module = InstalledModule(
            def: ModuleDef.byId(ModuleId.vaporator),
            level: 1,
          );
        }

        sectors.add(sector);
        index++;
      }
    }
  }

  void _initTechTree() {
    techTree = TechNode.initialTree();
    activeResearchId = 'superconductors';
  }

  void _initStartingLogs() {
    addLog(
      title: 'OUTPOST ONLINE',
      message: 'Aethelgard Prime Outpost established. Nexus Hub operational.',
      severity: LogSeverity.success,
      icon: Icons.flag,
    );
    addLog(
      title: 'SOLAR CYCLE COMMENCED',
      message: 'Telemetry stable. Atmospheric pressure 0.82 bar.',
      severity: LogSeverity.info,
      icon: Icons.wb_sunny,
    );
  }

  void _startSimulationLoop() {
    _tickTimer?.cancel();
    _tickTimer = Timer.periodic(const Duration(milliseconds: 500), (timer) {
      if (gameSpeed > 0) {
        _tick(0.5 * gameSpeed);
      }
    });
  }

  void setGameSpeed(double speed) {
    gameSpeed = speed;
    notifyListeners();
  }

  void addLog({
    required String title,
    required String message,
    required LogSeverity severity,
    IconData icon = Icons.info_outline,
  }) {
    final solTime = 'Sol $sol, ${(solProgress * 24).toInt().toString().padLeft(2, '0')}:00';
    logs.insert(
      0,
      ColonyLogEntry(
        id: DateTime.now().microsecondsSinceEpoch.toString(),
        solTimestamp: solTime,
        title: title,
        message: message,
        severity: severity,
        icon: icon,
      ),
    );
    if (logs.length > 50) {
      logs.removeLast();
    }
    notifyListeners();
  }

  bool isTechUnlocked(String id) {
    final node = techTree.firstWhere((t) => t.id == id, orElse: () => techTree.first);
    return node.isUnlocked;
  }

  void _tick(double deltaSeconds) {
    // 1. Advance Sol clock
    // 1 Full Sol takes 90 real seconds at 1x speed
    solProgress += (deltaSeconds / 90.0);
    if (solProgress >= 1.0) {
      solProgress = 0.0;
      sol++;
      _onNewSol();
    }

    // 2. Calculate net resource deltas
    final Map<ResourceType, double> deltas = {
      for (var t in ResourceType.values) t: 0.0,
    };

    // Human consumption
    // Colonists consume Food & Water & Oxygen
    final double foodRationMultiplier = foodRationing ? 0.6 : 1.0;
    deltas[ResourceType.food] = deltas[ResourceType.food]! - (population * 0.12 * foodRationMultiplier);
    deltas[ResourceType.water] = deltas[ResourceType.water]! - (population * 0.15);
    deltas[ResourceType.oxygen] = deltas[ResourceType.oxygen]! - (population * 0.18);

    // Tech tree modifiers
    final bool hasSuperconductors = isTechUnlocked('superconductors');
    final bool hasAeroponics = isTechUnlocked('aeroponics');
    final bool hasGasCracking = isTechUnlocked('gasSeparation');

    // Modules production
    for (var sector in sectors) {
      final module = sector.module;
      if (module == null || !module.isOnline) continue;

      final eff = module.effectiveProduction;
      eff.forEach((type, rate) {
        double adjustedRate = rate;

        // Night solar penalty
        if (module.def.id == ModuleId.solarCollector && type == ResourceType.energy) {
          if (isNight) adjustedRate *= 0.15; // 85% reduction at night
        }

        // Terrain bonus
        final terrainMult = sector.getBonusMultiplier(type);
        adjustedRate *= terrainMult;

        // Tech bonuses
        if (type == ResourceType.food && hasAeroponics) adjustedRate *= 1.25;
        if (type == ResourceType.oxygen && hasGasCracking) adjustedRate *= 1.35;
        if (type == ResourceType.science && researchFocus) adjustedRate *= 1.5;

        // Directive overdrive
        if (powerOverdrive && type == ResourceType.energy && adjustedRate > 0) {
          adjustedRate *= 1.3;
        }

        deltas[type] = (deltas[type] ?? 0.0) + adjustedRate;
      });
    }

    // Directive costs
    if (defenseProtocol) {
      deltas[ResourceType.energy] = deltas[ResourceType.energy]! - 12.0;
    }
    if (researchFocus) {
      deltas[ResourceType.energy] = deltas[ResourceType.energy]! - 8.0;
    }

    // Botanist / Specialist bonuses
    deltas[ResourceType.food] = deltas[ResourceType.food]! + (botanists * 0.35);
    deltas[ResourceType.alloys] = deltas[ResourceType.alloys]! + (engineers * 0.3);
    deltas[ResourceType.science] = deltas[ResourceType.science]! + (scientists * 0.4);

    // Apply storage updates & clamp
    deltas.forEach((type, rate) {
      final res = resources[type]!;
      res.ratePerSec = rate;

      // Adjust max capacity dynamically
      double capacity = res.type == ResourceType.energy && hasSuperconductors ? 600.0 : 300.0;
      if (res.type == ResourceType.credits) capacity = 5000.0;
      res.maxCapacity = capacity;

      res.current = (res.current + (rate * deltaSeconds)).clamp(0.0, res.maxCapacity);
    });

    // 3. Life Support Distress & Morale calculation
    if (resources[ResourceType.oxygen]!.current <= 0.0) {
      morale = max(0.0, morale - 1.5 * deltaSeconds);
      if (_random.nextDouble() < 0.05 && population > 3) {
        population--;
        addLog(
          title: 'CASUALTY REPORT',
          message: 'Colonist succumbed to acute hypoxia. Restore oxygen immediately!',
          severity: LogSeverity.danger,
          icon: Icons.heart_broken,
        );
      }
    } else if (resources[ResourceType.food]!.current <= 0.0 || resources[ResourceType.water]!.current <= 0.0) {
      morale = max(0.0, morale - 0.8 * deltaSeconds);
    } else {
      // Natural morale recovery
      if (morale < 80.0) {
        morale = min(100.0, morale + 0.2 * deltaSeconds);
      }
    }

    if (foodRationing) {
      morale = max(20.0, morale - 0.2 * deltaSeconds);
    }

    // 4. Tech tree research advancement
    if (activeResearchId != null && deltas[ResourceType.science]! > 0) {
      final currentTech = techTree.firstWhere((t) => t.id == activeResearchId);
      if (!currentTech.isCompleted) {
        currentTech.currentResearchProgress += (deltas[ResourceType.science]! * 0.6 * deltaSeconds);
        if (currentTech.currentResearchProgress >= currentTech.researchCost) {
          currentTech.isUnlocked = true;
          addLog(
            title: 'RESEARCH COMPLETE',
            message: 'Breakthrough achieved: ${currentTech.title} is now active.',
            severity: LogSeverity.success,
            icon: Icons.school,
          );
        }
      }
    }

    // 5. Merchant Frigate Cycle
    frigateDepartureCountdown -= deltaSeconds;
    if (frigateDepartureCountdown <= 0) {
      merchantFrigateDocked = !merchantFrigateDocked;
      frigateDepartureCountdown = merchantFrigateDocked ? 120.0 : 60.0;
      addLog(
        title: merchantFrigateDocked ? 'ORBITAL SHIP DOCKED' : 'MERCHANT FREIGHTER DEPARTED',
        message: merchantFrigateDocked
            ? 'Freighter "Orion Horizon" has entered docking orbit. Trading is now open.'
            : 'Freighter has engaged warp drive. Next trading vessel arriving soon.',
        severity: LogSeverity.info,
        icon: Icons.flight_takeoff,
      );
    }

    // 6. Crisis Timer
    if (activeCrisis == null) {
      _timeUntilNextCrisis -= deltaSeconds;
      if (_timeUntilNextCrisis <= 0) {
        _triggerRandomCrisis();
        _timeUntilNextCrisis = 80.0 + _random.nextInt(60);
      }
    }

    notifyListeners();
  }

  void _onNewSol() {
    addLog(
      title: 'SOL $sol BEGINS',
      message: 'Planetary dawn over Aethelgard crater. Outpost status normal.',
      severity: LogSeverity.info,
      icon: Icons.wb_twilight,
    );

    // Natural population migration if morale is high and housing available
    if (morale > 70 && population < maxHousing && _random.nextDouble() < 0.45) {
      population++;
      addLog(
        title: 'NEW COLONIST ARRIVAL',
        message: 'A transport shuttle has delivered an eager settler to the habitat.',
        severity: LogSeverity.success,
        icon: Icons.person_add,
      );
    }
  }

  void _triggerRandomCrisis() {
    final pool = CrisisEvent.pool;
    activeCrisis = pool[_random.nextInt(pool.length)];
    addLog(
      title: 'ALERT: ${activeCrisis!.title}',
      message: activeCrisis!.subtitle,
      severity: LogSeverity.danger,
      icon: Icons.warning,
    );
    notifyListeners();
  }

  void resolveCrisis(CrisisChoice choice) {
    if (activeCrisis == null) return;

    // Deduct cost
    choice.cost.forEach((type, cost) {
      resources[type]!.current = max(0.0, resources[type]!.current - cost);
    });

    // Add reward
    choice.reward.forEach((type, reward) {
      resources[type]!.current = min(resources[type]!.maxCapacity, resources[type]!.current + reward);
    });

    // Morale
    morale = (morale + choice.moraleDelta).clamp(0.0, 100.0);

    // Colonists
    population = max(1, population + choice.colonistDelta);

    // Damage random modules
    if (choice.randomModuleDamagePercent > 0) {
      for (var s in sectors) {
        if (s.module != null && _random.nextDouble() < 0.5) {
          s.module!.health = max(10.0, s.module!.health - choice.randomModuleDamagePercent);
        }
      }
    }

    addLog(
      title: 'CRISIS RESOLVED: ${activeCrisis!.title}',
      message: choice.outcomeDescription,
      severity: LogSeverity.success,
      icon: Icons.check_circle_outline,
    );

    activeCrisis = null;
    notifyListeners();
  }

  // Sector Actions
  bool canAfford(Map<ResourceType, double> costs) {
    for (var entry in costs.entries) {
      if ((resources[entry.key]?.current ?? 0.0) < entry.value) {
        return false;
      }
    }
    return true;
  }

  void deductCost(Map<ResourceType, double> costs) {
    costs.forEach((type, cost) {
      resources[type]!.current = max(0.0, resources[type]!.current - cost);
    });
  }

  bool constructModule(int sectorId, ModuleDef def) {
    final sector = sectors.firstWhere((s) => s.id == sectorId);
    if (sector.module != null) return false;

    // Apply Nanite Assembly tech discount
    final bool hasNaniteTech = isTechUnlocked('molecularFoundry');
    final Map<ResourceType, double> costs = {};
    def.buildCost.forEach((type, cost) {
      costs[type] = (hasNaniteTech && type == ResourceType.alloys) ? (cost * 0.8) : cost;
    });

    if (!canAfford(costs)) return false;

    deductCost(costs);
    sector.module = InstalledModule(def: def, level: 1);
    addLog(
      title: 'MODULE CONSTRUCTED',
      message: '${def.name} successfully established in Sector ${sector.id + 1}.',
      severity: LogSeverity.success,
      icon: def.icon,
    );
    notifyListeners();
    return true;
  }

  bool upgradeModule(int sectorId) {
    final sector = sectors.firstWhere((s) => s.id == sectorId);
    final module = sector.module;
    if (module == null || module.level >= module.def.maxLevel) return false;

    final costs = module.upgradeCost;
    if (!canAfford(costs)) return false;

    deductCost(costs);
    module.level++;
    module.health = 100.0; // fully repaired upon upgrade
    addLog(
      title: 'MODULE UPGRADED',
      message: '${module.def.name} upgraded to Level ${module.level}. Output increased.',
      severity: LogSeverity.success,
      icon: Icons.upgrade,
    );
    notifyListeners();
    return true;
  }

  void repairModule(int sectorId) {
    final sector = sectors.firstWhere((s) => s.id == sectorId);
    final module = sector.module;
    if (module == null || module.health >= 100.0) return;

    const repairCostAlloys = 15.0;
    if (resources[ResourceType.alloys]!.current < repairCostAlloys) return;

    resources[ResourceType.alloys]!.current -= repairCostAlloys;
    module.health = 100.0;
    addLog(
      title: 'MODULE REPAIRED',
      message: '${module.def.name} restored to 100% structural integrity.',
      severity: LogSeverity.info,
      icon: Icons.build,
    );
    notifyListeners();
  }

  void toggleModulePower(int sectorId) {
    final sector = sectors.firstWhere((s) => s.id == sectorId);
    if (sector.module != null) {
      sector.module!.isOnline = !sector.module!.isOnline;
      notifyListeners();
    }
  }

  void demolishModule(int sectorId) {
    final sector = sectors.firstWhere((s) => s.id == sectorId);
    if (sector.module == null || sector.module!.def.id == ModuleId.commandHub) return;

    // Refund 40% of alloys
    final refund = (sector.module!.def.buildCost[ResourceType.alloys] ?? 50.0) * 0.4;
    resources[ResourceType.alloys]!.current = min(
      resources[ResourceType.alloys]!.maxCapacity,
      resources[ResourceType.alloys]!.current + refund,
    );

    final name = sector.module!.def.name;
    sector.module = null;
    addLog(
      title: 'MODULE DEMOLISHED',
      message: '$name dismantled. Recovered ${refund.toInt()} Nanite Alloys.',
      severity: LogSeverity.warning,
      icon: Icons.delete_outline,
    );
    notifyListeners();
  }

  void surveySector(int sectorId) {
    final sector = sectors.firstWhere((s) => s.id == sectorId);
    if (sector.isSurveyed) return;

    const surveyCostCredits = 30.0;
    if (resources[ResourceType.credits]!.current < surveyCostCredits) return;

    resources[ResourceType.credits]!.current -= surveyCostCredits;
    sector.isSurveyed = true;
    addLog(
      title: 'SECTOR SURVEYED',
      message: 'Sector ${sector.id + 1} analyzed: ${sector.terrainName} detected (${sector.terrainBonusDesc}).',
      severity: LogSeverity.info,
      icon: sector.terrainIcon,
    );
    notifyListeners();
  }

  void selectResearch(String techId) {
    activeResearchId = techId;
    notifyListeners();
  }

  // Trading
  bool tradeBuy(ResourceType type, double amount, double creditCost) {
    if (resources[ResourceType.credits]!.current < creditCost) return false;
    final res = resources[type]!;
    if (res.current + amount > res.maxCapacity) return false;

    resources[ResourceType.credits]!.current -= creditCost;
    res.current += amount;
    addLog(
      title: 'TRADE PURCHASE',
      message: 'Purchased ${amount.toInt()} ${res.name} for ${creditCost.toInt()} ₡.',
      severity: LogSeverity.info,
      icon: Icons.shopping_cart,
    );
    notifyListeners();
    return true;
  }

  bool tradeSell(ResourceType type, double amount, double creditEarned) {
    final res = resources[type]!;
    if (res.current < amount) return false;

    res.current -= amount;
    resources[ResourceType.credits]!.current = min(
      resources[ResourceType.credits]!.maxCapacity,
      resources[ResourceType.credits]!.current + creditEarned,
    );
    addLog(
      title: 'TRADE EXPORT',
      message: 'Exported ${amount.toInt()} ${res.name} to orbital frigate for ${creditEarned.toInt()} ₡.',
      severity: LogSeverity.success,
      icon: Icons.sell,
    );
    notifyListeners();
    return true;
  }

  bool recruitSpecialist(String role, double cost) {
    if (resources[ResourceType.credits]!.current < cost) return false;
    if (population >= maxHousing) return false;

    resources[ResourceType.credits]!.current -= cost;
    population++;
    if (role == 'Engineer') engineers++;
    if (role == 'Scientist') scientists++;
    if (role == 'Botanist') botanists++;
    if (role == 'Medic') medics++;

    addLog(
      title: 'SPECIALIST RECRUITED',
      message: 'Hired certified $role to join the colony workforce.',
      severity: LogSeverity.success,
      icon: Icons.badge,
    );
    notifyListeners();
    return true;
  }

  void toggleDirective(String key) {
    if (key == 'power') powerOverdrive = !powerOverdrive;
    if (key == 'food') foodRationing = !foodRationing;
    if (key == 'research') researchFocus = !researchFocus;
    if (key == 'defense') defenseProtocol = !defenseProtocol;
    notifyListeners();
  }

  @override
  void dispose() {
    _tickTimer?.cancel();
    super.dispose();
  }
}
