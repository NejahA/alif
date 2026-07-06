import 'package:flutter/material.dart';

class LudicTheme {
  static const Color primary = Color(0xFF6C63FF);
  static const Color secondary = Color(0xFFFF6584);
  static const Color accent = Color(0xFF00D9FF);
  static const Color bgDark = Color(0xFF0D0D2B);
  static const Color bgCard = Color(0xFF1A1A40);
  static const Color surface = Color(0xFF252550);
  static const Color textPrimary = Color(0xFFFFFFFF);
  static const Color textSecondary = Color(0xFFB0B0D0);

  static const List<Color> palette = [
    Color(0xFFFF6584), // pink
    Color(0xFFFFB347), // orange
    Color(0xFF00D9FF), // cyan
    Color(0xFF6C63FF), // purple
    Color(0xFF00E676), // green
    Color(0xFFFF4081), // hot pink
    Color(0xFF7C4DFF), // deep purple
    Color(0xFFFFAB40), // amber
  ];

  static ThemeData get theme => ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: bgDark,
        colorScheme: const ColorScheme.dark(
          primary: primary,
          secondary: secondary,
          surface: bgCard,
        ),
        fontFamily: 'Poppins',
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.transparent,
          elevation: 0,
          centerTitle: true,
        ),
      );
}