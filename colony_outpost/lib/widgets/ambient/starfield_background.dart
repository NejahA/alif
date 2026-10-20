import 'dart:math';
import 'package:flutter/material.dart';
import '../../theme/colony_theme.dart';

class StarfieldBackground extends StatefulWidget {
  final Widget child;
  final bool isNight;

  const StarfieldBackground({
    super.key,
    required this.child,
    this.isNight = false,
  });

  @override
  State<StarfieldBackground> createState() => _StarfieldBackgroundState();
}

class _StarfieldBackgroundState extends State<StarfieldBackground>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  final List<Offset> _stars = [];
  final List<double> _starSizes = [];
  final List<double> _starOpacities = [];
  final Random _random = Random(42);

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 20),
    )..repeat();

    for (int i = 0; i < 90; i++) {
      _stars.add(Offset(_random.nextDouble(), _random.nextDouble()));
      _starSizes.add(_random.nextDouble() * 2.2 + 0.6);
      _starOpacities.add(_random.nextDouble() * 0.7 + 0.3);
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, _) {
        return Stack(
          children: [
            // Deep ambient planetary atmosphere gradient
            AnimatedContainer(
              duration: const Duration(seconds: 3),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: widget.isNight
                      ? [
                          const Color(0xFF03050B),
                          const Color(0xFF070B16),
                          const Color(0xFF0B1226),
                          const Color(0xFF13182E),
                        ]
                      : [
                          const Color(0xFF0A0F1D),
                          const Color(0xFF101932),
                          const Color(0xFF18223C),
                          const Color(0xFF1B1B32),
                        ],
                  stops: const [0.0, 0.35, 0.7, 1.0],
                ),
              ),
            ),
            // Custom starry canvas with celestial moon and nebula
            CustomPaint(
              size: Size.infinite,
              painter: _SpacePainter(
                stars: _stars,
                starSizes: _starSizes,
                starOpacities: _starOpacities,
                animationValue: _controller.value,
                isNight: widget.isNight,
              ),
            ),
            widget.child,
          ],
        );
      },
    );
  }
}

class _SpacePainter extends CustomPainter {
  final List<Offset> stars;
  final List<double> starSizes;
  final List<double> starOpacities;
  final double animationValue;
  final bool isNight;

  _SpacePainter({
    required this.stars,
    required this.starSizes,
    required this.starOpacities,
    required this.animationValue,
    required this.isNight,
  });

  @override
  void paint(Canvas canvas, Size size) {
    // 1. Draw subtle distant nebula glow
    final Rect nebulaRect = Rect.fromCircle(
      center: Offset(size.width * 0.85, size.height * 0.2),
      radius: size.width * 0.45,
    );
    final Paint nebulaPaint = Paint()
      ..shader = RadialGradient(
        colors: [
          ColonyTheme.plasmaPurple.withValues(alpha: isNight ? 0.12 : 0.06),
          ColonyTheme.neonCyan.withValues(alpha: isNight ? 0.05 : 0.02),
          Colors.transparent,
        ],
        stops: const [0.0, 0.5, 1.0],
      ).createShader(nebulaRect);
    canvas.drawRect(nebulaRect, nebulaPaint);

    // 2. Draw distant sister moon
    final Offset moonCenter = Offset(size.width * 0.18, size.height * 0.12);
    final double moonRadius = size.width * 0.07;
    final Paint moonGlow = Paint()
      ..color = (isNight ? ColonyTheme.neonCyan : ColonyTheme.laserAmber).withValues(alpha: 0.12)
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 20);
    canvas.drawCircle(moonCenter, moonRadius * 1.4, moonGlow);

    final Paint moonBody = Paint()
      ..shader = RadialGradient(
        center: const Alignment(-0.3, -0.3),
        colors: isNight
            ? [
                const Color(0xFF80D8FF),
                const Color(0xFF2979FF),
                const Color(0xFF0D47A1),
              ]
            : [
                const Color(0xFFFFE082),
                const Color(0xFFFF8F00),
                const Color(0xFFBF360C),
              ],
      ).createShader(Rect.fromCircle(center: moonCenter, radius: moonRadius));
    canvas.drawCircle(moonCenter, moonRadius, moonBody);

    // 3. Draw stars with twinkling phase
    for (int i = 0; i < stars.length; i++) {
      final double x = stars[i].dx * size.width;
      final double y = stars[i].dy * size.height;
      final double twinkle = (sin((animationValue * 2 * pi) + (i * 1.3)) + 1.0) / 2.0;
      final double alpha = (starOpacities[i] * (0.4 + 0.6 * twinkle)).clamp(0.0, 1.0);

      final Paint starPaint = Paint()
        ..color = (i % 5 == 0 ? ColonyTheme.neonCyan : Colors.white).withValues(alpha: alpha);
      canvas.drawCircle(Offset(x, y), starSizes[i], starPaint);
    }
  }

  @override
  bool shouldRepaint(covariant _SpacePainter oldDelegate) => true;
}
