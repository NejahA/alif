import 'dart:math';
import 'package:flutter/material.dart';
import '../models/orbit_node.dart';

class OrbitalCanvasPainter extends CustomPainter {
  final List<OrbitNode> nodes;
  final double animationValue; // 0.0 to 1.0 (continuous rotation)
  final String? selectedNodeId;

  OrbitalCanvasPainter({
    required this.nodes,
    required this.animationValue,
    this.selectedNodeId,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final maxRadius = min(size.width, size.height) * 0.45;

    // 1. Draw central Colonye Core Glow
    final coreGlowPaint = Paint()
      ..color = const Color(0xFF7C4DFF).withOpacity(0.2)
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 25);
    canvas.drawCircle(center, 42, coreGlowPaint);

    final corePaint = Paint()
      ..shader = const RadialGradient(
        colors: [
          Color(0xFF00E5FF),
          Color(0xFF7C4DFF),
          Color(0xFF090A10),
        ],
        stops: [0.1, 0.6, 1.0],
      ).createShader(Rect.fromCircle(center: center, radius: 36));
    canvas.drawCircle(center, 36, corePaint);

    // Core inner ring
    final coreRingPaint = Paint()
      ..color = Colors.white.withOpacity(0.6)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;
    canvas.drawCircle(center, 24, coreRingPaint);

    // 2. Draw Starfield Background Particles
    final starPaint = Paint()..color = Colors.white.withOpacity(0.4);
    final random = Random(42);
    for (int i = 0; i < 40; i++) {
      final starX = random.nextDouble() * size.width;
      final starY = random.nextDouble() * size.height;
      final starRadius = random.nextDouble() * 1.5 + 0.5;
      final alpha = (sin(animationValue * 2 * pi + i) + 1) / 2 * 0.5 + 0.2;
      starPaint.color = Colors.white.withOpacity(alpha);
      canvas.drawCircle(Offset(starX, starY), starRadius, starPaint);
    }

    // 3. Draw Orbit Rings & Nodes
    for (int i = 0; i < nodes.length; i++) {
      final node = nodes[i];
      final orbitRadius = maxRadius * node.orbitRadiusMultiplier;

      // Draw Orbit Track Ring
      final trackPaint = Paint()
        ..color = (node.isCompletedToday ? node.color : Colors.white12).withOpacity(0.15)
        ..style = PaintingStyle.stroke
        ..strokeWidth = node.isCompletedToday ? 1.8 : 1.0;
      
      canvas.drawCircle(center, orbitRadius, trackPaint);

      // Calculate node angle & position
      final angle = (animationValue * 2 * pi * node.baseSpeed) + (i * (2 * pi / nodes.length));
      final nodeX = center.dx + orbitRadius * cos(angle);
      final nodeY = center.dy + orbitRadius * sin(angle);
      final nodeCenter = Offset(nodeX, nodeY);

      // Draw Energy Connection Trail to Core if completed
      if (node.isCompletedToday) {
        final linePaint = Paint()
          ..shader = LinearGradient(
            colors: [node.color.withOpacity(0.5), Colors.transparent],
          ).createShader(Rect.fromPoints(center, nodeCenter))
          ..strokeWidth = 1.2;
        canvas.drawLine(center, nodeCenter, linePaint);
      }

      // Draw Node Outer Glow
      final nodeGlowRadius = node.isCompletedToday ? 22.0 : 16.0;
      final nodeGlowPaint = Paint()
        ..color = node.color.withOpacity(node.isCompletedToday ? 0.45 : 0.2)
        ..maskFilter = MaskFilter.blur(BlurStyle.normal, node.isCompletedToday ? 12 : 6);
      canvas.drawCircle(nodeCenter, nodeGlowRadius, nodeGlowPaint);

      // Draw Node Sphere
      final nodeBodyPaint = Paint()
        ..shader = RadialGradient(
          colors: [
            node.color,
            node.color.withOpacity(0.7),
            const Color(0xFF101322),
          ],
        ).createShader(Rect.fromCircle(center: nodeCenter, radius: 14));
      canvas.drawCircle(nodeCenter, 14, nodeBodyPaint);

      // Draw active completion ring around node
      if (node.isCompletedToday) {
        final ringPaint = Paint()
          ..color = Colors.white
          ..style = PaintingStyle.stroke
          ..strokeWidth = 2.0;
        canvas.drawCircle(nodeCenter, 17, ringPaint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant OrbitalCanvasPainter oldDelegate) {
    return oldDelegate.animationValue != animationValue ||
        oldDelegate.nodes != nodes ||
        oldDelegate.selectedNodeId != selectedNodeId;
  }
}
