import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class GalaxyDefenderGameScreen extends StatefulWidget {
  final Function(int coins, int xp) onGameFinished;

  const GalaxyDefenderGameScreen({super.key, required this.onGameFinished});

  @override
  State<GalaxyDefenderGameScreen> createState() => _GalaxyDefenderGameScreenState();
}

class _Invader {
  double x; // normalized 0..1
  double y;
  final int row;
  final Color color;
  final int points;
  bool isAlive = true;

  _Invader({
    required this.x,
    required this.y,
    required this.row,
    required this.color,
    required this.points,
  });
}

class _Laser {
  double x;
  double y;
  final bool isPlayer;

  _Laser({required this.x, required this.y, required this.isPlayer});
}

class _GalaxyDefenderGameScreenState extends State<GalaxyDefenderGameScreen> with SingleTickerProviderStateMixin {
  late AnimationController _ticker;

  bool _isPlaying = false;
  bool _isGameOver = false;

  double _playerX = 0.5;
  int _lives = 3;
  int _score = 0;
  int _wave = 1;

  final List<_Invader> _invaders = [];
  final List<_Laser> _lasers = [];

  double _invaderDir = 1.0;
  double _invaderSpeed = 0.0022;
  double _fireCooldown = 0.0;
  double _enemyFireCooldown = 0.0;

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

