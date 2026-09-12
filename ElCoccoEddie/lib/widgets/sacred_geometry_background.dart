import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../theme/illuminati_theme.dart';

class SacredGeometryBackground extends StatefulWidget {
  final Widget child;

  const SacredGeometryBackground({super.key, required this.child});

  @override
  State<SacredGeometryBackground> createState() =>
      _SacredGeometryBackgroundState();
}

class _SacredGeometryBackgroundState extends State<SacredGeometryBackground>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 20),
    )..repeat();
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
      builder: (context, child) {
        return CustomPaint(
          painter: SacredGridPainter(progress: _controller.value),
          child: widget.child,
        );
      },
    );
  }
}

class SacredGridPainter extends CustomPainter {
  final double progress;

  SacredGridPainter({required this.progress});

  @override
  void paint(Canvas canvas, Size size) {
    final bgPaint = Paint()..color = IlluminatiTheme.obsidianBlack;
    canvas.drawRect(Rect.fromLTWH(0, 0, size.width, size.height), bgPaint);

    final linePaint = Paint()
      ..color = IlluminatiTheme.sacredGold.withValues(alpha: 0.05)
      ..strokeWidth = 0.8;

    const gridSize = 45.0;
    for (double x = 0; x < size.width; x += gridSize) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), linePaint);
    }

    for (double y = 0; y < size.height; y += gridSize) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), linePaint);
    }

    // Floating particles
    final rand = math.Random(42);
    final particlePaint = Paint()
      ..style = PaintingStyle.fill;

    for (int i = 0; i < 25; i++) {
      final initialX = rand.nextDouble() * size.width;
      final initialY = rand.nextDouble() * size.height;
      final speed = 0.2 + rand.nextDouble() * 0.5;

      final currentY = (initialY - progress * size.height * speed) % size.height;
      final alpha = 0.2 + 0.3 * math.sin((progress * math.pi * 2) + i);

      particlePaint.color = (i % 3 == 0
              ? IlluminatiTheme.sacredGold
              : i % 3 == 1
                  ? IlluminatiTheme.cyberCyan
                  : IlluminatiTheme.emeraldShield)
          .withValues(alpha: alpha);

      canvas.drawCircle(Offset(initialX, currentY), 1.5 + (i % 3), particlePaint);
    }
  }

  @override
  bool shouldRepaint(covariant SacredGridPainter oldDelegate) {
    return oldDelegate.progress != progress;
  }
}
