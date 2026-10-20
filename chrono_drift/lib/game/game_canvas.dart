import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'game_state.dart';
import '../models/particle.dart';
import 'entities/enemy.dart';

class GameCanvasWidget extends StatefulWidget {
  final GameState gameState;

  const GameCanvasWidget({
    super.key,
    required this.gameState,
  });

  @override
  State<GameCanvasWidget> createState() => _GameCanvasWidgetState();
}

class _GameCanvasWidgetState extends State<GameCanvasWidget>
    with SingleTickerProviderStateMixin {
  late Ticker _ticker;
  Duration _lastElapsed = Duration.zero;

  @override
  void initState() {
    super.initState();
    _ticker = createTicker((elapsed) {
      if (!mounted) return;
      if (_lastElapsed == Duration.zero) {
        _lastElapsed = elapsed;
        return;
      }

      final dt = (elapsed - _lastElapsed).inMicroseconds / 1000000.0;
      _lastElapsed = elapsed;

      // Cap delta time to prevent physics tunneling during hitches
      final clampedDt = dt.clamp(0.001, 0.05);

      if (widget.gameState.status == GameStatus.playing) {
        final renderBox = context.findRenderObject() as RenderBox?;
        final size = renderBox?.size ?? widget.gameState.viewport;
        widget.gameState.update(clampedDt, size);
      }
    });

    _ticker.start();
  }

  @override
  void dispose() {
    _ticker.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        return ClipRect(
          child: CustomPaint(
            size: Size(constraints.maxWidth, constraints.maxHeight),
            painter: GamePainter(gameState: widget.gameState),
          ),
        );
      },
    );
  }
}

class GamePainter extends CustomPainter {
  final GameState gameState;

  GamePainter({required this.gameState}) : super(repaint: gameState);

  @override
  void paint(Canvas canvas, Size size) {
    canvas.save();

    // 1. Screen Shake
    if (gameState.screenShake > 0.1) {
      final rand = Random();
      final shakeX = (rand.nextDouble() - 0.5) * gameState.screenShake;
      final shakeY = (rand.nextDouble() - 0.5) * gameState.screenShake;
      canvas.translate(shakeX, shakeY);
    }

    // 2. Cyber Space Background & Parallax Grid
    _drawBackground(canvas, size);

    // 3. Shockwaves and Singularity Mines
    _drawShockwaves(canvas);

    // 4. Chrono-Core Collectibles
    _drawCores(canvas);

    // 5. Particles (Smoke, Sparks, Thruster trails)
    _drawParticles(canvas);

    // 6. Projectiles
    _drawProjectiles(canvas);

    // 7. Enemies
    _drawEnemies(canvas);

    // 8. Temporal Echoes (Quantum Clones)
    _drawEchoes(canvas);

    // 9. Player Ship
    _drawPlayer(canvas);

    // 10. Rewind VFX Glitch Distortion Overlay
    if (gameState.rewindVfxTimer > 0) {
      _drawRewindVfx(canvas, size);
    }

    canvas.restore();
  }

