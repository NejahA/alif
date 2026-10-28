import 'dart:math';
import 'package:flutter/material.dart';
import '../services/jungle_state.dart';
import '../theme/jungle_theme.dart';

class JungleParticle {
  double x;
  double y;
  double speed;
  double radius;
  double opacity;
  double phase;
  Color color;
  bool isRain;

  JungleParticle({
    required this.x,
    required this.y,
    required this.speed,
    required this.radius,
    required this.opacity,
    required this.phase,
    required this.color,
    this.isRain = false,
  });
}

class JungleParticleCanvas extends StatefulWidget {
  final AtmosphereMode atmosphere;
  final Widget? child;

  const JungleParticleCanvas({
    super.key,
    required this.atmosphere,
    this.child,
  });

  @override
  State<JungleParticleCanvas> createState() => _JungleParticleCanvasState();
}

class _JungleParticleCanvasState extends State<JungleParticleCanvas>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  final List<JungleParticle> _particles = [];
  final Random _rnd = Random();

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 10),
    )..repeat();

    _initParticles();
  }

  @override
  void didUpdateWidget(covariant JungleParticleCanvas oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.atmosphere != widget.atmosphere) {
      _initParticles();
    }
  }

  void _initParticles() {
    _particles.clear();
    final isRain = widget.atmosphere == AtmosphereMode.tropicalDownpour;
    final isNight = widget.atmosphere == AtmosphereMode.bioluminescentNight;
    final isGolden = widget.atmosphere == AtmosphereMode.goldenHour;

    final count = isRain ? 65 : 45;

    for (int i = 0; i < count; i++) {
      Color c;
      if (isRain) {
        c = JungleColors.azureLagoon.withOpacity(0.5);
      } else if (isNight) {
        c = (i % 2 == 0) ? JungleColors.neonJade : JungleColors.mysticOrchid;
      } else if (isGolden) {
        c = (i % 2 == 0) ? JungleColors.solarGold : JungleColors.tropicalPapaya;
      } else {
        c = (i % 2 == 0) ? JungleColors.electricMint : JungleColors.sunAmber;
      }

      _particles.add(
        JungleParticle(
          x: _rnd.nextDouble(),
          y: _rnd.nextDouble(),
          speed: isRain ? (0.008 + _rnd.nextDouble() * 0.012) : (0.0008 + _rnd.nextDouble() * 0.002),
          radius: isRain ? 1.5 : (1.5 + _rnd.nextDouble() * 3.5),
          opacity: 0.3 + _rnd.nextDouble() * 0.6,
          phase: _rnd.nextDouble() * 2 * pi,
          color: c,
          isRain: isRain,
        ),
      );
    }
  }

  void _addTouchFirefly(Offset localPos, Size size) {
    if (size.width == 0 || size.height == 0) return;
    setState(() {
      for (int i = 0; i < 5; i++) {
        _particles.add(
          JungleParticle(
            x: (localPos.dx / size.width) + (_rnd.nextDouble() * 0.06 - 0.03),
            y: (localPos.dy / size.height) + (_rnd.nextDouble() * 0.06 - 0.03),
            speed: 0.001 + _rnd.nextDouble() * 0.003,
            radius: 3.0 + _rnd.nextDouble() * 4.0,
            opacity: 0.9,
            phase: _rnd.nextDouble() * 2 * pi,
            color: JungleColors.neonJade,
            isRain: false,
          ),
        );
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final size = Size(constraints.maxWidth, constraints.maxHeight);
        return GestureDetector(
          onTapDown: (details) => _addTouchFirefly(details.localPosition, size),
          onPanUpdate: (details) => _addTouchFirefly(details.localPosition, size),
          child: Stack(
            fit: StackFit.expand,
            children: [
              AnimatedBuilder(
                animation: _controller,
                builder: (context, _) {
                  for (final p in _particles) {
                    p.y += p.speed;
                    if (p.y > 1.05) {
                      p.y = -0.05;
                      p.x = _rnd.nextDouble();
                    }
                    if (!p.isRain) {
                      p.x += sin(_controller.value * 2 * pi + p.phase) * 0.0006;
                    }
                  }
                  return CustomPaint(
                    painter: _JungleAtmospherePainter(
                      particles: _particles,
                      atmosphere: widget.atmosphere,
                      animValue: _controller.value,
                    ),
                  );
                },
              ),
              if (widget.child != null) widget.child!,
            ],
          ),
        );
      },
    );
  }
}

class _JungleAtmospherePainter extends CustomPainter {
  final List<JungleParticle> particles;
  final AtmosphereMode atmosphere;
  final double animValue;

  _JungleAtmospherePainter({
    required this.particles,
    required this.atmosphere,
    required this.animValue,
  });

  @override
  void paint(Canvas canvas, Size size) {
    // Background gradient according to atmosphere
    final bgRect = Offset.zero & size;
    final Paint bgPaint = Paint();

    switch (atmosphere) {
      case AtmosphereMode.morningMist:
        bgPaint.shader = LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            const Color(0xFF071F15),
            const Color(0xFF04120B),
            JungleColors.abyss,
          ],
        ).createShader(bgRect);
        break;

      case AtmosphereMode.tropicalDownpour:
        bgPaint.shader = LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            const Color(0xFF07171C),
            const Color(0xFF051613),
            JungleColors.abyss,
          ],
        ).createShader(bgRect);
        break;

      case AtmosphereMode.goldenHour:
        bgPaint.shader = LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            const Color(0xFF261A05),
            const Color(0xFF141F10),
            JungleColors.abyss,
          ],
        ).createShader(bgRect);
        break;

      case AtmosphereMode.bioluminescentNight:
        bgPaint.shader = LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            const Color(0xFF130924),
            const Color(0xFF071B16),
            JungleColors.abyss,
          ],
        ).createShader(bgRect);
        break;
    }

    canvas.drawRect(bgRect, bgPaint);

    // Render particles
    final Paint particlePaint = Paint()..style = PaintingStyle.fill;

    for (final p in particles) {
      final cx = p.x * size.width;
      final cy = p.y * size.height;

      if (p.isRain) {
        particlePaint.color = p.color.withOpacity(p.opacity * 0.75);
        particlePaint.strokeWidth = p.radius;
        particlePaint.style = PaintingStyle.stroke;
        canvas.drawLine(
          Offset(cx, cy),
          Offset(cx - 3, cy + 18),
          particlePaint,
        );
      } else {
        // Pulsing firefly / spore
        final pulse = 0.6 + 0.4 * sin(animValue * 2 * pi * 2 + p.phase);
        final glowRadius = p.radius * (1.5 + pulse);

        // Soft outer glow
        particlePaint.color = p.color.withOpacity(p.opacity * 0.25 * pulse);
        canvas.drawCircle(Offset(cx, cy), glowRadius * 2.2, particlePaint);

        // Bright inner core
        particlePaint.color = p.color.withOpacity(p.opacity * pulse);
        canvas.drawCircle(Offset(cx, cy), p.radius, particlePaint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant _JungleAtmospherePainter oldDelegate) => true;
}
