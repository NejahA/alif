import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../theme/illuminati_theme.dart';

class IlluminatiEyeWidget extends StatefulWidget {
  final bool isShielded;
  final VoidCallback onTap;
  final double size;

  const IlluminatiEyeWidget({
    super.key,
    required this.isShielded,
    required this.onTap,
    this.size = 280,
  });

  @override
  State<IlluminatiEyeWidget> createState() => _IlluminatiEyeWidgetState();
}

class _IlluminatiEyeWidgetState extends State<IlluminatiEyeWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 8),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: widget.onTap,
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, child) {
          return CustomPaint(
            size: Size(widget.size, widget.size),
            painter: IlluminatiEyePainter(
              rotationProgress: _controller.value,
              isShielded: widget.isShielded,
            ),
          );
        },
      ),
    );
  }
}

class IlluminatiEyePainter extends CustomPainter {
  final double rotationProgress;
  final bool isShielded;

  IlluminatiEyePainter({
    required this.rotationProgress,
    required this.isShielded,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;

    // 1. Outer Glowing Ambient Pulse
    final pulsePaint = Paint()
      ..color = (isShielded ? IlluminatiTheme.emeraldShield : IlluminatiTheme.crimsonSeal)
          .withValues(alpha: 0.15 + 0.05 * math.sin(rotationProgress * math.pi * 2))
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 25);
    canvas.drawCircle(center, radius * 0.95, pulsePaint);

    // 2. Sacred Outer Geometric Circles & Ticks
    final circlePaint = Paint()
      ..color = IlluminatiTheme.sacredGold.withValues(alpha: 0.5)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;

    canvas.drawCircle(center, radius * 0.88, circlePaint);
    canvas.drawCircle(center, radius * 0.82, circlePaint..color = IlluminatiTheme.amberGlow.withValues(alpha: 0.3));

    // Outer Rotating Rune Ticks
    canvas.save();
    canvas.translate(center.dx, center.dy);
    canvas.rotate(rotationProgress * math.pi * 2);
    final tickPaint = Paint()
      ..color = IlluminatiTheme.sacredGold.withValues(alpha: 0.7)
      ..strokeWidth = 2.0;

    const numTicks = 12;
    for (int i = 0; i < numTicks; i++) {
      final angle = (i * 2 * math.pi) / numTicks;
      final x1 = (radius * 0.84) * math.cos(angle);
      final y1 = (radius * 0.84) * math.sin(angle);
      final x2 = (radius * 0.88) * math.cos(angle);
      final y2 = (radius * 0.88) * math.sin(angle);
      canvas.drawLine(Offset(x1, y1), Offset(x2, y2), tickPaint);
    }
    canvas.restore();

    // 3. Counter-Rotating Inner Triangle Rays
    canvas.save();
    canvas.translate(center.dx, center.dy);
    canvas.rotate(-rotationProgress * math.pi);
    final rayPaint = Paint()
      ..color = (isShielded ? IlluminatiTheme.cyberCyan : IlluminatiTheme.crimsonSeal)
          .withValues(alpha: 0.18)
      ..strokeWidth = 1.0;
    for (int i = 0; i < 8; i++) {
      final angle = (i * 2 * math.pi) / 8;
      canvas.drawLine(
        Offset.zero,
        Offset((radius * 0.75) * math.cos(angle), (radius * 0.75) * math.sin(angle)),
        rayPaint,
      );
    }
    canvas.restore();

    // 4. The Illuminati Pyramid Triangle
    final trianglePath = Path();
    final triangleRadius = radius * 0.75;
    // Top vertex
    final topVertex = Offset(center.dx, center.dy - triangleRadius * 0.85);
    // Bottom Right
    final bottomRightVertex = Offset(
      center.dx + triangleRadius * math.cos(math.pi / 6),
      center.dy + triangleRadius * math.sin(math.pi / 6),
    );
    // Bottom Left
    final bottomLeftVertex = Offset(
      center.dx - triangleRadius * math.cos(math.pi / 6),
      center.dy + triangleRadius * math.sin(math.pi / 6),
    );

    trianglePath.moveTo(topVertex.dx, topVertex.dy);
    trianglePath.lineTo(bottomRightVertex.dx, bottomRightVertex.dy);
    trianglePath.lineTo(bottomLeftVertex.dx, bottomLeftVertex.dy);
    trianglePath.close();

    // Pyramid Gradient Fill
    final pyramidFillPaint = Paint()
      ..shader = RadialGradient(
        colors: [
          IlluminatiTheme.slateCard.withValues(alpha: 0.9),
          IlluminatiTheme.voidDark.withValues(alpha: 0.95),
          IlluminatiTheme.obsidianBlack,
        ],
        center: Alignment.center,
        radius: 0.8,
      ).createShader(Rect.fromCircle(center: center, radius: radius));

    canvas.drawPath(trianglePath, pyramidFillPaint);

    // Pyramid Border & Glow
    final pyramidBorderPaint = Paint()
      ..color = isShielded ? IlluminatiTheme.sacredGold : IlluminatiTheme.crimsonSeal
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3.5;

    final glowBorderPaint = Paint()
      ..color = (isShielded ? IlluminatiTheme.sacredGold : IlluminatiTheme.crimsonSeal).withValues(alpha: 0.6)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 8.0
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 10);

