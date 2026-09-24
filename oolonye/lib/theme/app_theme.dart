import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Colonye Color Palette
  static const Color voidBlack = Color(0xFF090A10);
  static const Color deepSpace = Color(0xFF101322);
  static const Color glassSurface = Color(0x1F1F2648);
  static const Color glassBorder = Color(0x357A88BF);
  
  static const Color nebulaViolet = Color(0xFF7C4DFF);
  static const Color quantumCyan = Color(0xFF00E5FF);
  static const Color astralGold = Color(0xFFFFD700);
  static const Color auroraRose = Color(0xFFFF4081);
  static const Color emeraldZen = Color(0xFF00E676);

  static const Color textPrimary = Color(0xFFF1F5F9);
  static const Color textSecondary = Color(0xFF94A3B8);

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: voidBlack,
      colorScheme: const ColorScheme.dark(
        primary: nebulaViolet,
        secondary: quantumCyan,
        tertiary: astralGold,
        surface: deepSpace,
        onSurface: textPrimary,
      ),
      textTheme: TextTheme(
        displayLarge: GoogleFonts.outfit(
          fontSize: 32,
          fontWeight: FontWeight.bold,
          color: textPrimary,
          letterSpacing: 1.2,
        ),
        displayMedium: GoogleFonts.outfit(
          fontSize: 24,
          fontWeight: FontWeight.w600,
          color: textPrimary,
        ),
        headlineMedium: GoogleFonts.outfit(
          fontSize: 20,
          fontWeight: FontWeight.w600,
          color: textPrimary,
        ),
        titleLarge: GoogleFonts.outfit(
          fontSize: 18,
          fontWeight: FontWeight.w500,
          color: textPrimary,
        ),
        bodyLarge: GoogleFonts.inter(
          fontSize: 15,
          fontWeight: FontWeight.normal,
          color: textPrimary,
        ),
        bodyMedium: GoogleFonts.inter(
          fontSize: 13,
          fontWeight: FontWeight.normal,
          color: textSecondary,
        ),
      ),
    );
  }
}
