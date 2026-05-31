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
        const SectionHeader(title: "THE_FLAME_SYMPHONY", icon: LucideIcons.flame),
        const SizedBox(height: 24),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _buildHeatRipple("FLAME_TEMPER", hearth.flameTemper, GourmetTheme.copper),
            _buildHeatRipple("PERFECTION_APEX", hearth.perfectionApex, GourmetTheme.bordeaux),
          ],
        ),
        const SizedBox(height: 24),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.02),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.white.withOpacity(0.05)),
          ),
          child: Row(
            children: [
              Icon(
                LucideIcons.chefHat, 
                size: 16, 
                color: hearth.isAtTemperature ? GourmetTheme.accentSage : GourmetTheme.copper
              ),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    hearth.culinaryTool,
                    style: GoogleFonts.firaCode(
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      color: GourmetTheme.parchment.withOpacity(0.9),
                    ),
                  ),
                  Text(
                    hearth.isAtTemperature ? "STATUS: OPTIMAL_TEMPER" : "STATUS: REFINING_FLAME",
                    style: GoogleFonts.inter(
                      fontSize: 8,
                      fontWeight: FontWeight.w500,
                      color: GourmetTheme.parchment.withOpacity(0.4),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),
        GourmetDial(
          label: "GOURMET_REFINEMENT_CALIBRATION", 
          value: hearth.perfectionApex, 
          color: GourmetTheme.copper, 
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
              style: GoogleFonts.firaCode(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: GourmetTheme.parchment,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 9,
            fontWeight: FontWeight.w900,
            letterSpacing: 1,
            color: GourmetTheme.parchment.withOpacity(0.3),
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
    
    // Static base ring
    final basePaint = Paint()
      ..color = Colors.white.withOpacity(0.05)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1;
    canvas.drawCircle(center, radius, basePaint);

    // Heat Ripples (3 layers)
    for (var i = 0; i < 3; i++) {
      final rippleValue = (value - (i * 0.1)).clamp(0.0, 1.0);
      if (rippleValue <= 0) continue;

      final paint = Paint()
        ..color = color.withOpacity(0.6 - (i * 0.2))
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

    // Inner glow
    final glowPaint = Paint()
      ..color = color.withOpacity(0.1 * value)
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 10);
    canvas.drawCircle(center, radius * 0.7 * value, glowPaint);
  }

  @override
  bool shouldRepaint(covariant HeatRipplePainter oldDelegate) => oldDelegate.value != value;
}
