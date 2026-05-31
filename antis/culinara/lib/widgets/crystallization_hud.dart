import 'package:flutter/material.dart';
import 'dart:math' as math;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:culinara/core/providers.dart';
import 'package:culinara/core/theme.dart';
import 'package:culinara/widgets/chef_widgets.dart';

class CrystallizationHUD extends ConsumerWidget {
  const CrystallizationHUD({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final hearth = ref.watch(hearthProvider);

    return Column(
      children: [
        const SectionHeader(title: "Sugar Work", icon: LucideIcons.snowflake),
        const SizedBox(height: 24),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _buildCrystalRadar("Alignment", hearth.flameTemper, CuisineTheme.saffron),
            _buildCrystalRadar(
                "Viscosity", (1.0 - hearth.flameTemper).clamp(0.0, 1.0), CuisineTheme.terracotta),
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
              const Icon(LucideIcons.thermometer, size: 16, color: CuisineTheme.saffron),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "Sugar Work — 154°C Target",
                    style: GoogleFonts.inter(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: CuisineTheme.cream.withValues(alpha: 0.9),
                    ),
                  ),
                  Text(
                    hearth.isAtTemperature
                        ? "Crystal structure stable"
                        : "Molecular transition in progress...",
                    style: GoogleFonts.inter(
                      fontSize: 9,
                      fontWeight: FontWeight.w500,
                      color: CuisineTheme.saffron.withValues(alpha: 0.4),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),
        GourmetDial(
          label: "MOLECULAR BOND REFINEMENT",
          value: hearth.perfectionApex,
          color: CuisineTheme.saffron,
          onChanged: (val) => ref.read(hearthProvider.notifier).updatePerfectionApex(val),
        ),
      ],
    );
  }

  Widget _buildCrystalRadar(String label, double value, Color color) {
    return Column(
      children: [
        SizedBox(
          width: 80,
          height: 80,
          child: CustomPaint(
            painter: CrystalGeometryPainter(value: value, color: color),
          ),
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

class CrystalGeometryPainter extends CustomPainter {
  final double value;
  final Color color;

  CrystalGeometryPainter({required this.value, required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;

    final paint = Paint()
      ..color = color.withValues(alpha: 0.2)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1;

    const points = 6;
    const angleStep = (2 * math.pi) / points;

    for (var i = 1; i <= 3; i++) {
      final r = radius * (i / 3);
      final path = Path();
      for (var j = 0; j < points; j++) {
        final angle = j * angleStep;
        final x = center.dx + r * math.cos(angle);
        final y = center.dy + r * math.sin(angle);
        if (j == 0) {
          path.moveTo(x, y);
        } else {
          path.lineTo(x, y);
        }
      }
      path.close();
      canvas.drawPath(path, paint);
    }

    final activePaint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;

    final activeRadius = radius * value;
    canvas.drawCircle(center, 2, activePaint);

    final starPaint = Paint()
      ..color = color.withValues(alpha: 0.6)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2;

    for (var i = 0; i < points; i++) {
      final angle = i * angleStep;
      final x = center.dx + activeRadius * math.cos(angle);
      final y = center.dy + activeRadius * math.sin(angle);
      canvas.drawLine(center, Offset(x, y), starPaint);
    }
  }

  @override
  bool shouldRepaint(covariant CrystalGeometryPainter oldDelegate) =>
      oldDelegate.value != value;
}
