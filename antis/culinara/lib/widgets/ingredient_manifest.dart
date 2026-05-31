import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:culinara/core/providers.dart';
import 'package:culinara/core/theme.dart';
import 'package:culinara/widgets/chef_widgets.dart';

class IngredientManifest extends ConsumerWidget {
  const IngredientManifest({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ingredients = ref.watch(ingredientProvider);
    final progress = ref.read(ingredientProvider.notifier).prepProgress;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SectionHeader(title: "Mise en Place", icon: LucideIcons.box),
        const SizedBox(height: 24),
        _MiseEnPlaceProgress(progress: progress),
        const SizedBox(height: 24),
        Expanded(
          child: ListView.separated(
            itemCount: ingredients.length,
            separatorBuilder: (context, index) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final ingredient = ingredients[index];
              return _IngredientItem(
                ingredient: ingredient,
                onToggle: () => ref.read(ingredientProvider.notifier).togglePrep(ingredient.id),
              );
            },
          ),
        ),
        const SizedBox(height: 24),
        const ChefVisionBranding(),
      ],
    );
  }
}

class _MiseEnPlaceProgress extends StatelessWidget {
  final double progress;

  const _MiseEnPlaceProgress({required this.progress});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              "Prep Progress",
              style: GoogleFonts.inter(
                fontSize: 10,
                fontWeight: FontWeight.w700,
                color: CuisineTheme.cream.withValues(alpha: 0.4),
              ),
            ),
            Text(
              "${(progress * 100).toInt()}%",
              style: GoogleFonts.inter(
                fontSize: 10,
                fontWeight: FontWeight.w800,
                color: CuisineTheme.terracotta,
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
            valueColor: const AlwaysStoppedAnimation<Color>(CuisineTheme.terracotta),
          ),
        ),
      ],
    );
  }
}

class _IngredientItem extends ConsumerWidget {
  final Ingredient ingredient;
  final VoidCallback onToggle;

  const _IngredientItem({required this.ingredient, required this.onToggle});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final session = ref.watch(chefSessionProvider);
    final subs = session.currentStep.substitutions;
    final hasSub = subs.keys.any((key) => ingredient.name.contains(key));

    return GestureDetector(
      onTap: onToggle,
      onLongPress: hasSub
          ? () => _showSubstitution(context, ingredient.name, subs)
          : null,
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: ingredient.isPrepped
              ? CuisineTheme.olive.withValues(alpha: 0.05)
              : CuisineTheme.darkWalnut.withValues(alpha: 0.3),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: ingredient.isPrepped
                ? CuisineTheme.olive.withValues(alpha: 0.2)
                : CuisineTheme.cream.withValues(alpha: 0.04),
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Icon(
                  ingredient.isPrepped ? LucideIcons.checkCircle2 : LucideIcons.circle,
                  size: 14,
                  color: ingredient.isPrepped
                      ? CuisineTheme.olive
                      : CuisineTheme.cream.withValues(alpha: 0.2),
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      ingredient.name,
                      style: GoogleFonts.inter(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: CuisineTheme.cream
                            .withValues(alpha: ingredient.isPrepped ? 0.3 : 0.9),
                        decoration: ingredient.isPrepped ? TextDecoration.lineThrough : null,
                      ),
                    ),
                    if (hasSub && !ingredient.isPrepped)
                      Text(
                        "Substitution available",
                        style: GoogleFonts.inter(
                          fontSize: 8,
                          fontWeight: FontWeight.w600,
                          color: CuisineTheme.saffron.withValues(alpha: 0.5),
                        ),
                      ),
                  ],
                ),
              ],
            ),
            Text(
              ingredient.qty,
              style: GoogleFonts.inter(
                fontSize: 11,
                fontWeight: FontWeight.w500,
                color: CuisineTheme.terracotta.withValues(alpha: 0.8),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showSubstitution(BuildContext context, String name, Map<String, String> subs) {
    final subKey = subs.keys.firstWhere((key) => name.contains(key));
    final subValue = subs[subKey];

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: CuisineTheme.darkWalnut,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
          side: BorderSide(color: CuisineTheme.saffron.withValues(alpha: 0.2)),
        ),
        title: Row(
          children: [
            const Icon(LucideIcons.sparkles, color: CuisineTheme.saffron, size: 18),
            const SizedBox(width: 12),
            Text(
              "Chef's Suggestion",
              style: GoogleFonts.playfairDisplay(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: CuisineTheme.cream,
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              "If $subKey is unavailable, try:",
              style: GoogleFonts.inter(
                fontSize: 12,
                color: CuisineTheme.cream.withValues(alpha: 0.6),
              ),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(16),
              width: double.infinity,
              decoration: BoxDecoration(
                color: CuisineTheme.saffron.withValues(alpha: 0.06),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: CuisineTheme.saffron.withValues(alpha: 0.15),
                ),
              ),
              child: Text(
                subValue!,
                style: GoogleFonts.playfairDisplay(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: CuisineTheme.cream,
                ),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(
              "Got it",
              style: GoogleFonts.inter(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: CuisineTheme.saffron,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class ChefVisionBranding extends StatelessWidget {
  const ChefVisionBranding({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [CuisineTheme.terracotta.withValues(alpha: 0.05), Colors.transparent],
          begin: Alignment.bottomCenter,
          end: Alignment.topCenter,
        ),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "V COOKS CUISINE",
            style: GoogleFonts.inter(
              fontSize: 10,
              fontWeight: FontWeight.w900,
              letterSpacing: 4,
              color: CuisineTheme.terracotta,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            "Culinara v4.0 — Cuisine Edition",
            style: GoogleFonts.inter(
              fontSize: 8,
              fontWeight: FontWeight.w400,
              color: CuisineTheme.cream.withValues(alpha: 0.3),
            ),
          ),
        ],
      ),
    );
  }
}
