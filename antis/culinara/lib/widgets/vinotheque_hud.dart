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

    if (wine == null) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SectionHeader(title: "Wine Pairing", icon: LucideIcons.glassWater),
          const SizedBox(height: 24),
          Center(
            child: Column(
              children: [
                Icon(LucideIcons.wineOff, size: 32, color: CuisineTheme.cream.withValues(alpha: 0.1)),
                const SizedBox(height: 12),
                Text(
                  "No Pairing",
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: CuisineTheme.cream.withValues(alpha: 0.2),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  "No wine pairing for this step.",
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    color: CuisineTheme.cream.withValues(alpha: 0.4),
                  ),
                ),
              ],
            ),
          ),
        ],
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SectionHeader(title: "Wine Pairing", icon: LucideIcons.glassWater),
        const SizedBox(height: 24),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: CuisineTheme.paprika.withValues(alpha: 0.08),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: CuisineTheme.saffron.withValues(alpha: 0.15)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    wine.vintage,
                    style: GoogleFonts.inter(
                      fontSize: 10,
                      fontWeight: FontWeight.w900,
                      color: CuisineTheme.saffron,
                    ),
                  ),
                  const Icon(LucideIcons.grape, size: 14, color: CuisineTheme.saffron),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                wine.label,
                style: GoogleFonts.playfairDisplay(
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                  color: CuisineTheme.cream,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                wine.tastingNote,
                style: GoogleFonts.inter(
                  fontSize: 11,
                  fontStyle: FontStyle.italic,
                  height: 1.4,
                  color: CuisineTheme.cream.withValues(alpha: 0.7),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),
        _buildLiquidStat("Serving Temp", wine.optimalTemp, LucideIcons.thermometerSnowflake),
        const SizedBox(height: 16),
        _buildDecantProgress(ref, wine.decantProgress),
      ],
    );
  }

  Widget _buildLiquidStat(String label, String value, IconData icon) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [
            Icon(icon, size: 12, color: CuisineTheme.saffron.withValues(alpha: 0.5)),
            const SizedBox(width: 8),
            Text(
              label,
              style: GoogleFonts.inter(
                fontSize: 10,
                fontWeight: FontWeight.w700,
                color: CuisineTheme.cream.withValues(alpha: 0.4),
              ),
            ),
          ],
        ),
        Text(
          value,
          style: GoogleFonts.inter(
            fontSize: 11,
            fontWeight: FontWeight.w700,
            color: CuisineTheme.saffron,
          ),
        ),
      ],
    );
  }

  Widget _buildDecantProgress(WidgetRef ref, double progress) {
    return GestureDetector(
      onTap: () => ref.read(chefSessionProvider.notifier).boostDecanting(),
      behavior: HitTestBehavior.opaque,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                "Decanting",
                style: GoogleFonts.inter(
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  color: CuisineTheme.saffron.withValues(alpha: 0.4),
                ),
              ),
              Text(
                "${(progress * 100).toInt()}%",
                style: GoogleFonts.inter(
                  fontSize: 10,
                  fontWeight: FontWeight.w800,
                  color: CuisineTheme.saffron,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: progress,
              minHeight: 3,
              backgroundColor: CuisineTheme.darkWalnut,
              valueColor:
                  const AlwaysStoppedAnimation<Color>(CuisineTheme.saffron),
            ),
          ),
        ],
      ),
    );
  }
}
