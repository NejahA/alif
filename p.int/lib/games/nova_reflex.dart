import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

const int _totalRounds = 10;
const double _baseSpeed = 0.85; // normalized track units per second
const double _speedStep = 0.08;
const double _baseZoneHalf = 0.18; // half-width of the target zone (fraction of track)
const double _zoneStep = 0.014;
const double _minZoneHalf = 0.055;
const double _perfectFrac = 0.28;
const double _greatFrac = 0.60;
const double _trackInset = 24.0;
const double _trackHeight = 46.0;

class NovaReflexGameScreen extends StatefulWidget {
  final Function(int coins, int xp) onGameFinished;

  const NovaReflexGameScreen({super.key, required this.onGameFinished});

  @override
  State<NovaReflexGameScreen> createState() => _NovaReflexGameScreenState();
}

class _Star {
  final double x;
  final double y;
  final double radius;
  final double alpha;

  const _Star({required this.x, required this.y, required this.radius, required this.alpha});
}

class _NovaReflexGameScreenState extends State<NovaReflexGameScreen> with SingleTickerProviderStateMixin {
  late final AnimationController _ticker;

  final List<_Star> _stars = [];

  Duration _lastTick = Duration.zero;

  bool _isPlaying = false;
  bool _isGameOver = false;
  bool _rewardGranted = false;

  int _round = 1;
  int _score = 0;
  int _combo = 0;
  int _bestCombo = 0;
  int _bestRank = 0;

  double _markerPos = 0.0;
  double _markerDir = 1.0;
  double _markerSpeed = _baseSpeed;
  double _zoneHalf = _baseZoneHalf;

  double _resolveTimer = 0.0;
  double _flashTimer = 0.0;
  String _flashLabel = '';
  Color _flashColor = const Color(0xFF00E5FF);

