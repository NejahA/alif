import 'dart:math';
import 'package:flutter/material.dart';
import '../theme/opiate_theme.dart';

class IslamicPatternBackground extends StatelessWidget {
  final Widget child;

  const IslamicPatternBackground({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Color(0xFF0C241F),
            Color(0xFF050E0C),
            Color(0xFF020705),
          ],
        ),
      ),
      child: Stack(
        children: [
          Positioned.fill(
            child: CustomPaint(
              painter: _IslamicGeometricPainter(),
            ),
          ),
          child,
        ],
      ),
    );
  }
}

class _IslamicGeometricPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = OpiateTheme.sacredGold.withValues(alpha: 0.04)
      ..strokeWidth = 1.0
      ..style = PaintingStyle.stroke;

    const double step = 60.0;
    final double radius = step / 2.8;

    for (double x = 0; x < size.width + step; x += step) {
      for (double y = 0; y < size.height + step; y += step) {
        final center = Offset(x, y);

        // Draw 8-pointed star rosette pattern
        canvas.drawCircle(center, radius, paint);

        final Path starPath = Path();
        for (int i = 0; i < 8; i++) {
          final double angle = i * pi / 4;
          final double r = (i % 2 == 0) ? radius : radius * 0.6;
          final double px = center.dx + r * cos(angle);
          final double py = center.dy + r * sin(angle);
          if (i == 0) {
            starPath.moveTo(px, py);
          } else {
            starPath.lineTo(px, py);
          }
        }
        starPath.close();
        canvas.drawPath(starPath, paint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
