import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class HyperspaceRacerGameScreen extends StatefulWidget {
  final Function(int coins, int xp) onGameFinished;

  const HyperspaceRacerGameScreen({super.key, required this.onGameFinished});

  @override
  State<HyperspaceRacerGameScreen> createState() => _HyperspaceRacerGameScreenState();
}

class _HighwayEntity {
  int lane; // 0: Left, 1: Center, 2: Right
  double z; // 0.0 (horizon) to 1.0 (player)
  final bool isBoost;
  final bool isCoin;
  bool collected = false;

  _HighwayEntity({
    required this.lane,
    required this.z,
    this.isBoost = false,
    this.isCoin = false,
  });
}

class _HyperspaceRacerGameScreenState extends State<HyperspaceRacerGameScreen> with SingleTickerProviderStateMixin {
  late AnimationController _ticker;

  bool _isPlaying = false;
  bool _isGameOver = false;

  // Player state
  int _currentLane = 1; // 0, 1, 2
  double _playerLaneX = 1.0; // smooth lane transition 0.0 .. 2.0
  int _lives = 3;
  double _distance = 0.0;
  int _score = 0;
  double _speed = 0.007;
  bool _hasBoost = false;
  double _boostTimer = 0.0;

  final List<_HighwayEntity> _entities = [];
  double _spawnTimer = 0.0;

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
      _currentLane = 1;
      _playerLaneX = 1.0;
      _lives = 3;
      _distance = 0.0;
      _score = 0;
      _speed = 0.007;
      _hasBoost = false;
      _boostTimer = 0.0;
      _entities.clear();
      _spawnTimer = 0.0;
    });
    _ticker.forward(from: 0.0);
  }

  void _shiftLane(int dir) {
    if (!_isPlaying || _isGameOver) return;
    final next = (_currentLane + dir).clamp(0, 2);
    if (next != _currentLane) {
      setState(() {
        _currentLane = next;
      });
      HapticFeedback.selectionClick();
    }
  }

  void _gameLoop() {
    if (!_isPlaying || _isGameOver) return;

    setState(() {
      // Smooth lane lerp
      _playerLaneX += (_currentLane - _playerLaneX) * 0.22;

      // Distance and speed
      final currentSpeed = _hasBoost ? _speed * 2.2 : _speed;
      _distance += currentSpeed * 120;
      _score += (_hasBoost ? 3 : 1);

      // Boost timer countdown
      if (_hasBoost) {
        _boostTimer -= 0.016;
        if (_boostTimer <= 0) {
          _hasBoost = false;
        }
      }

      // Entity spawn
      _spawnTimer += 0.016;
      if (_spawnTimer > (_hasBoost ? 0.35 : 0.65)) {
        _spawnTimer = 0.0;
        final rand = Random();
        final lane = rand.nextInt(3);
        final roll = rand.nextDouble();

        if (roll < 0.25) {
          // Boost pad
          _entities.add(_HighwayEntity(lane: lane, z: 0.0, isBoost: true));
        } else if (roll < 0.55) {
          // Stardust Coin
          _entities.add(_HighwayEntity(lane: lane, z: 0.0, isCoin: true));
        } else {
          // Obstacle drone/asteroid
          _entities.add(_HighwayEntity(lane: lane, z: 0.0));
        }
      }

      // Move entities towards player
      for (int i = _entities.length - 1; i >= 0; i--) {
        final e = _entities[i];
        e.z += currentSpeed * (1.0 + e.z * 1.5); // perspective acceleration

        // Collision check when near player (z ~ 0.85 to 0.95)
        if (!e.collected && e.z >= 0.82 && e.z <= 0.96) {
          if ((e.lane - _playerLaneX).abs() < 0.45) {
            e.collected = true;
            if (e.isBoost) {
              _hasBoost = true;
              _boostTimer = 4.5;
              _score += 100;
              HapticFeedback.mediumImpact();
            } else if (e.isCoin) {
              _score += 40;
              HapticFeedback.lightImpact();
            } else {
              // Obstacle hit
              if (!_hasBoost) {
                _lives -= 1;
                HapticFeedback.heavyImpact();
                if (_lives <= 0) {
                  _onGameOver();
                  return;
                }
              }
            }
          }
        }

        // Passed screen
        if (e.z > 1.15) {
          _entities.removeAt(i);
        }
      }

      // Gradually increase base speed
      if (_speed < 0.015) {
        _speed += 0.000003;
      }
    });
  }

  void _onGameOver() {
    _ticker.stop();
    HapticFeedback.vibrate();

    final earnedCoins = (_score / 20).round() + (_distance / 50).round() + 15;
    final earnedXP = (_score / 25).round() + (_distance / 40).round() + 20;

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
            Icon(Icons.speed_rounded, color: Color(0xFF00E5FF), size: 28),
            SizedBox(width: 8),
            Text('Speeder Totaled!', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Distance: ${_distance.toInt()}m', style: const TextStyle(color: Color(0xFFFFD700), fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            Text('Score: $_score', style: const TextStyle(color: Colors.white70, fontSize: 14)),
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
            child: const Text('RACE AGAIN', style: TextStyle(fontWeight: FontWeight.bold)),
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
        title: const Text('Cosmic Hyperspace Racer', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
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
                  const Icon(Icons.route, color: Color(0xFF00E5FF), size: 18),
                  const SizedBox(width: 4),
                  Text('${_distance.toInt()}m', style: const TextStyle(color: Color(0xFF00E5FF), fontWeight: FontWeight.bold, fontSize: 15)),
                ],
              ),
            ),
          ),
        ],
      ),
      body: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onHorizontalDragUpdate: (details) {
          if (details.delta.dx < -8) _shiftLane(-1);
          if (details.delta.dx > 8) _shiftLane(1);
        },
        child: Stack(
          children: [
            Positioned.fill(
              child: CustomPaint(
                painter: _HyperspaceTrackPainter(
                  playerLaneX: _playerLaneX,
                  entities: _entities,
                  hasBoost: _hasBoost,
                ),
              ),
            ),

            // Boost Indicator Banner
            if (_hasBoost)
              Positioned(
                top: 16,
                left: 0,
                right: 0,
                child: Center(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(colors: [Color(0xFF00E5FF), Color(0xFFEC4899)]),
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(color: const Color(0xFF00E5FF).withValues(alpha: 0.6), blurRadius: 15),
                      ],
                    ),
                    child: const Text(
                      '⚡ HYPERDRIVE TURBO ACTIVE! ⚡',
                      style: TextStyle(color: Colors.black, fontWeight: FontWeight.w900, fontSize: 13, letterSpacing: 1.2),
                    ),
                  ),
                ),
              ),

            // Onscreen Steering Controls
            Positioned(
              bottom: 20,
              left: 20,
              right: 20,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _buildSteerButton(Icons.arrow_back_rounded, () => _shiftLane(-1)),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.6),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: const Text(
                      '◀ Swipe or Tap to Switch Lanes ▶',
                      style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold),
                    ),
                  ),
                  _buildSteerButton(Icons.arrow_forward_rounded, () => _shiftLane(1)),
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
                    border: Border.all(color: const Color(0xFF00E5FF), width: 2),
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.speed_rounded, color: Color(0xFF00E5FF), size: 48),
                      const SizedBox(height: 12),
                      const Text(
                        'HYPERSPACE RACER',
                        style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900, letterSpacing: 1.2),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'PILOT ALIFI\'S HOVER SPEEDER DOWN THE 3-LANE WARP TUNNEL!\nHIT BOOST PADS & DODGE SPACE HAZARDS.',
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
                        child: const Text('IGNITE ENGINES', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
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

  Widget _buildSteerButton(IconData icon, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        width: 60,
        height: 60,
        decoration: BoxDecoration(
          color: const Color(0xFF1E293B),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: const Color(0xFF00E5FF).withValues(alpha: 0.5), width: 2),
          boxShadow: [
            BoxShadow(color: const Color(0xFF00E5FF).withValues(alpha: 0.25), blurRadius: 10),
          ],
        ),
        child: Icon(icon, color: const Color(0xFF00E5FF), size: 36),
      ),
    );
  }
}

