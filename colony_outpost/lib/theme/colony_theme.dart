import 'package:flutter/material.dart';

class ColonyTheme {
  // Deep space palette
  static const Color spaceVoid = Color(0xFF07090F);
  static const Color darkSlate = Color(0xFF0E1322);
  static const Color cardBg = Color(0xFF141C30);
  static const Color cardBgLight = Color(0xFF1C2640);
  static const Color borderGlow = Color(0xFF243456);

  // Hologram & Sci-Fi Accents
  static const Color neonCyan = Color(0xFF00F0FF);
  static const Color neonBlue = Color(0xFF0D6EFD);
  static const Color plasmaPurple = Color(0xFFA855F7);
  static const Color laserAmber = Color(0xFFFFB703);
  static const Color bioEmerald = Color(0xFF00F5D4);
  static const Color alertCrimson = Color(0xFFFF3366);
  static const Color textMuted = Color(0xFF8E9EB5);
  static const Color textBright = Color(0xFFE2E8F0);

  // Resource-specific Colors
  static const Color energyColor = Color(0xFFFFD166);
  static const Color oxygenColor = Color(0xFF4CC9F0);
  static const Color waterColor = Color(0xFF4361EE);
  static const Color foodColor = Color(0xFF06D6A0);
  static const Color alloyColor = Color(0xFFCBD5E1);
  static const Color scienceColor = Color(0xFFB5179E);
  static const Color creditColor = Color(0xFFFFBE0B);
  static const Color moraleColor = Color(0xFFF72585);

  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: spaceVoid,
      primaryColor: neonCyan,
      colorScheme: const ColorScheme.dark(
        primary: neonCyan,
        secondary: bioEmerald,
        surface: darkSlate,
        error: alertCrimson,
      ),
      fontFamily: 'monospace',
      cardTheme: CardThemeData(
        color: cardBg,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: const BorderSide(color: borderGlow, width: 1.2),
        ),
      ),
      dialogTheme: DialogThemeData(
        backgroundColor: darkSlate,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: neonCyan, width: 1.5),
        ),
      ),
    );
  }

  static BoxDecoration glowBox({
    Color? borderColor,
    Color? fillColor,
    double radius = 12,
    bool intense = false,
  }) {
    final border = borderColor ?? neonCyan.withValues(alpha: 0.4);
    final fill = fillColor ?? cardBg.withValues(alpha: 0.85);
    return BoxDecoration(
      color: fill,
      borderRadius: BorderRadius.circular(radius),
      border: Border.all(color: border, width: intense ? 1.8 : 1.2),
      boxShadow: [
        BoxShadow(
          color: (borderColor ?? neonCyan).withValues(alpha: intense ? 0.25 : 0.08),
          blurRadius: intense ? 16 : 8,
          spreadRadius: intense ? 2 : 0,
        ),
      ],
    );
  }
}
