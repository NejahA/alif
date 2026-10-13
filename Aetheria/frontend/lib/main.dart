import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'models/models.dart';
import 'services/api_service.dart';
import 'screens/skillforge_screen.dart';
import 'screens/cyberlounge_screen.dart';
import 'screens/synesthesia_screen.dart';
import 'screens/chronoverse_screen.dart';
import 'screens/leaderboard_screen.dart';
import 'screens/constellations_screen.dart';
import 'screens/alchemy_screen.dart';
import 'screens/achievements_screen.dart';
import 'screens/minigame_screen.dart';
import 'screens/pet_screen.dart';
import 'screens/guilds_screen.dart';

void main() {
  runApp(const AetheriaApp());
}

class AppThemeData {
  final String name;
  final Color primary;
  final Color secondary;
  final Color surface;
  final Color background;

  const AppThemeData({
    required this.name,
    required this.primary,
    required this.secondary,
    required this.surface,
    required this.background,
  });
}

class AetheriaApp extends StatefulWidget {
  const AetheriaApp({super.key});

  @override
  State<AetheriaApp> createState() => _AetheriaAppState();
}

class _AetheriaAppState extends State<AetheriaApp> {
  static const List<AppThemeData> themes = [
    AppThemeData(
      name: 'Cyber Neon',
      primary: Color(0xFF00F5FF),
      secondary: Color(0xFFFF007F),
      surface: Color(0xFF161B22),
      background: Color(0xFF0D1117),
    ),
    AppThemeData(
      name: 'Solar Flare',
      primary: Color(0xFFFFB800),
      secondary: Color(0xFFFF3300),
      surface: Color(0xFF1E1710),
      background: Color(0xFF120E0A),
    ),
    AppThemeData(
      name: 'Emerald Matrix',
      primary: Color(0xFF00FF66),
      secondary: Color(0xFF00E5FF),
      surface: Color(0xFF0F1F17),
      background: Color(0xFF0A140E),
    ),
    AppThemeData(
      name: 'Void Realm',
      primary: Color(0xFF9D00FF),
      secondary: Color(0xFF00F5FF),
      surface: Color(0xFF1A0F29),
      background: Color(0xFF10081A),
    ),
  ];

  AppThemeData currentTheme = themes[0];

  void _changeTheme(AppThemeData newTheme) {
    setState(() {
      currentTheme = newTheme;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Aetheria',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: currentTheme.background,
        primaryColor: currentTheme.primary,
        colorScheme: ColorScheme.dark(
          primary: currentTheme.primary,
          secondary: currentTheme.secondary,
          surface: currentTheme.surface,
        ),
        textTheme: GoogleFonts.outfitTextTheme(ThemeData.dark().textTheme),
      ),
      home: MainMultiverseShell(
        currentTheme: currentTheme,
        themes: themes,
        onThemeChanged: _changeTheme,
      ),
    );
  }
}

class MainMultiverseShell extends StatefulWidget {
  final AppThemeData currentTheme;
  final List<AppThemeData> themes;
  final ValueChanged<AppThemeData> onThemeChanged;

  const MainMultiverseShell({
    super.key,
    required this.currentTheme,
    required this.themes,
    required this.onThemeChanged,
  });

  @override
  State<MainMultiverseShell> createState() => _MainMultiverseShellState();
}

class _MainMultiverseShellState extends State<MainMultiverseShell> {
  int currentIndex = 0;
  UserProfile? profile;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  void _loadProfile() async {
    final p = await ApiService.fetchProfile();
    if (!mounted) return;
    setState(() {
      profile = p;
    });
  }

