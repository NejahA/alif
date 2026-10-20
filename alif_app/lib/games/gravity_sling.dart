import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class GravitySlingGameScreen extends StatefulWidget {
  final Function(int coins, int xp) onGameFinished;

  const GravitySlingGameScreen({super.key, required this.onGameFinished});

  @override
  State<GravitySlingGameScreen> createState() => _GravitySlingGameScreenState();
}

class _Planet {
  final double x; // normalized 0..1
  final double y;
  final double radius;
  final double mass;
  final Color color;

  const _Planet({
    required this.x,
    required this.y,
    required this.radius,
    required this.mass,
    required this.color,
  });
}

class _Gem {
  double x;
  double y;
  bool collected = false;

  _Gem({required this.x, required this.y});
}

class _GravitySlingGameScreenState extends State<GravitySlingGameScreen> with SingleTickerProviderStateMixin {
  late AnimationController _ticker;

  bool _isPlaying = false;
  bool _isGameOver = false;
  bool _isAiming = false;
  bool _isInFlight = false;

  // Slingshot Start Origin
  final Offset _launchOrigin = const Offset(0.20, 0.82);
  Offset _alifiPos = const Offset(0.20, 0.82);
  Offset _dragPos = const Offset(0.20, 0.82);
  Offset _velocity = Offset.zero;

  int _shotsRemaining = 3;
  int _score = 0;
  int _sector = 1;

  final List<_Planet> _planets = [
    const _Planet(x: 0.50, y: 0.45, radius: 36, mass: 0.0018, color: Color(0xFF6366F1)),
    const _Planet(x: 0.78, y: 0.28, radius: 24, mass: 0.0011, color: Color(0xFFEC4899)),
  ];

  final List<_Gem> _gems = [];
  Offset _portalPos = const Offset(0.85, 0.75);

  final List<Offset> _trail = [];

  @override
  void initState() {
    super.initState();
    _ticker = AnimationController(vsync: this, duration: const Duration(seconds: 1000))
      ..addListener(_gameLoop);
    _initLevel();
  }

  @override
  void dispose() {
    _ticker.dispose();
    super.dispose();
  }

  void _initLevel() {
    _gems.clear();
    _trail.clear();
    _gems.addAll([
      _Gem(x: 0.50, y: 0.28),
      _Gem(x: 0.35, y: 0.50),
      _Gem(x: 0.72, y: 0.52),
    ]);
    _portalPos = const Offset(0.85, 0.75);
    _alifiPos = _launchOrigin;
    _velocity = Offset.zero;
    _isInFlight = false;
  }

  void _startGame() {
    setState(() {
      _isPlaying = true;
      _isGameOver = false;
      _shotsRemaining = 3;
      _score = 0;
      _sector = 1;
      _initLevel();
    });
    _ticker.forward(from: 0.0);
  }

  void _onPanStart(DragStartDetails details, Size size) {
    if (!_isPlaying || _isGameOver || _isInFlight) return;
    final touch = Offset(details.localPosition.dx / size.width, details.localPosition.dy / size.height);
    if ((touch - _launchOrigin).distance < 0.15) {
      setState(() {
        _isAiming = true;
        _dragPos = touch;
      });
    }
  }

  void _onPanUpdate(DragUpdateDetails details, Size size) {
    if (!_isAiming) return;
    setState(() {
      final touch = Offset(details.localPosition.dx / size.width, details.localPosition.dy / size.height);
      final delta = touch - _launchOrigin;
      // Clamp pullback distance
      if (delta.distance > 0.18) {
        _dragPos = _launchOrigin + (delta / delta.distance) * 0.18;
      } else {
        _dragPos = touch;
      }
    });
  }

  void _onPanEnd(DragEndDetails details) {
    if (!_isAiming) return;
    setState(() {
      _isAiming = false;
      final pull = _launchOrigin - _dragPos;
      if (pull.distance > 0.02) {
        _isInFlight = true;
        _shotsRemaining -= 1;
        _velocity = pull * 0.16; // Impulse
        _trail.clear();
        HapticFeedback.mediumImpact();
      } else {
        _alifiPos = _launchOrigin;
      }
    });
  }

