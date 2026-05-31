import 'package:flutter/material.dart';
import 'dart:math' as math;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:culinara/core/providers.dart';
import 'package:culinara/core/theme.dart';
import 'package:culinara/widgets/chef_widgets.dart';

class TasteTelemetryWidget extends ConsumerWidget {
  const TasteTelemetryWidget({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final telemetry = ref.watch(tasteTelemetryProvider);
    final notifier = ref.read(tasteTelemetryProvider.notifier);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SectionHeader(title: "Flavor Profile", icon: LucideIcons.activity),
        const SizedBox(height: 32),
        Center(child: _TasteRadarChart(telemetry: telemetry)),
        const SizedBox(height: 40),
        GourmetDial(
          label: "SPICE",
          value: telemetry.spice,
          color: CuisineTheme.terracotta,
          onChanged: (val) => notifier.updateTaste('SPICE', val),
        ),
        const SizedBox(height: 12),
        GourmetDial(
          label: "ACID",
          value: telemetry.sour,
          color: CuisineTheme.saffron,
          onChanged: (val) => notifier.updateTaste('SOUR', val),
        ),
        const SizedBox(height: 12),
        GourmetDial(
          label: "AROMA",
          value: telemetry.aroma,
          color: CuisineTheme.butterscotch,
          onChanged: (val) => notifier.updateTaste('AROMA', val),
        ),
        const SizedBox(height: 12),
        GourmetDial(
          label: "UMAMI",
          value: telemetry.umami,
          color: CuisineTheme.cinnamonDust,
          onChanged: (val) => notifier.updateTaste('UMAMI', val),
        ),
        const SizedBox(height: 12),
        GourmetDial(
          label: "SWEET",
          value: telemetry.sweet,
          color: const Color(0xFFD48166),
          onChanged: (val) => notifier.updateTaste('SWEET', val),
        ),
        const SizedBox(height: 12),
        GourmetDial(
          label: "BITTER",
          value: telemetry.bitter,
          color: CuisineTheme.olive,
          onChanged: (val) => notifier.updateTaste('BITTER', val),
        ),
      ],
    );
  }
}

class _TasteRadarChart extends StatelessWidget {
  final TasteTelemetry telemetry;

  const _TasteRadarChart({required this.telemetry});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 180,
      height: 180,
      child: CustomPaint(
        painter: RadarChartPainter(
          telemetry: telemetry,
          color: CuisineTheme.terracotta,
        ),
      ),
    );
  }
}

class RadarChartPainter extends CustomPainter {
  final TasteTelemetry telemetry;
  final Color color;

  RadarChartPainter({required this.telemetry, required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;
    final paint = Paint()
      ..color = color.withValues(alpha: 0.2)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1;

    for (var i = 1; i <= 5; i++) {
      canvas.drawCircle(center, radius * (i / 5), paint);
    }

    final axisPaint = Paint()
      ..color = CuisineTheme.cream.withValues(alpha: 0.05)
      ..strokeWidth = 1;

    const points = 6;
    const angleStep = (2 * math.pi) / points;

    for (var i = 0; i < points; i++) {
      final angle = i * angleStep - (math.pi / 2);
      final x = center.dx + radius * (math.cos(angle));
      final y = center.dy + radius * (math.sin(angle));
      canvas.drawLine(center, Offset(x, y), axisPaint);
    }

    final values = [
      telemetry.spice,
      telemetry.sour,
      telemetry.aroma,
      telemetry.umami,
      telemetry.sweet,
      telemetry.bitter,
    ];

    final areaPaint = Paint()
      ..color = color.withValues(alpha: 0.3)
      ..style = PaintingStyle.fill;

    final borderPaint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2;

    final path = Path();
    for (var i = 0; i < points; i++) {
      final angle = i * angleStep - (math.pi / 2);
      final val = values[i];
      final x = center.dx + radius * val * (math.cos(angle));
      final y = center.dy + radius * val * (math.sin(angle));
      if (i == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }
    path.close();

    canvas.drawPath(path, areaPaint);
    canvas.drawPath(path, borderPaint);
  }

  @override
  bool shouldRepaint(covariant RadarChartPainter oldDelegate) =>
      oldDelegate.telemetry != telemetry;
}