  void _showOracleDialog() async {
    final wisdom = await ApiService.fetchOracleVibe();
    if (!mounted) return;

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: widget.currentTheme.surface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
          side: BorderSide(color: widget.currentTheme.primary, width: 1.5),
        ),
        title: Row(
          children: [
            Icon(Icons.auto_awesome, color: widget.currentTheme.primary, size: 28),
            const SizedBox(width: 10),
            Text(
              'Aether Orb Oracle',
              style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.bold),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: widget.currentTheme.primary.withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                '🔮 ${wisdom?['title'] ?? 'Harmonic Resonance'}',
                style: GoogleFonts.outfit(color: widget.currentTheme.primary, fontWeight: FontWeight.bold, fontSize: 13),
              ),
            ),
            const SizedBox(height: 12),
            Text(
              wisdom?['text'] ?? 'Your focus energy is in alignment today. Pursue your highest creative quest.',
              style: GoogleFonts.outfit(color: Colors.white70, fontSize: 14),
            ),
            const SizedBox(height: 16),
            Text(
              'Recommended Focus: +15 ${wisdom?['Stat'] ?? 'Focus'} XP Boost Active',
              style: GoogleFonts.outfit(color: widget.currentTheme.secondary, fontSize: 12, fontWeight: FontWeight.bold),
            ),
          ],
        ),
        actions: [
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: widget.currentTheme.primary),
            onPressed: () => Navigator.pop(ctx),
            child: Text('Attune Vibe', style: GoogleFonts.outfit(color: Colors.black, fontWeight: FontWeight.bold)),
          )
        ],
      ),
    );
  }

  void _showArcanaCardDraw() async {
    final card = await ApiService.fetchArcanaCard();
    if (!mounted) return;

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: widget.currentTheme.surface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
          side: const BorderSide(color: Color(0xFFFFB800), width: 2),
        ),
        title: Text(
          '📜 Daily Aether Arcana Draw',
          textAlign: TextAlign.center,
          style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(card?['icon'] ?? '📜', style: const TextStyle(fontSize: 48)),
            const SizedBox(height: 8),
            Text(
              card?['name'] ?? 'The Synthesizer',
              style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.bold, color: const Color(0xFFFFB800)),
            ),
            const SizedBox(height: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFFFFB800).withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                'Buff: ${card?['buff'] ?? '+20% XP'}',
                style: GoogleFonts.outfit(color: const Color(0xFFFFB800), fontWeight: FontWeight.bold, fontSize: 12),
              ),
            ),
            const SizedBox(height: 12),
            Text(
              card?['lore'] ?? 'Master of resonant frequencies.',
              textAlign: TextAlign.center,
              style: GoogleFonts.outfit(color: Colors.white70, fontSize: 13),
            ),
          ],
        ),
        actions: [
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFFFB800)),
            onPressed: () => Navigator.pop(ctx),
            child: Text('Claim Lore Buff', style: GoogleFonts.outfit(color: Colors.black, fontWeight: FontWeight.bold)),
          )
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final screens = [
      SkillForgeScreen(profile: profile, onProfileUpdated: _loadProfile),
      const CyberLoungeScreen(),
      const SynesthesiaScreen(),
      ChronoVerseScreen(profile: profile),
      PetScreen(onPetUpdated: _loadProfile),
      const GuildsScreen(),
      const ConstellationsScreen(),
      AlchemyScreen(onTransmuted: _loadProfile),
      const AchievementsScreen(),
      MiniGameScreen(onScoreSubmitted: _loadProfile),
      const LeaderboardScreen(),
    ];

    return Scaffold(
      appBar: AppBar(
        backgroundColor: widget.currentTheme.surface,
        elevation: 0,
        title: Row(
          children: [
            GestureDetector(
              onTap: _showOracleDialog,
              child: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: LinearGradient(
                    colors: [widget.currentTheme.primary, widget.currentTheme.secondary],
                  ),
                ),
                child: const Icon(Icons.auto_awesome, color: Colors.black, size: 20),
              ),
            ),
            const SizedBox(width: 12),
            Text(
              'AETHERIA',
              style: GoogleFonts.outfit(
                fontSize: 20,
                fontWeight: FontWeight.w900,
                letterSpacing: 2,
                color: Colors.white,
              ),
            ),
          ],
        ),
        actions: [
          // Arcana Draw Button
          IconButton(
            icon: const Icon(Icons.style, color: Color(0xFFFFB800)),
            tooltip: 'Daily Arcana Draw',
            onPressed: _showArcanaCardDraw,
          ),
          // Theme Switcher Menu
          PopupMenuButton<AppThemeData>(
            icon: Icon(Icons.palette, color: widget.currentTheme.primary),
            onSelected: widget.onThemeChanged,
            color: widget.currentTheme.surface,
            itemBuilder: (ctx) => widget.themes.map((t) {
              return PopupMenuItem(
                value: t,
                child: Row(
                  children: [
                    CircleAvatar(radius: 6, backgroundColor: t.primary),
                    const SizedBox(width: 8),
                    Text(t.name, style: GoogleFonts.outfit(color: Colors.white)),
                  ],
                ),
              );
            }).toList(),
          ),
          Container(
            margin: const EdgeInsets.only(right: 16),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: widget.currentTheme.primary.withValues(alpha: 0.3)),
            ),
            child: Row(
              children: [
                const Icon(Icons.star, color: Color(0xFFFFB800), size: 16),
                const SizedBox(width: 6),
                Text(
                  'LVL ${profile?.level ?? 1}',
                  style: GoogleFonts.outfit(
                    color: widget.currentTheme.primary,
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          )
        ],
      ),
      body: IndexedStack(
        index: currentIndex,
        children: screens,
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: widget.currentTheme.surface,
          border: Border(top: BorderSide(color: Colors.white.withValues(alpha: 0.08))),
        ),
        child: BottomNavigationBar(
          currentIndex: currentIndex,
          onTap: (idx) => setState(() => currentIndex = idx),
          type: BottomNavigationBarType.fixed,
          backgroundColor: Colors.transparent,
          elevation: 0,
          selectedItemColor: widget.currentTheme.primary,
          unselectedItemColor: Colors.white38,
          selectedLabelStyle: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 9),
          unselectedLabelStyle: GoogleFonts.outfit(fontSize: 8),
          items: [
            const BottomNavigationBarItem(
              icon: Icon(Icons.shield_outlined),
              activeIcon: Icon(Icons.shield),
              label: 'SkillForge',
            ),
            const BottomNavigationBarItem(
              icon: Icon(Icons.radio_outlined),
              activeIcon: Icon(Icons.radio),
              label: 'CyberLounge',
            ),
            const BottomNavigationBarItem(
              icon: Icon(Icons.gesture_outlined),
              activeIcon: Icon(Icons.gesture),
              label: 'Synesthesia',
            ),
            const BottomNavigationBarItem(
              icon: Icon(Icons.hourglass_empty),
              activeIcon: Icon(Icons.hourglass_full),
              label: 'Vault',
            ),
            const BottomNavigationBarItem(
              icon: Icon(Icons.pets_outlined),
              activeIcon: Icon(Icons.pets),
              label: 'Pet',
            ),
            const BottomNavigationBarItem(
              icon: Icon(Icons.groups_outlined),
              activeIcon: Icon(Icons.groups),
              label: 'Guilds',
            ),
            const BottomNavigationBarItem(
              icon: Icon(Icons.auto_graph_outlined),
              activeIcon: Icon(Icons.auto_graph),
              label: 'Stars',
            ),
            const BottomNavigationBarItem(
              icon: Icon(Icons.science_outlined),
              activeIcon: Icon(Icons.science),
              label: 'Alchemy',
            ),
            const BottomNavigationBarItem(
              icon: Icon(Icons.military_tech_outlined),
              activeIcon: Icon(Icons.military_tech),
              label: 'Trophies',
            ),
            const BottomNavigationBarItem(
              icon: Icon(Icons.videogame_asset_outlined),
              activeIcon: Icon(Icons.videogame_asset),
              label: 'Arcade',
            ),
            const BottomNavigationBarItem(
              icon: Icon(Icons.emoji_events_outlined),
              activeIcon: Icon(Icons.emoji_events),
              label: 'Ranks',
            ),
          ],
        ),
      ),
    );
  }
}
