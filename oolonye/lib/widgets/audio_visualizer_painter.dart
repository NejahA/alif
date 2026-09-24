import 'dart:math';
import 'package:flutter/material.dart';

class AudioVisualizerPainter extends CustomPainter {
  final double animationValue;
  final Color primaryColor;
  final Color secondaryColor;
  final bool isPlaying;

  AudioVisualizerPainter({
    required this.animationValue,
    required this.primaryColor,
    required this.secondaryColor,
    required this.isPlaying,
  });

  @override
  void paint(Canvas canvas, Size size) {
    if (!isPlaying) {
      // Draw muted baseline wave
      final linePaint = Paint()
        ..color = primaryColor.withOpacity(0.3)
        ..strokeWidth = 2.0;
      canvas.drawLine(
        Offset(0, size.height / 2),
        Offset(size.width, size.height / 2),
        linePaint,
      );
      return;
    }

    final barCount = 32;
    final barWidth = size.width / (barCount * 1.5);
    final centerY = size.height / 2;

    final paint = Paint()
      ..style = PaintingStyle.fill
      ..strokeCap = StrokeCap.round;

    for (int i = 0; i < barCount; i++) {
      final x = i * (barWidth * 1.5) + barWidth / 2;
      
      // Calculate dynamic bar height using layered sine waves
      final phase1 = sin(animationValue * 2 * pi * 2 + i * 0.4);
      final phase2 = cos(animationValue * 2 * pi * 3 - i * 0.2);
      final heightFactor = (phase1 + phase2 + 2) / 4.0; // 0.0 to 1.0
      
      final barHeight = max(6.0, heightFactor * (size.height * 0.8));

      // Gradient interpolation between primary and secondary colors
      final t = i / barCount;
      final barColor = Color.lerp(primaryColor, secondaryColor, t) ?? primaryColor;

      paint.color = barColor.withOpacity(0.85);

      final rect = RRect.fromRectAndRadius(
        Rect.fromLTRB(
          x - barWidth / 2,
          centerY - barHeight / 2,
          x + barWidth / 2,
          centerY + barHeight / 2,
        ),
        Radius.circular(barWidth / 2),
      );

      canvas.drawRRect(rect, paint);
    }
  }

  @override
  bool shouldRepaint(covariant AudioVisualizerPainter oldDelegate) {
    return oldDelegate.animationValue != animationValue ||
        oldDelegate.isPlaying != isPlaying ||
        oldDelegate.primaryColor != primaryColor;
  }
}
