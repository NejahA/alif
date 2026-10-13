import 'package:flutter/material.dart';

class KatanaEffect {
  final String id;
  final String name;
  final Color slashColor;
  final Color sparkColor;
  final int cost;
  final String description;

  const KatanaEffect({
    required this.id,
    required this.name,
    required this.slashColor,
    required this.sparkColor,
    required this.cost,
    required this.description,
  });

  static const List<KatanaEffect> allEffects = [
    KatanaEffect(
      id: 'void_blade',
      name: 'Void Blade',
      slashColor: Color(0xFF38BDF8),
      sparkColor: Color(0xFFE0F2FE),
      cost: 0,
      description: 'Standard razor sharp void energy cut.',
    ),
    KatanaEffect(
      id: 'flame_katana',
      name: 'Inferno Flame',
      slashColor: Color(0xFFF97316),
      sparkColor: Color(0xFFFDE047),
      cost: 100,
      description: 'Ignites the air leaving fiery ember trails.',
    ),
    KatanaEffect(
      id: 'plasma_saber',
      name: 'Neon Lightning',
      slashColor: Color(0xFFA855F7),
      sparkColor: Color(0xFFF0ABFC),
      cost: 250,
      description: 'Discharges electric arc sparks on hit.',
    ),
    KatanaEffect(
      id: 'cherry_petal',
      name: 'Sakura Arc',
      slashColor: Color(0xFFF43F5E),
      sparkColor: Color(0xFFFECDD3),
      cost: 400,
      description: 'Sweeps glowing cherry blossoms on every slash.',
    ),
  ];
}