  void _gameLoop() {
    if (!_isPlaying || _isGameOver || !_isInFlight) return;

    setState(() {
      // 1. Gravity from planets
      Offset totalAcc = Offset.zero;
      for (final p in _planets) {
        final planetOffset = Offset(p.x, p.y);
        final toPlanet = planetOffset - _alifiPos;
        final dist = toPlanet.distance;

        // Crash into planet
        if (dist < 0.065) {
          _resetShot(crashed: true);
          return;
        }

        final force = p.mass / max(dist * dist, 0.002);
        totalAcc += (toPlanet / dist) * force;
      }

      _velocity += totalAcc;
      _alifiPos += _velocity;
      _trail.add(_alifiPos);
      if (_trail.length > 35) _trail.removeAt(0);

      // 2. Collect Gems
      for (final gem in _gems) {
        if (!gem.collected && (Offset(gem.x, gem.y) - _alifiPos).distance < 0.05) {
          gem.collected = true;
          _score += 50;
          HapticFeedback.lightImpact();
        }
      }

      // 3. Reach Warp Portal
      if ((_portalPos - _alifiPos).distance < 0.065) {
        _score += 150 + (_shotsRemaining * 50);
        HapticFeedback.vibrate();
        _sector += 1;
        _shotsRemaining = 3;
        _initLevel();
        return;
      }

      // 4. Out of bounds check
      if (_alifiPos.dx < -0.1 || _alifiPos.dx > 1.1 || _alifiPos.dy < -0.1 || _alifiPos.dy > 1.1) {
        _resetShot(crashed: false);
      }
    });
  }

  void _resetShot({required bool crashed}) {
    HapticFeedback.heavyImpact();
    _isInFlight = false;
    _alifiPos = _launchOrigin;
    _velocity = Offset.zero;
    _trail.clear();

    if (_shotsRemaining <= 0) {
      _onGameOver();
    }
  }

