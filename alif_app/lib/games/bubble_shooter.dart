import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class BubbleShooterGameScreen extends StatefulWidget {
  final Function(int coins, int xp) onGameFinished;

  const BubbleShooterGameScreen({super.key, required this.onGameFinished});

  @override
  State<BubbleShooterGameScreen> createState() => _BubbleShooterGameScreenState();
}

class _Bubble {
  int r; // grid row
  int c; // grid col
  int colorIndex;
  bool isPopping = false;

  _Bubble({required this.r, required this.c, required this.colorIndex});
}

class _FlyingBubble {
  double x;
  double y;
  double vx;
  double vy;
  int colorIndex;

  _FlyingBubble({
    required this.x,
    required this.y,
    required this.vx,
    required this.vy,
    required this.colorIndex,
  });
}

class _BubbleShooterGameScreenState extends State<BubbleShooterGameScreen> with SingleTickerProviderStateMixin {
  late AnimationController _ticker;

  static const int gridRows = 8;
  static const int gridCols = 8;

  bool _isPlaying = false;
  bool _isGameOver = false;

  final List<_Bubble> _bubbles = [];
  _FlyingBubble? _bullet;

  double _aimAngle = -pi / 2; // straight up
  int _currentAmmo = 0;
  int _nextAmmo = 1;
  int _score = 0;

  static const List<Color> bubbleColors = [
    Color(0xFF00E5FF), // Cyan
    Color(0xFFEC4899), // Magenta
    Color(0xFFFFD700), // Gold
    Color(0xFF8B5CF6), // Purple
    Color(0xFF10B981), // Emerald
  ];

  @override
  void initState() {
    super.initState();
    _ticker = AnimationController(vsync: this, duration: const Duration(seconds: 1000))
      ..addListener(_gameLoop);
    _initCeiling();
  }

  @override
  void dispose() {
    _ticker.dispose();
    super.dispose();
  }

  void _initCeiling() {
    _bubbles.clear();
    final rand = Random();
    // Fill first 4 rows with bubbles
    for (int r = 0; r < 4; r++) {
      for (int c = 0; c < gridCols; c++) {
        _bubbles.add(_Bubble(r: r, c: c, colorIndex: rand.nextInt(bubbleColors.length)));
      }
    }
    _currentAmmo = rand.nextInt(bubbleColors.length);
    _nextAmmo = rand.nextInt(bubbleColors.length);
  }

  void _startGame() {
    setState(() {
      _isPlaying = true;
      _isGameOver = false;
      _score = 0;
      _bullet = null;
      _aimAngle = -pi / 2;
      _initCeiling();
    });
    _ticker.forward(from: 0.0);
  }

  void _aim(Offset localPos, Size size) {
    if (!_isPlaying || _isGameOver || _bullet != null) return;
    final cannonOrigin = Offset(size.width * 0.5, size.height * 0.88);
    final delta = localPos - cannonOrigin;
    if (delta.dy < -20) {
      setState(() {
        _aimAngle = atan2(delta.dy, delta.dx).clamp(-pi + 0.25, -0.25);
      });
    }
  }

  void _shoot() {
    if (!_isPlaying || _isGameOver || _bullet != null) return;
    const speed = 0.018;
    setState(() {
      _bullet = _FlyingBubble(
        x: 0.5,
        y: 0.88,
        vx: cos(_aimAngle) * speed,
        vy: sin(_aimAngle) * speed,
        colorIndex: _currentAmmo,
      );
      _currentAmmo = _nextAmmo;
      _nextAmmo = Random().nextInt(bubbleColors.length);
    });
    HapticFeedback.lightImpact();
  }

  void _gameLoop() {
    if (!_isPlaying || _isGameOver || _bullet == null) return;

    setState(() {
      final b = _bullet!;
      b.x += b.vx;
      b.y += b.vy;

      // Bounce left/right walls
      if (b.x < 0.06) {
        b.x = 0.06;
        b.vx = -b.vx;
      } else if (b.x > 0.94) {
        b.x = 0.94;
        b.vx = -b.vx;
      }

      // Check collision with ceiling or other bubbles
      bool collided = false;
      if (b.y < 0.08) {
        collided = true;
      } else {
        const bubbleNormRadius = 0.055;
        for (final bb in _bubbles) {
          final pos = _getBubblePos(bb.r, bb.c);
          if ((Offset(b.x, b.y) - pos).distance < bubbleNormRadius * 1.6) {
            collided = true;
            break;
          }
        }
      }

      if (collided) {
        _snapBubble(b);
        _bullet = null;
      }
    });
  }

