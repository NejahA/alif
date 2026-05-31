import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class StarlightTheme {
  static const Color deepVoid = Color(0xFF020205);
  static const Color stellarBlue = Color(0xFF00E5FF);
  static const Color nebulaPink = Color(0xFFFF00D4);
  static const Color stardust = Color(0xFFE0E0E0);
  static const Color glowGold = Color(0xFFFFD700);
  
  // Cyberpunk / Hacker Colors
  static const Color cyberAmber = Color(0xFFFFB300);
  static const Color cyberGreen = Color(0xFF00FF41);

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

  static ThemeData hackerTheme = darkTheme.copyWith(
    primaryColor: cyberGreen,
    hintColor: cyberAmber,
    colorScheme: const ColorScheme.dark(
      primary: cyberGreen,
      secondary: cyberAmber,
      surface: Color(0xFF050510),
    ),
  );

  static const Color featureCyan = Color(0xFF00FFF2);
  static const Color bugfixAmber = Color(0xFFFFAB40);
  static const Color hotfixRed = Color(0xFFFF5252);
  static const Color stableIndigo = Color(0xFF536DFE);

  static Color getBranchColor(String branch) {
    final b = branch.toLowerCase();
    if (b.startsWith('feat/') || b.startsWith('feature/')) return featureCyan;
    if (b.startsWith('fix/') || b.startsWith('bugfix/')) return bugfixAmber;
    if (b.startsWith('hotfix/')) return hotfixRed;
    return stellarBlue;
  }

  static const Map<String, Color> techColors = {
    'flutter': Color(0xFF40D0FB),
    'rust': Color(0xFFDEA584),
    'js': Color(0xFFF7DF1E),
    'python': Color(0xFF3776AB),
    'go': Color(0xFF00ADD8),
    'cpp': Color(0xFF00599C),
    'ts': Color(0xFF3178C6),
    'react': Color(0xFF61DAFB),
  };

  static Color getTechColor(String? intent) {
    if (intent == null) return stellarBlue;
    final lower = intent.toLowerCase();
    for (final tag in techColors.keys) {
      if (lower.contains(tag)) return techColors[tag]!;
    }
    return stellarBlue;
  }

  static BoxDecoration glassDecoration = BoxDecoration(
    color: Colors.white.withOpacity(0.03),
    borderRadius: BorderRadius.circular(24),
    border: Border.all(
      color: Colors.white.withOpacity(0.08),
      width: 1.5,
    ),
  );
}
