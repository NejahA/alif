import 'package:flutter/material.dart';
import '../theme/colony_theme.dart';
import 'resource.dart';

enum CrisisUrgency {
  opportunity,
  warning,
  danger,
  catastrophe,
}

class CrisisChoice {
  final String label;
  final String outcomeDescription;
  final IconData icon;
  final Map<ResourceType, double> cost;
  final Map<ResourceType, double> reward;
  final double moraleDelta;
  final double randomModuleDamagePercent;
  final int colonistDelta;

  const CrisisChoice({
    required this.label,
    required this.outcomeDescription,
    required this.icon,
    this.cost = const {},
    this.reward = const {},
    this.moraleDelta = 0.0,
    this.randomModuleDamagePercent = 0.0,
    this.colonistDelta = 0,
  });
}

class CrisisEvent {
  final String id;
  final String title;
  final String subtitle;
  final String story;
  final CrisisUrgency urgency;
  final IconData icon;
  final List<CrisisChoice> choices;

  const CrisisEvent({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.story,
    required this.urgency,
    required this.icon,
    required this.choices,
  });

  Color get urgencyColor {
    switch (urgency) {
      case CrisisUrgency.opportunity:
        return ColonyTheme.bioEmerald;
      case CrisisUrgency.warning:
        return ColonyTheme.laserAmber;
      case CrisisUrgency.danger:
        return const Color(0xFFFF5252);
      case CrisisUrgency.catastrophe:
        return ColonyTheme.alertCrimson;
    }
  }

  static List<CrisisEvent> get pool => [
    CrisisEvent(
      id: 'solar_flare',
      title: 'CLASS-4 SOLAR FLARE',
      subtitle: 'HELIOS SCANNER ALERT • ORBITAL SENSORS TRIPPED',
      story: 'A massive coronal mass ejection from Aethelgard Prime\'s primary star has entered the upper atmosphere. High-energy radiation surges will overload unprotected grid conduits within moments.',
      urgency: CrisisUrgency.danger,
      icon: Icons.wb_twilight,
      choices: [
        CrisisChoice(
          label: 'Deploy Ion Grounding Rods',
          outcomeDescription: 'Absorb radiation safely using reinforced nanite alloy grounding rods.',
          icon: Icons.shield,
          cost: {ResourceType.alloys: 35},
          moraleDelta: 5.0,
        ),
        CrisisChoice(
          label: 'Overclock Battery Shunts',
          outcomeDescription: 'Absorb energy surge directly into main grid. High yield, but risks capacitor fire.',
          icon: Icons.bolt,
          reward: {ResourceType.energy: 150},
          randomModuleDamagePercent: 15.0,
          moraleDelta: -5.0,
        ),
        CrisisChoice(
          label: 'Emergency Sector Blackout',
          outcomeDescription: 'Cut non-critical power lines immediately. Colonists will suffer darkness and cold.',
          icon: Icons.power_off,
          moraleDelta: -12.0,
        ),
      ],
    ),
    CrisisEvent(
      id: 'derelict_pod',
      title: 'DISTRESS BEACON DETECTED',
      subtitle: 'CRYO-CAPSULE CRASH SITE • SECTOR PERIMETER',
      story: 'Long-range radar has pinged a smoking surveyor escape pod that crash-landed in the crimson dunes outside the perimeter fence. Weak life signs and encrypted data cores are detected.',
      urgency: CrisisUrgency.opportunity,
      icon: Icons.satellite_alt,
      choices: [
        CrisisChoice(
          label: 'Send Medical Evac Shuttle',
          outcomeDescription: 'Deploy rover team with survival rations and oxygen tanks to rescue survivors.',
          icon: Icons.medical_services,
          cost: {ResourceType.water: 20, ResourceType.food: 20},
          colonistDelta: 3,
          moraleDelta: 15.0,
        ),
        CrisisChoice(
          label: 'Scavenge Pod Chassis',
          outcomeDescription: 'Strip the crash capsule for titanium composite alloys and power cells.',
          icon: Icons.handyman,
          reward: {ResourceType.alloys: 75, ResourceType.energy: 50},
          moraleDelta: -8.0,
        ),
        CrisisChoice(
          label: 'Download Data Core Only',
          outcomeDescription: 'Remotely beam the navigational research telemetry into Xenobiology servers.',
          icon: Icons.download,
          reward: {ResourceType.science: 40},
        ),
      ],
    ),
    CrisisEvent(
      id: 'sandstorm_vortex',
      title: 'CORROSIVE SILICA CYCLONE',
      subtitle: 'METEOROLOGICAL WARNING • PRESSURE 840 HPA',
      story: 'A towering dust vortex saturated with abrasive silica particles is sweeping across the colony basin. Glass solar panels and air intake filters are directly in its path.',
      urgency: CrisisUrgency.warning,
      icon: Icons.cyclone,
      choices: [
        CrisisChoice(
          label: 'Seal Intakes & Purge Air',
          outcomeDescription: 'Seal all filters and burn extra oxygen to pressurize domes against particulate ingress.',
          icon: Icons.air,
          cost: {ResourceType.oxygen: 25, ResourceType.energy: 30},
          moraleDelta: 2.0,
        ),
        CrisisChoice(
          label: 'Overdrive Atmosphere Scrubbers',
          outcomeDescription: 'Force scrubbers to run beyond capacity to filter dust on the fly.',
          icon: Icons.speed,
          cost: {ResourceType.energy: 45},
          randomModuleDamagePercent: 20.0,
        ),
        CrisisChoice(
          label: 'Nanite Polymer Spraydown',
          outcomeDescription: 'Coat solar arrays and biodome exteriors with protective sacrificial glaze.',
          icon: Icons.format_paint,
          cost: {ResourceType.alloys: 40},
          reward: {ResourceType.energy: 30},
        ),
      ],
    ),
    CrisisEvent(
      id: 'alien_artifact',
      title: 'ANOMALOUS MONOLITH EXCAVATED',
      subtitle: 'DEEP CRUST ANOMALY • SUB-FREQUENCY 432 HZ',
      story: 'Mining drills in the lower sectors have struck a polished obsidian monolith of unknown extra-solar origin. It pulses with rhythmic harmonic vibrations that resonate in colonists\' auditory implants.',
      urgency: CrisisUrgency.opportunity,
      icon: Icons.auto_awesome,
      choices: [
        CrisisChoice(
          label: 'Establish Quantum Probe Matrix',
          outcomeDescription: 'Direct research lasers into the structure to decode ancient stellar cartography.',
          icon: Icons.biotech,
          cost: {ResourceType.energy: 50},
          reward: {ResourceType.science: 90, ResourceType.credits: 150},
          moraleDelta: 8.0,
        ),
        CrisisChoice(
          label: 'Extract Crystalline Resonator',
          outcomeDescription: 'Carefully excise the core crystal to incorporate into colony fusion generators.',
          icon: Icons.diamond,
          reward: {ResourceType.alloys: 60, ResourceType.energy: 120},
          moraleDelta: -4.0,
        ),
        CrisisChoice(
          label: 'Declare Sacred Cultural Preserve',
          outcomeDescription: 'Enclose the monolith in a protected viewing dome. Colonists flock to wonder at it.',
          icon: Icons.temple_buddhist,
          moraleDelta: 25.0,
        ),
      ],
    ),
  ];
}
