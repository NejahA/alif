import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class OpiateTheme {
  static const Color deepEmerald = Color(0xFF071815);
  static const Color celestialMidnight = Color(0xFF030B09);
  static const Color sacredGold = Color(0xFFE5C158);
  static const Color emeraldGlow = Color(0xFF10B981);
  static const Color slateCard = Color(0x1AFFFFFF);
  static const Color borderGold = Color(0x40E5C158);
  static const Color textMuted = Color(0xB3FFFFFF);
  static const Color textArabic = Color(0xFFFAF6E9);

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: celestialMidnight,
      primaryColor: sacredGold,
      colorScheme: const ColorScheme.dark(
        primary: sacredGold,
        secondary: emeraldGlow,
        surface: deepEmerald,
      ),
      cardTheme: CardThemeData(
        color: slateCard,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: borderGold, width: 1),
        ),
      ),
      textTheme: TextTheme(
        headlineMedium: GoogleFonts.cinzel(
          color: sacredGold,
          fontSize: 22,
          fontWeight: FontWeight.bold,
        ),
        titleLarge: GoogleFonts.cinzel(
          color: Colors.white,
          fontSize: 16,
          fontWeight: FontWeight.w600,
        ),
        bodyMedium: GoogleFonts.outfit(
          color: textMuted,
          fontSize: 13,
        ),
      ),
    );
  }
}
