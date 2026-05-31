import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:culinara/core/providers.dart';
import 'package:culinara/core/theme.dart';
import 'package:culinara/widgets/chef_widgets.dart';

class VinothequeHUD extends ConsumerWidget {
  const VinothequeHUD({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final session = ref.watch(chefSessionProvider);
    final wine = session.currentStep.wineInfo;

    if (wine == null) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SectionHeader(title: "GRAND_VINOTHEQUE", icon: LucideIcons.glassWater),
        const SizedBox(height: 24),
        
        // Wine Display Card
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: GourmetTheme.bordeaux.withOpacity(0.1),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: GourmetTheme.goldLeaf.withOpacity(0.2)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    wine.vintage,
                    style: GoogleFonts.firaCode(
                      fontSize: 10,
                      fontWeight: FontWeight.w900,
                      color: GourmetTheme.goldLeaf,
                    ),
                  ),
                  const Icon(LucideIcons.grape, size: 14, color: GourmetTheme.goldLeaf),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                wine.label.toUpperCase(),
                style: GoogleFonts.playfairDisplay(
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                  color: GourmetTheme.parchment,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                wine.tastingNote,
                style: GoogleFonts.inter(
                  fontSize: 11,
                  fontStyle: FontStyle.italic,
                  height: 1.4,
                  color: GourmetTheme.parchment.withOpacity(0.7),
                ),
              ),
            ],
          ),
        ),
        
        const SizedBox(height: 24),
        
        // Liquid Telemetry
        _buildLiquidStat("CELLAR_TEMP", wine.optimalTemp, LucideIcons.thermometerSnowflake),
        const SizedBox(height: 16),
        _buildDecantProgress(wine.decantProgress),
      ],
    );
  }

  Widget _buildLiquidStat(String label, String value, IconData icon) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [
            Icon(icon, size: 12, color: GourmetTheme.goldLeaf.withOpacity(0.5)),
            const SizedBox(width: 8),
            Text(
              label,
              style: GoogleFonts.inter(
                fontSize: 9,
                fontWeight: FontWeight.w800,
                color: GourmetTheme.parchment.withOpacity(0.4),
              ),
            ),
          ],
        ),
        Text(
          value,
          style: GoogleFonts.firaCode(
            fontSize: 11,
            fontWeight: FontWeight.w700,
            color: GourmetTheme.goldLeaf,
          ),
        ),
      ],
    );
  }

  Widget _buildDecantProgress(double progress) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              "OXYGEN_RESONANCE",
              style: GoogleFonts.inter(
                fontSize: 9,
                fontWeight: FontWeight.w800,
                color: GourmetTheme.goldLeaf.withOpacity(0.4),
              ),
            ),
            Text(
              "${(progress * 100).toInt()}%",
              style: GoogleFonts.inter(
                fontSize: 9,
                fontWeight: FontWeight.w800,
                color: GourmetTheme.goldLeaf,
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        ClipRRect(
          borderRadius: BorderRadius.circular(2),
          child: LinearProgressIndicator(
            value: progress,
            minHeight: 2,
            backgroundColor: Colors.white.withOpacity(0.05),
            valueColor: const AlwaysStoppedAnimation<Color>(GourmetTheme.goldLeaf),
          ),
        ),
      ],
    );
  }
}
