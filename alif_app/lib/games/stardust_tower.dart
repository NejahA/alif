import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class StardustTowerGameScreen extends StatefulWidget {
  final Function(int coins, int xp) onGameFinished;

  const StardustTowerGameScreen({super.key, required this.onGameFinished});

  @override
  State<StardustTowerGameScreen> createState() => _StardustTowerGameScreenState();
}

class _TowerBlock {
  final double center; // normalized 0..1 across the playfield width
  final double width; // normalized 0..1 across the playfield width
  final Color color;
  final bool perfect;

  const _TowerBlock({
    required this.center,
    required this.width,
    required this.color,
    required this.perfect,
  });
}

class _Star {
  final double x;
  final double y;
  final double radius;
  final double alpha;

  const _Star({required this.x, required this.y, required this.radius, required this.alpha});
}

class _StardustTowerGameScreenState extends State<StardustTowerGameScreen> with SingleTickerProviderStateMixin {
  static const double _blockWidth = 0.52;
  static const List<Color> _palette = [
    Color(0xFF8B5CF6),
    Color(0xFF00E5FF),
    Color(0xFFFFD700),
    Color(0xFFEC4899),
  ];

  late final AnimationController _ticker;

  final List<_TowerBlock> _blocks = [];
  final List<_Star> _stars = [];

  Duration _lastTick = Duration.zero;

  bool _isPlaying = false;
  bool _isGameOver = false;
  bool _isToppling = false;
  bool _rewardGranted = false;

  double _slidePhase = 0.0;
  double _slideCenter = 0.5;
  double _toppleProgress = 0.0;
  double _flashTimer = 0.0;
  double _bannerTimer = 0.0;
  String _banner = '';

  int _height = 0;
  int _score = 0;
  int _combo = 0;
  int _perfectCount = 0;

  double get _tolerance => _blockWidth * (0.44 - _height * 0.012).clamp(0.16, 0.44);
  double get _perfectZone => _blockWidth * 0.08;

  @override
  void initState() {
    super.initState();
    final rand = Random(7);
    for (int i = 0; i < 70; i++) {
      _stars.add(
        _Star(
          x: rand.nextDouble(),
          y: rand.nextDouble(),
          radius: 0.6 + rand.nextDouble() * 1.6,
          alpha: 0.15 + rand.nextDouble() * 0.6,
        ),
      );
    }
    _resetTower();
    _ticker = AnimationController(vsync: this, duration: const Duration(seconds: 1000))..addListener(_gameLoop);
  }

  @override
  void dispose() {
    _ticker.dispose();
    super.dispose();
  }

  void _resetTower() {
    _blocks
      ..clear()
      ..add(const _TowerBlock(center: 0.5, width: _blockWidth, color: Color(0xFF8B5CF6), perfect: false));
  }

  void _startGame() {
    setState(() {
      _isPlaying = true;
      _isGameOver = false;
      _isToppling = false;
      _rewardGranted = false;
      _height = 0;
      _score = 0;
      _combo = 0;
      _perfectCount = 0;
      _slidePhase = 0.0;
      _slideCenter = 0.5;
      _toppleProgress = 0.0;
      _flashTimer = 0.0;
      _bannerTimer = 0.0;
      _banner = '';
      _resetTower();
    });
    _lastTick = Duration.zero;
    _ticker.forward(from: 0.0);
  }

  void _gameLoop() {
    if (!mounted) return;

    final now = _ticker.lastElapsedDuration ?? Duration.zero;
    var dt = (now - _lastTick).inMicroseconds / 1000000.0;
    _lastTick = now;
    if (dt <= 0 || dt > 0.05) dt = 0.016;

    if (_isToppling) {
      setState(() {
        _toppleProgress = (_toppleProgress + dt / 0.6).clamp(0.0, 1.0);
      });
      if (_toppleProgress >= 1.0) _finishGame();
      return;
    }

    if (!_isPlaying || _isGameOver) return;

    setState(() {
      if (_flashTimer > 0) _flashTimer = max(0.0, _flashTimer - dt);
      if (_bannerTimer > 0) _bannerTimer = max(0.0, _bannerTimer - dt);

      // The block slides faster as the tower grows.
      final speed = 2.0 + min(_height * 0.2, 3.0);
      _slidePhase += dt * speed;
      final amp = (1.0 - _blockWidth) / 2.0;
      _slideCenter = 0.5 + amp * sin(_slidePhase);
    });
  }

