import 'package:flutter/material.dart';

class Ripple {
  double x;
  double y;
  double radius;
  double maxRadius;
  Color color;
  double opacity;

  Ripple({
    required this.x,
    required this.y,
    this.radius = 0,
    this.maxRadius = 80,
    this.color = Colors.white,
    this.opacity = 0.6,
  });

  bool get isDead => radius >= maxRadius || opacity <= 0;

  void update() {
    radius += 2.5;
    opacity = (1 - radius / maxRadius).clamp(0, 0.6);
  }
}

class RipplePainter extends CustomPainter {
  final List<Ripple> ripples;

  RipplePainter(this.ripples);

  @override
  void paint(Canvas canvas, Size size) {
    for (final r in ripples) {
      final paint = Paint()
        ..color = r.color.withValues(alpha: r.opacity)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2.5;

      canvas.drawCircle(Offset(r.x, r.y), r.radius, paint);
    }
  }

  @override
  bool shouldRepaint(covariant RipplePainter oldDelegate) => true;
}