  void _drawBackground(Canvas canvas, Size size) {
    // Deep dark void
    final bgPaint = Paint()..color = const Color(0xFF030712);
    canvas.drawRect(Rect.fromLTWH(0, 0, size.width, size.height), bgPaint);

    // Moving sci-fi grid
    final gridPaint = Paint()
      ..color = const Color(0xFF1E293B).withValues(alpha: 0.35)
      ..strokeWidth = 1.0
      ..style = PaintingStyle.stroke;

    const gridSize = 64.0;
    final offsetY = (gameState.stats.timeSurvived * 24.0) % gridSize;

    for (double x = 0; x < size.width; x += gridSize) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), gridPaint);
    }
    for (double y = offsetY; y < size.height; y += gridSize) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), gridPaint);
    }
  }

  void _drawShockwaves(Canvas canvas) {
    for (final p in gameState.particles) {
      if (p.type == ParticleType.shockwave) {
        final alpha = ((1.0 - p.progress) * 0.8).clamp(0.0, 1.0);
        final paint = Paint()
          ..color = p.color.withValues(alpha: alpha)
          ..style = PaintingStyle.stroke
          ..strokeWidth = 3.0 + (1.0 - p.progress) * 4.0;

        canvas.drawCircle(p.position, p.radius, paint);

        // Core glow
        final fillPaint = Paint()
          ..color = p.color.withValues(alpha: alpha * 0.15)
          ..style = PaintingStyle.fill;
        canvas.drawCircle(p.position, p.radius, fillPaint);
      }
    }
  }

  void _drawCores(Canvas canvas) {
    final corePaint = Paint()..style = PaintingStyle.fill;
    final glowPaint = Paint()..style = PaintingStyle.stroke;

    for (final core in gameState.cores) {
      final pulse = (sin(gameState.stats.timeSurvived * 6.0 + core.pulseOffset) * 0.3) + 0.7;

      // Glow ring
      glowPaint
        ..color = const Color(0xFF00E5FF).withValues(alpha: pulse * 0.5)
        ..strokeWidth = 2.0;
      canvas.drawCircle(core.position, 8.0 * pulse, glowPaint);

      // Core diamond
      corePaint.color = const Color(0xFF18FFFF);
      final path = Path()
        ..moveTo(core.position.dx, core.position.dy - 6.0)
        ..lineTo(core.position.dx + 4.5, core.position.dy)
        ..lineTo(core.position.dx, core.position.dy + 6.0)
        ..lineTo(core.position.dx - 4.5, core.position.dy)
        ..close();
      canvas.drawPath(path, corePaint);
    }
  }

  void _drawParticles(Canvas canvas) {
    for (final p in gameState.particles) {
      if (p.type == ParticleType.shockwave) continue;

      final alpha = ((1.0 - p.progress) * 0.9).clamp(0.0, 1.0);
      final paint = Paint()
        ..color = p.color.withValues(alpha: alpha)
        ..style = PaintingStyle.fill;

      canvas.drawCircle(p.position, p.radius * (1.0 - p.progress * 0.5), paint);
    }
  }

  void _drawProjectiles(Canvas canvas) {
    for (final p in gameState.projectiles) {
      final paint = Paint()
        ..color = p.color
        ..style = PaintingStyle.fill;

      final glowPaint = Paint()
        ..color = p.color.withValues(alpha: 0.4)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 3.0;

      canvas.drawCircle(p.position, p.radius, glowPaint);
      canvas.drawCircle(p.position, p.radius * 0.7, paint);
    }
  }

  void _drawEnemies(Canvas canvas) {
    for (final enemy in gameState.enemies) {
      canvas.save();
      canvas.translate(enemy.position.dx, enemy.position.dy);

      // Sniper laser warning line
      if (enemy.isAimingSniper && enemy.sniperAimTimer > 0) {
        final laserPaint = Paint()
          ..color = const Color(0xFFFF1744).withValues(alpha: 0.65)
          ..strokeWidth = 1.8
          ..style = PaintingStyle.stroke;
        canvas.drawLine(
          Offset.zero,
          enemy.sniperLockDir * 600.0,
          laserPaint,
        );
      }

      canvas.rotate(enemy.angle);

      final paint = Paint()..style = PaintingStyle.fill;
      final strokePaint = Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2.0;

      switch (enemy.type) {
        case EnemyType.pulseChaser:
          // Triangle interceptor
          paint.color = const Color(0xFFFF1744);
          strokePaint.color = const Color(0xFFFF8A80);
          final path = Path()
            ..moveTo(16, 0)
            ..lineTo(-12, -10)
            ..lineTo(-6, 0)
            ..lineTo(-12, 10)
            ..close();
          canvas.drawPath(path, paint);
          canvas.drawPath(path, strokePaint);
          break;

        case EnemyType.sentinelTurret:
          // Hexagon turret
          paint.color = const Color(0xFFFF9100);
          strokePaint.color = const Color(0xFFFFD180);
          final path = Path();
          const r = 20.0;
          for (int i = 0; i < 6; i++) {
            final a = i * pi / 3;
            final pt = Offset(cos(a) * r, sin(a) * r);
            if (i == 0) {
              path.moveTo(pt.dx, pt.dy);
            } else {
              path.lineTo(pt.dx, pt.dy);
            }
          }
          path.close();
          canvas.drawPath(path, paint);
          canvas.drawPath(path, strokePaint);
          // Gun nozzle
          canvas.drawRect(const Rect.fromLTWH(0, -3, 18, 6), paint);
          break;

        case EnemyType.phaseSniper:
          // Diamond sniper
          paint.color = const Color(0xFFD500F9);
          strokePaint.color = const Color(0xFFEA80FC);
          final path = Path()
            ..moveTo(22, 0)
            ..lineTo(0, -12)
            ..lineTo(-16, 0)
            ..lineTo(0, 12)
            ..close();
          canvas.drawPath(path, paint);
          canvas.drawPath(path, strokePaint);
          break;

        case EnemyType.quantumLeviathan:
          // Massive boss
          paint.color = const Color(0xFFFF0055);
          strokePaint.color = const Color(0xFFFF4081);
          strokePaint.strokeWidth = 3.5;

          // Outer armor plates
          canvas.drawCircle(Offset.zero, 44, strokePaint);
          canvas.drawCircle(Offset.zero, 28, paint);

          // Core reactor pulse
          final corePulse = (sin(gameState.stats.timeSurvived * 8.0) * 0.3) + 0.7;
          final corePaint = Paint()
            ..color = const Color(0xFF00E5FF).withValues(alpha: corePulse)
            ..style = PaintingStyle.fill;
          canvas.drawCircle(Offset.zero, 16, corePaint);
          break;
      }

      canvas.restore();

      // Health bar above enemy if wounded
      if (enemy.health < enemy.maxHealth) {
        _drawHealthBar(canvas, enemy.position, enemy.health / enemy.maxHealth, enemy.collisionRadius + 10);
      }
    }
  }

  void _drawHealthBar(Canvas canvas, Offset pos, double pct, double yOffset) {
    const width = 36.0;
    const height = 4.0;
    final bgRect = Rect.fromCenter(center: Offset(pos.dx, pos.dy - yOffset), width: width, height: height);
    final fillRect = Rect.fromLTWH(bgRect.left, bgRect.top, width * pct.clamp(0.0, 1.0), height);

    final bgPaint = Paint()..color = Colors.black54;
    final fillPaint = Paint()..color = const Color(0xFFFF1744);

    canvas.drawRRect(RRect.fromRectAndRadius(bgRect, const Radius.circular(2)), bgPaint);
    canvas.drawRRect(RRect.fromRectAndRadius(fillRect, const Radius.circular(2)), fillPaint);
  }

  void _drawEchoes(Canvas canvas) {
    for (final echo in gameState.echoes) {
      canvas.save();
      canvas.translate(echo.currentPosition.dx, echo.currentPosition.dy);

      // Prismatic Resonance & Refraction Aura
      if (echo.canResonate) {
        final pulse = (sin(echo.auraPulse) * 0.25) + 0.75;
        final auraRadius = echo.refractionRadius * (0.92 + 0.08 * pulse);

        // Outer chromatic boundary ring
        final auraPaint = Paint()
          ..color = const Color(0xFF00FFCC).withValues(alpha: 0.35 * pulse)
          ..style = PaintingStyle.stroke
          ..strokeWidth = 2.0;
        canvas.drawCircle(Offset.zero, auraRadius, auraPaint);

        // Inner glowing resonance fill
        final auraFill = Paint()
          ..color = const Color(0xFF00FFCC).withValues(alpha: 0.08 * pulse)
          ..style = PaintingStyle.fill;
        canvas.drawCircle(Offset.zero, auraRadius, auraFill);

        // Concentric violet ripple
        final violetRing = Paint()
          ..color = const Color(0xFFE040FB).withValues(alpha: 0.25 * (1.5 - pulse))
          ..style = PaintingStyle.stroke
          ..strokeWidth = 1.2;
        canvas.drawCircle(Offset.zero, auraRadius * 0.65, violetRing);
      }

      canvas.rotate(echo.currentAngle);

      final ghostPaint = Paint()
        ..color = echo.ghostColor.withValues(alpha: 0.55)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2.5;

      final fillGhost = Paint()
        ..color = echo.ghostColor.withValues(alpha: 0.18)
        ..style = PaintingStyle.fill;

      // Holographic ship outline
      final path = Path()
        ..moveTo(22, 0)
        ..lineTo(-16, -14)
        ..lineTo(-8, 0)
        ..lineTo(-16, 14)
        ..close();

      canvas.drawPath(path, fillGhost);
      canvas.drawPath(path, ghostPaint);

      // Quantum ripple ring
      final ripplePaint = Paint()
        ..color = echo.ghostColor.withValues(alpha: 0.4)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1.5;
      canvas.drawCircle(Offset.zero, 24.0, ripplePaint);

      canvas.restore();
    }
  }

  void _drawPlayer(Canvas canvas) {
    final player = gameState.player;

    // Phase Dash Chromatic Afterimages
    if (player.isDashing && player.velocity.distance > 50) {
      final trailOffset = (player.velocity / player.velocity.distance) * -14.0;
      for (int t = 1; t <= 3; t++) {
        final ghostPos = player.position + trailOffset * t.toDouble();
        final ghostAlpha = 0.45 / t;
        canvas.save();
        canvas.translate(ghostPos.dx, ghostPos.dy);
        canvas.rotate(player.angle);

        final trailHull = Path()
          ..moveTo(24, 0)
          ..lineTo(-16, -16)
          ..lineTo(-8, -4)
          ..lineTo(-14, 0)
          ..lineTo(-8, 4)
          ..lineTo(-16, 16)
          ..close();

        final trailPaint = Paint()
          ..color = (t % 2 == 1 ? const Color(0xFF00FFCC) : const Color(0xFFE040FB)).withValues(alpha: ghostAlpha)
          ..style = PaintingStyle.stroke
          ..strokeWidth = 2.0;
        canvas.drawPath(trailHull, trailPaint);
        canvas.restore();
      }
    }

    // Invulnerability flashing
    if (player.invulnerableTimer > 0 && (player.invulnerableTimer * 15).floor() % 2 == 0) {
      // Skip frame for blink
      return;
    }

    canvas.save();
    canvas.translate(player.position.dx, player.position.dy);
    canvas.rotate(player.angle);

    // Temporal Overdrive Lightning Aura
    if (player.isOverdrive) {
      final pulse = (sin(gameState.stats.timeSurvived * 14.0) * 0.3) + 0.7;
      final odAuraPaint = Paint()
        ..color = const Color(0xFF00FFCC).withValues(alpha: 0.5 * pulse)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2.5;
      canvas.drawCircle(Offset.zero, 30.0 + pulse * 4.0, odAuraPaint);

      // Overdrive Wingtip Blasters visual flare
      final blasterPaint = Paint()
        ..color = const Color(0xFFE040FB).withValues(alpha: 0.8)
        ..style = PaintingStyle.fill;
      canvas.drawCircle(const Offset(-10, -18), 3.5, blasterPaint);
      canvas.drawCircle(const Offset(-10, 18), 3.5, blasterPaint);
    }

    final primaryPaint = Paint()
      ..color = gameState.selectedChassis.primaryColor
      ..style = PaintingStyle.fill;

    final accentPaint = Paint()
      ..color = gameState.selectedChassis.accentColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.5;

    // Ship Hull Geometry
    final hullPath = Path()
      ..moveTo(24, 0)
      ..lineTo(-16, -16)
      ..lineTo(-8, -4)
      ..lineTo(-14, 0)
      ..lineTo(-8, 4)
      ..lineTo(-16, 16)
      ..close();

    canvas.drawPath(hullPath, primaryPaint);
    canvas.drawPath(hullPath, accentPaint);

    // Cockpit Canopy
    final cockpitPaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;
    canvas.drawCircle(const Offset(4, 0), 4.5, cockpitPaint);

    // Shield Dome when active
    if (player.shield > 0) {
      final shieldAlpha = (player.shield / player.maxShield * 0.4).clamp(0.0, 0.4);
      final shieldPaint = Paint()
        ..color = const Color(0xFF00E5FF).withValues(alpha: shieldAlpha)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2.0;
      canvas.drawCircle(Offset.zero, 26, shieldPaint);
    }

    canvas.restore();
  }

  void _drawRewindVfx(Canvas canvas, Size size) {
    // Reverse glitch scanlines & chromatic distortion flash
    final progress = gameState.rewindVfxTimer / 0.45;
    final flashPaint = Paint()
      ..color = const Color(0xFF00E5FF).withValues(alpha: progress * 0.28)
      ..style = PaintingStyle.fill;
    canvas.drawRect(Rect.fromLTWH(0, 0, size.width, size.height), flashPaint);

    // Scanning temporal lines
    final linePaint = Paint()
      ..color = const Color(0xFFD500F9).withValues(alpha: progress * 0.45)
      ..strokeWidth = 2.0;

    for (double y = 0; y < size.height; y += 14) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), linePaint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
