import 'package:flutter/material.dart';

enum UpgradeRarity { common, rare, legendary }

class QuantumUpgrade {
  final String id;
  final String name;
  final String description;
  final IconData icon;
  final Color themeColor;
  final UpgradeRarity rarity;
  int currentLevel;
  final int maxLevel;

  QuantumUpgrade({
    required this.id,
    required this.name,
    required this.description,
    required this.icon,
    required this.themeColor,
    required this.rarity,
    this.currentLevel = 0,
    this.maxLevel = 5,
  });

  bool get isMaxed => currentLevel >= maxLevel;

  QuantumUpgrade copy() {
    return QuantumUpgrade(
      id: id,
      name: name,
      description: description,
      icon: icon,
      themeColor: themeColor,
      rarity: rarity,
      currentLevel: currentLevel,
      maxLevel: maxLevel,
    );
  }

  static List<QuantumUpgrade> getInitialPool() {
    return [
      QuantumUpgrade(
        id: 'echo_overcharge',
        name: 'Echo Overcharge',
        description: 'Temporal Echo deals +35% damage and mimics fire faster.',
        icon: Icons.repeat_one_rounded,
        themeColor: const Color(0xFF00E5FF),
        rarity: UpgradeRarity.common,
        maxLevel: 4,
      ),
      QuantumUpgrade(
        id: 'paradox_blast',
        name: 'Paradox Shockwave',
        description: 'Rewinding triggers an EMP wave clearing bullets and striking enemies.',
        icon: Icons.all_inclusive_rounded,
        themeColor: const Color(0xFFD500F9),
        rarity: UpgradeRarity.rare,
        maxLevel: 3,
      ),
      QuantumUpgrade(
        id: 'temporal_leech',
        name: 'Chronon Leech',
        description: 'Restores 20 HP / Shield upon triggering Temporal Rewind.',
        icon: Icons.healing_rounded,
        themeColor: const Color(0xFF00E676),
        rarity: UpgradeRarity.common,
        maxLevel: 3,
      ),
      QuantumUpgrade(
        id: 'tachyon_multishot',
        name: 'Tachyon Splitter',
        description: 'Main blasters fire additional angled plasma bolts.',
        icon: Icons.electric_bolt_rounded,
        themeColor: const Color(0xFFFFD600),
        rarity: UpgradeRarity.rare,
        maxLevel: 4,
      ),
      QuantumUpgrade(
        id: 'singularity_mine',
        name: 'Singularity Mine',
        description: 'Leaves a gravity vortex at your rewind origin point.',
        icon: Icons.donut_large_rounded,
        themeColor: const Color(0xFF7C4DFF),
        rarity: UpgradeRarity.rare,
        maxLevel: 3,
      ),
      QuantumUpgrade(
        id: 'quantum_magnet',
        name: 'Flux Attractor',
        description: 'Doubles Chrono-Core attraction radius and grants +15% core value.',
        icon: Icons.radio_button_checked_rounded,
        themeColor: const Color(0xFF00B0FF),
        rarity: UpgradeRarity.common,
        maxLevel: 3,
      ),
      QuantumUpgrade(
        id: 'phase_cloak',
        name: 'Phase Shield',
        description: 'Grants 1.5s of invulnerability after emerging from a Rewind.',
        icon: Icons.security_rounded,
        themeColor: const Color(0xFF18FFFF),
        rarity: UpgradeRarity.common,
        maxLevel: 3,
      ),
      QuantumUpgrade(
        id: 'twin_echoes',
        name: 'Twin Paradox',
        description: 'Manifests a SECOND Temporal Echo offset in the timeline!',
        icon: Icons.control_point_duplicate_rounded,
        themeColor: const Color(0xFFFF4081),
        rarity: UpgradeRarity.legendary,
        maxLevel: 1,
      ),
      QuantumUpgrade(
        id: 'prism_splitter',
        name: 'Prism Splitter',
        description: 'Projectiles passing through echoes split into 3 chromatic beams with +40% damage.',
        icon: Icons.auto_awesome_rounded,
        themeColor: const Color(0xFF00FFCC),
        rarity: UpgradeRarity.rare,
        maxLevel: 3,
      ),
      QuantumUpgrade(
        id: 'chrono_collapse',
        name: 'Chrono Collapse',
        description: 'Dashing into an Echo creates a +45% wider detonation wave that vaporizes bullets.',
        icon: Icons.blur_circular_rounded,
        themeColor: const Color(0xFFFF1744),
        rarity: UpgradeRarity.rare,
        maxLevel: 3,
      ),
      QuantumUpgrade(
        id: 'overdrive_surge',
        name: 'Resonance Surge',
        description: 'Temporal Overdrive lasts +1.5s longer and instantly restores shields on detonation.',
        icon: Icons.flash_on_rounded,
        themeColor: const Color(0xFFFFEA00),
        rarity: UpgradeRarity.legendary,
        maxLevel: 2,
      ),
      QuantumUpgrade(
        id: 'phase_burst',
        name: 'Phase Accelerator',
        description: 'Reduces Phase Dash cooldown by 30% and leaves burning tachyon sparks.',
        icon: Icons.fast_forward_rounded,
        themeColor: const Color(0xFFE040FB),
        rarity: UpgradeRarity.common,
        maxLevel: 3,
      ),
      QuantumUpgrade(
        id: 'tachyon_tether',
        name: 'Tachyon Monofilament',
        description: 'Echoes project high-energy cutting laser tethers that slice intersecting hostiles and trap groups in Stasis Polygons.',
        icon: Icons.linear_scale_rounded,
        themeColor: const Color(0xFF00FFCC),
        rarity: UpgradeRarity.rare,
        maxLevel: 3,
      ),
      QuantumUpgrade(
        id: 'timeline_splicer',
        name: 'Timeline Splicer',
        description: 'Weapon discharges attach Tachyon Anchors. Triggering Rewind forcibly yanks anchored enemies backward for massive dislocation trauma.',
        icon: Icons.history_toggle_off_rounded,
        themeColor: const Color(0xFFFF4081),
        rarity: UpgradeRarity.rare,
        maxLevel: 3,
      ),
      QuantumUpgrade(
        id: 'kinetic_parry',
        name: 'Kinetic Deflector',
        description: 'Phase Dashing through enemy projectiles parries and deflects them into lethal homing tachyon shards.',
        icon: Icons.shield_moon_rounded,
        themeColor: const Color(0xFFFFD600),
        rarity: UpgradeRarity.rare,
        maxLevel: 3,
      ),
      QuantumUpgrade(
        id: 'chrono_reflex',
        name: 'Tachyon Reflex',
        description: 'Grazing enemy bullets charges Bullet-Time 50% faster, expands graze radius, and extends Bullet-Time duration by +1.0s.',
        icon: Icons.timelapse_rounded,
        themeColor: const Color(0xFF7C4DFF),
        rarity: UpgradeRarity.legendary,
        maxLevel: 2,
      ),
    ];
  }
}
