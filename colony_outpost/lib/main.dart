import 'package:flutter/material.dart';
import 'theme/colony_theme.dart';
import 'state/colony_state.dart';
import 'widgets/ambient/starfield_background.dart';
import 'widgets/hud/top_hud_bar.dart';
import 'widgets/grid/colony_grid_view.dart';
import 'widgets/views/tech_tree_view.dart';
import 'widgets/views/orbital_trade_view.dart';
import 'widgets/views/directives_view.dart';
import 'widgets/views/colony_log_view.dart';
import 'widgets/modals/crisis_dialog.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const ColonyApp());
}

class ColonyApp extends StatelessWidget {
  const ColonyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Aethelgard Prime: Colony Outpost',
      debugShowCheckedModeBanner: false,
      theme: ColonyTheme.darkTheme,
      home: const ColonyMainScreen(),
    );
  }
}

class ColonyMainScreen extends StatefulWidget {
  const ColonyMainScreen({super.key});

  @override
  State<ColonyMainScreen> createState() => _ColonyMainScreenState();
}

class _ColonyMainScreenState extends State<ColonyMainScreen> {
  late final ColonyState _state;
  int _currentTabIndex = 0;
  bool _crisisModalShowing = false;

  @override
  void initState() {
    super.initState();
    _state = ColonyState();
    _state.addListener(_checkCrisisTrigger);
  }

  void _checkCrisisTrigger() {
    if (_state.activeCrisis != null && !_crisisModalShowing && mounted) {
      _crisisModalShowing = true;
      WidgetsBinding.instance.addPostFrameCallback((_) async {
        if (!mounted || _state.activeCrisis == null) {
          _crisisModalShowing = false;
          return;
        }
        await showDialog(
          context: context,
          barrierDismissible: false,
          builder: (_) => CrisisDialog(
            state: _state,
            crisis: _state.activeCrisis!,
          ),
        );
        _crisisModalShowing = false;
      });
    }
  }

  @override
  void dispose() {
    _state.removeListener(_checkCrisisTrigger);
    _state.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: _state,
      builder: (context, _) {
        return Scaffold(
          body: StarfieldBackground(
            isNight: _state.isNight,
            child: Column(
              children: [
                // Top HUD telemetry
                TopHudBar(state: _state),

                // Active Tab Content
                Expanded(
                  child: IndexedStack(
                    index: _currentTabIndex,
                    children: [
                      ColonyGridView(state: _state),
                      TechTreeView(state: _state),
                      OrbitalTradeView(state: _state),
                      DirectivesView(state: _state),
                      ColonyLogView(state: _state),
                    ],
                  ),
                ),
              ],
            ),
          ),
          bottomNavigationBar: _buildBottomNav(),
        );
      },
    );
  }

  Widget _buildBottomNav() {
    return Container(
      decoration: const BoxDecoration(
        color: ColonyTheme.darkSlate,
        border: Border(
          top: BorderSide(color: ColonyTheme.borderGlow, width: 1.5),
        ),
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 4),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildNavItem(0, Icons.grid_view_rounded, 'SECTORS'),
              _buildNavItem(1, Icons.account_tree_outlined, 'RESEARCH'),
              _buildNavItem(2, Icons.rocket_launch_outlined, 'TRADE'),
              _buildNavItem(3, Icons.tune_rounded, 'DIRECTIVES'),
              _buildNavItem(4, Icons.terminal_rounded, 'COMMS'),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(int index, IconData icon, String label) {
    final bool isSelected = _currentTabIndex == index;
    final color = isSelected ? ColonyTheme.neonCyan : ColonyTheme.textMuted;

    return InkWell(
      onTap: () {
        setState(() {
          _currentTabIndex = index;
        });
      },
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? ColonyTheme.neonCyan.withValues(alpha: 0.12) : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
          border: isSelected ? Border.all(color: ColonyTheme.neonCyan.withValues(alpha: 0.4)) : null,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 20, color: color),
            const SizedBox(height: 2),
            Text(
              label,
              style: TextStyle(
                fontSize: 9,
                fontWeight: isSelected ? FontWeight.w900 : FontWeight.bold,
                letterSpacing: 0.8,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