  Offset _getBubblePos(int r, int c) {
    const colWidth = 0.84 / gridCols;
    final x = 0.08 + (c + 0.5) * colWidth + (r % 2 == 1 ? colWidth * 0.5 : 0.0);
    final y = 0.08 + (r + 0.5) * 0.065;
    return Offset(x, y);
  }

  void _snapBubble(_FlyingBubble b) {
    // Determine closest empty slot (r, c)
    int bestR = 0;
    int bestC = 0;
    double minDist = 999.0;

    for (int r = 0; r < gridRows; r++) {
      for (int c = 0; c < gridCols; c++) {
        final alreadyOccupied = _bubbles.any((bb) => bb.r == r && bb.c == c);
        if (!alreadyOccupied) {
          final pos = _getBubblePos(r, c);
          final dist = (Offset(b.x, b.y) - pos).distance;
          if (dist < minDist) {
            minDist = dist;
            bestR = r;
            bestC = c;
          }
        }
      }
    }

    final newBubble = _Bubble(r: bestR, c: bestC, colorIndex: b.colorIndex);
    _bubbles.add(newBubble);

    // Check match >= 3 of same color using Flood Fill
    final matched = <_Bubble>{};
    final queue = <_Bubble>[newBubble];
    final visited = <_Bubble>{newBubble};

    while (queue.isNotEmpty) {
      final current = queue.removeAt(0);
      matched.add(current);

      for (final neighbor in _getNeighbors(current)) {
        if (!visited.contains(neighbor) && neighbor.colorIndex == newBubble.colorIndex) {
          visited.add(neighbor);
          queue.add(neighbor);
        }
      }
    }

    if (matched.length >= 3) {
      _bubbles.removeWhere((bb) => matched.contains(bb));
      _score += matched.length * 30;
      HapticFeedback.mediumImpact();

      // Check win
      if (_bubbles.isEmpty) {
        _score += 300;
        _onGameOver(won: true);
        return;
      }
    }

    // Check game over baseline (reached row 7)
    if (_bubbles.any((bb) => bb.r >= 6)) {
      _onGameOver(won: false);
    }
  }

  List<_Bubble> _getNeighbors(_Bubble b) {
    final neighbors = <_Bubble>[];
    for (final other in _bubbles) {
      if ((other.r - b.r).abs() <= 1 && (other.c - b.c).abs() <= 1 && other != b) {
        neighbors.add(other);
      }
    }
    return neighbors;
  }

