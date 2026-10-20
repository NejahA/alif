import 'package:flutter/material.dart';

class TechNode {
  final String id;
  final String title;
  final String category;
  final String description;
  final double researchCost;
  final IconData icon;
  final List<String> prerequisites;
  bool isUnlocked;
  double currentResearchProgress; // 0.0 to researchCost

  TechNode({
    required this.id,
    required this.title,
    required this.category,
    required this.description,
    required this.researchCost,
    required this.icon,
    this.prerequisites = const [],
    this.isUnlocked = false,
    this.currentResearchProgress = 0.0,
  });

  bool get isCompleted => isUnlocked || currentResearchProgress >= researchCost;
  double get progressRatio => (currentResearchProgress / researchCost).clamp(0.0, 1.0);

  static List<TechNode> initialTree() {
    return [
      TechNode(
        id: 'superconductors',
        title: 'Superconducting Grid',
        category: 'Energy',
        description: 'Increases outpost battery storage by +300 MW and decreases energy line resistance by 15%.',
        researchCost: 50.0,
        icon: Icons.battery_charging_full,
      ),
      TechNode(
        id: 'aeroponics',
        title: 'Aeroponic Cultivation',
        category: 'Biosphere',
        description: 'Mists nutrient vapor directly onto roots. Increases Food production by 25% and reduces Water consumption.',
        researchCost: 75.0,
        icon: Icons.grass,
        prerequisites: ['superconductors'],
      ),
      TechNode(
        id: 'gasSeparation',
        title: 'Cryogenic Gas Cracking',
        category: 'Life Support',
        description: 'Extracts atmospheric nitrogen & oxygen at higher purity, increasing Oxygen output by 35%.',
        researchCost: 80.0,
        icon: Icons.air,
        prerequisites: ['superconductors'],
      ),
      TechNode(
        id: 'molecularFoundry',
        title: 'Molecular Nanite Printing',
        category: 'Engineering',
        description: 'Reduces module construction and upgrade Nanite Alloy costs across all sectors by 20%.',
        researchCost: 120.0,
        icon: Icons.precision_manufacturing,
        prerequisites: ['aeroponics'],
      ),
      TechNode(
        id: 'orbitalRelay',
        title: 'Interstellar Trade Relay',
        category: 'Commerce',
        description: 'Transmits quantum beacons to distant merchant freighters. +25% trade profit and cheaper specialists.',
        researchCost: 150.0,
        icon: Icons.satellite_alt,
        prerequisites: ['gasSeparation'],
      ),
      TechNode(
        id: 'ionCanopy',
        title: 'Planetary Ion Canopy',
        category: 'Defense',
        description: 'Projects planetary deflector umbrella, mitigating 70% of structural damage from cosmic storms and meteorites.',
        researchCost: 200.0,
        icon: Icons.shield,
        prerequisites: ['molecularFoundry'],
      ),
      TechNode(
        id: 'terraformingGenesis',
        title: 'Genesis Terraforming Beacon',
        category: 'Pinnacle',
        description: 'The ultimate milestone: begins atmospheric transmutation, permanently stabilizing Aethelgard Prime for permanent civilization.',
        researchCost: 400.0,
        icon: Icons.public,
        prerequisites: ['orbitalRelay', 'ionCanopy'],
      ),
    ];
  }
}
