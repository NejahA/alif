import 'dart:math';
import 'package:flutter/material.dart';

class CelestialBackground extends StatelessWidget {
  final Widget? child;
  const CelestialBackground({super.key, this.child});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Positioned.fill(
          child: CustomPaint(
            painter: StarfieldPainter(),
          ),
        ),
        // Add a subtle nebula glow overlay
        Positioned.fill(
          child: Container(
            decoration: BoxDecoration(
              gradient: RadialGradient(
                center: Alignment.center,
                radius: 1.2,
                colors: [
                  const Color(0xFF1A0B2E).withOpacity(0.3),
                  const Color(0xFF020205).withOpacity(0.8),
                  const Color(0xFF000000),
                ],
                stops: const [0.0, 0.6, 1.0],
              ),
            ),
          ),
        ),
        if (child != null) Positioned.fill(child: child!),
      ],
    );
  }
}

class StarfieldPainter extends CustomPainter {
  final List<Star> stars = List.generate(200, (index) => Star());

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = Colors.white;
    final random = Random(42);

    for (var star in stars) {
      final x = random.nextDouble() * size.width;
      final y = random.nextDouble() * size.height;
      final radius = random.nextDouble() * 1.5;
      final opacity = random.nextDouble() * 0.7 + 0.3;

      paint.color = Colors.white.withOpacity(opacity);
      canvas.drawCircle(Offset(x, y), radius, paint);

      // Add a faint glow to some stars
      if (random.nextDouble() > 0.95) {
        final glowPaint = Paint()
          ..color = star.color.withOpacity(0.2)
          ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 4);
        canvas.drawCircle(Offset(x, y), radius * 3, glowPaint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class Star {
  final Color color;
  Star() : color = _randomStarColor();

  static Color _randomStarColor() {
    final colors = [
      const Color(0xFF00E5FF),
      const Color(0xFFFF00D4),
      const Color(0xFFFFFFFF),
      const Color(0xFFFFFACD),
    ];
    return colors[Random().nextInt(colors.length)];
  }
}
