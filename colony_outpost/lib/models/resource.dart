import 'package:flutter/material.dart';
import '../theme/colony_theme.dart';

enum ResourceType {
  energy,
  oxygen,
  water,
  food,
  alloys,
  science,
  credits,
}

class ColonyResource {
  final ResourceType type;
  double current;
  double maxCapacity;
  double ratePerSec;

  ColonyResource({
    required this.type,
    required this.current,
    required this.maxCapacity,
    this.ratePerSec = 0.0,
  });

  String get name {
    switch (type) {
      case ResourceType.energy:
        return 'Energy';
      case ResourceType.oxygen:
        return 'Oxygen';
      case ResourceType.water:
        return 'Water';
      case ResourceType.food:
        return 'Food';
      case ResourceType.alloys:
        return 'Nanite Alloys';
      case ResourceType.science:
        return 'Research';
      case ResourceType.credits:
        return 'Colony Scrip';
    }
  }

  String get unit {
    switch (type) {
      case ResourceType.energy:
        return 'MW';
      case ResourceType.oxygen:
        return 'O₂';
      case ResourceType.water:
        return 'kL';
      case ResourceType.food:
        return 't';
      case ResourceType.alloys:
        return 'kg';
      case ResourceType.science:
        return 'RP';
      case ResourceType.credits:
        return '₡';
    }
  }

  IconData get icon {
    switch (type) {
      case ResourceType.energy:
        return Icons.bolt;
      case ResourceType.oxygen:
        return Icons.air;
      case ResourceType.water:
        return Icons.water_drop;
      case ResourceType.food:
        return Icons.eco;
      case ResourceType.alloys:
        return Icons.square_foot_rounded;
      case ResourceType.science:
        return Icons.biotech;
      case ResourceType.credits:
        return Icons.toll;
    }
  }

  Color get color {
    switch (type) {
      case ResourceType.energy:
        return ColonyTheme.energyColor;
      case ResourceType.oxygen:
        return ColonyTheme.oxygenColor;
      case ResourceType.water:
        return ColonyTheme.waterColor;
      case ResourceType.food:
        return ColonyTheme.foodColor;
      case ResourceType.alloys:
        return ColonyTheme.alloyColor;
      case ResourceType.science:
        return ColonyTheme.scienceColor;
      case ResourceType.credits:
        return ColonyTheme.creditColor;
    }
  }

  double get ratio => maxCapacity > 0 ? (current / maxCapacity).clamp(0.0, 1.0) : 0.0;
}
