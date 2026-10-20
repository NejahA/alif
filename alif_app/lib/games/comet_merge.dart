import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class CometMergeGameScreen extends StatefulWidget {
  final Function(int coins, int xp) onGameFinished;

  const CometMergeGameScreen({super.key, required this.onGameFinished});

  @override
  State<CometMergeGameScreen> createState() => _CometMergeGameScreenState();
}

/// One merge tier of the drop-and-merge physics puzzle.
class _Tier {
  final String name;
  final Color color;

  /// Radius expressed as a fraction of the playfield width (0..1).
  final double radius;

  const _Tier(this.name, this.color, this.radius);
}

/// Asteroid -> Comet -> Moon -> Planet -> Star -> Giant -> Supernova.
///
/// Each tier is ~1.4x the radius of the previous one, so a merged world holds
/// roughly the same area as the two it replaced. Merging therefore cannot
/// outrun the incoming drops forever: the arena keeps filling and a round can
/// always end by overflowing. The top tier is wide enough that two Supernovas
/// can never sit side by side.
const List<_Tier> _kTiers = [
  _Tier('Asteroid', Color(0xFF9AA7C7), 0.055),
  _Tier('Comet', Color(0xFF00E5FF), 0.077),
  _Tier('Moon', Color(0xFFC7D2E0), 0.108),
  _Tier('Planet', Color(0xFF10B981), 0.151),
  _Tier('Star', Color(0xFFFFD700), 0.211),
  _Tier('Giant', Color(0xFFFF8A3D), 0.295),
  _Tier('Supernova', Color(0xFFEC4899), 0.413),
];

/// A falling orb. Positions are stored in normalised "width units": both axes
/// are fractions of the playfield width so circles stay circular and the whole
/// simulation scales with whatever size the layout reports.
class _Orb {
  double x;
  double y;
  double vx;
  double vy;
  final int tier;
  double age = 0.0;

  _Orb({
    required this.x,
    required this.y,
    required this.tier,
    this.vx = 0.0,
    this.vy = 0.0,
  });

  double get radius => _kTiers[tier].radius;
}

/// Short lived ring drawn where two orbs merged.
class _Pop {
  final double x;
  final double y;
  final Color color;
  final double radius;
  double t = 0.0;

  _Pop({required this.x, required this.y, required this.color, required this.radius});
}

class _Star {
  final double x;
  final double y;
  final double radius;
  final double alpha;

  const _Star({required this.x, required this.y, required this.radius, required this.alpha});
}

class _CometMergeGameScreenState extends State<CometMergeGameScreen> with SingleTickerProviderStateMixin {
  static const double _dangerFrac = 0.16; // danger line, fraction of field height
  static const double _dropFrac = 0.08; // hover/drop height, fraction of field height
  static const double _gravity = 3.6; // width-units per second squared
  static const double _fixedStep = 1.0 / 120.0;
  static const double _maxDelta = 0.033;
  static const double _spawnVy = 0.6;

  /// Points awarded for the tier that a merge produces.
  static const List<int> _mergeScore = [0, 12, 30, 55, 90, 140, 210];
  static const int _supernovaBonus = 400;

  late final AnimationController _ticker;

  final Random _rand = Random();
  final List<_Orb> _orbs = [];
  final List<_Pop> _pops = [];
  final List<_Star> _stars = [];

  Size _fieldSize = Size.zero;
  Duration _lastTick = Duration.zero;

  bool _isPlaying = false;
  bool _isGameOver = false;
  bool _rewardGranted = false;
  bool _autoSweep = true;

  double _aimX = 0.5;
  double _hoverPhase = 0.0;
  double _dangerTimer = 0.0;
  double _bannerTimer = 0.0;
  String _banner = '';

  int _score = 0;
  int _highestTier = 0;
  int _nextTier = 0;

  double get _fieldH => _fieldSize.width > 0 ? _fieldSize.height / _fieldSize.width : 1.62;

  @override
  void initState() {
    super.initState();
    final rand = Random(11);
    for (int i = 0; i < 64; i++) {
      _stars.add(
        _Star(
          x: rand.nextDouble(),
          y: rand.nextDouble(),
          radius: 0.6 + rand.nextDouble() * 1.7,
          alpha: 0.12 + rand.nextDouble() * 0.55,
        ),
      );
    }
    _nextTier = _rollTier();
    _ticker = AnimationController(vsync: this, duration: const Duration(seconds: 1000))..addListener(_gameLoop);
  }

  @override
  void dispose() {
    _ticker.dispose();
    super.dispose();
  }

