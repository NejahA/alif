import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class VoidMeteorRushGameScreen extends StatefulWidget {
  final Function(int coins, int xp) onGameFinished;

  const VoidMeteorRushGameScreen({super.key, required this.onGameFinished});

  @override
  State<VoidMeteorRushGameScreen> createState() => _VoidMeteorRushGameScreenState();
}

class _Meteor {
  double x;
  double y;
  double size;
  double speed;
  double rotation;
  double rotSpeed;

  _Meteor({
    required this.x,
    required this.y,
    required this.size,
    required this.speed,
    required this.rotation,
    required this.rotSpeed,
  });
}

class _StarCrystal {
  double x;
  double y;
  bool isShield;

  _StarCrystal({required this.x, required this.y, this.isShield = false});
}

class _VoidMeteorRushGameScreenState extends State<VoidMeteorRushGameScreen> with SingleTickerProviderStateMixin {
  late AnimationController _ticker;
  double _shipX = 0.5; // normalized 0..1
  double _targetShipX = 0.5;
  int _score = 0;
  bool _hasShield = false;
  bool _isGameOver = false;

  final List<_Meteor> _meteors = [];
  final List<_StarCrystal> _crystals = [];
  final Random _rand = Random();

  double _spawnTimer = 0.0;
  double _difficultyTimer = 0.0;
  double _gameSpeed = 1.0;

  @override
  void initState() {
    super.initState();
    _ticker = AnimationController(vsync: this, duration: const Duration(seconds: 1))..repeat();
    _ticker.addListener(_updateGame);
  }

  @override
  void dispose() {
    _ticker.dispose();
    super.dispose();
  }

  void _updateGame() {
    if (_isGameOver) return;

    final dt = 0.016;
    _difficultyTimer += dt;
    _gameSpeed = 1.0 + (_difficultyTimer * 0.025).clamp(0.0, 1.8);

    // Smooth ship position interpolation
    _shipX += (_targetShipX - _shipX) * 0.25;

    // Spawn meteors
    _spawnTimer += dt * _gameSpeed;
    if (_spawnTimer >= 0.45) {
      _spawnTimer = 0.0;
      _meteors.add(
        _Meteor(
          x: 0.08 + _rand.nextDouble() * 0.84,
          y: -0.1,
          size: 28.0 + _rand.nextDouble() * 22.0,
          speed: 0.35 + _rand.nextDouble() * 0.35,
          rotation: _rand.nextDouble() * pi * 2,
          rotSpeed: (_rand.nextDouble() - 0.5) * 3.0,
        ),
      );

      // Chance to spawn crystal or shield
      if (_rand.nextDouble() < 0.40) {
        _crystals.add(
          _StarCrystal(
            x: 0.12 + _rand.nextDouble() * 0.76,
            y: -0.1,
            isShield: _rand.nextDouble() < 0.18 && !_hasShield,
          ),
        );
      }
    }

    // Update meteors
    for (int i = _meteors.length - 1; i >= 0; i--) {
      final m = _meteors[i];
      m.y += m.speed * _gameSpeed * dt;
      m.rotation += m.rotSpeed * dt;

      // Check collision with ship (ship is at y = 0.82)
      final dx = m.x - _shipX;
      final dy = m.y - 0.82;
      final distSq = dx * dx + dy * dy;

      if (distSq < 0.0035) {
        // Hit!
        if (_hasShield) {
          _hasShield = false;
          _meteors.removeAt(i);
          HapticFeedback.mediumImpact();
          continue;
        } else {
          _endGame();
          return;
        }
      }

      if (m.y > 1.1) {
        _meteors.removeAt(i);
      }
    }

    // Update crystals
    for (int i = _crystals.length - 1; i >= 0; i--) {
      final c = _crystals[i];
      c.y += 0.45 * _gameSpeed * dt;

      final dx = c.x - _shipX;
      final dy = c.y - 0.82;
      if (dx * dx + dy * dy < 0.004) {
        if (c.isShield) {
          _hasShield = true;
          HapticFeedback.lightImpact();
        } else {
          _score += 1;
          HapticFeedback.selectionClick();
        }
        _crystals.removeAt(i);
        continue;
      }

      if (c.y > 1.1) {
        _crystals.removeAt(i);
      }
    }

    setState(() {});
  }

