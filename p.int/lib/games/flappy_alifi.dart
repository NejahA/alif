import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class FlappyAlifiGameScreen extends StatefulWidget {
  final Function(int coins, int xp) onGameFinished;

  const FlappyAlifiGameScreen({super.key, required this.onGameFinished});

  @override
  State<FlappyAlifiGameScreen> createState() => _FlappyAlifiGameScreenState();
}

class _GatePillar {
  double x; // normalized 0..1+
  final double gapCenterY; // normalized 0.2..0.8
  final double gapSize = 0.28;
  bool passed = false;

  _GatePillar({required this.x, required this.gapCenterY});
}

class _FlappyAlifiGameScreenState extends State<FlappyAlifiGameScreen> with SingleTickerProviderStateMixin {
  late AnimationController _ticker;

  bool _isPlaying = false;
  bool _isGameOver = false;

  // Alifi Physics (normalized 0..1)
  double _alifiY = 0.5;
  double _velocity = 0.0;
  final double _gravity = 0.0016;
  final double _flapImpulse = -0.024;

  // Stargate Pillars
  final List<_GatePillar> _gates = [];
  double _gateSpawnTimer = 0.0;
  final double _scrollSpeed = 0.0055;

  int _score = 0;
  int _bonusCrystals = 0;

  @override
  void initState() {
    super.initState();
    _ticker = AnimationController(vsync: this, duration: const Duration(seconds: 1000))
      ..addListener(_gameLoop);
  }

  @override
  void dispose() {
    _ticker.dispose();
    super.dispose();
  }

  void _startGame() {
    setState(() {
      _isPlaying = true;
      _isGameOver = false;
      _alifiY = 0.5;
      _velocity = 0.0;
      _score = 0;
      _bonusCrystals = 0;
      _gates.clear();
      _gateSpawnTimer = 0.0;
    });
    _ticker.forward(from: 0.0);
  }

  void _flap() {
    if (!_isPlaying && !_isGameOver) {
      _startGame();
      return;
    }
    if (_isGameOver) return;

    setState(() {
      _velocity = _flapImpulse;
    });
    HapticFeedback.lightImpact();
  }

  void _gameLoop() {
    if (!_isPlaying || _isGameOver) return;

    setState(() {
      // 1. Apply gravity & velocity
      _velocity += _gravity;
      _alifiY += _velocity;

      // Screen boundaries
      if (_alifiY < 0.04) {
        _alifiY = 0.04;
        _velocity = 0.0;
      }
      if (_alifiY > 0.94) {
        _onGameOver();
        return;
      }

      // 2. Scroll and update gates
      _gateSpawnTimer += 0.016;
      if (_gateSpawnTimer > 1.8) {
        _gateSpawnTimer = 0.0;
        final rand = Random();
        final gapY = 0.22 + rand.nextDouble() * 0.52;
        _gates.add(_GatePillar(x: 1.15, gapCenterY: gapY));
      }

      for (int i = _gates.length - 1; i >= 0; i--) {
        final g = _gates[i];
        g.x -= _scrollSpeed;

        // Check if Alifi passed gate
        if (!g.passed && g.x < 0.3) {
          g.passed = true;
          _score += 1;
          _bonusCrystals += 1;
          HapticFeedback.selectionClick();
        }

        // Collision check (Alifi at x=0.3, radius=0.04)
        final alifiRadius = 0.038;
        if (g.x > 0.22 && g.x < 0.38) {
          final halfGap = g.gapSize / 2;
          final topLimit = g.gapCenterY - halfGap;
          final bottomLimit = g.gapCenterY + halfGap;

          if (_alifiY - alifiRadius < topLimit || _alifiY + alifiRadius > bottomLimit) {
            _onGameOver();
            return;
          }
        }

        // Remove offscreen
        if (g.x < -0.2) {
          _gates.removeAt(i);
        }
      }
    });
  }

