import 'dart:math';
import 'package:flutter/material.dart';
import '../theme/jungle_theme.dart';

class AudioVisualizer extends StatefulWidget {
  final bool isPlaying;
  final Color? color;
  final double height;

  const AudioVisualizer({
    super.key,
    required this.isPlaying,
    this.color,
    this.height = 42,
  });

  @override
  State<AudioVisualizer> createState() => _AudioVisualizerState();
}

class _AudioVisualizerState extends State<AudioVisualizer>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: widget.height,
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, _) {
          return CustomPaint(
            size: Size.infinite,
            painter: _WaveVisualizerPainter(
              animValue: _controller.value,
              isPlaying: widget.isPlaying,
              color: widget.color ?? JungleColors.neonJade,
            ),
          );
        },
      ),
    );
  }
}

class _WaveVisualizerPainter extends CustomPainter {
  final double animValue;
  final bool isPlaying;
  final Color color;

  _WaveVisualizerPainter({
    required this.animValue,
    required this.isPlaying,
    required this.color,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final barCount = 28;
    final barWidth = size.width / (barCount * 1.6);
    final gap = (size.width - (barCount * barWidth)) / (barCount - 1);

    final paint = Paint()
      ..style = PaintingStyle.fill
      ..strokeCap = StrokeCap.round;

    for (int i = 0; i < barCount; i++) {
      final x = i * (barWidth + gap);
      double heightMultiplier = 0.15;

      if (isPlaying) {
        final phase = (i / barCount) * 2 * pi;
        final wave1 = sin(animValue * 2 * pi * 2 + phase);
        final wave2 = cos(animValue * 2 * pi * 3 - phase * 1.5);
        heightMultiplier = (0.25 + 0.35 * (wave1.abs()) + 0.4 * (wave2.abs())).clamp(0.12, 1.0);
      }

      final barH = size.height * heightMultiplier;
      final y = (size.height - barH) / 2;

      paint.shader = LinearGradient(
        begin: Alignment.bottomCenter,
        end: Alignment.topCenter,
        colors: [
          color.withOpacity(0.4),
          color,
        ],
      ).createShader(Rect.fromLTWH(x, y, barWidth, barH));

      canvas.drawRRect(
        RRect.fromRectAndRadius(
          Rect.fromLTWH(x, y, barWidth, barH),
          Radius.circular(barWidth / 2),
        ),
        paint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant _WaveVisualizerPainter oldDelegate) => true;
}
