import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class StarlightTheme {
  static const Color deepVoid = Color(0xFF020205);
  static const Color stellarBlue = Color(0xFF00E5FF);
  static const Color nebulaPink = Color(0xFFFF00D4);
  static const Color stardust = Color(0xFFE0E0E0);
  static const Color glowGold = Color(0xFFFFD700);

  static ThemeData darkTheme = ThemeData(
    brightness: Brightness.dark,
    scaffoldBackgroundColor: deepVoid,
    primaryColor: stellarBlue,
    hintColor: nebulaPink,
    textTheme: GoogleFonts.spaceGroteskTextTheme(
      ThemeData.dark().textTheme,
    ).apply(
      bodyColor: stardust,
      displayColor: Colors.white,
    ),
    colorScheme: const ColorScheme.dark(
      primary: stellarBlue,
      secondary: nebulaPink,
      tertiary: glowGold,
      surface: Color(0xFF0A0A10),
    ),
  );

  static BoxDecoration glassDecoration = BoxDecoration(
    color: Colors.white.withOpacity(0.03),
    borderRadius: BorderRadius.circular(24),
    border: Border.all(
      color: Colors.white.withOpacity(0.08),
      width: 1.5,
    ),
  );
}
