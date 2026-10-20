import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class CosmicPinballGameScreen extends StatefulWidget {
  final Function(int coins, int xp) onGameFinished;

  const CosmicPinballGameScreen({super.key, required this.onGameFinished});

  @override
  State<CosmicPinballGameScreen> createState() => _CosmicPinballGameScreenState();
}

class _Bumper {
  final double x; // normalized 0..1
  final double y;
  final double radius;
  final Color color;
  final int points;
  double flashTimer = 0.0;

  _Bumper({
    required this.x,
    required this.y,
    required this.radius,
    required this.color,
    required this.points,
  });
}

class _CosmicPinballGameScreenState extends State<CosmicPinballGameScreen> with SingleTickerProviderStateMixin {
  late AnimationController _ticker;

  bool _isPlaying = false;
  bool _isGameOver = false;

  // Ball physics (normalized coordinates 0..1)
  double _ballX = 0.5;
  double _ballY = 0.3;
  double _ballVx = 0.003;
  double _ballVy = 0.002;
  final double _gravity = 0.00045;
  final double _ballRadius = 0.035;

  // Flippers
  bool _leftFlipperActive = false;
  bool _rightFlipperActive = false;

  int _score = 0;
  int _ballsLeft = 3;

  final List<_Bumper> _bumpers = [
    _Bumper(x: 0.35, y: 0.30, radius: 26, color: const Color(0xFF00E5FF), points: 50),
    _Bumper(x: 0.65, y: 0.30, radius: 26, color: const Color(0xFFEC4899), points: 50),
    _Bumper(x: 0.50, y: 0.44, radius: 32, color: const Color(0xFFFFD700), points: 100),
    _Bumper(x: 0.30, y: 0.58, radius: 22, color: const Color(0xFF8B5CF6), points: 30),
    _Bumper(x: 0.70, y: 0.58, radius: 22, color: const Color(0xFF10B981), points: 30),
  ];

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
      _score = 0;
      _ballsLeft = 3;
      _launchBall();
    });
    _ticker.forward(from: 0.0);
  }

  void _launchBall() {
    final rand = Random();
    _ballX = 0.48 + rand.nextDouble() * 0.04;
    _ballY = 0.18;
    _ballVx = (rand.nextBool() ? 1 : -1) * (0.004 + rand.nextDouble() * 0.003);
    _ballVy = 0.002;
    HapticFeedback.lightImpact();
  }

  void _gameLoop() {
    if (!_isPlaying || _isGameOver) return;

    setState(() {
      // 1. Gravity and velocity
      _ballVy += _gravity;
      _ballX += _ballVx;
      _ballY += _ballVy;

      // 2. Wall bounce (Left, Right, Top)
      if (_ballX - _ballRadius < 0.06) {
        _ballX = 0.06 + _ballRadius;
        _ballVx = -_ballVx * 0.85;
      } else if (_ballX + _ballRadius > 0.94) {
        _ballX = 0.94 - _ballRadius;
        _ballVx = -_ballVx * 0.85;
      }

      if (_ballY - _ballRadius < 0.08) {
        _ballY = 0.08 + _ballRadius;
        _ballVy = -_ballVy * 0.85;
      }

      // 3. Bumper Collisions
      for (final bumper in _bumpers) {
        if (bumper.flashTimer > 0) bumper.flashTimer -= 0.016;

        final dx = _ballX - bumper.x;
        final dy = _ballY - bumper.y;
        final dist = sqrt(dx * dx + dy * dy);
        final normBumperRadius = bumper.radius / 400.0; // approximate normalized radius

        if (dist < _ballRadius + normBumperRadius) {
          final angle = atan2(dy, dx);
          const reboundSpeed = 0.014;
          _ballVx = cos(angle) * reboundSpeed;
          _ballVy = sin(angle) * reboundSpeed;
          _score += bumper.points;
          bumper.flashTimer = 0.25;
          HapticFeedback.mediumImpact();
        }
      }

      // 4. Flipper Collisions (Flippers at y ~ 0.82 to 0.88)
      // Left flipper region (x: 0.12..0.45, y: 0.82..0.88)
      if (_ballY >= 0.80 && _ballY <= 0.88 && _ballX >= 0.12 && _ballX <= 0.46) {
        if (_leftFlipperActive) {
          _ballVy = -0.018; // Strong impulse
          _ballVx += 0.004;
          HapticFeedback.heavyImpact();
        } else if (_ballVy > 0) {
          // Passive slope deflection
          _ballVy = -_ballVy * 0.45;
          _ballVx += 0.002;
        }
      }

      // Right flipper region (x: 0.54..0.88, y: 0.82..0.88)
      if (_ballY >= 0.80 && _ballY <= 0.88 && _ballX >= 0.54 && _ballX <= 0.88) {
        if (_rightFlipperActive) {
          _ballVy = -0.018;
          _ballVx -= 0.004;
          HapticFeedback.heavyImpact();
        } else if (_ballVy > 0) {
          _ballVy = -_ballVy * 0.45;
          _ballVx -= 0.002;
        }
      }

      // 5. Drain Check (Ball fell below bottom y > 0.98)
      if (_ballY > 0.98) {
        _ballsLeft -= 1;
        HapticFeedback.vibrate();
        if (_ballsLeft <= 0) {
          _onGameOver();
        } else {
          _launchBall();
        }
      }
    });
  }

  void _onGameOver() {
    _ticker.stop();

    final earnedCoins = (_score / 20).round() + 15;
    final earnedXP = (_score / 25).round() + 20;

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
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24), side: const BorderSide(color: Color(0xFFFFD700), width: 1.8)),
        title: const Row(
          children: [
            Icon(Icons.stars_rounded, color: Color(0xFFFFD700), size: 28),
            SizedBox(width: 8),
            Text('Pinball Tilt Over!', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Score: $_score', style: const TextStyle(color: Color(0xFFFFD700), fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            const Text('All 3 Pinballs Drained!', style: TextStyle(color: Colors.white70, fontSize: 14)),
            const SizedBox(height: 8),
            Text('Earned: +$earnedCoins Coins & +$earnedXP XP', style: const TextStyle(color: Color(0xFF00E5FF), fontSize: 15, fontWeight: FontWeight.bold)),
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
              backgroundColor: const Color(0xFFFFD700),
              foregroundColor: Colors.black,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
            onPressed: () {
              Navigator.pop(ctx);
              _startGame();
            },
            child: const Text('NEW BALLS', style: TextStyle(fontWeight: FontWeight.bold)),
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
        title: const Text('Cosmic Pinball', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        actions: [
          Center(
            child: Padding(
              padding: const EdgeInsets.only(right: 16),
              child: Row(
                children: [
                  const Icon(Icons.circle, color: Color(0xFF00E5FF), size: 14),
                  const SizedBox(width: 4),
                  Text('$_ballsLeft', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                  const SizedBox(width: 14),
                  const Icon(Icons.stars, color: Color(0xFFFFD700), size: 18),
                  const SizedBox(width: 4),
                  Text('$_score', style: const TextStyle(color: Color(0xFFFFD700), fontWeight: FontWeight.bold, fontSize: 16)),
                ],
              ),
            ),
          ),
        ],
      ),
      body: Stack(
        children: [
          Positioned.fill(
            child: CustomPaint(
              painter: _PinballCanvasPainter(
                ballX: _ballX,
                ballY: _ballY,
                ballRadius: _ballRadius,
                bumpers: _bumpers,
                leftFlipperActive: _leftFlipperActive,
                rightFlipperActive: _rightFlipperActive,
              ),
            ),
          ),

          // Bottom Dual Flipper Touch Pads
          Positioned(
            bottom: 16,
            left: 16,
            right: 16,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                GestureDetector(
                  onTapDown: (_) => setState(() => _leftFlipperActive = true),
                  onTapUp: (_) => setState(() => _leftFlipperActive = false),
                  onTapCancel: () => setState(() => _leftFlipperActive = false),
                  child: Container(
                    width: 120,
                    height: 64,
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: _leftFlipperActive
                            ? [const Color(0xFF00E5FF), const Color(0xFF38BDF8)]
                            : [const Color(0xFF1E293B), const Color(0xFF334155)],
                      ),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFF00E5FF), width: 2),
                      boxShadow: [
                        BoxShadow(color: const Color(0xFF00E5FF).withValues(alpha: 0.3), blurRadius: 10),
                      ],
                    ),
                    child: const Center(
                      child: Text(
                        'FLIP L',
                        style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 16, letterSpacing: 1.2),
                      ),
                    ),
                  ),
                ),
                GestureDetector(
                  onTapDown: (_) => setState(() => _rightFlipperActive = true),
                  onTapUp: (_) => setState(() => _rightFlipperActive = false),
                  onTapCancel: () => setState(() => _rightFlipperActive = false),
                  child: Container(
                    width: 120,
                    height: 64,
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: _rightFlipperActive
                            ? [const Color(0xFFEC4899), const Color(0xFFF472B6)]
                            : [const Color(0xFF1E293B), const Color(0xFF334155)],
                      ),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFFEC4899), width: 2),
                      boxShadow: [
                        BoxShadow(color: const Color(0xFFEC4899).withValues(alpha: 0.3), blurRadius: 10),
                      ],
                    ),
                    child: const Center(
                      child: Text(
                        'FLIP R',
                        style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 16, letterSpacing: 1.2),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Start Screen Overlay
          if (!_isPlaying && !_isGameOver)
            Center(
              child: Container(
                constraints: const BoxConstraints(maxWidth: 340),
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A).withValues(alpha: 0.95),
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: const Color(0xFFFFD700), width: 2),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.stars_rounded, color: Color(0xFFFFD700), size: 48),
                    const SizedBox(height: 12),
                    const Text(
                      'COSMIC PINBALL',
                      style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900, letterSpacing: 1.2),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'BOUNCE STARDUST BALLS OFF CELESTIAL BUMPERS!\nHIT DUAL FLIPPERS TO KEEP THE BALL IN ORBIT.',
                      style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold, height: 1.4),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 20),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFFFD700),
                        foregroundColor: Colors.black,
                        minimumSize: const Size.fromHeight(48),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                      onPressed: _startGame,
                      child: const Text('LAUNCH PINBALL', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _PinballCanvasPainter extends CustomPainter {
  final double ballX;
  final double ballY;
  final double ballRadius;
  final List<_Bumper> bumpers;
  final bool leftFlipperActive;
  final bool rightFlipperActive;

  _PinballCanvasPainter({
    required this.ballX,
    required this.ballY,
    required this.ballRadius,
    required this.bumpers,
    required this.leftFlipperActive,
    required this.rightFlipperActive,
  });

  @override
  void paint(Canvas canvas, Size size) {
    // 1. Table Boundaries (Outer neon rails)
    final wallPaint = Paint()
      ..color = const Color(0xFF6366F1).withValues(alpha: 0.5)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3.5;

    final wallRect = Rect.fromLTWH(size.width * 0.05, size.height * 0.06, size.width * 0.90, size.height * 0.88);
    canvas.drawRRect(RRect.fromRectAndRadius(wallRect, const Radius.circular(32)), wallPaint);

    // 2. Bumpers
    for (final b in bumpers) {
      final pos = Offset(b.x * size.width, b.y * size.height);
      final isFlashing = b.flashTimer > 0;

      // Glow halo
      final glowPaint = Paint()
        ..color = (isFlashing ? Colors.white : b.color).withValues(alpha: isFlashing ? 0.7 : 0.25)
        ..style = PaintingStyle.fill;
      canvas.drawCircle(pos, b.radius + (isFlashing ? 14 : 8), glowPaint);

      // Core bumper
      final bumperPaint = Paint()..color = isFlashing ? Colors.white : b.color;
      canvas.drawCircle(pos, b.radius, bumperPaint);

      final centerStar = Paint()..color = const Color(0xFF0F172A);
      canvas.drawCircle(pos, b.radius * 0.4, centerStar);
    }

    // 3. Flippers
    // Left Flipper (Pivot at x: 0.14, y: 0.86)
    final leftPivot = Offset(size.width * 0.14, size.height * 0.86);
    final leftAngle = leftFlipperActive ? -0.45 : 0.25;
    final leftTip = leftPivot + Offset(cos(leftAngle) * (size.width * 0.30), sin(leftAngle) * (size.width * 0.30));

    final flipperLPaint = Paint()
      ..color = const Color(0xFF00E5FF)
      ..strokeWidth = 14.0
      ..strokeCap = StrokeCap.round;
    canvas.drawLine(leftPivot, leftTip, flipperLPaint);

    // Right Flipper (Pivot at x: 0.86, y: 0.86)
    final rightPivot = Offset(size.width * 0.86, size.height * 0.86);
    final rightAngle = rightFlipperActive ? 0.45 : -0.25;
    final rightTip = rightPivot + Offset(-cos(rightAngle) * (size.width * 0.30), sin(rightAngle) * (size.width * 0.30));

    final flipperRPaint = Paint()
      ..color = const Color(0xFFEC4899)
      ..strokeWidth = 14.0
      ..strokeCap = StrokeCap.round;
    canvas.drawLine(rightPivot, rightTip, flipperRPaint);

    // 4. Stardust Ball (Alifi Pinball)
    final ballPos = Offset(ballX * size.width, ballY * size.height);
    final pxBallRadius = ballRadius * size.width;

    final ballAura = Paint()
      ..color = const Color(0xFFFFD700).withValues(alpha: 0.45)
      ..style = PaintingStyle.fill;
    canvas.drawCircle(ballPos, pxBallRadius + 6, ballAura);

    final ballPaint = Paint()
      ..shader = const RadialGradient(
        colors: [Colors.white, Color(0xFFFFD700)],
      ).createShader(Rect.fromCircle(center: ballPos, radius: pxBallRadius));
    canvas.drawCircle(ballPos, pxBallRadius, ballPaint);
  }

  @override
  bool shouldRepaint(covariant _PinballCanvasPainter oldDelegate) => true;
}
