import 'package:flutter/material.dart';

class NinjaSkin {
  final String id;
  final String name;
  final String title;
  final Color primaryColor;
  final Color accentColor;
  final Color glowColor;
  final int cost;
  final String description;
  final IconData icon;

  const NinjaSkin({
    required this.id,
    required this.name,
    required this.title,
    required this.primaryColor,
    required this.accentColor,
    required this.glowColor,
    required this.cost,
    required this.description,
    required this.icon,
  });

  static const List<NinjaSkin> allSkins = [
    NinjaSkin(
      id: 'shadow_shinobi',
      name: 'Shadow Shinobi',
      title: 'Silent Assassin',
      primaryColor: Color(0xFF1E293B),
      accentColor: Color(0xFF38BDF8),
      glowColor: Color(0xFF0284C7),
      cost: 0,
      description: 'Master of stealth, shrouded in midnight shadows.',
      icon: Icons.shield,
    ),
    NinjaSkin(
      id: 'crimson_demon',
      name: 'Crimson Demon',
      title: 'Oni Slayer',
      primaryColor: Color(0xFF450A0A),
      accentColor: Color(0xFFEF4444),
      glowColor: Color(0xFFF87171),
      cost: 150,
      description: 'Imbued with ancient demon flame energy.',
      icon: Icons.local_fire_department,
    ),
    NinjaSkin(
      id: 'cyber_kunoichi',
      name: 'Cyber Kunoichi',
      title: 'Neon Phantom',
      primaryColor: Color(0xFF4C1D95),
      accentColor: Color(0xFFEC4899),
      glowColor: Color(0xFFF472B6),
      cost: 300,
      description: 'Futuristic kunoichi fitted with plasma agility gear.',
      icon: Icons.bolt,
    ),
    NinjaSkin(
      id: 'golden_ronin',
      name: 'Golden Ronin',
      title: 'Imperial Vanguard',
      primaryColor: Color(0xFF78350F),
      accentColor: Color(0xFFF59E0B),
      glowColor: Color(0xFFFBBF24),
      cost: 500,
      description: 'Clad in ceremonial gold leaf armor of ancient masters.',
      icon: Icons.military_tech,
    ),
    NinjaSkin(
      id: 'void_spectre',
      name: 'Void Spectre',
      title: 'Ethereal Ghost',
      primaryColor: Color(0xFF0F172A),
      accentColor: Color(0xFF10B981),
      glowColor: Color(0xFF34D399),
      cost: 800,
      description: 'Phases seamlessly between real world and the nether void.',
      icon: Icons.auto_awesome,
    ),
  ];
}