  int _rollTier() {
    final r = _rand.nextDouble();
    if (r < 0.72) return 0;
    if (r < 0.94) return 1;
    return 2;
  }

  void _startGame() {
    setState(() {
      _isPlaying = true;
      _isGameOver = false;
      _rewardGranted = false;
      _autoSweep = true;
      _score = 0;
      _highestTier = 0;
      _aimX = 0.5;
      _hoverPhase = 0.0;
      _dangerTimer = 0.0;
      _bannerTimer = 0.0;
      _banner = '';
      _orbs.clear();
      _pops.clear();
      _nextTier = _rollTier();
    });
    _lastTick = Duration.zero;
    _ticker.forward(from: 0.0);
  }

  void _gameLoop() {
    if (!mounted) return;

    final now = _ticker.lastElapsedDuration ?? Duration.zero;
    var dt = (now - _lastTick).inMicroseconds / 1000000.0;
    _lastTick = now;
    if (dt <= 0) return;
    if (dt > _maxDelta) dt = _maxDelta;

    if (!_isPlaying || _isGameOver) return;

    final Size field = _fieldSize;
    if (field.width <= 0 || field.height <= 0) return;
    final double h = field.height / field.width;

    if (_autoSweep) {
      _hoverPhase += dt * 1.5;
      _aimX = 0.5 + 0.34 * sin(_hoverPhase);
    }

    var overflow = false;
    setState(() {
      if (_bannerTimer > 0) _bannerTimer = max(0.0, _bannerTimer - dt);

      var remaining = dt;
      var steps = 0;
      while (remaining > 0.000001 && steps < 8) {
        final sub = remaining < _fixedStep ? remaining : _fixedStep;
        _physicsStep(sub, h);
        remaining -= sub;
        steps++;
      }

      _resolveMerges(h);
      _updatePops(dt);
      overflow = _updateOverflow(dt, h);
    });

    if (overflow) _finishGame();
  }

  void _physicsStep(double dt, double h) {
    if (_orbs.isEmpty) return;

    const double wallDamp = 0.42;
    const double floorDamp = 0.28;
    const double friction = 0.86;

    // 1. Integrate under gravity.
    for (final o in _orbs) {
      o.vy += _gravity * dt;
      o.x += o.vx * dt;
      o.y += o.vy * dt;
      o.age += dt;
    }

    // 2. Resolve overlaps + walls with a few relaxation iterations.
    for (int iter = 0; iter < 3; iter++) {
      for (int i = 0; i < _orbs.length; i++) {
        final a = _orbs[i];
        for (int j = i + 1; j < _orbs.length; j++) {
          final b = _orbs[j];
          var dx = b.x - a.x;
          var dy = b.y - a.y;
          var dist = sqrt(dx * dx + dy * dy);
          final minDist = a.radius + b.radius;
          if (dist >= minDist) continue;
          if (dist < 0.00001) {
            dx = 0.0;
            dy = -0.00001;
            dist = 0.00001;
          }
          final nx = dx / dist;
          final ny = dy / dist;
          final push = (minDist - dist) / 2.0;
          a.x -= nx * push;
          a.y -= ny * push;
          b.x += nx * push;
          b.y += ny * push;

          if (iter == 0) {
            final vn = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
            if (vn < 0) {
              final jn = -vn * 0.5;
              a.vx -= nx * jn;
              a.vy -= ny * jn;
              b.vx += nx * jn;
              b.vy += ny * jn;
            }
            // Bleed off the gravity that keeps accumulating while two orbs are
            // resting on each other, otherwise the whole stack jitters forever.
            a.vx *= 0.9;
            a.vy *= 0.9;
            b.vx *= 0.9;
            b.vy *= 0.9;
          }
        }
      }

      for (final o in _orbs) {
        final r = o.radius;
        if (o.x - r < 0.0) {
          o.x = r;
          if (o.vx < 0) o.vx = -o.vx * wallDamp;
        }
        if (o.x + r > 1.0) {
          o.x = 1.0 - r;
          if (o.vx > 0) o.vx = -o.vx * wallDamp;
        }
        if (o.y + r > h) {
          o.y = h - r;
          if (o.vy > 0) o.vy = -o.vy * floorDamp;
          o.vx *= friction;
        }
        if (o.y - r < 0.0) {
          o.y = r;
          if (o.vy < 0) o.vy = 0.0;
        }
      }
    }

    // 3. Hard clamp so nothing can ever escape, and calm the micro jitter.
    for (final o in _orbs) {
      final r = o.radius;
      final maxX = 1.0 - r;
      final maxY = h - r;
      o.x = o.x.clamp(r, maxX < r ? r : maxX);
      o.y = o.y.clamp(r, maxY < r ? r : maxY);
      if (o.vx.abs() < 0.0008) o.vx = 0.0;
      if (o.vy.abs() < 0.002) o.vy = 0.0;
    }
  }