  void _spawnWave() {
    _invaders.clear();
    const rows = 3;
    const cols = 6;
    final rowColors = [
      const Color(0xFFFF5252), // Top: Red
      const Color(0xFFEC4899), // Mid: Pink
      const Color(0xFF00E5FF), // Bot: Cyan
    ];
    final rowPoints = [50, 30, 20];

    for (int r = 0; r < rows; r++) {
      for (int c = 0; c < cols; c++) {
        _invaders.add(
          _Invader(
            x: 0.14 + c * 0.14,
            y: 0.10 + r * 0.07,
            row: r,
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
      _wave = 1;
      _playerX = 0.5;
      _lasers.clear();
      _invaderDir = 1.0;
      _invaderSpeed = 0.0022;
      _spawnWave();
    });
    _ticker.forward(from: 0.0);
  }

  void _gameLoop() {
    if (!_isPlaying || _isGameOver) return;

    setState(() {
      // 1. Move Invaders
      bool hitEdge = false;
      for (final inv in _invaders) {
        if (!inv.isAlive) continue;
        inv.x += _invaderDir * _invaderSpeed;
        if (inv.x < 0.06 || inv.x > 0.94) {
          hitEdge = true;
        }
      }

      if (hitEdge) {
        _invaderDir = -_invaderDir;
        for (final inv in _invaders) {
          if (!inv.isAlive) continue;
          inv.y += 0.024;
          // Breach defense line
          if (inv.y > 0.82) {
            _onGameOver();
            return;
          }
        }
      }

      // 2. Player Auto-Fire Lasers
      _fireCooldown += 0.016;
      if (_fireCooldown > 0.28) {
        _fireCooldown = 0.0;
        _lasers.add(_Laser(x: _playerX - 0.03, y: 0.84, isPlayer: true));
        _lasers.add(_Laser(x: _playerX + 0.03, y: 0.84, isPlayer: true));
      }

      // 3. Enemy Random Lasers
      _enemyFireCooldown += 0.016;
      if (_enemyFireCooldown > (1.2 / _wave).clamp(0.4, 1.2)) {
        _enemyFireCooldown = 0.0;
        final livingInvaders = _invaders.where((i) => i.isAlive).toList();
        if (livingInvaders.isNotEmpty) {
          final shooter = livingInvaders[Random().nextInt(livingInvaders.length)];
          _lasers.add(_Laser(x: shooter.x, y: shooter.y + 0.02, isPlayer: false));
        }
      }

      // 4. Update Lasers
      for (int i = _lasers.length - 1; i >= 0; i--) {
        final laser = _lasers[i];
        if (laser.isPlayer) {
          laser.y -= 0.018;

          // Check hit on invaders
          bool hit = false;
          for (final inv in _invaders) {
            if (inv.isAlive && (laser.x - inv.x).abs() < 0.05 && (laser.y - inv.y).abs() < 0.04) {
              inv.isAlive = false;
              hit = true;
              _score += inv.points;
              HapticFeedback.lightImpact();
              break;
            }
          }
          if (hit || laser.y < -0.05) {
            _lasers.removeAt(i);
          }
        } else {
          laser.y += 0.010;

          // Check hit on player (at y = 0.86, radius 0.06)
          if ((laser.x - _playerX).abs() < 0.06 && (laser.y - 0.86).abs() < 0.035) {
            _lasers.removeAt(i);
            _lives -= 1;
            HapticFeedback.heavyImpact();
            if (_lives <= 0) {
              _onGameOver();
              return;
            }
          } else if (laser.y > 1.05) {
            _lasers.removeAt(i);
          }
        }
      }

      // 5. Check Wave Clear
      if (_invaders.every((i) => !i.isAlive)) {
        _wave += 1;
        _score += 150; // Wave bonus
        _invaderSpeed += 0.0006;
        _spawnWave();
        HapticFeedback.mediumImpact();
      }
    });
  }

  void _onGameOver() {
    _ticker.stop();
    HapticFeedback.vibrate();

    final earnedCoins = (_score / 15).round() + (_wave * 20) + 15;
    final earnedXP = (_score / 20).round() + (_wave * 15) + 20;

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
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24), side: const BorderSide(color: Color(0xFFFF5252), width: 1.8)),
        title: const Row(
          children: [
            Icon(Icons.shield_moon_rounded, color: Color(0xFFFF5252), size: 28),
            SizedBox(width: 8),
            Text('Defense Breached!', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Score: $_score', style: const TextStyle(color: Color(0xFFFFD700), fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            Text('Waves Cleared: ${_wave - 1}', style: const TextStyle(color: Colors.white70, fontSize: 14)),
            const SizedBox(height: 8),
            Text('Earned: +$earnedCoins Coins & +$earnedXP XP', style: const TextStyle(color: Color(0xFFFF5252), fontSize: 15, fontWeight: FontWeight.bold)),
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
              backgroundColor: const Color(0xFFFF5252),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
            onPressed: () {
              Navigator.pop(ctx);
              _startGame();
            },
            child: const Text('REDEPLOY', style: TextStyle(fontWeight: FontWeight.bold)),
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
        title: const Text('Galaxy Defender', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        actions: [
          Center(
            child: Padding(
              padding: const EdgeInsets.only(right: 16),
              child: Row(
                children: [
                  const Icon(Icons.favorite, color: Color(0xFFFF5252), size: 18),
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
            _playerX = (_playerX + details.delta.dx / boxWidth).clamp(0.08, 0.92);
          });
        },
        onTapDown: (details) {
          final boxWidth = context.size?.width ?? 400;
          setState(() {
            _playerX = (details.localPosition.dx / boxWidth).clamp(0.08, 0.92);
          });
        },
        child: Stack(
          children: [
            Positioned.fill(
              child: CustomPaint(
                painter: _GalaxyDefenderPainter(
                  playerX: _playerX,
                  invaders: _invaders,
                  lasers: _lasers,
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
                    '◀ Drag or Tap to maneuver Starfighter ▶',
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
                    border: Border.all(color: const Color(0xFFFF5252), width: 2),
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.rocket_launch_rounded, color: Color(0xFFFF5252), size: 48),
                      const SizedBox(height: 12),
                      const Text(
                        'GALAXY DEFENDER',
                        style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900, letterSpacing: 1.2),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'DEFEND THE SECTOR! PILOT ALIFI\'S STARFIGHTER TO INTERCEPT INVADER WAVES.',
                        style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold, height: 1.4),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 20),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFFF5252),
                          foregroundColor: Colors.white,
                          minimumSize: const Size.fromHeight(48),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        ),
                        onPressed: _startGame,
                        child: const Text('ENGAGE FLEET', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
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

class _GalaxyDefenderPainter extends CustomPainter {
  final double playerX;
  final List<_Invader> invaders;
  final List<_Laser> lasers;

  _GalaxyDefenderPainter({
    required this.playerX,
    required this.invaders,
    required this.lasers,
  });

  @override
  void paint(Canvas canvas, Size size) {
    // 1. Draw Invaders
    for (final inv in invaders) {
      if (!inv.isAlive) continue;

      final center = Offset(inv.x * size.width, inv.y * size.height);
      const invaderRadius = 14.0;

      // Invader glow
      final glowPaint = Paint()
        ..color = inv.color.withValues(alpha: 0.35)
        ..style = PaintingStyle.fill;
      canvas.drawCircle(center, invaderRadius + 4, glowPaint);

      // Core glyph
      final invaderPaint = Paint()..color = inv.color;
      canvas.drawRRect(
        RRect.fromRectAndRadius(
          Rect.fromCenter(center: center, width: invaderRadius * 1.8, height: invaderRadius * 1.4),
          const Radius.circular(5),
        ),
        invaderPaint,
      );

      // Eyes
      final eyePaint = Paint()..color = Colors.black;
      canvas.drawCircle(center + const Offset(-4, -1), 2.0, eyePaint);
      canvas.drawCircle(center + const Offset(4, -1), 2.0, eyePaint);
    }

    // 2. Draw Lasers
    for (final laser in lasers) {
      final pos = Offset(laser.x * size.width, laser.y * size.height);
      final laserPaint = Paint()
        ..color = laser.isPlayer ? const Color(0xFF00E5FF) : const Color(0xFFFF5252)
        ..strokeWidth = laser.isPlayer ? 3.0 : 4.0
        ..strokeCap = StrokeCap.round;

      canvas.drawLine(pos, pos + Offset(0, laser.isPlayer ? -14 : 14), laserPaint);
    }

    // 3. Draw Player Starfighter (at y = 0.86)
    final shipCenter = Offset(playerX * size.width, 0.86 * size.height);

    // Engine glow
    final thrusterPaint = Paint()
      ..color = const Color(0xFF00E5FF).withValues(alpha: 0.45)
      ..style = PaintingStyle.fill;
    canvas.drawCircle(shipCenter, 22.0, thrusterPaint);

    // Ship Hull (triangle)
    final shipPaint = Paint()
      ..shader = const LinearGradient(
        colors: [Color(0xFF00E5FF), Color(0xFF8B5CF6)],
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
      ).createShader(Rect.fromCircle(center: shipCenter, radius: 18));

    final path = Path()
      ..moveTo(shipCenter.dx, shipCenter.dy - 16)
      ..lineTo(shipCenter.dx + 16, shipCenter.dy + 12)
      ..lineTo(shipCenter.dx, shipCenter.dy + 6)
      ..lineTo(shipCenter.dx - 16, shipCenter.dy + 12)
      ..close();

    canvas.drawPath(path, shipPaint);

    // Cockpit
    final cockpitPaint = Paint()..color = const Color(0xFFFFD700);
    canvas.drawCircle(shipCenter + const Offset(0, -2), 4.5, cockpitPaint);
  }

  @override
  bool shouldRepaint(covariant _GalaxyDefenderPainter oldDelegate) => true;
}
