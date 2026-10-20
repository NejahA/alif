import 'package:flutter/material.dart';

class ShipChassis {
  final String id;
  final String name;
  final String subtitle;
  final String description;
  final Color primaryColor;
  final Color accentColor;
  final double baseHealth;
  final double speed;
  final double fireRate; // shots per sec
  final double rewindCooldown; // seconds
  final int coreUnlockCost;
  final IconData icon;

  const ShipChassis({
    required this.id,
    required this.name,
    required this.subtitle,
    required this.description,
    required this.primaryColor,
    required this.accentColor,
    required this.baseHealth,
    required this.speed,
    required this.fireRate,
    required this.rewindCooldown,
    required this.coreUnlockCost,
    required this.icon,
  });

  static const List<ShipChassis> allChassis = [
    ShipChassis(
      id: 'chronos_vector',
      name: 'Chronos-01',
      subtitle: 'Quantum Interceptor',
      description: 'Balanced prototype vessel. Reliable hull, standard rewind drive.',
      primaryColor: Color(0xFF00E5FF),
      accentColor: Color(0xFF7C4DFF),
      baseHealth: 100.0,
      speed: 280.0,
      fireRate: 4.5,
      rewindCooldown: 6.0,
      coreUnlockCost: 0,
      icon: Icons.navigation_rounded,
    ),
    ShipChassis(
      id: 'phase_phantom',
      name: 'Phantom-VX',
      subtitle: 'Tachyon Speeder',
      description: 'Hyper-agile skirmisher with rapid fire and 4.5s rewind recharge, but fragile armor.',
      primaryColor: Color(0xFFFF1744),
      accentColor: Color(0xFFFF9100),
      baseHealth: 70.0,
      speed: 340.0,
      fireRate: 6.0,
      rewindCooldown: 4.5,
      coreUnlockCost: 250,
      icon: Icons.flash_on_rounded,
    ),
    ShipChassis(
      id: 'aegis_dreadnought',
      name: 'Aegis Titan',
      subtitle: 'Heavy Chrono-Bastion',
      description: 'Heavily plated fortress. Emits double-radius shockwaves on rewind with huge HP.',
      primaryColor: Color(0xFF00E676),
      accentColor: Color(0xFF00B0FF),
      baseHealth: 160.0,
      speed: 220.0,
      fireRate: 3.5,
      rewindCooldown: 7.5,
      coreUnlockCost: 600,
      icon: Icons.shield_rounded,
    ),
  ];
}