  void _resolveMerges(double h) {
    if (_orbs.length < 2) return;

    final Set<_Orb> remove = <_Orb>{};
    final List<_Orb> add = <_Orb>[];
    final int top = _kTiers.length - 1;

    // Each orb can only be consumed by a single merge per step, so chains can
    // never loop forever within one frame.
    for (int i = 0; i < _orbs.length; i++) {
      final a = _orbs[i];
      if (remove.contains(a)) continue;
      for (int j = i + 1; j < _orbs.length; j++) {
        final b = _orbs[j];
        if (remove.contains(b)) continue;
        if (a.tier != b.tier) continue;

        final dx = b.x - a.x;
        final dy = b.y - a.y;
        final d = sqrt(dx * dx + dy * dy);
        if (d > a.radius + b.radius + 0.004) continue;

        remove.add(a);
        remove.add(b);

        final mx = (a.x + b.x) * 0.5;
        final my = (a.y + b.y) * 0.5;

        if (a.tier >= top) {
          // Two Supernovas annihilate for a big bonus.
          _score += _supernovaBonus;
          _addPop(mx, my, _kTiers[top].color, _kTiers[top].radius * 1.3);
          _banner = 'SUPERNOVA!';
          _bannerTimer = 1.1;
        } else {
          final nt = a.tier + 1;
          add.add(
            _Orb(
              x: mx,
              y: my,
              tier: nt,
              vx: (a.vx + b.vx) * 0.25,
              vy: (a.vy + b.vy) * 0.25,
            ),
          );
          _score += _mergeScore[nt];
          if (nt > _highestTier) _highestTier = nt;
          _addPop(mx, my, _kTiers[nt].color, _kTiers[nt].radius * 1.25);
          _banner = '${_kTiers[nt].name.toUpperCase()}!';
          _bannerTimer = 0.9;
        }
        HapticFeedback.mediumImpact();
        break;
      }
    }

    if (remove.isEmpty) return;
    _orbs.removeWhere(remove.contains);
    for (final n in add) {
      final r = n.radius;
      final maxX = 1.0 - r;
      final maxY = h - r;
      n.x = n.x.clamp(r, maxX < r ? r : maxX);
      n.y = n.y.clamp(r, maxY < r ? r : maxY);
      _orbs.add(n);
    }
  }

  void _updatePops(double dt) {
    if (_pops.isEmpty) return;
    for (final p in _pops) {
      p.t += dt / 0.45;
    }
    _pops.removeWhere((p) => p.t >= 1.0);
  }

  void _addPop(double x, double y, Color color, double radius) {
    if (_pops.length > 40) _pops.removeAt(0);
    _pops.add(_Pop(x: x, y: y, color: color, radius: radius));
  }

  bool _updateOverflow(double dt, double h) {
    final dangerY = h * _dangerFrac;
    var inDanger = false;
    for (final o in _orbs) {
      // An unobstructed drop clears the top of the arena in well under 0.6s,
      // so an orb that is still this high after that long is genuinely stuck.
      if (o.age < 0.6) continue;
      if (o.y - o.radius < dangerY) {
        inDanger = true;
        break;
      }
    }
    _dangerTimer = inDanger ? _dangerTimer + dt : 0.0;
    return _dangerTimer >= 1.5;
  }

  void _dropAt(double normalizedX) {
    if (!_isPlaying || _isGameOver) return;
    final w = _fieldSize.width;
    if (w <= 0) return;

    final tier = _nextTier;
    final r = _kTiers[tier].radius;
    final h = _fieldH;

    final x = normalizedX.clamp(r, 1.0 - r);
    final y = max(r, h * _dropFrac);

    setState(() {
      _orbs.add(_Orb(x: x, y: y, tier: tier, vy: _spawnVy));
      _nextTier = _rollTier();
    });
    HapticFeedback.lightImpact();
  }

  void _aimAt(Offset local) {
    if (!_isPlaying || _isGameOver) return;
    final w = _fieldSize.width;
    if (w <= 0) return;
    _autoSweep = false;
    _aimX = (local.dx / w).clamp(0.0, 1.0);
  }