  @override
  void initState() {
    super.initState();
    final rand = Random(29);
    for (int i = 0; i < 70; i++) {
      _stars.add(
        _Star(
          x: rand.nextDouble(),
          y: rand.nextDouble(),
          radius: 0.6 + rand.nextDouble() * 1.7,
          alpha: 0.12 + rand.nextDouble() * 0.6,
        ),
      );
    }
    _ticker = AnimationController(vsync: this, duration: const Duration(minutes: 10))..addListener(_gameLoop);
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
      _rewardGranted = false;
      _round = 1;
      _score = 0;
      _combo = 0;
      _bestCombo = 0;
      _bestRank = 0;
      _resolveTimer = 0.0;
      _flashTimer = 0.0;
      _flashLabel = '';
      _flashColor = const Color(0xFF00E5FF);
      _setupRound();
    });
    _lastTick = Duration.zero;
    _ticker.forward(from: 0.0);
  }

  void _setupRound() {
    _markerSpeed = _baseSpeed + (_round - 1) * _speedStep;
    _zoneHalf = max(_minZoneHalf, _baseZoneHalf - (_round - 1) * _zoneStep);
    _markerPos = 0.0;
    _markerDir = 1.0;
  }

  void _gameLoop() {
    if (!mounted) return;

    final now = _ticker.lastElapsedDuration ?? Duration.zero;
    var dt = (now - _lastTick).inMicroseconds / 1000000.0;
    _lastTick = now;
    if (dt <= 0 || dt > 0.05) dt = 0.016;

    if (!_isPlaying || _isGameOver) return;

    var shouldFinish = false;
    setState(() {
      if (_flashTimer > 0) _flashTimer = max(0.0, _flashTimer - dt);

      if (_resolveTimer > 0) {
        _resolveTimer -= dt;
        if (_resolveTimer <= 0) {
          _resolveTimer = 0.0;
          if (_round >= _totalRounds) {
            shouldFinish = true;
          } else {
            _round += 1;
            _setupRound();
          }
        }
        return;
      }

      _markerPos += _markerDir * _markerSpeed * dt;
      if (_markerPos >= 1.0) {
        _markerPos = 1.0;
        _markerDir = -1.0;
      } else if (_markerPos <= 0.0) {
        _markerPos = 0.0;
        _markerDir = 1.0;
      }
    });

    if (shouldFinish) _finishGame();
  }

  void _handleTap() {
    if (!_isPlaying || _isGameOver) return;
    if (_resolveTimer > 0) return;

    final distance = (_markerPos - 0.5).abs();
    late String label;
    late int points;
    late Color color;
    late int rank;
    if (distance <= _zoneHalf * _perfectFrac) {
      label = 'PERFECT!';
      points = 100;
      color = const Color(0xFFFFD700);
      rank = 3;
    } else if (distance <= _zoneHalf * _greatFrac) {
      label = 'GREAT!';
      points = 60;
      color = const Color(0xFF00E5FF);
      rank = 2;
    } else if (distance <= _zoneHalf) {
      label = 'GOOD!';
      points = 30;
      color = const Color(0xFF22C55E);
      rank = 1;
    } else {
      label = 'MISS';
      points = 0;
      color = const Color(0xFFEC4899);
      rank = 0;
    }

    HapticFeedback.selectionClick();
    setState(() {
      _score += points;
      if (rank > 0) {
        _combo += 1;
        if (_combo > _bestCombo) _bestCombo = _combo;
      } else {
        _combo = 0;
      }
      if (rank > _bestRank) _bestRank = rank;
      _flashLabel = label;
      _flashColor = color;
      _flashTimer = 0.85;
      _resolveTimer = 0.75;
    });
  }

  String _ratingName(int rank) {
    if (rank >= 3) return 'PERFECT';
    if (rank == 2) return 'GREAT';
    if (rank == 1) return 'GOOD';
    return 'MISS';
  }

  void _finishGame() {
    if (_rewardGranted) return;
    _rewardGranted = true;
    _ticker.stop();

    final earnedCoins = (20 + _score * 0.07).round().clamp(20, 90);
    final earnedXP = (15 + _score * 0.055).round().clamp(15, 70);

    if (!mounted) return;

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
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
          side: const BorderSide(color: Color(0xFF00E5FF), width: 1.8),
        ),
        title: const Row(
          children: [
            Icon(Icons.bolt_rounded, color: Color(0xFFFFD700), size: 28),
            SizedBox(width: 8),
            Flexible(child: Text('Reflex Run Complete!', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold))),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Score: $_score', style: const TextStyle(color: Color(0xFFFFD700), fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            Text('Best rating: ${_ratingName(_bestRank)}  •  Best streak: ${_bestCombo}x', style: const TextStyle(color: Colors.white70, fontSize: 13)),
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
              foregroundColor: const Color(0xFF070514),
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
        title: const FittedBox(
          fit: BoxFit.scaleDown,
          alignment: Alignment.centerLeft,
          child: Text('Nova Reflex', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        ),
        actions: [
          Center(
            child: Padding(
              padding: const EdgeInsets.only(right: 12),
              child: FittedBox(
                fit: BoxFit.scaleDown,
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.gps_fixed_rounded, color: Color(0xFF00E5FF), size: 16),
                    const SizedBox(width: 3),
                    Text('$_round/$_totalRounds', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                    const SizedBox(width: 10),
                    const Icon(Icons.bolt_rounded, color: Color(0xFFFFD700), size: 16),
                    const SizedBox(width: 3),
                    Text('$_score', style: const TextStyle(color: Color(0xFFFFD700), fontWeight: FontWeight.bold, fontSize: 14)),
                    const SizedBox(width: 10),
                    const Icon(Icons.local_fire_department_rounded, color: Color(0xFFEC4899), size: 16),
                    const SizedBox(width: 3),
                    Text('$_combo', style: const TextStyle(color: Color(0xFFEC4899), fontWeight: FontWeight.bold, fontSize: 14)),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
      body: LayoutBuilder(
        builder: (context, _) {
          return GestureDetector(
            behavior: HitTestBehavior.opaque,
            onTapDown: (_) => _handleTap(),
            child: Stack(
              children: [
                Positioned.fill(
                  child: CustomPaint(
                    painter: _NovaReflexPainter(
                      stars: _stars,
                      markerPos: _markerPos,
                      zoneHalf: _zoneHalf,
                      showMarker: _isPlaying && !_isGameOver,
                    ),
                  ),
                ),

                // Round feedback flash
                if (_flashTimer > 0 && _flashLabel.isNotEmpty && _isPlaying && !_isGameOver)
                  Positioned(
                    top: 20,
                    left: 0,
                    right: 0,
                    child: IgnorePointer(
                      child: Center(
                        child: Opacity(
                          opacity: (_flashTimer / 0.85).clamp(0.0, 1.0),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
                            decoration: BoxDecoration(
                              color: Colors.black.withValues(alpha: 0.55),
                              borderRadius: BorderRadius.circular(18),
                              border: Border.all(color: _flashColor, width: 1.5),
                              boxShadow: [
                                BoxShadow(color: _flashColor.withValues(alpha: 0.35), blurRadius: 16, spreadRadius: 1),
                              ],
                            ),
                            child: Text(
                              _flashLabel,
                              style: TextStyle(color: _flashColor, fontSize: 18, fontWeight: FontWeight.w900, letterSpacing: 1.4),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),

                // Control hint
                if (_isPlaying && !_isGameOver)
                  Positioned(
                    bottom: 6,
                    left: 0,
                    right: 0,
                    child: IgnorePointer(
                      child: Center(
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.black.withValues(alpha: 0.45),
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: const Text(
                            '▲ TAP ANYWHERE TO STOP THE MARKER ▼',
                            style: TextStyle(color: Colors.white60, fontSize: 10, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ),
                    ),
                  ),

                // Start overlay
                if (!_isPlaying && !_isGameOver)
                  Center(
                    child: Container(
                      constraints: const BoxConstraints(maxWidth: 340),
                      margin: const EdgeInsets.symmetric(horizontal: 16),
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F172A).withValues(alpha: 0.95),
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: const Color(0xFF00E5FF), width: 2),
                      ),
                      child: SingleChildScrollView(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.bolt_rounded, color: Color(0xFF00E5FF), size: 48),
                            const SizedBox(height: 12),
                            const Text(
                              'NOVA REFLEX',
                              style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900, letterSpacing: 1.2),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 8),
                            const Text(
                              'Tap to freeze the sweeping marker inside the target zone!',
                              style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold, height: 1.4),
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 20),
                            ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF00E5FF),
                                foregroundColor: const Color(0xFF070514),
                                minimumSize: const Size.fromHeight(48),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                              ),
                              onPressed: _startGame,
                              child: const Text('START REFLEX', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                            ),
                          ],
                        ),
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

class _NovaReflexPainter extends CustomPainter {
  final List<_Star> stars;
  final double markerPos;
  final double zoneHalf;
  final bool showMarker;

  const _NovaReflexPainter({
    required this.stars,
    required this.markerPos,
    required this.zoneHalf,
    required this.showMarker,
  });

  @override
  void paint(Canvas canvas, Size size) {
    // Starfield backdrop.
    final starPaint = Paint();
    for (final s in stars) {
      starPaint.color = Colors.white.withValues(alpha: s.alpha * 0.85);
      canvas.drawCircle(Offset(s.x * size.width, s.y * size.height), s.radius, starPaint);
    }

    final trackLeft = _trackInset;
    final trackRight = size.width - _trackInset;
    if (trackRight <= trackLeft) return;

    final trackWidth = trackRight - trackLeft;
    final centerY = size.height * 0.5;
    final trackTop = centerY - _trackHeight / 2;
    final zoneCenterX = trackLeft + trackWidth / 2;

    // Track base.
    final trackRect = RRect.fromRectAndRadius(
      Rect.fromLTWH(trackLeft, trackTop, trackWidth, _trackHeight),
      const Radius.circular(_trackHeight / 2),
    );
    canvas.drawRRect(trackRect, Paint()..color = const Color(0xFF0F172A));
    canvas.drawRRect(
      trackRect,
      Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1.5
        ..color = const Color(0xFF00E5FF).withValues(alpha: 0.35),
    );

    // Target zone band.
    final zoneHalfPx = zoneHalf * trackWidth;
    final zoneRect = Rect.fromCenter(center: Offset(zoneCenterX, centerY), width: zoneHalfPx * 2, height: _trackHeight);
    canvas.drawRect(zoneRect, Paint()..color = const Color(0xFF8B5CF6).withValues(alpha: 0.20));
    canvas.drawRect(
      zoneRect,
      Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2
        ..color = const Color(0xFF8B5CF6),
    );

    // Perfect inner band.
    final perfectHalfPx = zoneHalfPx * _perfectFrac;
    final perfectRect = Rect.fromCenter(center: Offset(zoneCenterX, centerY), width: perfectHalfPx * 2, height: _trackHeight);
    canvas.drawRect(perfectRect, Paint()..color = const Color(0xFFFFD700).withValues(alpha: 0.24));

    // Centre line.
    canvas.drawLine(
      Offset(zoneCenterX, centerY - _trackHeight / 2),
      Offset(zoneCenterX, centerY + _trackHeight / 2),
      Paint()
        ..strokeWidth = 1.5
        ..color = const Color(0xFFFFD700).withValues(alpha: 0.75),
    );

    if (!showMarker) return;

    // Sweeping marker.
    final markerX = trackLeft + markerPos * trackWidth;
    final glowRect = Rect.fromCenter(center: Offset(markerX, centerY), width: 18, height: _trackHeight + 20);
    canvas.drawRRect(
      RRect.fromRectAndRadius(glowRect, const Radius.circular(10)),
      Paint()..color = const Color(0xFF00E5FF).withValues(alpha: 0.18),
    );
    final markerRect = Rect.fromCenter(center: Offset(markerX, centerY), width: 6, height: _trackHeight + 16);
    canvas.drawRRect(
      RRect.fromRectAndRadius(markerRect, const Radius.circular(4)),
      Paint()..color = const Color(0xFF00E5FF),
    );
    canvas.drawRect(
      Rect.fromCenter(center: Offset(markerX, centerY), width: 2, height: _trackHeight + 16),
      Paint()..color = Colors.white.withValues(alpha: 0.9),
    );
  }

  @override
  bool shouldRepaint(covariant _NovaReflexPainter oldDelegate) => true;
}
