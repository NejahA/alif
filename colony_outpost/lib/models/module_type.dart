import 'package:flutter/material.dart';
import '../theme/colony_theme.dart';
import 'resource.dart';

enum ModuleId {
  commandHub,
  solarCollector,
  fusionReactor,
  atmosphereScrubber,
  vaporator,
  hydroBiodome,
  naniteFoundry,
  researchInstitute,
  habitatComplex,
  deflectorShield,
  spaceportBeacon,
}

class ModuleDef {
  final ModuleId id;
  final String name;
  final String category;
  final String description;
  final IconData icon;
  final Color accentColor;
  final Map<ResourceType, double> buildCost;
  final Map<ResourceType, double> baseProduction; // positive = produce, negative = consume
  final int maxLevel;
  final int housingCapacity;

  const ModuleDef({
    required this.id,
    required this.name,
    required this.category,
    required this.description,
    required this.icon,
    required this.accentColor,
    required this.buildCost,
    required this.baseProduction,
    this.maxLevel = 3,
    this.housingCapacity = 0,
  });

  static const List<ModuleDef> all = [
    ModuleDef(
      id: ModuleId.commandHub,
      name: 'Nexus Command Hub',
      category: 'Command',
      description: 'The tactical heart of Aethelgard Outpost. Provides central communications and colony storage.',
      icon: Icons.hub,
      accentColor: ColonyTheme.neonCyan,
      buildCost: {ResourceType.alloys: 100, ResourceType.credits: 200},
      baseProduction: {
        ResourceType.energy: 5.0,
        ResourceType.science: 0.5,
      },
      housingCapacity: 4,
      maxLevel: 5,
    ),
    ModuleDef(
      id: ModuleId.solarCollector,
      name: 'Photovoltaic Array',
      category: 'Power',
      description: 'Harnesses stellar radiation to supply clean megawatt energy. Less effective during planetary night.',
      icon: Icons.solar_power,
      accentColor: ColonyTheme.energyColor,
      buildCost: {ResourceType.alloys: 40, ResourceType.credits: 60},
      baseProduction: {
        ResourceType.energy: 16.0,
      },
    ),
    ModuleDef(
      id: ModuleId.fusionReactor,
      name: 'Magnetic Fusion Core',
      category: 'Power',
      description: 'High-yield tokamak reactor. Generates massive power output independent of weather or night cycles.',
      icon: Icons.cyclone,
      accentColor: ColonyTheme.plasmaPurple,
      buildCost: {ResourceType.alloys: 140, ResourceType.credits: 300},
      baseProduction: {
        ResourceType.energy: 45.0,
        ResourceType.water: -0.5,
      },
    ),
    ModuleDef(
      id: ModuleId.atmosphereScrubber,
      name: 'Atmospheric Processor',
      category: 'Life Support',
      description: 'Filters toxic sulfurous atmosphere, cracking trace oxides into breathable oxygen canisters.',
      icon: Icons.air,
      accentColor: ColonyTheme.oxygenColor,
      buildCost: {ResourceType.alloys: 50, ResourceType.credits: 80},
      baseProduction: {
        ResourceType.oxygen: 6.0,
        ResourceType.energy: -4.0,
      },
    ),
    ModuleDef(
      id: ModuleId.vaporator,
      name: 'Moisture Vaporator',
      category: 'Life Support',
      description: 'Condenses atmospheric dew and subterranean humidity into purified water reserves.',
      icon: Icons.water_drop,
      accentColor: ColonyTheme.waterColor,
      buildCost: {ResourceType.alloys: 45, ResourceType.credits: 70},
      baseProduction: {
        ResourceType.water: 4.5,
        ResourceType.energy: -3.0,
      },
    ),
    ModuleDef(
      id: ModuleId.hydroBiodome,
      name: 'Hydroponics Biodome',
      category: 'Biosphere',
      description: 'Genetically engineered micro-greens and protein paste tanks to sustain colonist nutrition.',
      icon: Icons.forest,
      accentColor: ColonyTheme.foodColor,
      buildCost: {ResourceType.alloys: 60, ResourceType.credits: 100},
      baseProduction: {
        ResourceType.food: 4.0,
        ResourceType.oxygen: 1.5,
        ResourceType.water: -2.0,
        ResourceType.energy: -3.5,
      },
    ),
    ModuleDef(
      id: ModuleId.naniteFoundry,
      name: 'Nanite Smelter & Rig',
      category: 'Industry',
      description: 'Refines planetary regolith into structural nanite alloys for expanding base sectors.',
      icon: Icons.precision_manufacturing,
      accentColor: ColonyTheme.alloyColor,
      buildCost: {ResourceType.alloys: 70, ResourceType.credits: 120},
      baseProduction: {
        ResourceType.alloys: 3.5,
        ResourceType.energy: -6.0,
      },
    ),
    ModuleDef(
      id: ModuleId.researchInstitute,
      name: 'Xenobiology Lab',
      category: 'Science',
      description: 'Analyzes alien flora, fossilized strata, and celestial anomalies to unlock advanced technology.',
      icon: Icons.biotech,
      accentColor: ColonyTheme.scienceColor,
      buildCost: {ResourceType.alloys: 80, ResourceType.credits: 150},
      baseProduction: {
        ResourceType.science: 3.0,
        ResourceType.energy: -4.5,
      },
    ),
    ModuleDef(
      id: ModuleId.habitatComplex,
      name: 'Cryo-Hab Pod',
      category: 'Colony',
      description: 'Pressurized living quarters with simulated circadian illumination to elevate colonist morale.',
      icon: Icons.apartment,
      accentColor: ColonyTheme.bioEmerald,
      buildCost: {ResourceType.alloys: 65, ResourceType.credits: 110},
      baseProduction: {
        ResourceType.energy: -2.5,
        ResourceType.water: -1.0,
        ResourceType.food: -1.0,
      },
      housingCapacity: 8,
    ),
    ModuleDef(
      id: ModuleId.deflectorShield,
      name: 'Ion Deflector Pylon',
      category: 'Defense',
      description: 'Projects a localized energy shield to protect adjacent sectors from dust storms and meteor showers.',
      icon: Icons.shield,
      accentColor: ColonyTheme.neonCyan,
      buildCost: {ResourceType.alloys: 90, ResourceType.credits: 180},
      baseProduction: {
        ResourceType.energy: -8.0,
      },
    ),
    ModuleDef(
      id: ModuleId.spaceportBeacon,
      name: 'Orbital Trade Beacon',
      category: 'Commerce',
      description: 'Transmits landing coordinates to merchant freighters and interstellar mining consortia.',
      icon: Icons.rocket_launch,
      accentColor: ColonyTheme.creditColor,
      buildCost: {ResourceType.alloys: 110, ResourceType.credits: 220},
      baseProduction: {
        ResourceType.credits: 6.0,
        ResourceType.energy: -5.0,
      },
    ),
  ];

  static ModuleDef byId(ModuleId id) {
    return all.firstWhere((element) => element.id == id);
  }
}

class InstalledModule {
  final ModuleDef def;
  int level;
  bool isOnline;
  double health; // 0.0 to 100.0

  InstalledModule({
    required this.def,
    this.level = 1,
    this.isOnline = true,
    this.health = 100.0,
  });

  Map<ResourceType, double> get upgradeCost {
    final Map<ResourceType, double> scaled = {};
    def.buildCost.forEach((type, cost) {
      scaled[type] = (cost * (level + 1) * 0.8).roundToDouble();
    });
    return scaled;
  }

  Map<ResourceType, double> get effectiveProduction {
    if (!isOnline || health <= 10.0) return {};
    final factor = (level * 1.0) * (health / 100.0);
    final Map<ResourceType, double> result = {};
    def.baseProduction.forEach((type, rate) {
      if (rate > 0) {
        result[type] = rate * factor;
      } else {
        // Consumptions scale more gently with levels
        result[type] = rate * (1.0 + (level - 1) * 0.4);
      }
    });
    return result;
  }
}