  void _onGameOver() {
    _ticker.stop();
    HapticFeedback.vibrate();

    final earnedCoins = (_score * 6) + (_bonusCrystals * 4) + 15;
    final earnedXP = (_score * 5) + 20;

    setState(() {
      _isGameOver = true;
      _isPlaying = false;
    });

    widget.onGameFinished(earnedCoins, earnedXP);

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24), side: const BorderSide(color: Color(0xFF00E5FF), width: 1.5)),
        title: const Row(
          children: [
            Icon(Icons.rocket_rounded, color: Color(0xFF00E5FF), size: 28),
            SizedBox(width: 8),
            Text('Stargate Breach!', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Gates Cleared: $_score', style: const TextStyle(color: Color(0xFFFFD700), fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            Text('Earned: +$earnedCoins Coins & +$earnedXP XP', style: const TextStyle(color: Colors.white70, fontSize: 15)),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              Navigator.pop(context);
            },
            child: const Text('ARCADE HUB', style: TextStyle(color: Colors.white60)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF00E5FF),
              foregroundColor: Colors.black,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
            onPressed: () {
              Navigator.pop(ctx);
              _startGame();
            },
            child: const Text('TRY AGAIN', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF070514),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        title: const Text('Flappy Alifi: Stargate Flight', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        actions: [
          Center(
            child: Padding(
              padding: const EdgeInsets.only(right: 16),
              child: Row(
                children: [
                  const Icon(Icons.stars, color: Color(0xFFFFD700), size: 20),
                  const SizedBox(width: 4),
                  Text('$_score', style: const TextStyle(color: Color(0xFFFFD700), fontSize: 18, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
          ),
        ],
      ),
      body: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTapDown: (_) => _flap(),
        child: Stack(
          children: [
            // Ambient Canvas
            Positioned.fill(
              child: CustomPaint(
                painter: _FlappyCanvasPainter(
                  alifiY: _alifiY,
                  gates: _gates,
                  velocity: _velocity,
                ),
              ),
            ),

            // Start prompt overlay
            if (!_isPlaying && !_isGameOver)
              Center(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha: 0.75),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(0xFF00E5FF), width: 1.5),
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.touch_app_rounded, color: Color(0xFF00E5FF), size: 40),
                      const SizedBox(height: 10),
                      const Text(
                        'FLAPPY ALIFI',
                        style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900, letterSpacing: 1.2),
                      ),
                      const SizedBox(height: 6),
                      const Text(
                        'TAP SCREEN TO FLAP & GLIDE THROUGH STARGATES',
                        style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 14),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF00E5FF),
                          foregroundColor: Colors.black,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                        onPressed: _startGame,
                        child: const Text('START FLIGHT', style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _FlappyCanvasPainter extends CustomPainter {
  final double alifiY;
  final List<_GatePillar> gates;
  final double velocity;

  _FlappyCanvasPainter({
    required this.alifiY,
    required this.gates,
    required this.velocity,
  });

  @override
  void paint(Canvas canvas, Size size) {
    // 1. Draw Starfield background
    final starPaint = Paint()..color = Colors.white.withValues(alpha: 0.25);
    final rand = Random(42);
    for (int i = 0; i < 40; i++) {
      canvas.drawCircle(
        Offset(rand.nextDouble() * size.width, rand.nextDouble() * size.height),
        rand.nextDouble() * 1.8 + 0.5,
        starPaint,
      );
    }

    // 2. Draw Stargates (Pillars + Energy Ring)
    final pillarPaint = Paint()
      ..shader = const LinearGradient(
        colors: [Color(0xFF6366F1), Color(0xFF00E5FF)],
        begin: Alignment.centerLeft,
        end: Alignment.centerRight,
      ).createShader(Rect.fromLTWH(0, 0, size.width, size.height));

    final gateGlowPaint = Paint()
      ..color = const Color(0xFF00E5FF).withValues(alpha: 0.4)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 4.0;

    const pillarWidth = 42.0;

    for (final g in gates) {
      final xPos = g.x * size.width;
      final gapCenter = g.gapCenterY * size.height;
      final halfGap = (g.gapSize * size.height) / 2;

      // Top Pillar
      final topRect = Rect.fromLTRB(xPos - pillarWidth / 2, 0, xPos + pillarWidth / 2, gapCenter - halfGap);
      canvas.drawRRect(RRect.fromRectAndRadius(topRect, const Radius.circular(8)), pillarPaint);

      // Bottom Pillar
      final botRect = Rect.fromLTRB(xPos - pillarWidth / 2, gapCenter + halfGap, xPos + pillarWidth / 2, size.height);
      canvas.drawRRect(RRect.fromRectAndRadius(botRect, const Radius.circular(8)), pillarPaint);

      // Gate energy threshold arches
      canvas.drawArc(
        Rect.fromCircle(center: Offset(xPos, gapCenter - halfGap), radius: pillarWidth / 2),
        0,
        pi,
        false,
        gateGlowPaint,
      );
      canvas.drawArc(
        Rect.fromCircle(center: Offset(xPos, gapCenter + halfGap), radius: pillarWidth / 2),
        pi,
        pi,
        false,
        gateGlowPaint,
      );

      // Stardust bonus crystal in gap center
      final crystalPos = Offset(xPos, gapCenter);
      final crystalPaint = Paint()..color = const Color(0xFFFFD700);
      canvas.drawCircle(crystalPos, 6.0, crystalPaint);
    }

    // 3. Draw Alifi Avatar (at x = 0.3 * size.width, y = alifiY * size.height)
    final alifiCenter = Offset(0.3 * size.width, alifiY * size.height);
    const alifiRadius = 24.0;

    // Aura glow
    final auraPaint = Paint()
      ..color = const Color(0xFFEC4899).withValues(alpha: 0.35)
      ..style = PaintingStyle.fill;
    canvas.drawCircle(alifiCenter, alifiRadius + 8, auraPaint);

    // Body
    final bodyPaint = Paint()
      ..shader = const RadialGradient(
        colors: [Color(0xFFF472B6), Color(0xFF8B5CF6)],
      ).createShader(Rect.fromCircle(center: alifiCenter, radius: alifiRadius));
    canvas.drawCircle(alifiCenter, alifiRadius, bodyPaint);

    // Cute facial eyes
    final eyePaint = Paint()..color = Colors.white;
    final pupilPaint = Paint()..color = const Color(0xFF1E1B4B);

    final leftEye = Offset(alifiCenter.dx + 4, alifiCenter.dy - 4);
    final rightEye = Offset(alifiCenter.dx + 13, alifiCenter.dy - 4);

    canvas.drawCircle(leftEye, 4.0, eyePaint);
    canvas.drawCircle(rightEye, 4.0, eyePaint);
    canvas.drawCircle(leftEye + const Offset(1, 0), 2.2, pupilPaint);
    canvas.drawCircle(rightEye + const Offset(1, 0), 2.2, pupilPaint);

    // Tiny wings fluttering based on velocity
    final wingAngle = (velocity * 10).clamp(-0.4, 0.4);
    final wingPaint = Paint()
      ..color = const Color(0xFF00E5FF).withValues(alpha: 0.8)
      ..style = PaintingStyle.fill;

    canvas.save();
    canvas.translate(alifiCenter.dx - 14, alifiCenter.dy + 4);
    canvas.rotate(-wingAngle);
    canvas.drawOval(const Rect.fromLTWH(-10, -6, 12, 8), wingPaint);
    canvas.restore();
  }

  @override
  bool shouldRepaint(covariant _FlappyCanvasPainter oldDelegate) => true;
}