  void _onGameOver({bool won = false}) {
    _ticker.stop();
    HapticFeedback.vibrate();

    final earnedCoins = (_score / 20).round() + (won ? 50 : 20);
    final earnedXP = (_score / 25).round() + (won ? 40 : 25);

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
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24), side: BorderSide(color: won ? const Color(0xFFFFD700) : const Color(0xFF00E5FF), width: 1.8)),
        title: Row(
          children: [
            Icon(won ? Icons.emoji_events_rounded : Icons.bubble_chart_rounded, color: won ? const Color(0xFFFFD700) : const Color(0xFF00E5FF), size: 28),
            const SizedBox(width: 8),
            Text(won ? 'Constellation Cleared!' : 'Cluster Overflow', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Score: $_score', style: const TextStyle(color: Color(0xFFFFD700), fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            Text(won ? 'All bubbles popped!' : 'Bubbles breached baseline', style: const TextStyle(color: Colors.white70, fontSize: 14)),
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
        title: const Text('Nebula Bubble Shooter', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        actions: [
          Center(
            child: Padding(
              padding: const EdgeInsets.only(right: 16),
              child: Row(
                children: [
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
            onPanUpdate: (d) => _aim(d.localPosition, size),
            onPanEnd: (_) => _shoot(),
            onTapUp: (d) {
              _aim(d.localPosition, size);
              _shoot();
            },
            child: Stack(
              children: [
                Positioned.fill(
                  child: CustomPaint(
                    painter: _BubbleShooterPainter(
                      bubbles: _bubbles,
                      bullet: _bullet,
                      aimAngle: _aimAngle,
                      currentAmmo: _currentAmmo,
                      nextAmmo: _nextAmmo,
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
                        '◀ Drag to Aim Cannon • Release to Shoot Bubbles ▶',
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
                          const Icon(Icons.bubble_chart_rounded, color: Color(0xFF00E5FF), size: 48),
                          const SizedBox(height: 12),
                          const Text(
                            'NEBULA BUBBLE SHOOTER',
                            style: TextStyle(color: Colors.white, fontSize: 19, fontWeight: FontWeight.w900, letterSpacing: 1.2),
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            'AIM & LAUNCH COLORFUL STARDUST BUBBLES!\nMATCH 3 OR MORE TO POP CLUSTERS.',
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
                            child: const Text('AIM & LAUNCH', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
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

class _BubbleShooterPainter extends CustomPainter {
  final List<_Bubble> bubbles;
  final _FlyingBubble? bullet;
  final double aimAngle;
  final int currentAmmo;
  final int nextAmmo;

  _BubbleShooterPainter({
    required this.bubbles,
    required this.bullet,
    required this.aimAngle,
    required this.currentAmmo,
    required this.nextAmmo,
  });

  @override
  void paint(Canvas canvas, Size size) {
    const colWidth = 0.84 / _BubbleShooterGameScreenState.gridCols;

    // 1. Draw Ceiling Bubbles
    for (final b in bubbles) {
      final x = 0.08 + (b.c + 0.5) * colWidth + (b.r % 2 == 1 ? colWidth * 0.5 : 0.0);
      final y = 0.08 + (b.r + 0.5) * 0.065;
      final center = Offset(x * size.width, y * size.height);
      const radius = 17.0;

      final color = _BubbleShooterGameScreenState.bubbleColors[b.colorIndex];

      final aura = Paint()
        ..color = color.withValues(alpha: 0.35)
        ..style = PaintingStyle.fill;
      canvas.drawCircle(center, radius + 4, aura);

      final bubblePaint = Paint()..color = color;
      canvas.drawCircle(center, radius, bubblePaint);

      final shine = Paint()..color = Colors.white.withValues(alpha: 0.8);
      canvas.drawCircle(center + const Offset(-4, -4), 4.0, shine);
    }

    // 2. Draw Cannon & Aiming Line
    final cannonOrigin = Offset(size.width * 0.5, size.height * 0.88);

    // Aim dotted line
    final aimPaint = Paint()
      ..color = const Color(0xFF00E5FF).withValues(alpha: 0.45)
      ..strokeWidth = 2.0;

    for (int i = 1; i <= 10; i++) {
      final dot = cannonOrigin + Offset(cos(aimAngle), sin(aimAngle)) * (i * 26.0);
      canvas.drawCircle(dot, 3.0, aimPaint);
    }

    // Cannon Barrel
    final barrelTip = cannonOrigin + Offset(cos(aimAngle), sin(aimAngle)) * 34.0;
    final barrelPaint = Paint()
      ..color = const Color(0xFF1E293B)
      ..strokeWidth = 14.0
      ..strokeCap = StrokeCap.round;
    canvas.drawLine(cannonOrigin, barrelTip, barrelPaint);

    // Current Ammo in Cannon
    final ammoColor = _BubbleShooterGameScreenState.bubbleColors[currentAmmo];
    final ammoPaint = Paint()..color = ammoColor;
    canvas.drawCircle(cannonOrigin, 18.0, ammoPaint);

    // Next Ammo preview on the side
    final nextColor = _BubbleShooterGameScreenState.bubbleColors[nextAmmo];
    final nextPaint = Paint()..color = nextColor;
    canvas.drawCircle(cannonOrigin + const Offset(42, 0), 12.0, nextPaint);

    // 3. Draw Flying Bullet
    if (bullet != null) {
      final bCenter = Offset(bullet!.x * size.width, bullet!.y * size.height);
      final bColor = _BubbleShooterGameScreenState.bubbleColors[bullet!.colorIndex];

      final bulletAura = Paint()
        ..color = bColor.withValues(alpha: 0.5)
        ..style = PaintingStyle.fill;
      canvas.drawCircle(bCenter, 22.0, bulletAura);

      final bulletPaint = Paint()..color = bColor;
      canvas.drawCircle(bCenter, 18.0, bulletPaint);
    }
  }

  @override
  bool shouldRepaint(covariant _BubbleShooterPainter oldDelegate) => true;
}
