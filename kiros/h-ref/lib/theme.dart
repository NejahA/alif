import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  static const Color bgDark = Color(0xFF0D0D1A);
  static const Color bgCard = Color(0xFF14142B);
  static const Color bgCardLight = Color(0xFF1C1C3A);
  static const Color accent = Color(0xFFD4AF37); // divine gold
  static const Color accentSoft = Color(0xFF9B6F2F);
  static const Color textPrimary = Color(0xFFF5F0E8);
  static const Color textSecondary = Color(0xFFB0A89A);
  static const Color textMuted = Color(0xFF6B6580);
  static const Color error = Color(0xFFCF4444);
  static const Color success = Color(0xFF4CAF50);

  static const Map<String, Color> categoryColors = {
    'ancient': Color(0xFF8B6914),
    'abrahamic': Color(0xFF1A5F7A),
    'eastern': Color(0xFF7B2D8B),
    'norse': Color(0xFF2D5A8B),
    'celtic': Color(0xFF2D7B3D),
    'mesoamerican': Color(0xFF8B3A1A),
    'african': Color(0xFF8B5A1A),
    'modern': Color(0xFF4A3A8B),
  };

  static ThemeData get theme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: bgDark,
      colorScheme: const ColorScheme.dark(
        background: bgDark,
        surface: bgCard,
        primary: accent,
        onPrimary: bgDark,
        secondary: accentSoft,
        onSecondary: textPrimary,
        error: error,
      ),
      textTheme: GoogleFonts.cinzelTextTheme(
        const TextTheme(
          displayLarge: TextStyle(
            color: textPrimary,
            fontSize: 32,
            fontWeight: FontWeight.w700,
            letterSpacing: 1.5,
          ),
          displayMedium: TextStyle(
            color: textPrimary,
            fontSize: 24,
            fontWeight: FontWeight.w600,
            letterSpacing: 1.2,
          ),
          headlineLarge: TextStyle(
            color: textPrimary,
            fontSize: 22,
            fontWeight: FontWeight.w700,
            letterSpacing: 1.0,
          ),
          headlineMedium: TextStyle(
            color: textPrimary,
            fontSize: 18,
            fontWeight: FontWeight.w600,
            letterSpacing: 0.8,
          ),
          titleLarge: TextStyle(
            color: textPrimary,
            fontSize: 16,
            fontWeight: FontWeight.w600,
            letterSpacing: 0.5,
          ),
          bodyLarge: TextStyle(
            color: textPrimary,
            fontSize: 14,
            height: 1.6,
          ),
          bodyMedium: TextStyle(
            color: textSecondary,
            fontSize: 13,
            height: 1.5,
          ),
          labelLarge: TextStyle(
            color: accent,
            fontSize: 12,
            fontWeight: FontWeight.w600,
            letterSpacing: 1.5,
          ),
        ),
      ).apply(
        bodyColor: textPrimary,
        displayColor: textPrimary,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: bgDark,
        foregroundColor: accent,
        elevation: 0,
        titleTextStyle: GoogleFonts.cinzel(
          color: accent,
          fontSize: 20,
          fontWeight: FontWeight.w700,
          letterSpacing: 2.0,
        ),
        iconTheme: const IconThemeData(color: accent),
      ),
      cardTheme: const CardThemeData(
        color: bgCard,
        elevation: 0,
        margin: EdgeInsets.zero,
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: bgCardLight,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFF2A2A4A)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFF2A2A4A)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: accent, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: error),
        ),
        labelStyle: GoogleFonts.cinzel(
          color: textSecondary,
          fontSize: 12,
          letterSpacing: 1.0,
        ),
        hintStyle: const TextStyle(color: textMuted),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: accent,
          foregroundColor: bgDark,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          textStyle: GoogleFonts.cinzel(
            fontWeight: FontWeight.w700,
            letterSpacing: 1.5,
            fontSize: 13,
          ),
        ),
      ),
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: accent,
        foregroundColor: bgDark,
        elevation: 8,
      ),
      chipTheme: ChipThemeData(
        backgroundColor: bgCardLight,
        selectedColor: accent,
        labelStyle: GoogleFonts.cinzel(
          fontSize: 11,
          letterSpacing: 0.5,
        ),
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        side: const BorderSide(color: Color(0xFF2A2A4A)),
      ),
    );
  }
}