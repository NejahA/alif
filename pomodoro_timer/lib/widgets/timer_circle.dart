import 'dart:math';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/pomodoro_timer.dart';

class TimerCircle extends StatelessWidget {
  const TimerCircle({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<PomodoroTimerModel>(
      builder: (context, timer, _) {
        final color = timer.isWorkSession
            ? const Color(0xFFE53935)
            : const Color(0xFF43A047);

        return SizedBox(
          width: 280,
          height: 280,
          child: CustomPaint(
            painter: TimerCirclePainter(
              progress: timer.progress,
              color: color,
              isRunning: timer.state == TimerState.running,
            ),
            child: Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    timer.formattedTime,
                    style: TextStyle(
                      fontSize: 64,
                      fontWeight: FontWeight.w300,
                      color: Colors.white,
                      letterSpacing: 4,
                      shadows: [
                        Shadow(
                          color: color.withValues(alpha: 0.3),
                          blurRadius: 20,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    timer.state == TimerState.running
                        ? 'Running'
                        : timer.state == TimerState.paused
                            ? 'Paused'
                            : 'Ready',
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.white38,
                      letterSpacing: 3,
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

class TimerCirclePainter extends CustomPainter {
  final double progress;
  final Color color;
  final bool isRunning;

  TimerCirclePainter({
    required this.progress,
    required this.color,
    required this.isRunning,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = min(size.width, size.height) / 2 - 20;

    // Background circle
    final bgPaint = Paint()
      ..color = Colors.white.withValues(alpha: 0.05)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 8;

    canvas.drawCircle(center, radius, bgPaint);

    // Progress arc
    final progressPaint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 8
      ..strokeCap = StrokeCap.round;

    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      -pi / 2,
      2 * pi * progress,
      false,
      progressPaint,
    );

    // Glow effect
    if (isRunning) {
      final glowPaint = Paint()
        ..color = color.withValues(alpha: 0.15)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 20
        ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 10);

      canvas.drawArc(
        Rect.fromCircle(center: center, radius: radius),
        -pi / 2,
        2 * pi * progress,
        false,
        glowPaint,
      );
    }

    // Tick marks
    final tickPaint = Paint()
      ..color = Colors.white.withValues(alpha: 0.1)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2;

    for (int i = 0; i < 60; i++) {
      final angle = -pi / 2 + (2 * pi * i / 60);
      final isMajor = i % 5 == 0;
      final innerRadius = isMajor ? radius - 15 : radius - 8;
      final outerRadius = radius - 4;

      canvas.drawLine(
        Offset(center.dx + innerRadius * cos(angle), center.dy + innerRadius * sin(angle)),
        Offset(center.dx + outerRadius * cos(angle), center.dy + outerRadius * sin(angle)),
        tickPaint..strokeWidth = isMajor ? 2.5 : 1.5,
      );
    }
  }

  @override
  bool shouldRepaint(TimerCirclePainter oldDelegate) {
    return oldDelegate.progress != progress ||
        oldDelegate.color != color ||
        oldDelegate.isRunning != isRunning;
  }
}