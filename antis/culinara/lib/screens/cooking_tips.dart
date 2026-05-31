import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:culinara/core/theme.dart';
import 'package:culinara/core/culinary_data.dart';

class CookingTipsScreen extends StatefulWidget {
  const CookingTipsScreen({super.key});

  @override
  State<CookingTipsScreen> createState() => _CookingTipsScreenState();
}

class _CookingTipsScreenState extends State<CookingTipsScreen> {
  int _expandedIndex = -1;
  String _selectedCategory = 'All';

  @override
  Widget build(BuildContext context) {
    final filteredTips = _selectedCategory == 'All'
        ? culinaryTipsData
        : culinaryTipsData.where((t) => t.category == _selectedCategory).toList();

    return Container(
      decoration: BoxDecoration(gradient: CuisineTheme.kitchenWarmth),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        "Chef's Knowledge",
                        style: GoogleFonts.playfairDisplay(
                          fontSize: 26,
                          fontWeight: FontWeight.w900,
                          color: CuisineTheme.cream,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        "Techniques, tips & culinary wisdom",
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          fontStyle: FontStyle.italic,
                          color: CuisineTheme.cream.withValues(alpha: 0.4),
                        ),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: CuisineTheme.saffron.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: CuisineTheme.saffron.withValues(alpha: 0.2),
                      ),
                    ),
                    child: const Icon(LucideIcons.lightbulb,
                        size: 20, color: CuisineTheme.saffron),
                  ),
                ],
              ),

              const SizedBox(height: 24),

              // Category filters
              SizedBox(
                height: 36,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  children: [
                    _buildCategoryChip('All'),
                    _buildCategoryChip('Technique'),
                    _buildCategoryChip('Ingredient'),
                    _buildCategoryChip('Equipment'),
                    _buildCategoryChip('Science'),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Ingredient Spotlight
              _buildIngredientSpotlight(),

              const SizedBox(height: 20),

              // Tips list
              Expanded(
                child: ListView.separated(
                  itemCount: filteredTips.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    final tip = filteredTips[index];
                    final isExpanded = _expandedIndex == index;

                    return GestureDetector(
                      onTap: () => setState(() =>
                          _expandedIndex = isExpanded ? -1 : index),
                      behavior: HitTestBehavior.opaque,
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 300),
                        curve: Curves.easeOutCubic,
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: isExpanded
                              ? tip.accentColor.withValues(alpha: 0.08)
                              : CuisineTheme.darkWalnut.withValues(alpha: 0.4),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: isExpanded
                                ? tip.accentColor.withValues(alpha: 0.25)
                                : CuisineTheme.cream.withValues(alpha: 0.05),
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Container(
                                  width: 40,
                                  height: 40,
                                  decoration: BoxDecoration(
                                    color: tip.accentColor
                                        .withValues(alpha: 0.12),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Icon(tip.icon,
                                      size: 18, color: tip.accentColor),
                                ),
                                const SizedBox(width: 14),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        tip.title,
                                        style: GoogleFonts.playfairDisplay(
                                          fontSize: 16,
                                          fontWeight: FontWeight.w700,
                                          color: CuisineTheme.cream,
                                        ),
                                      ),
                                      const SizedBox(height: 2),
                                      Row(
                                        children: [
                                          _buildDifficultyDots(
                                              tip.difficultyLevel),
                                          const SizedBox(width: 8),
                                          Text(
                                            tip.category.toUpperCase(),
                                            style: GoogleFonts.inter(
                                              fontSize: 8,
                                              fontWeight: FontWeight.w800,
                                              letterSpacing: 1,
                                              color: tip.accentColor
                                                  .withValues(alpha: 0.7),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                                AnimatedRotation(
                                  turns: isExpanded ? 0.5 : 0,
                                  duration:
                                      const Duration(milliseconds: 300),
                                  child: Icon(
                                    LucideIcons.chevronDown,
                                    size: 16,
                                    color: CuisineTheme.cream
                                        .withValues(alpha: 0.3),
                                  ),
                                ),
                              ],
                            ),
                            if (isExpanded) ...[
                              const SizedBox(height: 16),
                              Container(
                                width: double.infinity,
                                height: 0.5,
                                color: tip.accentColor
                                    .withValues(alpha: 0.15),
                              ),
                              const SizedBox(height: 16),
                              Text(
                                tip.description,
                                style: GoogleFonts.inter(
                                  fontSize: 13,
                                  height: 1.6,
                                  color: CuisineTheme.cream
                                      .withValues(alpha: 0.7),
                                ),
                              ),
                              const SizedBox(height: 16),
                              if (tip.proTip != null)
                                Container(
                                  padding: const EdgeInsets.all(14),
                                  decoration: BoxDecoration(
                                    color: CuisineTheme.saffron
                                        .withValues(alpha: 0.06),
                                    borderRadius: BorderRadius.circular(14),
                                    border: Border.all(
                                      color: CuisineTheme.saffron
                                          .withValues(alpha: 0.15),
                                    ),
                                  ),
                                  child: Row(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Icon(LucideIcons.sparkles,
                                          size: 14,
                                          color: CuisineTheme.saffron),
                                      const SizedBox(width: 10),
                                      Expanded(
                                        child: Text(
                                          tip.proTip!,
                                          style: GoogleFonts.inter(
                                            fontSize: 11,
                                            fontStyle: FontStyle.italic,
                                            height: 1.5,
                                            color: CuisineTheme.saffron
                                                .withValues(alpha: 0.8),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                            ],
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCategoryChip(String label) {
    final isSelected = _selectedCategory == label;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: GestureDetector(
        onTap: () => setState(() => _selectedCategory = label),
        behavior: HitTestBehavior.opaque,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
          decoration: BoxDecoration(
            color: isSelected
                ? CuisineTheme.butterscotch.withValues(alpha: 0.15)
                : CuisineTheme.darkWalnut.withValues(alpha: 0.4),
            borderRadius: BorderRadius.circular(18),
            border: Border.all(
              color: isSelected
                  ? CuisineTheme.butterscotch.withValues(alpha: 0.4)
                  : CuisineTheme.cream.withValues(alpha: 0.05),
            ),
          ),
          child: Text(
            label,
            style: GoogleFonts.inter(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: isSelected
                  ? CuisineTheme.butterscotch
                  : CuisineTheme.cream.withValues(alpha: 0.35),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildDifficultyDots(int level) {
    return Row(
      children: List.generate(
        4,
        (i) => Container(
          width: 5,
          height: 5,
          margin: const EdgeInsets.only(right: 3),
          decoration: BoxDecoration(
            color: i < level
                ? CuisineTheme.saffron
                : CuisineTheme.cream.withValues(alpha: 0.1),
            shape: BoxShape.circle,
          ),
        ),
      ),
    );
  }

  Widget _buildIngredientSpotlight() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            CuisineTheme.terracotta.withValues(alpha: 0.1),
            CuisineTheme.darkWalnut.withValues(alpha: 0.5),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: CuisineTheme.terracotta.withValues(alpha: 0.15),
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: CuisineTheme.saffron.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Icon(LucideIcons.star,
                size: 24, color: CuisineTheme.saffron),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "INGREDIENT SPOTLIGHT",
                  style: GoogleFonts.inter(
                    fontSize: 9,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 1.5,
                    color: CuisineTheme.saffron.withValues(alpha: 0.7),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  "Saffron — Red Gold",
                  style: GoogleFonts.playfairDisplay(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: CuisineTheme.cream,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  "The world's most expensive spice by weight. Only 3 stigmas per crocus flower.",
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    height: 1.4,
                    color: CuisineTheme.cream.withValues(alpha: 0.5),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// Data is now located in lib/core/culinary_data.dart
