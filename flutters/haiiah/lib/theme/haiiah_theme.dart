import 'package:flutter/material.dart';

class HaiiahTheme {
  static const Color deep = Color(0xFF0B2E26);
  static const Color deep2 = Color(0xFF123F35);
  static const Color emerald = Color(0xFF1B5E4F);
  static const Color emeraldLight = Color(0xFF2A7A68);
  static const Color gold = Color(0xFFC9A227);
  static const Color goldLight = Color(0xFFE0C05C);
  static const Color goldSoft = Color(0xFFF0E6C8);
  static const Color ivory = Color(0xFFFAF6EC);
  static const Color ivory2 = Color(0xFFF3ECDA);
  static const Color ink = Color(0xFF1F2A26);
  static const Color muted = Color(0xFF5C6B64);

  static ThemeData get lightTheme {
    final base = ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      colorScheme: const ColorScheme.light(
        primary: deep,
        secondary: emerald,
        tertiary: gold,
        surface: ivory,
        onPrimary: ivory,
        onSecondary: ivory,
        onTertiary: deep,
      ),
      scaffoldBackgroundColor: ivory,
    );

    return base.copyWith(
      appBarTheme: const AppBarTheme(
        backgroundColor: ivory,
        foregroundColor: deep,
        elevation: 0,
        centerTitle: true,
      ),
      cardTheme: CardThemeData(
        color: Colors.white,
        elevation: 2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: deep,
          foregroundColor: ivory,
          padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(50),
          ),
        ),
      ),
      textTheme: base.textTheme.copyWith(
        headlineLarge: const TextStyle(
          fontSize: 32,
          fontWeight: FontWeight.bold,
          color: deep,
        ),
        headlineMedium: const TextStyle(
          fontSize: 24,
          fontWeight: FontWeight.bold,
          color: deep,
        ),
        titleLarge: const TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.w600,
          color: deep,
        ),
        bodyLarge: const TextStyle(
          fontSize: 16,
          color: ink,
          height: 1.6,
        ),
        bodyMedium: const TextStyle(
          fontSize: 14,
          color: muted,
          height: 1.6,
        ),
      ),
    );
  }
}