  void _drop() {
    if (!_isPlaying || _isGameOver || _isToppling || _blocks.isEmpty) return;

    final below = _blocks.last;
    final offset = (_slideCenter - below.center).abs();
    HapticFeedback.lightImpact();

    if (offset > _tolerance) {
      // Too far off centre — the tower topples.
      HapticFeedback.vibrate();
      setState(() {
        _isToppling = true;
        _toppleProgress = 0.0;
        _banner = 'TOWER TOPPLED';
        _bannerTimer = 1.0;
      });
      return;
    }

    final isPerfect = offset <= _perfectZone;
    setState(() {
      _height += 1;
      _blocks.add(
        _TowerBlock(
          center: isPerfect ? below.center : _slideCenter,
          width: below.width,
          color: _palette[_height % _palette.length],
          perfect: isPerfect,
        ),
      );

      if (isPerfect) {
        _combo += 1;
        _perfectCount += 1;
        _score += 25 + (_combo - 1) * 10;
        _flashTimer = 0.4;
        _banner = _combo > 1 ? 'PERFECT x$_combo!' : 'PERFECT!';
        _bannerTimer = 0.8;
        HapticFeedback.mediumImpact();
      } else {
        _combo = 0;
        _score += 10;
      }
    });
  }

  void _finishGame() {
    if (_rewardGranted) return;
    _rewardGranted = true;
    _ticker.stop();
    if (!mounted) return;

    final earnedCoins = (22 + _height * 3 + _perfectCount * 4).clamp(25, 90).toInt();
    final earnedXP = (18 + _height * 2 + _perfectCount * 3).clamp(20, 70).toInt();

    setState(() {
      _isToppling = false;
      _isGameOver = true;
      _isPlaying = false;
    });

    widget.onGameFinished(earnedCoins, earnedXP);

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24), side: const BorderSide(color: Color(0xFF8B5CF6), width: 1.8)),
        title: const Row(
          children: [
            Icon(Icons.auto_awesome, color: Color(0xFFFFD700), size: 28),
            SizedBox(width: 8),
            Text('Tower Toppled!', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Score: $_score', style: const TextStyle(color: Color(0xFFFFD700), fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            Text('Tower Height: $_height  •  Perfect Drops: $_perfectCount', style: const TextStyle(color: Colors.white70, fontSize: 14)),
            const SizedBox(height: 6),
            const Text('The stardust blocks scattered across the void!', style: TextStyle(color: Colors.white54, fontSize: 13)),
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
            child: const Text('REBUILD TOWER', style: TextStyle(fontWeight: FontWeight.bold)),
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
        title: const Text(
          'Stardust Tower',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18),
          overflow: TextOverflow.ellipsis,
        ),
        actions: [
          Center(
            child: Padding(
              padding: const EdgeInsets.only(right: 10),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.layers_rounded, color: Color(0xFF8B5CF6), size: 16),
                  const SizedBox(width: 3),
                  Text('$_height', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                  const SizedBox(width: 10),
                  const Icon(Icons.stars, color: Color(0xFFFFD700), size: 16),
                  const SizedBox(width: 3),
                  Text('$_score', style: const TextStyle(color: Color(0xFFFFD700), fontWeight: FontWeight.bold, fontSize: 14)),
                  const SizedBox(width: 10),
                  const Icon(Icons.auto_awesome, color: Color(0xFF00E5FF), size: 16),
                  const SizedBox(width: 3),
                  Text('$_combo', style: const TextStyle(color: Color(0xFF00E5FF), fontWeight: FontWeight.bold, fontSize: 14)),
                ],
              ),
            ),
          ),
        ],
      ),
      body: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTapDown: (_) => _drop(),
        child: Stack(
          children: [
            Positioned.fill(
              child: CustomPaint(
                painter: _TowerPainter(
                  blocks: _blocks,
                  stars: _stars,
                  slideCenter: _slideCenter,
                  tolerance: _tolerance,
                  perfectZone: _perfectZone,
                  flashTimer: _flashTimer,
                  toppleProgress: _toppleProgress,
                  isToppling: _isToppling,
                ),
              ),
            ),

            // Perfect drop banner
            if (_bannerTimer > 0 && _banner.isNotEmpty)
              Positioned(
                top: 14,
                left: 0,
                right: 0,
                child: IgnorePointer(
                  child: Center(
                    child: Opacity(
                      opacity: (_bannerTimer / 0.8).clamp(0.0, 1.0),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
                        decoration: BoxDecoration(
                          color: Colors.black.withValues(alpha: 0.55),
                          borderRadius: BorderRadius.circular(18),
                          border: Border.all(color: const Color(0xFFFFD700), width: 1.5),
                          boxShadow: [
                            BoxShadow(color: const Color(0xFFFFD700).withValues(alpha: 0.35), blurRadius: 16, spreadRadius: 1),
                          ],
                        ),
                        child: Text(
                          _banner,
                          style: const TextStyle(color: Color(0xFFFFD700), fontSize: 16, fontWeight: FontWeight.w900, letterSpacing: 1.4),
                        ),
                      ),
                    ),
                  ),
                ),
              ),

            // Control hint
            if (_isPlaying && !_isToppling)
              Positioned(
                bottom: 14,
                left: 0,
                right: 0,
                child: IgnorePointer(
                  child: Center(
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.5),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: const Text(
                        '▲ TAP ANYWHERE TO DROP THE STARDUST BLOCK',
                        style: TextStyle(color: Colors.white60, fontSize: 11, fontWeight: FontWeight.bold),
                      ),
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
                      const Icon(Icons.auto_awesome, color: Color(0xFF8B5CF6), size: 48),
                      const SizedBox(height: 12),
                      const Text(
                        'STARDUST TOWER',
                        style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900, letterSpacing: 1.2),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Tap anywhere to drop each stardust block — perfect centres build a taller, brighter tower!',
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
                        child: const Text('START TOWER', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
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

class _TowerPainter extends CustomPainter {
  final List<_TowerBlock> blocks;
  final List<_Star> stars;
  final double slideCenter;
  final double tolerance;
  final double perfectZone;
  final double flashTimer;
  final double toppleProgress;
  final bool isToppling;

  const _TowerPainter({
    required this.blocks,
    required this.stars,
    required this.slideCenter,
    required this.tolerance,
    required this.perfectZone,
    required this.flashTimer,
    required this.toppleProgress,
    required this.isToppling,
  });

  @override
  void paint(Canvas canvas, Size size) {
    // 1. Cheap starfield backdrop
    final starPaint = Paint();
    for (final s in stars) {
      starPaint.color = Colors.white.withValues(alpha: s.alpha * 0.85);
      canvas.drawCircle(Offset(s.x * size.width, s.y * size.height), s.radius, starPaint);
    }

    if (blocks.isEmpty) return;

    final double blockH = (size.height * 0.052).clamp(20.0, 34.0);
    final double groundY = size.height - 44.0;
    final double towerTop = groundY - blocks.length * blockH;
    final double desiredTop = size.height * 0.30;
    final double shift = towerTop < desiredTop ? desiredTop - towerTop : 0.0;
    final double blockPx = blocks.first.width * size.width;

    // 2. Camera: keep the top of the tower on screen once it grows tall
    canvas.save();
    if (isToppling) {
      final pivot = Offset(size.width * 0.5, size.height * 0.45);
      canvas.translate(pivot.dx, pivot.dy);
      canvas.rotate(toppleProgress * 0.30);
      canvas.translate(-pivot.dx, -pivot.dy);
      canvas.translate(0, toppleProgress * toppleProgress * size.height * 0.5);
    }

    // 3. Perfect-drop flourish glow (behind the tower blocks)
    if (flashTimer > 0 && !isToppling) {
      final last = blocks.last;
      final lastW = last.width * size.width;
      final lastLeft = last.center * size.width - lastW / 2;
      final lastTop = groundY - blocks.length * blockH + shift;
      final glow = Paint()..color = const Color(0xFFFFD700).withValues(alpha: 0.30 * (flashTimer / 0.4));
      canvas.drawRRect(
        RRect.fromRectAndRadius(Rect.fromLTWH(lastLeft - 9, lastTop - 9, lastW + 18, blockH + 6), const Radius.circular(16)),
        glow,
      );
    }

    // 4. Tower blocks
    for (int i = 0; i < blocks.length; i++) {
      final b = blocks[i];
      final w = b.width * size.width;
      final left = b.center * size.width - w / 2;
      final top = groundY - (i + 1) * blockH + shift;
      final rect = Rect.fromLTWH(left, top, w, blockH - 3);

      final glowPaint = Paint()..color = b.color.withValues(alpha: 0.22);
      canvas.drawRRect(
        RRect.fromRectAndRadius(Rect.fromLTWH(left - 4, top - 4, w + 8, blockH + 1), const Radius.circular(12)),
        glowPaint,
      );

      final bodyPaint = Paint()
        ..shader = LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Color.lerp(b.color, Colors.white, 0.45)!, b.color],
        ).createShader(rect);
      canvas.drawRRect(RRect.fromRectAndRadius(rect, const Radius.circular(9)), bodyPaint);

      if (b.perfect) {
        final sparkPaint = Paint()..color = Colors.white.withValues(alpha: 0.9);
        canvas.drawCircle(rect.center, (blockH * 0.13).clamp(2.0, 4.5), sparkPaint);
      }
    }

    // 5. Landing guides + sliding block
    if (!isToppling) {
      final centerX = blocks.last.center * size.width;
      final belowTop = groundY - blocks.length * blockH + shift;

      final tolPaint = Paint()..color = const Color(0xFF00E5FF).withValues(alpha: 0.18);
      canvas.drawRRect(
        RRect.fromRectAndRadius(Rect.fromLTWH(centerX - tolerance * size.width, belowTop, tolerance * size.width * 2, blockH - 3), const Radius.circular(8)),
        tolPaint,
      );

      final perfectPaint = Paint()..color = const Color(0xFFFFD700).withValues(alpha: 0.35);
      canvas.drawRRect(
        RRect.fromRectAndRadius(Rect.fromLTWH(centerX - perfectZone * size.width, belowTop, perfectZone * size.width * 2, blockH - 3), const Radius.circular(6)),
        perfectPaint,
      );

      final sliderTop = towerTop + shift - blockH - 12;
      final guidePaint = Paint()
        ..color = Colors.white.withValues(alpha: 0.14)
        ..strokeWidth = 2;
      canvas.drawLine(Offset(slideCenter * size.width, sliderTop + blockH), Offset(slideCenter * size.width, belowTop), guidePaint);

      final sliderLeft = slideCenter * size.width - blockPx / 2;
      final sliderRect = Rect.fromLTWH(sliderLeft, sliderTop, blockPx, blockH - 3);

      canvas.drawRRect(
        RRect.fromRectAndRadius(sliderRect.inflate(5), const Radius.circular(14)),
        Paint()..color = const Color(0xFF00E5FF).withValues(alpha: 0.22),
      );
      canvas.drawRRect(
        RRect.fromRectAndRadius(sliderRect, const Radius.circular(9)),
        Paint()
          ..shader = LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Colors.white.withValues(alpha: 0.95), const Color(0xFF00E5FF)],
          ).createShader(sliderRect),
      );
      canvas.drawRect(
        Rect.fromLTWH(slideCenter * size.width - 1.5, sliderTop, 3, blockH - 3),
        Paint()..color = const Color(0xFFEC4899),
      );
    }

    canvas.restore();

    // 6. The missed block tumbling into the void
    if (isToppling) {
      final missedTop = towerTop + shift - blockH - 12 + toppleProgress * toppleProgress * size.height * 0.9;
      final missedRect = Rect.fromLTWH(slideCenter * size.width - blockPx / 2, missedTop, blockPx, blockH - 3);
      canvas.save();
      canvas.translate(missedRect.center.dx, missedRect.center.dy);
      canvas.rotate(toppleProgress * 1.6);
      canvas.translate(-missedRect.center.dx, -missedRect.center.dy);
      canvas.drawRRect(
        RRect.fromRectAndRadius(missedRect, const Radius.circular(9)),
        Paint()..color = const Color(0xFFEC4899).withValues(alpha: 1.0 - toppleProgress * 0.7),
      );
      canvas.restore();
    }
  }

  @override
  bool shouldRepaint(covariant _TowerPainter oldDelegate) => true;
}
