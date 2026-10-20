import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class StellarSlicerGameScreen extends StatefulWidget {
  final Function(int coins, int xp) onGameFinished;

  const StellarSlicerGameScreen({super.key, required this.onGameFinished});

  @override
  State<StellarSlicerGameScreen> createState() => _StellarSlicerGameScreenState();
}

class _FlyingFruit {
  double x;
  double y;
  double vx;
  double vy;
  double rotation;
  double rotSpeed;
  final Color color;
  final String label;
  final int points;
  final bool isBomb;
  bool isSliced = false;

  _FlyingFruit({
    required this.x,
    required this.y,
    required this.vx,
    required this.vy,
    required this.rotation,
    required this.rotSpeed,
    required this.color,
    required this.label,
    required this.points,
    this.isBomb = false,
  });
}

class _StellarSlicerGameScreenState extends State<StellarSlicerGameScreen> with SingleTickerProviderStateMixin {
  late AnimationController _ticker;

  bool _isPlaying = false;
  bool _isGameOver = false;

  int _score = 0;
  int _lives = 3;
  double _timeRemaining = 45.0;

  final List<_FlyingFruit> _fruits = [];
  final List<Offset> _bladeTrail = [];
  double _spawnTimer = 0.0;
  int _comboCount = 0;

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
      _lives = 3;
      _timeRemaining = 45.0;
      _fruits.clear();
      _bladeTrail.clear();
      _spawnTimer = 0.0;
      _comboCount = 0;
    });
    _ticker.forward(from: 0.0);
  }

  void _spawnFruitWave() {
    final rand = Random();
    final count = 1 + rand.nextInt(3);

    for (int i = 0; i < count; i++) {
      final isBomb = rand.nextDouble() < 0.20;
      final startX = 0.20 + rand.nextDouble() * 0.60;
      final vx = (rand.nextDouble() - 0.5) * 0.007;
      final vy = -0.016 - rand.nextDouble() * 0.006;

      if (isBomb) {
        _fruits.add(
          _FlyingFruit(
            x: startX,
            y: 1.05,
            vx: vx,
            vy: vy,
            rotation: 0.0,
            rotSpeed: 0.05,
            color: const Color(0xFFFF5252),
            label: 'BOMB',
            points: -50,
            isBomb: true,
          ),
        );
      } else {
        final fruitIndex = rand.nextInt(4);
        final colors = [
          const Color(0xFF10B981), // Nebula Melon
          const Color(0xFFFFB703), // Solar Orange
          const Color(0xFFEC4899), // Stardust Berry
          const Color(0xFF8B5CF6), // Void Plum
        ];
        final labels = ['Melon', 'Solar', 'Berry', 'Plum'];
        final pts = [20, 15, 25, 30];

        _fruits.add(
          _FlyingFruit(
            x: startX,
            y: 1.05,
            vx: vx,
            vy: vy,
            rotation: 0.0,
            rotSpeed: (rand.nextDouble() - 0.5) * 0.08,
            color: colors[fruitIndex],
            label: labels[fruitIndex],
            points: pts[fruitIndex],
          ),
        );
      }
    }
  }

  void _onPanUpdate(DragUpdateDetails details, Size size) {
    if (!_isPlaying || _isGameOver) return;
    final touch = Offset(details.localPosition.dx / size.width, details.localPosition.dy / size.height);
    _bladeTrail.add(touch);
    if (_bladeTrail.length > 15) _bladeTrail.removeAt(0);

    // Collision check between slice line and fruits
    for (final f in _fruits) {
      if (!f.isSliced && (Offset(f.x, f.y) - touch).distance < 0.065) {
        f.isSliced = true;
        if (f.isBomb) {
          _lives -= 1;
          _score = max(0, _score + f.points);
          HapticFeedback.heavyImpact();
          if (_lives <= 0) {
            _onGameOver();
            return;
          }
        } else {
          _comboCount++;
          final multiplier = _comboCount >= 3 ? 2 : 1;
          _score += f.points * multiplier;
          HapticFeedback.lightImpact();
        }
      }
    }
  }

  void _onPanEnd(DragEndDetails details) {
    _bladeTrail.clear();
    _comboCount = 0;
  }

  void _gameLoop() {
    if (!_isPlaying || _isGameOver) return;

    setState(() {
      _timeRemaining -= 0.016;
      if (_timeRemaining <= 0) {
        _onGameOver();
        return;
      }

      // Spawn timer
      _spawnTimer += 0.016;
      if (_spawnTimer > 1.4) {
        _spawnTimer = 0.0;
        _spawnFruitWave();
      }

      // Physics update
      const gravity = 0.00035;
      for (int i = _fruits.length - 1; i >= 0; i--) {
        final f = _fruits[i];
        f.vy += gravity;
        f.x += f.vx;
        f.y += f.vy;
        f.rotation += f.rotSpeed;

        // Remove offscreen
        if (f.y > 1.2 && f.vy > 0) {
          _fruits.removeAt(i);
        }
      }
    });
  }

  void _onGameOver() {
    _ticker.stop();
    HapticFeedback.vibrate();

    final earnedCoins = (_score / 15).round() + 20;
    final earnedXP = (_score / 20).round() + 25;

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
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24), side: const BorderSide(color: Color(0xFF00E5FF), width: 1.8)),
        title: const Row(
          children: [
            Icon(Icons.content_cut_rounded, color: Color(0xFF00E5FF), size: 28),
            SizedBox(width: 8),
            Text('Blade Master Sliced!', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Score: $_score', style: const TextStyle(color: Color(0xFFFFD700), fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            const Text('Starlight harvest complete!', style: TextStyle(color: Colors.white70, fontSize: 14)),
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
              backgroundColor: const Color(0xFF00E5FF),
              foregroundColor: Colors.black,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
            onPressed: () {
              Navigator.pop(ctx);
              _startGame();
            },
            child: const Text('SLICE AGAIN', style: TextStyle(fontWeight: FontWeight.bold)),
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
        title: const Text('Stellar Blade Slicer', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        actions: [
          Center(
            child: Padding(
              padding: const EdgeInsets.only(right: 16),
              child: Row(
                children: [
                  const Icon(Icons.favorite, color: Color(0xFFFF5252), size: 18),
                  const SizedBox(width: 4),
                  Text('$_lives', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                  const SizedBox(width: 12),
                  const Icon(Icons.timer_outlined, color: Color(0xFF00E5FF), size: 18),
                  const SizedBox(width: 4),
                  Text('${_timeRemaining.toInt()}s', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                  const SizedBox(width: 12),
                  const Icon(Icons.stars, color: Color(0xFFFFD700), size: 18),
                  const SizedBox(width: 4),
                  Text('$_score', style: const TextStyle(color: Color(0xFFFFD700), fontWeight: FontWeight.bold, fontSize: 16)),
                ],
              ),
            ),
          ),
        ],
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          final size = Size(constraints.maxWidth, constraints.maxHeight);
          return GestureDetector(
            behavior: HitTestBehavior.opaque,
            onPanUpdate: (d) => _onPanUpdate(d, size),
            onPanEnd: _onPanEnd,
            child: Stack(
              children: [
                Positioned.fill(
                  child: CustomPaint(
                    painter: _SlicerCanvasPainter(
                      fruits: _fruits,
                      bladeTrail: _bladeTrail,
                    ),
                  ),
                ),

                // Controls Hint overlay
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
                        '◀ Swipe across the screen to slice cosmic fruits! Avoid bombs ▶',
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
                        border: Border.all(color: const Color(0xFF00E5FF), width: 2),
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.content_cut_rounded, color: Color(0xFF00E5FF), size: 48),
                          const SizedBox(height: 12),
                          const Text(
                            'STELLAR BLADE SLICER',
                            style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900, letterSpacing: 1.2),
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            'SWIPE FINGER ACROSS FLYING CELESTIAL FRUITS TO SLICE THEM WITH LASER BLADES!\nDODGE ANTIMATTER BOMBS.',
                            style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold, height: 1.4),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 20),
                          ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF00E5FF),
                              foregroundColor: Colors.black,
                              minimumSize: const Size.fromHeight(48),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            ),
                            onPressed: _startGame,
                            child: const Text('DRAW BLADE', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _SlicerCanvasPainter extends CustomPainter {
  final List<_FlyingFruit> fruits;
  final List<Offset> bladeTrail;

  _SlicerCanvasPainter({
    required this.fruits,
    required this.bladeTrail,
  });

  @override
  void paint(Canvas canvas, Size size) {
    // 1. Draw Fruits
    for (final f in fruits) {
      final pos = Offset(f.x * size.width, f.y * size.height);
      const radius = 24.0;

      canvas.save();
      canvas.translate(pos.dx, pos.dy);
      canvas.rotate(f.rotation);

      if (f.isSliced) {
        // Draw 2 sliced halves separating
        final halfPaint = Paint()..color = f.color.withValues(alpha: 0.6);
        canvas.drawArc(const Rect.fromLTWH(-radius - 6, -radius, radius * 2, radius * 2), 0, pi, true, halfPaint);
        canvas.drawArc(const Rect.fromLTWH(-radius + 6, -radius, radius * 2, radius * 2), pi, pi, true, halfPaint);
      } else {
        // Aura
        final aura = Paint()
          ..color = f.color.withValues(alpha: 0.35)
          ..style = PaintingStyle.fill;
        canvas.drawCircle(Offset.zero, radius + 6, aura);

        // Core Fruit
        final fruitPaint = Paint()..color = f.color;
        canvas.drawCircle(Offset.zero, radius, fruitPaint);

        // Icon/Pattern
        final innerPaint = Paint()..color = Colors.white.withValues(alpha: 0.85);
        if (f.isBomb) {
          final skullPaint = Paint()..color = Colors.black;
          canvas.drawCircle(Offset.zero, 8, skullPaint);
        } else {
          canvas.drawCircle(const Offset(-4, -4), 4, innerPaint);
        }
      }

      canvas.restore();
    }

    // 2. Draw Laser Blade Trail
    if (bladeTrail.length > 1) {
      for (int i = 0; i < bladeTrail.length - 1; i++) {
        final frac = i / bladeTrail.length;
        final p1 = Offset(bladeTrail[i].dx * size.width, bladeTrail[i].dy * size.height);
        final p2 = Offset(bladeTrail[i + 1].dx * size.width, bladeTrail[i + 1].dy * size.height);

        final bladePaint = Paint()
          ..color = Color.lerp(const Color(0xFF00E5FF), const Color(0xFFEC4899), frac)!
          ..strokeWidth = 2.0 + frac * 8.0
          ..strokeCap = StrokeCap.round;
        canvas.drawLine(p1, p2, bladePaint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant _SlicerCanvasPainter oldDelegate) => true;
}
