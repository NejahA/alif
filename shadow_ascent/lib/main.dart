import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'game/game_state.dart';
import 'game/game_canvas.dart';
import 'ui/main_menu.dart';
import 'ui/hud_overlay.dart';
import 'ui/game_over_dialog.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);
  runApp(const ShadowAscentApp());
}

class ShadowAscentApp extends StatefulWidget {
  const ShadowAscentApp({super.key});

  @override
  State<ShadowAscentApp> createState() => _ShadowAscentAppState();
}

class _ShadowAscentAppState extends State<ShadowAscentApp> {
  final GameStateNotifier gameState = GameStateNotifier();
  bool isPlaying = false;

  @override
  void initState() {
    super.initState();
    gameState.addListener(() {
      if (mounted) setState(() {});
    });
  }

  void _startGame(GameMode mode) {
    gameState.startNewGame(mode);
    setState(() {
      isPlaying = true;
    });
  }

  void _exitToMenu() {
    setState(() {
      isPlaying = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Shadow Tactics: Ninja Ascent',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF030712),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF38BDF8),
          secondary: Color(0xFFF59E0B),
        ),
      ),
      home: Scaffold(
        body: !isPlaying
            ? MainMenuScreen(
                gameState: gameState,
                onStartGame: _startGame,
              )
            : Stack(
                children: [
                  // Game Rendering Engine
                  GameCanvasWidget(
                    key: ValueKey('${gameState.selectedMode}_${DateTime.now().millisecondsSinceEpoch}'),
                    gameState: gameState,
                  ),

                  // Top Status HUD
                  HudOverlay(
                    gameState: gameState,
                    onPause: () {
                      setState(() {
                        gameState.isPaused = !gameState.isPaused;
                      });
                    },
                  ),

                  // Pause Menu Overlay
                  if (gameState.isPaused)
                    Container(
                      color: Colors.black70,
                      child: Center(
                        child: Container(
                          padding: const EdgeInsets.all(24),
                          decoration: BoxDecoration(
                            color: const Color(0xFF0F172A),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: const Color(0xFF38BDF8)),
                          ),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Text(
                                'GAME PAUSED',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 24,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 2,
                                ),
                              ),
                              const SizedBox(height: 20),
                              ElevatedButton(
                                onPressed: () {
                                  setState(() {
                                    gameState.isPaused = false;
                                  });
                                },
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF38BDF8),
                                  minimumSize: const Size(180, 44),
                                ),
                                child: const Text('RESUME', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
                              ),
                              const SizedBox(height: 12),
                              OutlinedButton(
                                onPressed: () {
                                  setState(() {
                                    gameState.isPaused = false;
                                    isPlaying = false;
                                  });
                                },
                                style: OutlinedButton.styleFrom(
                                  side: const BorderSide(color: Colors.white30),
                                  minimumSize: const Size(180, 44),
                                ),
                                child: const Text('EXIT TO MENU', style: TextStyle(color: Colors.white)),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),

                  // Game Over / Victory Modal
                  if (gameState.isGameOver)
                    GameOverDialog(
                      gameState: gameState,
                      onRestart: () {
                        _startGame(gameState.selectedMode);
                      },
                      onMainMenu: _exitToMenu,
                    ),
                ],
              ),
      ),
    );
  }
}
