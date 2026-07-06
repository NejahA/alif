import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter/services.dart';
import '../models/particle.dart';
import '../theme.dart';
import '../widgets/particle_painter.dart';
import '../widgets/ripple_painter.dart';

enum FunMode {
  paint,
  firework,
  ripple,
  spiral,
}

class PlaygroundScreen extends StatefulWidget {
  const PlaygroundScreen({super.key});

  @override
  State<PlaygroundScreen> createState() => _PlaygroundScreenState();
}

class _PlaygroundScreenState extends State<PlaygroundScreen>
    with SingleTickerProviderStateMixin {
  final List<Particle> _particles = [];
  final List<Ripple> _ripples = [];
  late Ticker _ticker;
  FunMode _mode = FunMode.paint;
  Color _currentColor = LudicTheme.palette[0];
  int _colorIndex = 0;
  double _brushSize = 6;
  Offset? _lastPosition;
  double _spiralAngle = 0;

  @override
  void initState() {
    super.initState();
    _ticker = createTicker(_onTick)..start();
    HapticFeedback.lightImpact();
  }

  @override
  void dispose() {
    _ticker.dispose();
    super.dispose();
  }

  void _onTick(Duration elapsed) {
    setState(() {
      // Update particles
      for (final p in _particles) {
        p.update();
      }
      _particles.removeWhere((p) => p.isDead);

      // Update ripples
      for (final r in _ripples) {
        r.update();
      }
      _ripples.removeWhere((r) => r.isDead);
    });
  }

  void _onPanStart(DragStartDetails details) {
    _lastPosition = details.localPosition;
    _cycleColor();
    HapticFeedback.lightImpact();

    if (_mode == FunMode.firework) {
      _spawnFirework(details.localPosition);
    } else if (_mode == FunMode.ripple) {
      _spawnRipple(details.localPosition);
    }
  }

  void _onPanUpdate(DragUpdateDetails details) {
    final pos = details.localPosition;
    final last = _lastPosition ?? pos;

    switch (_mode) {
      case FunMode.paint:
        _spawnPaintTrail(last, pos);
        break;
      case FunMode.spiral:
        _spawnSpiral(pos);
        break;
      case FunMode.firework:
        if (_particles.length < 200) {
          _spawnFirework(pos);
        }
        break;
      case FunMode.ripple:
        _spawnRipple(pos);
        break;
    }

    _lastPosition = pos;
  }

  void _onPanEnd(DragEndDetails details) {
    _lastPosition = null;
  }

  void _onTap(TapDownDetails details) {
    _cycleColor();
    HapticFeedback.heavyImpact();

    // Burst effect on tap
    for (int i = 0; i < 20; i++) {
      _particles.add(Particle.burst(
        x: details.localPosition.dx,
        y: details.localPosition.dy,
        color: _currentColor,
        speed: 6,
        size: 5,
        life: 0.8,
        gravity: 0.04,
      ));
    }

    // Sparkles
    final rng = Random();
    for (int i = 0; i < 10; i++) {
      final angle = rng.nextDouble() * 2 * pi;
      _particles.add(Particle.spark(
        x: details.localPosition.dx,
        y: details.localPosition.dy,
        color: Colors.white,
        angle: angle,
        speed: 3,
      ));
    }

    _spawnRipple(details.localPosition);
  }

  void _spawnPaintTrail(Offset from, Offset to) {
    final rng = Random();
    final dist = (to - from).distance;
    final steps = (dist / 3).ceil().clamp(1, 20);

    for (int i = 0; i < steps; i++) {
      final t = i / steps;
      final x = from.dx + (to.dx - from.dx) * t;
      final y = from.dy + (to.dy - from.dy) * t;

      _particles.add(Particle(
        x: x + (rng.nextDouble() - 0.5) * 4,
        y: y + (rng.nextDouble() - 0.5) * 4,
        vx: (rng.nextDouble() - 0.5) * 0.5,
        vy: (rng.nextDouble() - 0.5) * 0.5,
        color: _currentColor,
        size: rng.nextDouble() * _brushSize + 1,
        life: 1.0,
        maxLife: 1.0,
        gravity: -0.01,
        friction: 0.97,
      ));
    }
  }

  void _spawnFirework(Offset pos) {
    final rng = Random();
    final count = rng.nextInt(8) + 6;

    for (int i = 0; i < count; i++) {
      final angle = (2 * pi / count) * i + (rng.nextDouble() - 0.5) * 0.5;
      final speed = rng.nextDouble() * 3 + 2;
      _particles.add(Particle(
        x: pos.dx,
        y: pos.dy,
        vx: cos(angle) * speed,
        vy: sin(angle) * speed,
        color: _currentColor,
        size: rng.nextDouble() * 3 + 2,
        life: 0.8,
        maxLife: 0.8,
        gravity: 0.06,
        friction: 0.95,
      ));
    }
  }

  void _spawnSpiral(Offset pos) {
    final rng = Random();
    _spiralAngle += 0.3;

    for (int i = 0; i < 3; i++) {
      final angle = _spiralAngle + (i * 2 * pi / 3);
      final radius = 20.0;
      final x = pos.dx + cos(angle) * radius;
      final y = pos.dy + sin(angle) * radius;

      _particles.add(Particle(
        x: x,
        y: y,
        vx: cos(angle) * 1.5,
        vy: sin(angle) * 1.5,
        color: _currentColor,
        size: rng.nextDouble() * _brushSize + 2,
        life: 0.6,
        maxLife: 0.6,
        gravity: 0.03,
        friction: 0.93,
      ));

      // Trail spark
      _particles.add(Particle(
        x: pos.dx,
        y: pos.dy,
        color: Colors.white.withValues(alpha: 0.5),
        size: 1.5,
        life: 0.4,
        maxLife: 0.4,
        gravity: 0,
        friction: 0.9,
      ));
    }
  }

  void _spawnRipple(Offset pos) {
    final rng = Random();
    final colors = [
      _currentColor,
      LudicTheme.palette[(_colorIndex + 1) % LudicTheme.palette.length],
      LudicTheme.palette[(_colorIndex + 2) % LudicTheme.palette.length],
    ];
    _ripples.add(Ripple(
      x: pos.dx,
      y: pos.dy,
      color: colors[rng.nextInt(colors.length)],
      maxRadius: 60 + rng.nextDouble() * 40,
    ));
  }

  void _cycleColor() {
    setState(() {
      _colorIndex = (_colorIndex + 1) % LudicTheme.palette.length;
      _currentColor = LudicTheme.palette[_colorIndex];
    });
  }

  void _changeMode(FunMode mode) {
    setState(() {
      _mode = mode;
      HapticFeedback.selectionClick();
    });
  }

  void _clearCanvas() {
    setState(() {
      _particles.clear();
      _ripples.clear();
    });
    HapticFeedback.mediumImpact();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Background with subtle gradient
          Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  LudicTheme.bgDark,
                  Color(0xFF141430),
                  LudicTheme.bgDark,
                ],
              ),
            ),
          ),

          // Particle layer
          GestureDetector(
            onPanStart: _onPanStart,
            onPanUpdate: _onPanUpdate,
            onPanEnd: _onPanEnd,
            onTapDown: _onTap,
            child: RepaintBoundary(
              child: CustomPaint(
                size: Size.infinite,
                painter: ParticlePainter(_particles),
                child: CustomPaint(
                  size: Size.infinite,
                  painter: RipplePainter(_ripples),
                ),
              ),
            ),
          ),

          // HUD overlay
          _buildHUD(),

          // Bottom controls
          _buildBottomControls(),
        ],
      ),
    );
  }

  Widget _buildHUD() {
    return SafeArea(
      child: Column(
        children: [
          const SizedBox(height: 16),
          // Header
          Text(
            '🎨 LUDIC',
            style: TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: _currentColor,
              letterSpacing: 4,
              shadows: [
                Shadow(
                  color: _currentColor.withValues(alpha: 0.4),
                  blurRadius: 20,
                ),
              ],
            ),
          ),
          const SizedBox(height: 4),
          Text(
            _mode.name.toUpperCase(),
            style: TextStyle(
              fontSize: 13,
              color: LudicTheme.textSecondary,
              letterSpacing: 3,
            ),
          ),

          const Spacer(),

          // Particle count
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: LudicTheme.bgCard.withValues(alpha: 0.7),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              '${_particles.length} particles',
              style: const TextStyle(
                color: LudicTheme.textSecondary,
                fontSize: 12,
              ),
            ),
          ),
          const SizedBox(height: 80),
        ],
      ),
    );
  }

  Widget _buildBottomControls() {
    return Positioned(
      bottom: 0,
      left: 0,
      right: 0,
      child: Container(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.bottomCenter,
            end: Alignment.topCenter,
            colors: [
              LudicTheme.bgDark.withValues(alpha: 0.95),
              LudicTheme.bgDark.withValues(alpha: 0),
            ],
          ),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Mode selector
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _modeButton(FunMode.paint, '🎨', 'Paint'),
                _modeButton(FunMode.firework, '✨', 'Sparks'),
                _modeButton(FunMode.ripple, '🌊', 'Ripple'),
                _modeButton(FunMode.spiral, '🌀', 'Spiral'),
              ],
            ),
            const SizedBox(height: 12),

            // Action bar
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Color indicator
                GestureDetector(
                  onTap: _cycleColor,
                  child: Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: _currentColor,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: _currentColor.withValues(alpha: 0.4),
                          blurRadius: 12,
                        ),
                      ],
                    ),
                    child: const Icon(Icons.touch_app, color: Colors.white, size: 18),
                  ),
                ),
                const SizedBox(width: 16),

                // Clear button
                _iconButton(Icons.delete_outline, 'Clear', _clearCanvas),

                const SizedBox(width: 16),

                // Brush size slider
                Container(
                  width: 100,
                  height: 40,
                  decoration: BoxDecoration(
                    color: LudicTheme.bgCard.withValues(alpha: 0.6),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Slider(
                    value: _brushSize,
                    min: 2,
                    max: 16,
                    divisions: 7,
                    activeColor: _currentColor,
                    inactiveColor: LudicTheme.textSecondary.withValues(alpha: 0.2),
                    onChanged: (v) => setState(() => _brushSize = v),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _modeButton(FunMode mode, String icon, String label) {
    final isActive = _mode == mode;
    return GestureDetector(
      onTap: () => _changeMode(mode),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: isActive
              ? _currentColor.withValues(alpha: 0.2)
              : LudicTheme.bgCard.withValues(alpha: 0.4),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isActive ? _currentColor : Colors.transparent,
            width: 1.5,
          ),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(icon, style: const TextStyle(fontSize: 20)),
            const SizedBox(height: 2),
            Text(
              label,
              style: TextStyle(
                fontSize: 10,
                color: isActive ? _currentColor : LudicTheme.textSecondary,
                fontWeight: isActive ? FontWeight.w600 : FontWeight.normal,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _iconButton(IconData icon, String tooltip, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: LudicTheme.bgCard.withValues(alpha: 0.6),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Icon(icon, color: LudicTheme.textSecondary, size: 20),
      ),
    );
  }
}