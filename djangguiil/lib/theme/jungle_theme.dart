import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class JungleColors {
  // Deep jungle darks
  static const Color abyss = Color(0xFF06110B);
  static const Color deepCanopy = Color(0xFF0B1F15);
  static const Color understory = Color(0xFF102D1E);
  static const Color foliageSurface = Color(0xFF163E2B);
  static const Color foliageBorder = Color(0xFF265D41);

  // Vibrant bio-accents
  static const Color emerald = Color(0xFF10B981);
  static const Color neonJade = Color(0xFF34D399);
  static const Color electricMint = Color(0xFF6EE7B7);
  static const Color sunAmber = Color(0xFFF59E0B);
  static const Color solarGold = Color(0xFFFBBF24);
  static const Color tropicalPapaya = Color(0xFFFF6B4A);
  static const Color mysticOrchid = Color(0xFFC084FC);
  static const Color azureLagoon = Color(0xFF38BDF8);

  // Text colors
  static const Color textPrimary = Color(0xFFF0FDF4);
  static const Color textSecondary = Color(0xFFA7F3D0);
  static const Color textMuted = Color(0xFF6EE7B7);
  static const Color textSubtle = Color(0xFF3B6B54);

  // Glass overlay colors
  static final Color glassFill = const Color(0xFF0F2C1D).withOpacity(0.65);
  static final Color glassBorder = const Color(0xFF34D399).withOpacity(0.25);
  static final Color glowShadow = const Color(0xFF10B981).withOpacity(0.2);
}

class JungleTheme {
  static ThemeData get darkTheme {
    final baseTextTheme = GoogleFonts.outfitTextTheme(ThemeData.dark().textTheme);

    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: JungleColors.abyss,
      primaryColor: JungleColors.emerald,
      colorScheme: const ColorScheme.dark(
        primary: JungleColors.emerald,
        secondary: JungleColors.sunAmber,
        tertiary: JungleColors.mysticOrchid,
        surface: JungleColors.understory,
        onPrimary: JungleColors.abyss,
        onSurface: JungleColors.textPrimary,
      ),
      textTheme: baseTextTheme.copyWith(
        displayLarge: GoogleFonts.outfit(
          fontSize: 32,
          fontWeight: FontWeight.w800,
          color: JungleColors.textPrimary,
          letterSpacing: -0.5,
        ),
        displayMedium: GoogleFonts.outfit(
          fontSize: 26,
          fontWeight: FontWeight.w700,
          color: JungleColors.textPrimary,
        ),
        headlineSmall: GoogleFonts.outfit(
          fontSize: 20,
          fontWeight: FontWeight.w600,
          color: JungleColors.textPrimary,
        ),
        titleMedium: GoogleFonts.outfit(
          fontSize: 16,
          fontWeight: FontWeight.w600,
          color: JungleColors.textPrimary,
        ),
        bodyLarge: GoogleFonts.outfit(
          fontSize: 15,
          fontWeight: FontWeight.w400,
          color: JungleColors.textSecondary,
        ),
        bodyMedium: GoogleFonts.outfit(
          fontSize: 13,
          fontWeight: FontWeight.w400,
          color: JungleColors.textSecondary,
        ),
      ),
      cardTheme: CardThemeData(
        color: JungleColors.foliageSurface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: JungleColors.foliageBorder, width: 1),
        ),
      ),
    );
  }
}
