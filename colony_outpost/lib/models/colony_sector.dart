import 'package:flutter/material.dart';
import '../theme/colony_theme.dart';
import 'module_type.dart';
import 'resource.dart';

enum SectorTerrain {
  barrenRegolith,
  geothermalVent,
  subterraneanAquifer,
  crystallineDeposit,
  fertileBiocrust,
  radioactiveOutcrop,
}

class ColonySector {
  final int id;
  final int x;
  final int y;
  final SectorTerrain terrain;
  bool isSurveyed;
  bool isCleared;
  InstalledModule? module;

  ColonySector({
    required this.id,
    required this.x,
    required this.y,
    required this.terrain,
    this.isSurveyed = false,
    this.isCleared = true,
    this.module,
  });

  String get terrainName {
    switch (terrain) {
      case SectorTerrain.barrenRegolith:
        return 'Barren Regolith';
      case SectorTerrain.geothermalVent:
        return 'Geothermal Fissure';
      case SectorTerrain.subterraneanAquifer:
        return 'Subterranean Aquifer';
      case SectorTerrain.crystallineDeposit:
        return 'Crystalline Outcrop';
      case SectorTerrain.fertileBiocrust:
        return 'Fertile Bio-Crust';
      case SectorTerrain.radioactiveOutcrop:
        return 'Radioactive Strata';
    }
  }

  String get terrainBonusDesc {
    switch (terrain) {
      case SectorTerrain.barrenRegolith:
        return 'Standard structural stability';
      case SectorTerrain.geothermalVent:
        return '+50% Power generation';
      case SectorTerrain.subterraneanAquifer:
        return '+50% Water condensation';
      case SectorTerrain.crystallineDeposit:
        return '+50% Nanite Alloy synthesis';
      case SectorTerrain.fertileBiocrust:
        return '+50% Food production';
      case SectorTerrain.radioactiveOutcrop:
        return '+100% Science research yield';
    }
  }

  IconData get terrainIcon {
    switch (terrain) {
      case SectorTerrain.barrenRegolith:
        return Icons.terrain;
      case SectorTerrain.geothermalVent:
        return Icons.local_fire_department;
      case SectorTerrain.subterraneanAquifer:
        return Icons.water;
      case SectorTerrain.crystallineDeposit:
        return Icons.diamond;
      case SectorTerrain.fertileBiocrust:
        return Icons.grass;
      case SectorTerrain.radioactiveOutcrop:
        return Icons.warning_amber;
    }
  }

  Color get terrainColor {
    switch (terrain) {
      case SectorTerrain.barrenRegolith:
        return const Color(0xFF64748B);
      case SectorTerrain.geothermalVent:
        return const Color(0xFFFF5722);
      case SectorTerrain.subterraneanAquifer:
        return ColonyTheme.waterColor;
      case SectorTerrain.crystallineDeposit:
        return const Color(0xFF00E5FF);
      case SectorTerrain.fertileBiocrust:
        return ColonyTheme.bioEmerald;
      case SectorTerrain.radioactiveOutcrop:
        return const Color(0xFFFFEB3B);
    }
  }

  double getBonusMultiplier(ResourceType type) {
    if (terrain == SectorTerrain.geothermalVent && type == ResourceType.energy) {
      return 1.5;
    }
    if (terrain == SectorTerrain.subterraneanAquifer && type == ResourceType.water) {
      return 1.5;
    }
    if (terrain == SectorTerrain.crystallineDeposit && type == ResourceType.alloys) {
      return 1.5;
    }
    if (terrain == SectorTerrain.fertileBiocrust && type == ResourceType.food) {
      return 1.5;
    }
    if (terrain == SectorTerrain.radioactiveOutcrop && type == ResourceType.science) {
      return 2.0;
    }
    return 1.0;
  }
}
