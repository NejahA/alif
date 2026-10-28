import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class HiroColors {
  // Deep obsidian & astral space
  static const Color abyss = Color(0xFF050811);
  static const Color deepSpace = Color(0xFF090E1A);
  static const Color surface = Color(0xFF0F172A);
  static const Color surfaceElevated = Color(0xFF1E293B);
  static const Color surfaceGlass = Color(0xCC0F172A);
  static const Color borderSubtle = Color(0xFF334155);
  static const Color borderGlow = Color(0x4038BDF8);

  // Bio-luminescent neural accents
  static const Color neonCyan = Color(0xFF38BDF8);
  static const Color electricTeal = Color(0xFF2DD4BF);
  static const Color neuralEmerald = Color(0xFF10B981);
  static const Color solarAmber = Color(0xFFF59E0B);
  static const Color karmaGold = Color(0xFFFBBF24);
  static const Color astralViolet = Color(0xFFA855F7);
  static const Color mysticOrchid = Color(0xFFC084FC);
  static const Color crimsonFlare = Color(0xFFF43F5E);
  static const Color hotPink = Color(0xFFEC4899);

  // Text
  static const Color textPrimary = Color(0xFFF8FAFC);
  static const Color textSecondary = Color(0xFF94A3B8);
  static const Color textMuted = Color(0xFF64748B);

  // Synapse Template Colors
  static Color templateColor(String type) {
    switch (type.toLowerCase()) {
      case 'idea':
        return solarAmber;
      case 'task':
        return neuralEmerald;
      case 'question':
        return astralViolet;
      case 'resource':
        return neonCyan;
      case 'warning':
        return crimsonFlare;
      default:
        return neonCyan;
    }
  }

  static String templateEmoji(String type) {
    switch (type.toLowerCase()) {
      case 'idea':
        return '💡';
      case 'task':
        return '✅';
      case 'question':
        return '❓';
      case 'resource':
        return '🔗';
      case 'warning':
        return '⚠️';
      default:
        return '🌱';
    }
  }
}

class HiroTheme {
  static ThemeData get darkTheme {
    final baseTextTheme = GoogleFonts.outfitTextTheme(ThemeData.dark().textTheme);

    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: HiroColors.abyss,
      primaryColor: HiroColors.neonCyan,
      canvasColor: HiroColors.deepSpace,
      colorScheme: const ColorScheme.dark(
        primary: HiroColors.neonCyan,
        secondary: HiroColors.astralViolet,
        tertiary: HiroColors.neuralEmerald,
        surface: HiroColors.surface,
        onPrimary: HiroColors.abyss,
        onSecondary: Colors.white,
        onSurface: HiroColors.textPrimary,
      ),
      cardTheme: CardThemeData(
        color: HiroColors.surface,
        elevation: 6,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: HiroColors.borderSubtle, width: 1),
        ),
      ),
      dialogTheme: DialogThemeData(
        backgroundColor: HiroColors.surfaceGlass,
        elevation: 12,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: HiroColors.borderGlow, width: 1.5),
        ),
      ),
      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: HiroColors.surfaceGlass,
        modalBackgroundColor: HiroColors.surfaceGlass,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          side: BorderSide(color: HiroColors.borderGlow, width: 1),
        ),
      ),
      textTheme: baseTextTheme.copyWith(
        displayLarge: GoogleFonts.outfit(
          fontSize: 32,
          fontWeight: FontWeight.w800,
          color: HiroColors.textPrimary,
          letterSpacing: -0.5,
        ),
        displayMedium: GoogleFonts.outfit(
          fontSize: 24,
          fontWeight: FontWeight.w700,
          color: HiroColors.textPrimary,
        ),
        titleLarge: GoogleFonts.outfit(
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: HiroColors.textPrimary,
        ),
        bodyLarge: GoogleFonts.outfit(
          fontSize: 15,
          fontWeight: FontWeight.normal,
          color: HiroColors.textPrimary,
        ),
        bodyMedium: GoogleFonts.outfit(
          fontSize: 13,
          fontWeight: FontWeight.normal,
          color: HiroColors.textSecondary,
        ),
        labelLarge: GoogleFonts.outfit(
          fontSize: 13,
          fontWeight: FontWeight.w600,
          color: HiroColors.textPrimary,
          letterSpacing: 0.5,
        ),
      ),
      iconTheme: const IconThemeData(
        color: HiroColors.neonCyan,
        size: 20,
      ),
    );
  }
}
