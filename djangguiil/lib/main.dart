import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'screens/altar_screen.dart';
import 'screens/bestiary_screen.dart';
import 'screens/home_screen.dart';
import 'screens/soundscape_screen.dart';
import 'services/jungle_state.dart';
import 'theme/jungle_theme.dart';
import 'widgets/jungle_particle_canvas.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: JungleColors.abyss,
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );
  runApp(const JungleOdysseyApp());
}

class JungleOdysseyApp extends StatefulWidget {
  const JungleOdysseyApp({super.key});

  @override
  State<JungleOdysseyApp> createState() => _JungleOdysseyAppState();
}

class _JungleOdysseyAppState extends State<JungleOdysseyApp> {
  final JungleState _jungleState = JungleState();

  @override
  void dispose() {
    _jungleState.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'DJANGGUIIL',
      debugShowCheckedModeBanner: false,
      theme: JungleTheme.darkTheme,
      home: JungleMainScaffold(state: _jungleState),
    );
  }
}

class JungleMainScaffold extends StatefulWidget {
  final JungleState state;

  const JungleMainScaffold({
    super.key,
    required this.state,
  });

  @override
  State<JungleMainScaffold> createState() => _JungleMainScaffoldState();
}

class _JungleMainScaffoldState extends State<JungleMainScaffold> {
  int _currentIndex = 0;

  void _navigateToTab(int index) {
    setState(() {
      _currentIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: widget.state,
      builder: (context, _) {
        final screens = [
          HomeScreen(
            state: widget.state,
            onNavigateToSoundscape: () => _navigateToTab(2),
            onNavigateToAltar: () => _navigateToTab(3),
            onNavigateToBestiary: () => _navigateToTab(1),
          ),
          BestiaryScreen(state: widget.state),
          SoundscapeScreen(state: widget.state),
          AltarScreen(state: widget.state),
        ];

        return Scaffold(
          backgroundColor: JungleColors.abyss,
          body: Stack(
            children: [
              // Interactive background particle canvas (fireflies, mist, raindrops)
              Positioned.fill(
                child: JungleParticleCanvas(
                  atmosphere: widget.state.atmosphere,
                ),
              ),

              // Screen content
              SafeArea(
                bottom: false,
                child: IndexedStack(
                  index: _currentIndex,
                  children: screens,
                ),
              ),

              // Frosted Glass Bottom Navigation Bar
              Positioned(
                left: 16,
                right: 16,
                bottom: 16,
                child: _buildBottomNav(context),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildBottomNav(BuildContext context) {
    final navItems = [
      {'label': 'Sanctuary', 'icon': Icons.forest_rounded},
      {'label': 'Bestiary', 'icon': Icons.menu_book_rounded},
      {'label': 'Soundscape', 'icon': Icons.graphic_eq_rounded},
      {'label': 'Stone Altar', 'icon': Icons.self_improvement_rounded},
    ];

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
      decoration: BoxDecoration(
        color: JungleColors.deepCanopy.withOpacity(0.90),
        borderRadius: BorderRadius.circular(26),
        border: Border.all(
          color: JungleColors.foliageBorder.withOpacity(0.8),
          width: 1.2,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.55),
            blurRadius: 25,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: List.generate(navItems.length, (index) {
          final item = navItems[index];
          final isSelected = _currentIndex == index;

          return GestureDetector(
            onTap: () {
              widget.state.triggerBirdChirp();
              _navigateToTab(index);
            },
            behavior: HitTestBehavior.opaque,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 250),
              curve: Curves.easeOutCubic,
              padding: EdgeInsets.symmetric(
                horizontal: isSelected ? 16 : 12,
                vertical: 8,
              ),
              decoration: BoxDecoration(
                color: isSelected
                    ? JungleColors.emerald.withOpacity(0.2)
                    : Colors.transparent,
                borderRadius: BorderRadius.circular(18),
                border: isSelected
                    ? Border.all(
                        color: JungleColors.neonJade.withOpacity(0.4),
                        width: 1,
                      )
                    : null,
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    item['icon'] as IconData,
                    color: isSelected
                        ? JungleColors.neonJade
                        : JungleColors.textSubtle,
                    size: 22,
                  ),
                  if (isSelected) ...[
                    const SizedBox(width: 8),
                    Text(
                      item['label'] as String,
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: JungleColors.textPrimary,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ],
                ],
              ),
            ),
          );
        }),
      ),
    );
  }
}
