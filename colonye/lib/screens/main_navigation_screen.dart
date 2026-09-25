import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import 'orbital_dashboard_screen.dart';
import 'soundscape_sanctuary_screen.dart';
import 'frequency_synth_screen.dart';
import 'mindweaver_journal_screen.dart';
import 'sacred_breathwork_screen.dart';
import 'cosmic_oracle_screen.dart';
import 'focus_portal_screen.dart';
import 'colony_resonance_screen.dart';
import 'constellation_milestones_screen.dart';

class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    OrbitalDashboardScreen(),
    SoundscapeSanctuaryScreen(),
    FrequencySynthScreen(),
    CosmicOracleScreen(),
    FocusPortalScreen(),
    ColonyResonanceScreen(),
    MindweaverJournalScreen(),
    SacredBreathworkScreen(),
    ConstellationMilestonesScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: AppTheme.voidBlack.withOpacity(0.92),
          border: const Border(
            top: BorderSide(color: AppTheme.glassBorder, width: 1.0),
          ),
          boxShadow: [
            BoxShadow(
              color: AppTheme.nebulaViolet.withOpacity(0.12),
              blurRadius: 20,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (index) => setState(() => _currentIndex = index),
          backgroundColor: Colors.transparent,
          elevation: 0,
          type: BottomNavigationBarType.fixed,
          selectedItemColor: AppTheme.quantumCyan,
          unselectedItemColor: AppTheme.textSecondary,
          selectedFontSize: 8,
          unselectedFontSize: 8,
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.blur_on_rounded),
              activeIcon: Icon(Icons.blur_on_rounded, color: AppTheme.quantumCyan),
              label: 'Orbits',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.graphic_eq_rounded),
              activeIcon: Icon(Icons.graphic_eq_rounded, color: AppTheme.quantumCyan),
              label: 'Sanctuary',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.waves_rounded),
              activeIcon: Icon(Icons.waves_rounded, color: AppTheme.quantumCyan),
              label: 'Synth',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.auto_awesome_rounded),
              activeIcon: Icon(Icons.auto_awesome_rounded, color: AppTheme.quantumCyan),
              label: 'Oracle',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.timer_rounded),
              activeIcon: Icon(Icons.timer_rounded, color: AppTheme.quantumCyan),
              label: 'Focus',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.group_work_rounded),
              activeIcon: Icon(Icons.group_work_rounded, color: AppTheme.quantumCyan),
              label: 'Tribe',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.auto_stories_rounded),
              activeIcon: Icon(Icons.auto_stories_rounded, color: AppTheme.quantumCyan),
              label: 'Journal',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.air_rounded),
              activeIcon: Icon(Icons.air_rounded, color: AppTheme.quantumCyan),
              label: 'Breathwork',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.brightness_7_rounded),
              activeIcon: Icon(Icons.brightness_7_rounded, color: AppTheme.quantumCyan),
              label: 'Galaxy',
            ),
          ],
        ),
      ),
    );
  }
}
