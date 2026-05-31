import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class CuisineTheme {
  // ─── Warm Cuisine Palette ───
  static const Color espresso = Color(0xFF1B1210);
  static const Color darkWalnut = Color(0xFF2A1F1A);
  static const Color cream = Color(0xFFFFF8F0);
  static const Color terracotta = Color(0xFFC4704E);
  static const Color saffron = Color(0xFFE8A849);
  static const Color olive = Color(0xFF6B7D5E);
  static const Color paprika = Color(0xFF8B2E1C);
  static const Color butterscotch = Color(0xFFD4A760);
  static const Color rosemary = Color(0xFF3D5A3A);
  static const Color warmLinen = Color(0xFFF5E6D0);
  static const Color cinnamonDust = Color(0xFFAA7B5B);
  static const Color charredAmber = Color(0xFF3A2218);
  static const Color freshMint = Color(0xFF7FBDA0);
  static const Color cranberry = Color(0xFFC1292E);

  // Legacy aliases for backward compat
  static const Color onyx = espresso;
  static const Color copper = terracotta;
  static const Color parchment = cream;
  static const Color goldLeaf = saffron;
  static const Color accentSage = olive;
  static const Color bordeaux = paprika;
  static const Color deepWood = darkWalnut;
  static const Color charcoalSmoke = Color(0xFF1C1816);
  static const Color crimsonFlambe = cranberry;
  static const Color emeraldBraise = rosemary;
  static const Color cinnamonHaze = cinnamonDust;
  static const Color lavenderFrost = Color(0xFF9B8EC0);

  // ─── Decorations ───
  static BoxDecoration glassDecoration(BuildContext context) {
    return BoxDecoration(
      color: darkWalnut.withValues(alpha: 0.6),
      borderRadius: BorderRadius.circular(28),
      border: Border.all(color: saffron.withValues(alpha: 0.08), width: 0.5),
      boxShadow: [
        BoxShadow(
          color: Colors.black.withValues(alpha: 0.35),
          blurRadius: 40,
          offset: const Offset(0, 16),
        ),
      ],
    );
  }

  static BoxDecoration warmCardDecoration({
    Color? glowColor,
    double borderRadius = 24,
  }) {
    return BoxDecoration(
      color: darkWalnut.withValues(alpha: 0.5),
      borderRadius: BorderRadius.circular(borderRadius),
      border: Border.all(
        color: (glowColor ?? saffron).withValues(alpha: 0.1),
        width: 0.5,
      ),
      boxShadow: [
        BoxShadow(
          color: (glowColor ?? terracotta).withValues(alpha: 0.06),
          blurRadius: 30,
          offset: const Offset(0, 12),
        ),
      ],
    );
  }

  // ─── Gradients ───
  static LinearGradient get paprikaGradient => const LinearGradient(
        colors: [paprika, Color(0xFF5C1A12)],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      );

  static LinearGradient get warmSurfaceGradient => const LinearGradient(
        colors: [espresso, darkWalnut],
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
      );

  static LinearGradient get terracottaShimmer => const LinearGradient(
        colors: [Color(0xFFC4704E), Color(0xFFE8A849), Color(0xFFC4704E)],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      );

  static LinearGradient get kitchenWarmth => LinearGradient(
        colors: [
          espresso,
          darkWalnut.withValues(alpha: 0.95),
          espresso,
        ],
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
      );

  // ─── Theme Data ───
  static ThemeData get dark {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: espresso,
      colorScheme: const ColorScheme.dark(
        primary: terracotta,
        secondary: olive,
        surface: Color(0xFF211916),
        onSurface: cream,
      ),
      textTheme: GoogleFonts.interTextTheme().copyWith(
        displayLarge: GoogleFonts.playfairDisplay(
          color: cream,
          fontWeight: FontWeight.w800,
          letterSpacing: -1,
        ),
        displayMedium: GoogleFonts.cormorantGaramond(
          color: terracotta,
          fontWeight: FontWeight.w700,
          fontSize: 28,
        ),
        titleLarge: GoogleFonts.playfairDisplay(
          color: cream,
          fontWeight: FontWeight.w700,
        ),
        bodyMedium: GoogleFonts.inter(color: cream.withValues(alpha: 0.8)),
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: charredAmber,
        indicatorColor: terracotta.withValues(alpha: 0.15),
        labelTextStyle: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return GoogleFonts.inter(
              fontSize: 10,
              fontWeight: FontWeight.w800,
              letterSpacing: 1,
              color: saffron,
            );
          }
          return GoogleFonts.inter(
            fontSize: 10,
            fontWeight: FontWeight.w600,
            letterSpacing: 1,
            color: cream.withValues(alpha: 0.3),
          );
        }),
      ),
    );
  }
}

// Keep backward compat alias
typedef GourmetTheme = CuisineTheme;
