import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class QuantumBreakoutGameScreen extends StatefulWidget {
  final Function(int coins, int xp) onGameFinished;

  const QuantumBreakoutGameScreen({super.key, required this.onGameFinished});

  @override
  State<QuantumBreakoutGameScreen> createState() => _QuantumBreakoutGameScreenState();
}

class _Brick {
  double x; // normalized 0..1
  double y;
  double width;
  double height;
  Color color;
  int points;
  bool destroyed = false;

  _Brick({
    required this.x,
    required this.y,
    required this.width,
    required this.height,
    required this.color,
    required this.points,
  });
}

class _Ball {
  double x;
  double y;
  double vx;
  double vy;

  _Ball({required this.x, required this.y, required this.vx, required this.vy});
}

class _QuantumBreakoutGameScreenState extends State<QuantumBreakoutGameScreen> with SingleTickerProviderStateMixin {
  late AnimationController _ticker;

  bool _isPlaying = false;
  bool _isGameOver = false;

  // Paddle (normalized 0..1)
  double _paddleX = 0.5;
  double _paddleWidth = 0.22;

  // Balls
  final List<_Ball> _balls = [];

  // Bricks
  final List<_Brick> _bricks = [];

  int _score = 0;
  int _lives = 3;

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

  void _initBricks() {
    _bricks.clear();
    const rows = 4;
    const cols = 6;
    const brickHeight = 0.038;
    const margin = 0.015;
    final totalWidth = 1.0 - (margin * 2);
    final brickWidth = (totalWidth - (margin * (cols - 1))) / cols;

    final rowColors = [
      const Color(0xFFEC4899), // Row 0
      const Color(0xFF8B5CF6), // Row 1
      const Color(0xFF00E5FF), // Row 2
      const Color(0xFFFFD700), // Row 3
    ];
    final rowPoints = [40, 30, 20, 10];

    for (int r = 0; r < rows; r++) {
      for (int c = 0; c < cols; c++) {
        final x = margin + c * (brickWidth + margin);
        final y = 0.10 + r * (brickHeight + margin);
        _bricks.add(
          _Brick(
            x: x,
            y: y,
            width: brickWidth,
            height: brickHeight,
            color: rowColors[r],
            points: rowPoints[r],
          ),
        );
      }
    }
  }

  void _startGame() {
    setState(() {
      _isPlaying = true;
      _isGameOver = false;
      _score = 0;
      _lives = 3;
      _paddleX = 0.5;
      _paddleWidth = 0.22;
      _initBricks();
      _balls.clear();
      _balls.add(_Ball(x: 0.5, y: 0.75, vx: 0.005, vy: -0.007));
    });
    _ticker.forward(from: 0.0);
  }

  void _gameLoop() {
    if (!_isPlaying || _isGameOver) return;

    setState(() {
      for (int i = _balls.length - 1; i >= 0; i--) {
        final b = _balls[i];
        b.x += b.vx;
        b.y += b.vy;

        // Bounce left/right walls
        if (b.x < 0.02) {
          b.x = 0.02;
          b.vx = -b.vx;
        } else if (b.x > 0.98) {
          b.x = 0.98;
          b.vx = -b.vx;
        }

        // Bounce top ceiling
        if (b.y < 0.02) {
          b.y = 0.02;
          b.vy = -b.vy;
        }

        // Paddle Collision (Paddle at y = 0.86)
        final paddleTop = 0.85;
        final paddleBottom = 0.875;
        final paddleLeft = _paddleX - _paddleWidth / 2;
        final paddleRight = _paddleX + _paddleWidth / 2;

        if (b.y >= paddleTop && b.y <= paddleBottom && b.x >= paddleLeft && b.x <= paddleRight && b.vy > 0) {
          b.vy = -b.vy.abs();
          // Angle bounce based on offset from center
          final hitOffset = (b.x - _paddleX) / (_paddleWidth / 2);
          b.vx = hitOffset * 0.009;
          HapticFeedback.lightImpact();
        }

        // Brick Collisions
        for (final brick in _bricks) {
          if (!brick.destroyed) {
            if (b.x >= brick.x && b.x <= brick.x + brick.width &&
                b.y >= brick.y && b.y <= brick.y + brick.height) {
              brick.destroyed = true;
              b.vy = -b.vy;
              _score += brick.points;
              HapticFeedback.selectionClick();
              break;
            }
          }
        }

        // Ball fell below screen
        if (b.y > 0.98) {
          _balls.removeAt(i);
        }
      }

      // Check if all balls lost
      if (_balls.isEmpty) {
        _lives -= 1;
        if (_lives <= 0) {
          _onGameOver(false);
          return;
        } else {
          // Respawn ball
          _balls.add(_Ball(x: _paddleX, y: 0.75, vx: 0.005, vy: -0.007));
        }
      }

      // Check win condition (all bricks destroyed)
      if (_bricks.every((b) => b.destroyed)) {
        _score += 200; // Clear bonus
        _onGameOver(true);
      }
    });
  }

