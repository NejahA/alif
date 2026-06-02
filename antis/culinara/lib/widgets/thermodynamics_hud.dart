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
            _buildTempGauge("ELEMENT_INTENSITY", hearth.elementIntensity, GourmetTheme.copper),
            _buildTempGauge("PRECISION_TARGET", hearth.precisionTarget, GourmetTheme.bordeaux),
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
                    hearth.isAtTemperature ? "STATUS: OPTIMAL_HEAT" : "STATUS: CALIBRATING_FLAME",
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
          label: "SEARING_PRECISION_CALIBRATION", 
          value: hearth.precisionTarget, 
          color: GourmetTheme.copper, 
          onChanged: (val) => ref.read(hearthProvider.notifier).updatePrecisionTarget(val),
        ),
      ],
    );
  }

  Widget _buildTempGauge(String label, double value, Color color) {
    return Column(
      children: [
        Stack(
          alignment: Alignment.center,
          children: [
            SizedBox(
              width: 80,
              height: 80,
              child: CircularProgressIndicator(
                value: value,
                strokeWidth: 3,
                backgroundColor: Colors.white.withOpacity(0.05),
                valueColor: AlwaysStoppedAnimation<Color>(color),
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
