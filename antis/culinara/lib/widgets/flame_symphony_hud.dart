import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:culinara/core/providers.dart';
import 'package:culinara/core/theme.dart';
import 'package:culinara/widgets/chef_widgets.dart';

class FlameSymphonyHUD extends ConsumerWidget {
  const FlameSymphonyHUD({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final hearth = ref.watch(hearthProvider);

    return Column(
      children: [
        const SectionHeader(title: "Heat Control", icon: LucideIcons.flame),
        const SizedBox(height: 24),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _buildHeatRipple("Current Temp", hearth.flameTemper, CuisineTheme.terracotta),
            _buildHeatRipple("Target Temp", hearth.perfectionApex, CuisineTheme.paprika),
          ],
        ),
        const SizedBox(height: 24),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: CuisineTheme.darkWalnut.withValues(alpha: 0.3),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: CuisineTheme.cream.withValues(alpha: 0.04)),
          ),
          child: Row(
            children: [
              Icon(
                LucideIcons.chefHat,
                size: 16,
                color: hearth.isAtTemperature ? CuisineTheme.olive : CuisineTheme.terracotta,
              ),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "Copper Sautoir 24cm",
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: CuisineTheme.cream.withValues(alpha: 0.9),
                    ),
                  ),
                  Text(
                    hearth.isAtTemperature ? "Temperature optimal" : "Heating up...",
                    style: GoogleFonts.inter(
                      fontSize: 9,
                      fontWeight: FontWeight.w500,
                      color: CuisineTheme.cream.withValues(alpha: 0.4),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),
        GourmetDial(
          label: "TARGET CALIBRATION",
          value: hearth.perfectionApex,
          color: CuisineTheme.terracotta,
          onChanged: (val) => ref.read(hearthProvider.notifier).updatePerfectionApex(val),
        ),
      ],
    );
  }

  Widget _buildHeatRipple(String label, double value, Color color) {
    return Column(
      children: [
        Stack(
          alignment: Alignment.center,
          children: [
            SizedBox(
              width: 80,
              height: 80,
              child: CustomPaint(
                painter: HeatRipplePainter(value: value, color: color),
              ),
            ),
            Text(
              "${(value * 450).toInt()}°C",
              style: GoogleFonts.inter(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: CuisineTheme.cream,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 9,
            fontWeight: FontWeight.w800,
            letterSpacing: 0.5,
            color: CuisineTheme.cream.withValues(alpha: 0.3),
          ),
        ),
      ],
    );
  }
}

class HeatRipplePainter extends CustomPainter {
  final double value;
  final Color color;

  HeatRipplePainter({required this.value, required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;

    final basePaint = Paint()
      ..color = CuisineTheme.cream.withValues(alpha: 0.05)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1;
    canvas.drawCircle(center, radius, basePaint);

    for (var i = 0; i < 3; i++) {
      final rippleValue = (value - (i * 0.1)).clamp(0.0, 1.0);
      if (rippleValue <= 0) continue;

      final paint = Paint()
        ..color = color.withValues(alpha: 0.6 - (i * 0.2))
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2 + (i * 1.5);

      canvas.drawArc(
        Rect.fromCircle(center: center, radius: radius - (i * 6)),
        -math.pi / 2,
        2 * math.pi * rippleValue,
        false,
        paint,
      );
    }

    final glowPaint = Paint()
      ..color = color.withValues(alpha: 0.1 * value)
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 10);
    canvas.drawCircle(center, radius * 0.7 * value, glowPaint);
  }

  @override
  bool shouldRepaint(covariant HeatRipplePainter oldDelegate) => oldDelegate.value != value;
}
