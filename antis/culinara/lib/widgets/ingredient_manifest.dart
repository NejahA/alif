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
        const SectionHeader(title: "INGREDIENT_MANIFEST", icon: LucideIcons.box),
        const SizedBox(height: 24),
        
        // Mise en Place Progress
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
              "MISE_EN_PLACE",
              style: GoogleFonts.inter(
                fontSize: 9,
                fontWeight: FontWeight.w800,
                color: GourmetTheme.parchment.withOpacity(0.4),
              ),
            ),
            Text(
              "${(progress * 100).toInt()}%",
              style: GoogleFonts.inter(
                fontSize: 9,
                fontWeight: FontWeight.w800,
                color: GourmetTheme.copper,
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
            valueColor: const AlwaysStoppedAnimation<Color>(GourmetTheme.copper),
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

    return InkWell(
      onTap: onToggle,
      onLongPress: hasSub ? () => _showSubstitution(context, ingredient.name, subs) : null,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.02),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: ingredient.isPrepped 
              ? GourmetTheme.copper.withOpacity(0.2) 
              : Colors.white.withOpacity(0.05)
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
                  color: ingredient.isPrepped ? GourmetTheme.accentSage : GourmetTheme.parchment.withOpacity(0.2),
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
                        color: GourmetTheme.parchment.withOpacity(ingredient.isPrepped ? 0.3 : 0.9),
                        decoration: ingredient.isPrepped ? TextDecoration.lineThrough : null,
                      ),
                    ),
                    if (hasSub && !ingredient.isPrepped)
                      Text(
                        "SUBSTITUTION_AVAILABLE",
                        style: GoogleFonts.firaCode(
                          fontSize: 7,
                          fontWeight: FontWeight.w700,
                          color: GourmetTheme.goldLeaf.withOpacity(0.5),
                          letterSpacing: 0.5,
                        ),
                      ),
                  ],
                ),
              ],
            ),
            Text(
              ingredient.qty,
              style: GoogleFonts.firaCode(
                fontSize: 11,
                fontWeight: FontWeight.w400,
                color: GourmetTheme.copper.withOpacity(0.8),
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
        backgroundColor: GourmetTheme.onyx,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
          side: const BorderSide(color: GourmetTheme.goldLeaf, width: 0.5),
        ),
        title: Row(
          children: [
            const Icon(LucideIcons.sparkles, color: GourmetTheme.goldLeaf, size: 18),
            const SizedBox(width: 12),
            Text(
              "MICHELIN_INTELLIGENCE",
              style: GoogleFonts.inter(
                fontSize: 12,
                fontWeight: FontWeight.w900,
                color: GourmetTheme.goldLeaf,
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              "If $subKey is unavailable, Chef de Cuisine recommends:",
              style: GoogleFonts.inter(
                fontSize: 11,
                color: GourmetTheme.parchment.withOpacity(0.6),
              ),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(16),
              width: double.infinity,
              decoration: BoxDecoration(
                color: GourmetTheme.goldLeaf.withOpacity(0.05),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                subValue!,
                style: GoogleFonts.playfairDisplay(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: GourmetTheme.parchment,
                ),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              "PRO_TIP: Ensure visual consistency is maintained with the original plating guide.",
              style: GoogleFonts.inter(
                fontSize: 9,
                fontStyle: FontStyle.italic,
                color: GourmetTheme.goldLeaf.withOpacity(0.5),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(
              "ACKNOWLEDGE",
              style: GoogleFonts.firaCode(
                fontSize: 10,
                fontWeight: FontWeight.w700,
                color: GourmetTheme.goldLeaf,
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
          colors: [GourmetTheme.copper.withOpacity(0.05), Colors.transparent],
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
              color: GourmetTheme.copper,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            "HIGH_GASTRONOMY_OS_v2.0",
            style: GoogleFonts.firaCode(
              fontSize: 8,
              fontWeight: FontWeight.w400,
              color: GourmetTheme.parchment.withOpacity(0.3),
            ),
          ),
        ],
      ),
    );
  }
}
