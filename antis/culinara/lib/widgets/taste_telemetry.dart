import 'package:flutter/material.dart';
import 'dart:math' as math;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
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
        const SectionHeader(title: "TASTE_TELEMETRY", icon: LucideIcons.activity),
        const SizedBox(height: 32),
        Center(child: _TasteRadarChart(telemetry: telemetry)),
        const SizedBox(height: 40),
        
        GourmetDial(
          label: "SPICE", 
          value: telemetry.spice, 
          color: const Color(0xFFB35945),
          onChanged: (val) => notifier.updateTaste('SPICE', val),
        ),
        const SizedBox(height: 12),
        GourmetDial(
          label: "ACID", 
          value: telemetry.sour, 
          color: const Color(0xFFE5B14B),
          onChanged: (val) => notifier.updateTaste('SOUR', val),
        ),
        const SizedBox(height: 12),
        GourmetDial(
          label: "AROMA", 
          value: telemetry.aroma, 
          color: GourmetTheme.goldLeaf,
          onChanged: (val) => notifier.updateTaste('AROMA', val),
        ),
        const SizedBox(height: 12),
        GourmetDial(
          label: "UMAMI", 
          value: telemetry.umami, 
          color: GourmetTheme.copper,
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
          color: GourmetTheme.accentSage,
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
          color: GourmetTheme.copper,
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
      ..color = color.withOpacity(0.3)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1;

    // Draw background rings
    for (var i = 1; i <= 5; i++) {
      canvas.drawCircle(center, radius * (i / 5), paint);
    }

    // Draw axis lines
    final axisPaint = Paint()
      ..color = Colors.white.withOpacity(0.05)
      ..strokeWidth = 1;
    
    final points = 6;
    final angleStep = (2 * math.pi) / points;

    for (var i = 0; i < points; i++) {
      final angle = i * angleStep - (math.pi / 2);
      final x = center.dx + radius * (math.cos(angle));
      final y = center.dy + radius * (math.sin(angle));
      canvas.drawLine(center, Offset(x, y), axisPaint);
    }

    // Draw telemetry area
    final values = [
      telemetry.spice,
      telemetry.sour,
      telemetry.aroma,
      telemetry.umami,
      telemetry.sweet,
      telemetry.bitter,
    ];

    final areaPaint = Paint()
      ..color = color.withOpacity(0.4)
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