    canvas.drawPath(trianglePath, glowBorderPaint);
    canvas.drawPath(trianglePath, pyramidBorderPaint);

    // Pyramid Horizontal Bricks Lines
    final brickPaint = Paint()
      ..color = IlluminatiTheme.sacredGold.withValues(alpha: 0.25)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0;

    for (int i = 1; i <= 4; i++) {
      double t = i / 5.0;
      double y = topVertex.dy + (bottomRightVertex.dy - topVertex.dy) * t;
      double leftX = topVertex.dx + (bottomLeftVertex.dx - topVertex.dx) * t;
      double rightX = topVertex.dx + (bottomRightVertex.dx - topVertex.dx) * t;
      canvas.drawLine(Offset(leftX, y), Offset(rightX, y), brickPaint);
    }

    // 5. The All-Seeing Eye of Providence
    final eyeCenter = Offset(center.dx, center.dy + 8);
    final eyeWidth = radius * 0.45;
    final eyeHeight = isShielded ? radius * 0.05 : radius * 0.25; // Closed when shielded!

    final eyePath = Path();
    eyePath.moveTo(eyeCenter.dx - eyeWidth, eyeCenter.dy);
    eyePath.quadraticBezierTo(
      eyeCenter.dx,
      eyeCenter.dy - eyeHeight,
      eyeCenter.dx + eyeWidth,
      eyeCenter.dy,
    );
    eyePath.quadraticBezierTo(
      eyeCenter.dx,
      eyeCenter.dy + eyeHeight,
      eyeCenter.dx - eyeWidth,
      eyeCenter.dy,
    );

    final eyePaint = Paint()
      ..color = isShielded ? IlluminatiTheme.sacredGold : IlluminatiTheme.cyberCyan
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.5;

    final eyeGlowPaint = Paint()
      ..color = (isShielded ? IlluminatiTheme.sacredGold : IlluminatiTheme.cyberCyan).withValues(alpha: 0.8)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 6.0
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 8);

    canvas.drawPath(eyePath, eyeGlowPaint);
    canvas.drawPath(eyePath, eyePaint);

    if (!isShielded) {
      // Iris & Pupil (Visible when watching / unshielded)
      final irisRadius = radius * 0.11;
      final irisPaint = Paint()
        ..color = IlluminatiTheme.crimsonSeal
        ..style = PaintingStyle.fill;
      canvas.drawCircle(eyeCenter, irisRadius, irisPaint);

      final pupilPaint = Paint()
        ..color = Colors.black
        ..style = PaintingStyle.fill;
      canvas.drawCircle(eyeCenter, irisRadius * 0.45, pupilPaint);

      // Glint in the eye
      final glintPaint = Paint()
        ..color = Colors.white
        ..style = PaintingStyle.fill;
      canvas.drawCircle(
        Offset(eyeCenter.dx - irisRadius * 0.3, eyeCenter.dy - irisRadius * 0.3),
        irisRadius * 0.25,
        glintPaint,
      );
    } else {
      // Shielded Lock Seal Symbol in the Eye
      final lockPaint = Paint()
        ..color = IlluminatiTheme.emeraldShield
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2.5;
      
      canvas.drawCircle(eyeCenter, 8, lockPaint);
      canvas.drawLine(
        Offset(eyeCenter.dx - 12, eyeCenter.dy),
        Offset(eyeCenter.dx + 12, eyeCenter.dy),
        lockPaint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant IlluminatiEyePainter oldDelegate) {
    return oldDelegate.rotationProgress != rotationProgress ||
        oldDelegate.isShielded != isShielded;
  }
}