  void _onGameOver() {
    _ticker.stop();
    HapticFeedback.vibrate();

    final earnedCoins = (_score / 10).round() + (_sector * 15) + 15;
    final earnedXP = (_score / 15).round() + (_sector * 12) + 20;

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
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24), side: const BorderSide(color: Color(0xFF6366F1), width: 1.8)),
        title: const Row(
          children: [
            Icon(Icons.public_rounded, color: Color(0xFF6366F1), size: 28),
            SizedBox(width: 8),
            Text('Orbit Complete!', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Score: $_score', style: const TextStyle(color: Color(0xFFFFD700), fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            Text('Sectors Traversed: $_sector', style: const TextStyle(color: Colors.white70, fontSize: 14)),
            const SizedBox(height: 8),
            Text('Earned: +$earnedCoins Coins & +$earnedXP XP', style: const TextStyle(color: Color(0xFF6366F1), fontSize: 15, fontWeight: FontWeight.bold)),
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
              backgroundColor: const Color(0xFF6366F1),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
            onPressed: () {
              Navigator.pop(ctx);
              _startGame();
            },
            child: const Text('RE-LAUNCH', style: TextStyle(fontWeight: FontWeight.bold)),
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
        title: const Text('Gravity Slingshot', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        actions: [
          Center(
            child: Padding(
              padding: const EdgeInsets.only(right: 16),
              child: Row(
                children: [
                  const Icon(Icons.rocket, color: Color(0xFF6366F1), size: 18),
                  const SizedBox(width: 4),
                  Text('$_shotsRemaining shots', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
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
      body: LayoutBuilder(
        builder: (context, constraints) {
          final size = Size(constraints.maxWidth, constraints.maxHeight);
          return GestureDetector(
            behavior: HitTestBehavior.opaque,
            onPanStart: (d) => _onPanStart(d, size),
            onPanUpdate: (d) => _onPanUpdate(d, size),
            onPanEnd: _onPanEnd,
            child: Stack(
              children: [
                Positioned.fill(
                  child: CustomPaint(
                    painter: _GravitySlingPainter(
                      alifiPos: _alifiPos,
                      dragPos: _dragPos,
                      launchOrigin: _launchOrigin,
                      isAiming: _isAiming,
                      planets: _planets,
                      gems: _gems,
                      portalPos: _portalPos,
                      trail: _trail,
                    ),
                  ),
                ),

                // Hint overlay
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
                        '◀ Pull back on Alifi & Release to Sling through gravity ▶',
                        style: TextStyle(color: Colors.white60, fontSize: 12, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                ),

                // Start overlay
                if (!_isPlaying && !_isGameOver)
                  Center(
                    child: Container(
                      constraints: const BoxConstraints(maxWidth: 340),
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F172A).withValues(alpha: 0.95),
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: const Color(0xFF6366F1), width: 2),
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.blur_circular_rounded, color: Color(0xFF6366F1), size: 48),
                          const SizedBox(height: 12),
                          const Text(
                            'GRAVITY SLINGSHOT',
                            style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900, letterSpacing: 1.2),
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            'SLINGSHOT ALIFI AROUND PLANETARY GRAVITY WELLS!\nCOLLECT ORBITAL GEMS & WARP OUT.',
                            style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold, height: 1.4),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 20),
                          ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF6366F1),
                              foregroundColor: Colors.white,
                              minimumSize: const Size.fromHeight(48),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            ),
                            onPressed: _startGame,
                            child: const Text('START ORBIT', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
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

class _GravitySlingPainter extends CustomPainter {
  final Offset alifiPos;
  final Offset dragPos;
  final Offset launchOrigin;
  final bool isAiming;
  final List<_Planet> planets;
  final List<_Gem> gems;
  final Offset portalPos;
  final List<Offset> trail;

  _GravitySlingPainter({
    required this.alifiPos,
    required this.dragPos,
    required this.launchOrigin,
    required this.isAiming,
    required this.planets,
    required this.gems,
    required this.portalPos,
    required this.trail,
  });

  @override
  void paint(Canvas canvas, Size size) {
    // 1. Draw Planets (Gravity Wells)
    for (final p in planets) {
      final center = Offset(p.x * size.width, p.y * size.height);

      // Atmosphere aura
      final auraPaint = Paint()
        ..color = p.color.withValues(alpha: 0.22)
        ..style = PaintingStyle.fill;
      canvas.drawCircle(center, p.radius + 18, auraPaint);

      // Core planet
      final planetPaint = Paint()
        ..shader = RadialGradient(
          colors: [p.color, p.color.withValues(alpha: 0.6)],
        ).createShader(Rect.fromCircle(center: center, radius: p.radius));
      canvas.drawCircle(center, p.radius, planetPaint);

      // Gravity field rings
      final ringPaint = Paint()
        ..color = p.color.withValues(alpha: 0.15)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1.5;
      canvas.drawCircle(center, p.radius + 36, ringPaint);
    }

    // 2. Draw Gems
    for (final g in gems) {
      if (g.collected) continue;
      final gemPos = Offset(g.x * size.width, g.y * size.height);

      final glow = Paint()
        ..color = const Color(0xFFFFD700).withValues(alpha: 0.4)
        ..style = PaintingStyle.fill;
      canvas.drawCircle(gemPos, 14.0, glow);

      final gemPaint = Paint()..color = const Color(0xFFFFD700);
      canvas.drawCircle(gemPos, 8.0, gemPaint);
    }

    // 3. Draw Warp Portal
    final portalCenter = Offset(portalPos.dx * size.width, portalPos.dy * size.height);
    final portalPaint = Paint()
      ..color = const Color(0xFF00E5FF).withValues(alpha: 0.35)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 4.0;
    canvas.drawCircle(portalCenter, 22.0, portalPaint);

    final portalCore = Paint()..color = const Color(0xFF00E5FF);
    canvas.drawCircle(portalCenter, 12.0, portalCore);

    // 4. Draw Trail
    final trailPaint = Paint()
      ..color = const Color(0xFFEC4899).withValues(alpha: 0.4)
      ..strokeWidth = 3.0
      ..strokeCap = StrokeCap.round;

    for (int i = 0; i < trail.length - 1; i++) {
      final p1 = Offset(trail[i].dx * size.width, trail[i].dy * size.height);
      final p2 = Offset(trail[i + 1].dx * size.width, trail[i + 1].dy * size.height);
      canvas.drawLine(p1, p2, trailPaint);
    }

    // 5. Slingshot Aim Guide
    if (isAiming) {
      final pOrigin = Offset(launchOrigin.dx * size.width, launchOrigin.dy * size.height);
      final pDrag = Offset(dragPos.dx * size.width, dragPos.dy * size.height);

      final linePaint = Paint()
        ..color = const Color(0xFF6366F1)
        ..strokeWidth = 3.0;
      canvas.drawLine(pOrigin, pDrag, linePaint);

      // Aim trajectory dotted line opposite to pull
      final aimDir = pOrigin - pDrag;
      final aimPaint = Paint()
        ..color = const Color(0xFF00E5FF).withValues(alpha: 0.6)
        ..strokeWidth = 2.0;

      for (int i = 1; i <= 8; i++) {
        final dotPos = pOrigin + aimDir * (i * 0.35);
        canvas.drawCircle(dotPos, 3.0, aimPaint);
      }
    }

    // 6. Draw Alifi Orb
    final pos = isAiming
        ? Offset(dragPos.dx * size.width, dragPos.dy * size.height)
        : Offset(alifiPos.dx * size.width, alifiPos.dy * size.height);

    const alifiRadius = 18.0;
    final aura = Paint()
      ..color = const Color(0xFFEC4899).withValues(alpha: 0.45)
      ..style = PaintingStyle.fill;
    canvas.drawCircle(pos, alifiRadius + 6, aura);

    final body = Paint()
      ..shader = const RadialGradient(
        colors: [Color(0xFFF472B6), Color(0xFF8B5CF6)],
      ).createShader(Rect.fromCircle(center: pos, radius: alifiRadius));
    canvas.drawCircle(pos, alifiRadius, body);

    // Eyes
    final eyes = Paint()..color = Colors.white;
    canvas.drawCircle(pos + const Offset(3, -2), 3.0, eyes);
    canvas.drawCircle(pos + const Offset(9, -2), 3.0, eyes);
  }

  @override
  bool shouldRepaint(covariant _GravitySlingPainter oldDelegate) => true;
}