  void _finishGame() {
    if (_rewardGranted) return;
    _rewardGranted = true;
    _ticker.stop();
    if (!mounted) return;

    final earnedCoins = (24 + _highestTier * 8).clamp(25, 90).toInt();
    final earnedXP = (18 + _highestTier * 6).clamp(20, 70).toInt();

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
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24), side: const BorderSide(color: Color(0xFFEC4899), width: 1.8)),
        title: const Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.brightness_high_rounded, color: Color(0xFFFFD700), size: 28),
            SizedBox(width: 8),
            Flexible(child: Text('Cosmic Collapse!', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold))),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Score: $_score', style: const TextStyle(color: Color(0xFFFFD700), fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            Text('Biggest world: ${_kTiers[_highestTier].name}', style: const TextStyle(color: Colors.white70, fontSize: 14)),
            const SizedBox(height: 6),
            const Text('The comet stack overflowed into the void!', style: TextStyle(color: Colors.white54, fontSize: 13)),
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
              backgroundColor: const Color(0xFFEC4899),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
            onPressed: () {
              Navigator.pop(ctx);
              _startGame();
            },
            child: const Text('DROP AGAIN', style: TextStyle(fontWeight: FontWeight.bold)),
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
          'Comet Merge',
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
                  const Icon(Icons.stars, color: Color(0xFFFFD700), size: 16),
                  const SizedBox(width: 3),
                  Text('$_score', style: const TextStyle(color: Color(0xFFFFD700), fontWeight: FontWeight.bold, fontSize: 14)),
                  const SizedBox(width: 10),
                  const Icon(Icons.auto_awesome, color: Color(0xFFEC4899), size: 16),
                  const SizedBox(width: 3),
                  Text(
                    _kTiers[_highestTier].name,
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          _fieldSize = Size(constraints.maxWidth, constraints.maxHeight);
          return GestureDetector(
            behavior: HitTestBehavior.opaque,
            onTapUp: (d) => _dropAt((d.localPosition.dx / max(1.0, _fieldSize.width)).clamp(0.0, 1.0)),
            onPanStart: (d) => _aimAt(d.localPosition),
            onPanUpdate: (d) => _aimAt(d.localPosition),
            onPanEnd: (_) => _dropAt(_aimX),
            child: Stack(
              children: [
                Positioned.fill(
                  child: CustomPaint(
                    painter: _CometMergePainter(
                      orbs: _orbs,
                      pops: _pops,
                      stars: _stars,
                      aimX: _aimX,
                      nextTier: _nextTier,
                      showHover: _isPlaying && !_isGameOver,
                      dangerFrac: _dangerFrac,
                      dropFrac: _dropFrac,
                    ),
                  ),
                ),

                // Merge / tier banner
                if (_bannerTimer > 0 && _banner.isNotEmpty)
                  Positioned(
                    top: 14,
                    left: 0,
                    right: 0,
                    child: IgnorePointer(
                      child: Center(
                        child: Opacity(
                          opacity: (_bannerTimer / 0.9).clamp(0.0, 1.0),
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
                if (_isPlaying && !_isGameOver)
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
                            'TAP TO DROP AT THAT SPOT — MATCHING WORLDS MERGE',
                            style: TextStyle(color: Colors.white60, fontSize: 11, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ),
                    ),
                  ),

                // Start screen overlay
                if (!_isPlaying && !_isGameOver)
                  Center(
                    child: Container(
                      constraints: const BoxConstraints(maxWidth: 340),
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F172A).withValues(alpha: 0.95),
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: const Color(0xFFEC4899), width: 2),
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.brightness_high_rounded, color: Color(0xFFEC4899), size: 48),
                          const SizedBox(height: 12),
                          const Text(
                            'COMET MERGE',
                            style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900, letterSpacing: 1.2),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            'Tap to drop each comet — identical comets merge into bigger worlds. Build up to a Supernova!',
                            style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold, height: 1.4),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 20),
                          ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFFEC4899),
                              foregroundColor: Colors.white,
                              minimumSize: const Size.fromHeight(48),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            ),
                            onPressed: _startGame,
                            child: const Text('START DROP', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
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

class _CometMergePainter extends CustomPainter {
  final List<_Orb> orbs;
  final List<_Pop> pops;
  final List<_Star> stars;
  final double aimX;
  final int nextTier;
  final bool showHover;
  final double dangerFrac;
  final double dropFrac;

  const _CometMergePainter({
    required this.orbs,
    required this.pops,
    required this.stars,
    required this.aimX,
    required this.nextTier,
    required this.showHover,
    required this.dangerFrac,
    required this.dropFrac,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final double unit = size.width;
    if (unit <= 0) return;

    // 1. Starfield backdrop
    final starPaint = Paint();
    for (final s in stars) {
      starPaint.color = Colors.white.withValues(alpha: s.alpha * 0.8);
      canvas.drawCircle(Offset(s.x * size.width, s.y * size.height), s.radius, starPaint);
    }

    // 2. Arena walls + floor
    final rect = Rect.fromLTWH(0, 0, size.width, size.height);
    final rrect = RRect.fromRectAndRadius(rect.deflate(1.4), const Radius.circular(20));
    canvas.drawRRect(rrect, Paint()..style = PaintingStyle.stroke..strokeWidth = 2.8..color = const Color(0xFF8B5CF6).withValues(alpha: 0.8));
    canvas.drawRect(
      Rect.fromLTWH(0, size.height - 14, size.width, 14),
      Paint()..color = const Color(0xFF8B5CF6).withValues(alpha: 0.22),
    );

    // 3. Danger line (dashed neon)
    final double dangerY = size.height * dangerFrac;
    final dangerPaint = Paint()
      ..color = const Color(0xFFFF5252).withValues(alpha: 0.7)
      ..strokeWidth = 2.0;
    const double dash = 12.0;
    const double gap = 9.0;
    double x = 14.0;
    while (x < size.width - 14.0) {
      canvas.drawLine(Offset(x, dangerY), Offset(min(x + dash, size.width - 14.0), dangerY), dangerPaint);
      x += dash + gap;
    }
    final warning = Paint()..color = const Color(0xFFFF5252).withValues(alpha: 0.10);
    canvas.drawRect(Rect.fromLTWH(0, 0, size.width, dangerY), warning);

    // 4. Orbs
    for (final o in orbs) {
      final center = Offset(o.x * unit, o.y * unit);
      final radius = o.radius * unit;
      final tier = _kTiers[o.tier];

      canvas.drawCircle(center, radius * 1.25, Paint()..color = tier.color.withValues(alpha: 0.16));
      canvas.drawCircle(
        center,
        radius,
        Paint()
          ..shader = RadialGradient(
            center: const Alignment(-0.35, -0.4),
            radius: 0.95,
            colors: [
              Color.lerp(tier.color, Colors.white, 0.6)!,
              tier.color,
              Color.lerp(tier.color, Colors.black, 0.35)!,
            ],
            stops: const [0.0, 0.55, 1.0],
          ).createShader(Rect.fromCircle(center: center, radius: radius)),
      );
      canvas.drawCircle(center, radius, Paint()..style = PaintingStyle.stroke..strokeWidth = 1.6..color = Colors.white.withValues(alpha: 0.35));
      canvas.drawCircle(Offset(center.dx - radius * 0.3, center.dy - radius * 0.35), radius * 0.18, Paint()..color = Colors.white.withValues(alpha: 0.75));
    }

    // 5. Merge pops
    for (final p in pops) {
      final t = p.t.clamp(0.0, 1.0);
      final center = Offset(p.x * unit, p.y * unit);
      final r = p.radius * unit * (0.6 + t * 1.0);
      canvas.drawCircle(
        center,
        r,
        Paint()
          ..style = PaintingStyle.stroke
          ..strokeWidth = (1.0 - t) * 4.0 + 1.0
          ..color = p.color.withValues(alpha: (1.0 - t) * 0.85),
      );
      canvas.drawCircle(center, r * 0.55, Paint()..color = p.color.withValues(alpha: (1.0 - t) * 0.25));
    }

    // 6. Hovering "next orb" preview + drop guide
    if (showHover) {
      final tier = _kTiers[nextTier];
      final double cx = aimX.clamp(tier.radius, 1.0 - tier.radius) * unit;
      final double cy = size.height * dropFrac;
      final double radius = tier.radius * unit;

      final guide = Paint()
        ..color = Colors.white.withValues(alpha: 0.16)
        ..strokeWidth = 2.0;
      canvas.drawLine(Offset(cx, cy + radius), Offset(cx, size.height - 16), guide);

      canvas.drawCircle(Offset(cx, cy), radius * 1.3, Paint()..color = tier.color.withValues(alpha: 0.18));
      canvas.drawCircle(
        Offset(cx, cy),
        radius,
        Paint()
          ..shader = RadialGradient(
            center: const Alignment(-0.35, -0.4),
            radius: 0.95,
            colors: [
              Color.lerp(tier.color, Colors.white, 0.6)!,
              tier.color,
              Color.lerp(tier.color, Colors.black, 0.35)!,
            ],
          ).createShader(Rect.fromCircle(center: Offset(cx, cy), radius: radius)),
      );
      canvas.drawCircle(Offset(cx, cy), radius, Paint()..style = PaintingStyle.stroke..strokeWidth = 2.0..color = Colors.white.withValues(alpha: 0.6));
    }
  }

  @override
  bool shouldRepaint(covariant _CometMergePainter oldDelegate) => true;
}