class _HyperspaceTrackPainter extends CustomPainter {
  final double playerLaneX;
  final List<_HighwayEntity> entities;
  final bool hasBoost;

  _HyperspaceTrackPainter({
    required this.playerLaneX,
    required this.entities,
    required this.hasBoost,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final horizonY = size.height * 0.15;
    final horizonX = size.width * 0.5;

    // 1. Draw 3-Lane Perspective Highway
    final trackPath = Path()
      ..moveTo(horizonX - 30, horizonY)
      ..lineTo(horizonX + 30, horizonY)
      ..lineTo(size.width * 0.95, size.height)
      ..lineTo(size.width * 0.05, size.height)
      ..close();

    final trackPaint = Paint()
      ..shader = LinearGradient(
        colors: [
          const Color(0xFF0F172A),
          hasBoost ? const Color(0xFF1E1B4B) : const Color(0xFF070514),
        ],
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
      ).createShader(Rect.fromLTWH(0, horizonY, size.width, size.height - horizonY));
    canvas.drawPath(trackPath, trackPaint);

    // Highway neon boundary rails
    final railPaint = Paint()
      ..color = hasBoost ? const Color(0xFFEC4899) : const Color(0xFF00E5FF)
      ..strokeWidth = 3.0;
    canvas.drawLine(Offset(horizonX - 30, horizonY), Offset(size.width * 0.05, size.height), railPaint);
    canvas.drawLine(Offset(horizonX + 30, horizonY), Offset(size.width * 0.95, size.height), railPaint);

    // Lane dividers
    final dividerPaint = Paint()
      ..color = Colors.white.withValues(alpha: 0.15)
      ..strokeWidth = 1.5;
    for (int i = 1; i <= 2; i++) {
      final topX = (horizonX - 30) + i * 20;
      final botX = (size.width * 0.05) + i * (size.width * 0.90 / 3);
      canvas.drawLine(Offset(topX, horizonY), Offset(botX, size.height), dividerPaint);
    }

    // Helper for perspective projection (lane 0..2, z 0..1)
    Offset project(int lane, double z) {
      final y = horizonY + z * (size.height - horizonY);
      final trackLeft = (horizonX - 30) + z * (size.width * 0.05 - (horizonX - 30));
      final trackRight = (horizonX + 30) + z * (size.width * 0.95 - (horizonX + 30));
      final laneWidth = (trackRight - trackLeft) / 3;
      final x = trackLeft + (lane + 0.5) * laneWidth;
      return Offset(x, y);
    }

    // 2. Draw Entities
    for (final e in entities) {
      if (e.collected) continue;
      final pos = project(e.lane, e.z);
      final scale = 0.3 + e.z * 1.4;

      if (e.isBoost) {
        // Boost pad chevron (Cyan glow)
        final boostPaint = Paint()
          ..color = const Color(0xFF00E5FF)
          ..style = PaintingStyle.fill;
        canvas.drawCircle(pos, 14 * scale, boostPaint);
        final innerChevron = Paint()..color = Colors.white;
        canvas.drawCircle(pos, 7 * scale, innerChevron);
      } else if (e.isCoin) {
        // Stardust Coin (Gold)
        final coinPaint = Paint()..color = const Color(0xFFFFD700);
        canvas.drawCircle(pos, 12 * scale, coinPaint);
      } else {
        // Hazard Asteroid (Crimson spike)
        final hazardPaint = Paint()..color = const Color(0xFFFF5252);
        canvas.drawRRect(
          RRect.fromRectAndRadius(
            Rect.fromCenter(center: pos, width: 26 * scale, height: 18 * scale),
            Radius.circular(6 * scale),
          ),
          hazardPaint,
        );
      }
    }

    // 3. Draw Player Speeder (at z = 0.88)
    final playerY = horizonY + 0.88 * (size.height - horizonY);
    final botTrackLeft = size.width * 0.05;
    final botLaneWidth = (size.width * 0.90) / 3;
    final playerX = botTrackLeft + (playerLaneX + 0.5) * botLaneWidth;
    final speederCenter = Offset(playerX, playerY);

    // Jet Engine Exhaust
    final jetPaint = Paint()
      ..color = (hasBoost ? const Color(0xFFEC4899) : const Color(0xFF00E5FF)).withValues(alpha: 0.7)
      ..style = PaintingStyle.fill;
    canvas.drawOval(
      Rect.fromCenter(center: speederCenter + const Offset(0, 16), width: 18, height: hasBoost ? 28 : 16),
      jetPaint,
    );

    // Speeder Chassis
    final speederPaint = Paint()
      ..shader = const LinearGradient(
        colors: [Color(0xFF00E5FF), Color(0xFF8B5CF6)],
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
      ).createShader(Rect.fromCenter(center: speederCenter, width: 36, height: 26));

    final speederPath = Path()
      ..moveTo(speederCenter.dx, speederCenter.dy - 16)
      ..lineTo(speederCenter.dx + 18, speederCenter.dy + 12)
      ..lineTo(speederCenter.dx - 18, speederCenter.dy + 12)
      ..close();
    canvas.drawPath(speederPath, speederPaint);

    // Cockpit
    final cockpitPaint = Paint()..color = const Color(0xFFFFD700);
    canvas.drawCircle(speederCenter + const Offset(0, 2), 5, cockpitPaint);
  }

  @override
  bool shouldRepaint(covariant _HyperspaceTrackPainter oldDelegate) => true;
}