  void _onGameOver(bool won) {
    _ticker.stop();
    HapticFeedback.vibrate();

    final earnedCoins = (_score / 15).round() + (won ? 50 : 15);
    final earnedXP = (_score / 20).round() + (won ? 40 : 20);

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
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24), side: BorderSide(color: won ? const Color(0xFFFFD700) : const Color(0xFF8B5CF6), width: 1.8)),
        title: Row(
          children: [
            Icon(won ? Icons.emoji_events_rounded : Icons.sports_esports_rounded, color: won ? const Color(0xFFFFD700) : const Color(0xFF8B5CF6), size: 28),
            const SizedBox(width: 8),
            Text(won ? 'Galaxy Cleared!' : 'Quantum Collapse', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Score: $_score', style: const TextStyle(color: Color(0xFFFFD700), fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            Text(won ? 'All Bricks Shattered!' : 'Lives Expired', style: const TextStyle(color: Colors.white70, fontSize: 14)),
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
              backgroundColor: const Color(0xFF8B5CF6),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
            onPressed: () {
              Navigator.pop(ctx);
              _startGame();
            },
            child: const Text('PLAY AGAIN', style: TextStyle(fontWeight: FontWeight.bold)),
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
        title: const Text('Quantum Breakout', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        actions: [
          Center(
            child: Padding(
              padding: const EdgeInsets.only(right: 16),
              child: Row(
                children: [
                  const Icon(Icons.favorite, color: Color(0xFFEC4899), size: 18),
                  const SizedBox(width: 4),
                  Text('$_lives', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
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
      body: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onHorizontalDragUpdate: (details) {
          final boxWidth = context.size?.width ?? 400;
          setState(() {
            _paddleX = (_paddleX + details.delta.dx / boxWidth).clamp(_paddleWidth / 2, 1.0 - _paddleWidth / 2);
          });
        },
        onTapDown: (details) {
          final boxWidth = context.size?.width ?? 400;
          setState(() {
            _paddleX = (details.localPosition.dx / boxWidth).clamp(_paddleWidth / 2, 1.0 - _paddleWidth / 2);
          });
        },
        child: Stack(
          children: [
            Positioned.fill(
              child: CustomPaint(
                painter: _BreakoutCanvasPainter(
                  paddleX: _paddleX,
                  paddleWidth: _paddleWidth,
                  balls: _balls,
                  bricks: _bricks,
                ),
              ),
            ),

            // Controls Hint overlay at bottom
            Positioned(
              bottom: 16,
              left: 0,
              right: 0,
              child: Center(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha: 0.5),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: const Text(
                    '◀ Drag or Tap to glide Paddle ▶',
                    style: TextStyle(color: Colors.white60, fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                ),
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
                    border: Border.all(color: const Color(0xFF8B5CF6), width: 2),
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.view_module_rounded, color: Color(0xFF8B5CF6), size: 48),
                      const SizedBox(height: 12),
                      const Text(
                        'QUANTUM BREAKOUT',
                        style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900, letterSpacing: 1.2),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'STEER THE NEON PADDLE TO BOUNCE QUANTUM ENERGY AND SHATTER CELESTIAL BRICKS!',
                        style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold, height: 1.4),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 20),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF8B5CF6),
                          foregroundColor: Colors.white,
                          minimumSize: const Size.fromHeight(48),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        ),
                        onPressed: _startGame,
                        child: const Text('LAUNCH BALL', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
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

class _BreakoutCanvasPainter extends CustomPainter {
  final double paddleX;
  final double paddleWidth;
  final List<_Ball> balls;
  final List<_Brick> bricks;

  _BreakoutCanvasPainter({
    required this.paddleX,
    required this.paddleWidth,
    required this.balls,
    required this.bricks,
  });

  @override
  void paint(Canvas canvas, Size size) {
    // 1. Draw Bricks
    for (final b in bricks) {
      if (b.destroyed) continue;

      final rect = Rect.fromLTWH(
        b.x * size.width,
        b.y * size.height,
        b.width * size.width,
        b.height * size.height,
      );

      final brickPaint = Paint()..color = b.color;
      canvas.drawRRect(RRect.fromRectAndRadius(rect, const Radius.circular(6)), brickPaint);

      final glowPaint = Paint()
        ..color = b.color.withValues(alpha: 0.3)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2.0;
      canvas.drawRRect(RRect.fromRectAndRadius(rect, const Radius.circular(6)), glowPaint);
    }

    // 2. Draw Paddle (at y = 0.86)
    final paddleRect = Rect.fromCenter(
      center: Offset(paddleX * size.width, 0.86 * size.height),
      width: paddleWidth * size.width,
      height: 14.0,
    );

    final paddlePaint = Paint()
      ..shader = const LinearGradient(
        colors: [Color(0xFF00E5FF), Color(0xFF8B5CF6), Color(0xFFEC4899)],
      ).createShader(paddleRect);
    canvas.drawRRect(RRect.fromRectAndRadius(paddleRect, const Radius.circular(8)), paddlePaint);

    // 3. Draw Balls
    for (final b in balls) {
      final ballCenter = Offset(b.x * size.width, b.y * size.height);
      const ballRadius = 8.0;

      // Glow halo
      final glowPaint = Paint()
        ..color = const Color(0xFFFFD700).withValues(alpha: 0.45)
        ..style = PaintingStyle.fill;
      canvas.drawCircle(ballCenter, ballRadius + 6, glowPaint);

      // Core
      final corePaint = Paint()..color = Colors.white;
      canvas.drawCircle(ballCenter, ballRadius, corePaint);
    }
  }

  @override
  bool shouldRepaint(covariant _BreakoutCanvasPainter oldDelegate) => true;
}
