import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'game/game_state.dart';
import 'game/game_canvas.dart';
import 'ui/main_menu.dart';
import 'ui/hangar_screen.dart';
import 'ui/hud_overlay.dart';
import 'ui/upgrade_modal.dart';
import 'ui/game_over_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const ChronoDriftApp());
}

class ChronoDriftApp extends StatelessWidget {
  const ChronoDriftApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Chrono-Drift: Temporal Roguelite',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF030712),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF00E5FF),
          secondary: Color(0xFFD500F9),
          surface: Color(0xFF0F172A),
        ),
      ),
      home: const ChronoDriftHome(),
    );
  }
}

class ChronoDriftHome extends StatefulWidget {
  const ChronoDriftHome({super.key});

  @override
  State<ChronoDriftHome> createState() => _ChronoDriftHomeState();
}

class _ChronoDriftHomeState extends State<ChronoDriftHome> {
  final GameState gameState = GameState();
  final FocusNode _keyboardFocusNode = FocusNode();
  bool _inHangar = false;

  // Set of pressed keys for smooth keyboard input
  final Set<LogicalKeyboardKey> _pressedKeys = {};

  @override
  void initState() {
    super.initState();
    gameState.addListener(_onGameStateChanged);
  }

  void _onGameStateChanged() {
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    gameState.removeListener(_onGameStateChanged);
    _keyboardFocusNode.dispose();
    super.dispose();
  }

  void _startRun(BuildContext context) {
    final size = MediaQuery.of(context).size;
    gameState.startNewGame(gameState.selectedChassis, size);
    _keyboardFocusNode.requestFocus();
  }

  void _handleKeyEvent(KeyEvent event) {
    if (event is KeyDownEvent) {
      _pressedKeys.add(event.logicalKey);

      // Trigger Rewind on Spacebar
      if (event.logicalKey == LogicalKeyboardKey.space) {
        gameState.triggerRewind();
      }

      // Trigger Dash on Shift or K
      if (event.logicalKey == LogicalKeyboardKey.shiftLeft ||
          event.logicalKey == LogicalKeyboardKey.shiftRight ||
          event.logicalKey == LogicalKeyboardKey.keyK) {
        gameState.triggerDash();
      }

      // Pause toggle on P or Esc
      if (event.logicalKey == LogicalKeyboardKey.keyP || event.logicalKey == LogicalKeyboardKey.escape) {
        if (gameState.status == GameStatus.playing) {
          gameState.pauseGame();
        } else if (gameState.status == GameStatus.paused) {
          gameState.resumeGame();
        }
      }
    } else if (event is KeyUpEvent) {
      _pressedKeys.remove(event.logicalKey);
    }

    _updateKeyboardMovement();
  }

  void _updateKeyboardMovement() {
    double dx = 0.0;
    double dy = 0.0;

    if (_pressedKeys.contains(LogicalKeyboardKey.keyW) || _pressedKeys.contains(LogicalKeyboardKey.arrowUp)) {
      dy -= 1.0;
    }
    if (_pressedKeys.contains(LogicalKeyboardKey.keyS) || _pressedKeys.contains(LogicalKeyboardKey.arrowDown)) {
      dy += 1.0;
    }
    if (_pressedKeys.contains(LogicalKeyboardKey.keyA) || _pressedKeys.contains(LogicalKeyboardKey.arrowLeft)) {
      dx -= 1.0;
    }
    if (_pressedKeys.contains(LogicalKeyboardKey.keyD) || _pressedKeys.contains(LogicalKeyboardKey.arrowRight)) {
      dx += 1.0;
    }

    // Only override if keyboard movement keys are engaged
    if (dx != 0.0 || dy != 0.0) {
      gameState.moveInput = Offset(dx, dy);
    } else if (_pressedKeys.isEmpty) {
      // Don't zero out if virtual stick is being used, only if keys were released
    }
  }

  @override
  Widget build(BuildContext context) {
    // 1. Hangar Screen
    if (_inHangar) {
      return HangarScreen(
        gameState: gameState,
        onBack: () => setState(() => _inHangar = false),
      );
    }

    // 2. Main Menu
    if (gameState.status == GameStatus.menu) {
      return MainMenuScreen(
        gameState: gameState,
        onStartGame: () => _startRun(context),
        onOpenHangar: () => setState(() => _inHangar = true),
      );
    }

    // 3. In-Game State
    return KeyboardListener(
      focusNode: _keyboardFocusNode,
      autofocus: true,
      onKeyEvent: _handleKeyEvent,
      child: Scaffold(
        body: Stack(
          children: [
            // Active 60+ FPS Game Canvas
            GameCanvasWidget(
              key: ValueKey('canvas_${gameState.selectedChassis.id}_${gameState.stats.score}'),
              gameState: gameState,
            ),

            // Top Status HUD, Phase Dash, and Rewind Buttons
            HudOverlay(
              gameState: gameState,
              onPause: () => gameState.pauseGame(),
              onRewind: () => gameState.triggerRewind(),
              onDash: () => gameState.triggerDash(),
            ),

            // Pause Overlay
            if (gameState.status == GameStatus.paused)
              Container(
                color: Colors.black87,
                child: Center(
                  child: Container(
                    padding: const EdgeInsets.all(28),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F172A),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFF00E5FF)),
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Text(
                          'SIMULATION PAUSED',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 20,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 2.0,
                          ),
                        ),
                        const SizedBox(height: 20),
                        ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF00E5FF),
                            foregroundColor: Colors.black,
                            minimumSize: const Size(180, 46),
                          ),
                          onPressed: () => gameState.resumeGame(),
                          child: const Text('RESUME RUN', style: TextStyle(fontWeight: FontWeight.bold)),
                        ),
                        const SizedBox(height: 10),
                        OutlinedButton(
                          style: OutlinedButton.styleFrom(
                            foregroundColor: Colors.white70,
                            side: const BorderSide(color: Colors.white24),
                            minimumSize: const Size(180, 46),
                          ),
                          onPressed: () => gameState.exitToMenu(),
                          child: const Text('ABORT TO MENU'),
                        ),
                      ],
                    ),
                  ),
                ),
              ),

            // Level-Up Upgrade Selection Modal
            if (gameState.status == GameStatus.upgrading)
              UpgradeModal(
                upgrades: gameState.upgradeOptions,
                onSelected: (upgrade) {
                  gameState.selectUpgrade(upgrade);
                  _keyboardFocusNode.requestFocus();
                },
              ),

            // Game Over Debrief Screen
            if (gameState.status == GameStatus.gameOver)
              GameOverScreen(
                gameState: gameState,
                onRestart: () => _startRun(context),
                onHangar: () {
                  gameState.exitToMenu();
                  setState(() => _inHangar = true);
                },
              ),
          ],
        ),
      ),
    );
  }
}
