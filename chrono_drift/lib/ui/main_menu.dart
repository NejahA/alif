import 'package:flutter/material.dart';
import '../game/game_state.dart';

class MainMenuScreen extends StatelessWidget {
  final GameState gameState;
  final VoidCallback onStartGame;
  final VoidCallback onOpenHangar;

  const MainMenuScreen({
    super.key,
    required this.gameState,
    required this.onStartGame,
    required this.onOpenHangar,
  });

  @override
  Widget build(BuildContext context) {
    final chassis = gameState.selectedChassis;

    return Scaffold(
      backgroundColor: const Color(0xFF030712),
      body: Stack(
        children: [
          // Ambient Cyber Grid background
          Positioned.fill(
            child: Opacity(
              opacity: 0.15,
              child: CustomPaint(
                painter: _MenuGridPainter(),
              ),
            ),
          ),

          SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
                child: Container(
                  constraints: const BoxConstraints(maxWidth: 480),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Badge
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 5),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0F172A),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: const Color(0xFF00E5FF).withValues(alpha: 0.5)),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.history_toggle_off_rounded, color: Color(0xFF00E5FF), size: 14),
                            SizedBox(width: 6),
                            Text(
                              'TEMPORAL ACTION ROGUELITE',
                              style: TextStyle(
                                color: Color(0xFF00E5FF),
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 1.5,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 18),

                      // Title
                      Text(
                        'CHRONO\nDRIFT',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 48,
                          fontWeight: FontWeight.w900,
                          height: 0.95,
                          letterSpacing: 4.0,
                          shadows: [
                            Shadow(
                              color: const Color(0xFF00E5FF).withValues(alpha: 0.7),
                              blurRadius: 24,
                            ),
                            Shadow(
                              color: const Color(0xFFD500F9).withValues(alpha: 0.5),
                              blurRadius: 36,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'SECTOR ZERO PROTOCOL',
                        style: TextStyle(
                          color: Colors.white38,
                          fontSize: 12,
                          letterSpacing: 3.0,
                          fontWeight: FontWeight.w600,
                        ),
                      ),

                      const SizedBox(height: 36),

                      // Active Ship Card
                      GestureDetector(
                        onTap: onOpenHangar,
                        child: Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: const Color(0xFF0F172A),
                            borderRadius: BorderRadius.circular(18),
                            border: Border.all(color: chassis.primaryColor.withValues(alpha: 0.4)),
                            boxShadow: [
                              BoxShadow(
                                color: chassis.primaryColor.withValues(alpha: 0.12),
                                blurRadius: 16,
                              ),
                            ],
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 50,
                                height: 50,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: chassis.primaryColor.withValues(alpha: 0.15),
                                  border: Border.all(color: chassis.primaryColor),
                                ),
                                child: Icon(chassis.icon, color: chassis.primaryColor, size: 28),
                              ),
                              const SizedBox(width: 14),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      chassis.name,
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 16,
                                      ),
                                    ),
                                    Text(
                                      chassis.subtitle,
                                      style: TextStyle(
                                        color: chassis.primaryColor,
                                        fontSize: 12,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const Icon(Icons.arrow_forward_ios_rounded, color: Colors.white38, size: 16),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 28),

                      // Launch Game Button
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF00E5FF),
                          foregroundColor: Colors.black,
                          minimumSize: const Size.fromHeight(56),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          elevation: 8,
                          shadowColor: const Color(0xFF00E5FF).withValues(alpha: 0.6),
                        ),
                        onPressed: onStartGame,
                        child: const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.play_arrow_rounded, size: 28),
                            SizedBox(width: 8),
                            Text(
                              'DEPLOY TO RUN',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w900,
                                letterSpacing: 1.5,
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 12),

                      // Vessel Hangar Button
                      OutlinedButton(
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.white,
                          side: const BorderSide(color: Color(0xFF38BDF8), width: 1.5),
                          minimumSize: const Size.fromHeight(50),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        ),
                        onPressed: onOpenHangar,
                        child: const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.warehouse_rounded, size: 20),
                            SizedBox(width: 8),
                            Text(
                              'VESSEL HANGAR & UPGRADES',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 1.0,
                              ),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 12),

                      // How to Play Modal Trigger
                      TextButton.icon(
                        icon: const Icon(Icons.help_outline_rounded, color: Colors.white60, size: 18),
                        label: const Text(
                          'HOW TEMPORAL REWIND WORKS',
                          style: TextStyle(color: Colors.white60, fontSize: 12, letterSpacing: 0.8),
                        ),
                        onPressed: () => _showHowToPlay(context),
                      ),

                      const SizedBox(height: 16),

                      // Bottom Stats & Audio toggles
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.emoji_events_rounded, color: Color(0xFFFFD600), size: 18),
                              const SizedBox(width: 6),
                              Text(
                                'HIGH SCORE: ${gameState.highScore}',
                                style: const TextStyle(
                                  color: Colors.white70,
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  fontFamily: 'monospace',
                                ),
                              ),
                            ],
                          ),
                          Row(
                            children: [
                              const Icon(Icons.diamond_rounded, color: Color(0xFF00E5FF), size: 16),
                              const SizedBox(width: 4),
                              Text(
                                '${gameState.lifetimeCores}',
                                style: const TextStyle(
                                  color: Color(0xFF00E5FF),
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                  fontFamily: 'monospace',
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showHowToPlay(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          backgroundColor: const Color(0xFF0F172A),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
            side: const BorderSide(color: Color(0xFF00E5FF), width: 1.5),
          ),
          title: const Row(
            children: [
              Icon(Icons.auto_stories_rounded, color: Color(0xFF00E5FF)),
              SizedBox(width: 10),
              Text('Tactical Briefing', style: TextStyle(color: Colors.white)),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _briefingStep('1. Kinematics & Weapons', 'Maneuver using the virtual joystick or WASD/Arrow keys. Rapid pulse blasters fire continuously at hostiles.'),
              const SizedBox(height: 12),
              _briefingStep('2. Temporal Rewind & Phase Dash', 'Press REWIND or Spacebar to warp 3 seconds back. Press DASH [Shift/K] to slip through fire at high velocity.'),
              const SizedBox(height: 12),
              _briefingStep('3. Chrono Collapse & Overdrive', 'Phase Dash into an active Echo to trigger a Chrono Collapse EMP detonation and activate high-energy Overdrive blasters!'),
              const SizedBox(height: 12),
              _briefingStep('4. Chrono-Cores & Upgrades', 'Collect glowing cores to level up and install Prism Splitters, Paradox Shockwaves, and Twin Echoes.'),
            ],
          ),
          actions: [
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00E5FF), foregroundColor: Colors.black),
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text('ENGAGE', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        );
      },
    );
  }

  Widget _briefingStep(String title, String desc) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: const TextStyle(color: Color(0xFF00E5FF), fontWeight: FontWeight.bold, fontSize: 13)),
        const SizedBox(height: 2),
        Text(desc, style: const TextStyle(color: Colors.white70, fontSize: 12)),
      ],
    );
  }
}

class _MenuGridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFF00E5FF)
      ..strokeWidth = 0.8
      ..style = PaintingStyle.stroke;

    const step = 40.0;
    for (double x = 0; x < size.width; x += step) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }
    for (double y = 0; y < size.height; y += step) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
