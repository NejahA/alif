import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class IlluminatiTheme {
  // Color Palette
  static const Color obsidianBlack = Color(0xFF0B0D12);
  static const Color voidDark = Color(0xFF121620);
  static const Color sacredGold = Color(0xFFFFD700);
  static const Color amberGlow = Color(0xFFFFB300);
  static const Color cyberCyan = Color(0xFF00E5FF);
  static const Color emeraldShield = Color(0xFF00FFAB);
  static const Color crimsonSeal = Color(0xFFFF0266);
  static const Color occultPurple = Color(0xFF8A2BE2);
  static const Color slateCard = Color(0xFF1A1F2C);
  static const Color mutedGold = Color(0xFF9E8B47);

  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: obsidianBlack,
      primaryColor: sacredGold,
      colorScheme: const ColorScheme.dark(
        primary: sacredGold,
        secondary: cyberCyan,
        tertiary: emeraldShield,
        error: crimsonSeal,
        surface: slateCard,
      ),
      textTheme: TextTheme(
        displayLarge: GoogleFonts.cinzel(
          color: sacredGold,
          fontSize: 32,
          fontWeight: FontWeight.bold,
          letterSpacing: 2.0,
        ),
        displayMedium: GoogleFonts.cinzel(
          color: Colors.white,
          fontSize: 24,
          fontWeight: FontWeight.w600,
          letterSpacing: 1.5,
        ),
        titleLarge: GoogleFonts.cinzelDecorative(
          color: sacredGold,
          fontSize: 20,
          fontWeight: FontWeight.bold,
          letterSpacing: 1.2,
        ),
        bodyLarge: GoogleFonts.orbitron(
          color: const Color(0xFFD0D7E5),
          fontSize: 15,
          letterSpacing: 0.8,
        ),
        bodyMedium: GoogleFonts.orbitron(
          color: const Color(0xFF94A3B8),
          fontSize: 13,
        ),
        labelLarge: GoogleFonts.cinzel(
          color: sacredGold,
          fontSize: 14,
          fontWeight: FontWeight.bold,
          letterSpacing: 1.5,
        ),
      ),
      cardTheme: CardThemeData(
        color: slateCard,
        elevation: 8,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: sacredGold.withValues(alpha: 0.3), width: 1.2),
        ),
      ),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: voidDark,
        contentTextStyle: GoogleFonts.orbitron(color: sacredGold),
        shape: RoundedRectangleBorder(
          side: const BorderSide(color: sacredGold, width: 1.5),
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    );
  }
}
