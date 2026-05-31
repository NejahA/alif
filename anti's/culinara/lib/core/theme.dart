import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class GourmetTheme {
  // Palette: Bordeaux, Copper, Onyx, Gold Leaf, Linen
  static const Color bordeaux = Color(0xFF4A0E0E);
  static const Color copper = Color(0xFFB87333);
  static const Color onyx = Color(0xFF0F0F0F);
  static const Color parchment = Color(0xFFF5E6CC);
  static const Color goldLeaf = Color(0xFFD4AF37);
  static const Color linen = Color(0xFFFAF9F6);
  static const Color accentSage = Color(0xFF7B8D72);
  static const Color deepWood = Color(0xFF1A120F);

  static BoxDecoration glassDecoration(BuildContext context) {
    return BoxDecoration(
      color: Colors.white.withOpacity(0.02),
      borderRadius: BorderRadius.circular(24),
      border: Border.all(color: Colors.white.withOpacity(0.05), width: 1),
      boxShadow: [
        BoxShadow(
          color: Colors.black.withOpacity(0.4),
          blurRadius: 40,
          offset: const Offset(0, 20),
        ),
      ],
    );
  }

  static LinearGradient get bordeauxGradient => const LinearGradient(
        colors: [bordeaux, Color(0xFF631414)],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      );

  static LinearGradient get darkSurfaceGradient => const LinearGradient(
        colors: [onyx, deepWood],
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
      );

  static ThemeData get dark {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: onyx,
      colorScheme: const ColorScheme.dark(
        primary: copper,
        secondary: accentSage,
        surface: Color(0xFF151515),
        onSurface: parchment,
      ),
      textTheme: GoogleFonts.interTextTheme().copyWith(
        displayLarge: GoogleFonts.playfairDisplay(
          color: parchment,
          fontWeight: FontWeight.w800,
          letterSpacing: -1,
        ),
        displayMedium: GoogleFonts.playfairDisplay(
          color: copper,
          fontWeight: FontWeight.w700,
        ),
        titleLarge: GoogleFonts.playfairDisplay(
          color: parchment,
          fontWeight: FontWeight.w700,
        ),
        bodyMedium: GoogleFonts.inter(color: parchment.withOpacity(0.8)),
      ),
    );
  }
}