  void _endGame() {
    _isGameOver = true;
    _ticker.stop();
    HapticFeedback.heavyImpact();

    final coins = _score * 4;
    final xp = _score * 5;
    widget.onGameFinished(coins, xp);

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
          side: const BorderSide(color: Color(0xFFFF5252), width: 2),
        ),
        title: const Text('💥 Hull Breach!', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Stars Secured: $_score', style: const TextStyle(color: Color(0xFFFFD700), fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            Text('Earned: +$coins Coins & +$xp XP', style: const TextStyle(color: Colors.white70, fontSize: 15)),
          ],
        ),
        actions: [
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFFF5252),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
            onPressed: () {
              Navigator.pop(ctx);
              Navigator.pop(context);
            },
            child: const Text('DEPLOY BACK', style: TextStyle(fontWeight: FontWeight.bold)),
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
        title: const Text('Void Meteor Rush', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        actions: [
          Center(
            child: Padding(
              padding: const EdgeInsets.only(right: 16),
              child: Row(
                children: [
                  const Icon(Icons.stars, color: Color(0xFFFFD700), size: 20),
                  const SizedBox(width: 4),
                  Text('$_score', style: const TextStyle(color: Color(0xFFFFD700), fontSize: 18, fontWeight: FontWeight.bold)),
                  if (_hasShield) ...[
                    const SizedBox(width: 12),
                    const Icon(Icons.shield, color: Color(0xFF00E5FF), size: 18),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
      body: GestureDetector(
        onHorizontalDragUpdate: (details) {
          final boxWidth = context.size?.width ?? 400;
          setState(() {
            _targetShipX = (_targetShipX + details.delta.dx / boxWidth).clamp(0.08, 0.92);
          });
        },
        onTapDown: (details) {
          final boxWidth = context.size?.width ?? 400;
          setState(() {
            _targetShipX = (details.localPosition.dx / boxWidth).clamp(0.08, 0.92);
          });
        },
        child: Stack(
          children: [
            // Ambient Star Field
            Positioned.fill(
              child: CustomPaint(
                painter: _SpaceFieldPainter(
                  meteors: _meteors,
                  crystals: _crystals,
                  shipX: _shipX,
                  hasShield: _hasShield,
                ),
              ),
            ),

            // Controls Hint overlay at bottom
            Positioned(
              bottom: 20,
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
                    '◀ Drag or Tap to steer Alifi ▶',
                    style: TextStyle(color: Colors.white60, fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SpaceFieldPainter extends CustomPainter {
  final List<_Meteor> meteors;
  final List<_StarCrystal> crystals;
  final double shipX;
  final bool hasShield;

  _SpaceFieldPainter({
    required this.meteors,
    required this.crystals,
    required this.shipX,
    required this.hasShield,
  });

  @override
  void paint(Canvas canvas, Size size) {
    // 1. Draw Crystals
    final crystalPaint = Paint()..style = PaintingStyle.fill;
    for (final c in crystals) {
      final pos = Offset(c.x * size.width, c.y * size.height);
      crystalPaint.color = c.isShield ? const Color(0xFF00E5FF) : const Color(0xFFFFD700);
      canvas.drawCircle(pos, c.isShield ? 9.0 : 7.0, crystalPaint);

      // Glow halo
      final glowPaint = Paint()
        ..color = (c.isShield ? const Color(0xFF00E5FF) : const Color(0xFFFFD700)).withValues(alpha: 0.35)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 3.0;
      canvas.drawCircle(pos, c.isShield ? 13.0 : 10.0, glowPaint);
    }

    // 2. Draw Meteors
    for (final m in meteors) {
      canvas.save();
      final pos = Offset(m.x * size.width, m.y * size.height);
      canvas.translate(pos.dx, pos.dy);
      canvas.rotate(m.rotation);

      final meteorPaint = Paint()
        ..color = const Color(0xFF64748B)
        ..style = PaintingStyle.fill;
      final rimPaint = Paint()
        ..color = const Color(0xFFEF4444).withValues(alpha: 0.75)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2.0;

      final half = m.size / 2;
      final path = Path()
        ..moveTo(0, -half)
        ..lineTo(half * 0.8, -half * 0.4)
        ..lineTo(half, half * 0.6)
        ..lineTo(0, half)
        ..lineTo(-half * 0.8, half * 0.4)
        ..lineTo(-half * 0.7, -half * 0.5)
        ..close();

      canvas.drawPath(path, meteorPaint);
      canvas.drawPath(path, rimPaint);
      canvas.restore();
    }

    // 3. Draw Alifi Shuttle
    final shipPos = Offset(shipX * size.width, size.height * 0.82);

    // Thruster fire
    final flamePaint = Paint()
      ..color = const Color(0xFFFF9100)
      ..style = PaintingStyle.fill;
    final flamePath = Path()
      ..moveTo(shipPos.dx - 6, shipPos.dy + 12)
      ..lineTo(shipPos.dx, shipPos.dy + 26)
      ..lineTo(shipPos.dx + 6, shipPos.dy + 12)
      ..close();
    canvas.drawPath(flamePath, flamePaint);

    // Shuttle hull
    final shipPaint = Paint()
      ..color = const Color(0xFF8B5CF6)
      ..style = PaintingStyle.fill;
    final outlinePaint = Paint()
      ..color = const Color(0xFFEC4899)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.5;

    final hull = Path()
      ..moveTo(shipPos.dx, shipPos.dy - 16)
      ..lineTo(shipPos.dx + 16, shipPos.dy + 12)
      ..lineTo(shipPos.dx, shipPos.dy + 6)
      ..lineTo(shipPos.dx - 16, shipPos.dy + 12)
      ..close();

    canvas.drawPath(hull, shipPaint);
    canvas.drawPath(hull, outlinePaint);

    // Canopy
    final canopyPaint = Paint()..color = const Color(0xFF00E5FF);
    canvas.drawCircle(Offset(shipPos.dx, shipPos.dy - 2), 4.5, canopyPaint);

    // Shield Dome if active
    if (hasShield) {
      final shieldPaint = Paint()
        ..color = const Color(0xFF00E5FF).withValues(alpha: 0.6)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2.5;
      canvas.drawCircle(shipPos, 24.0, shieldPaint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
