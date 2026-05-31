import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:culinara/core/providers.dart';
import 'package:culinara/core/theme.dart';
import 'package:culinara/screens/recipe_library.dart';

class MealPlannerScreen extends ConsumerStatefulWidget {
  const MealPlannerScreen({super.key});

  @override
  ConsumerState<MealPlannerScreen> createState() => _MealPlannerScreenState();
}

class _MealPlannerScreenState extends ConsumerState<MealPlannerScreen> {
  int _selectedDayIndex = 0;

  static const _days = [
    {'key': 'mon', 'label': 'Mon', 'full': 'Monday'},
    {'key': 'tue', 'label': 'Tue', 'full': 'Tuesday'},
    {'key': 'wed', 'label': 'Wed', 'full': 'Wednesday'},
    {'key': 'thu', 'label': 'Thu', 'full': 'Thursday'},
    {'key': 'fri', 'label': 'Fri', 'full': 'Friday'},
    {'key': 'sat', 'label': 'Sat', 'full': 'Saturday'},
    {'key': 'sun', 'label': 'Sun', 'full': 'Sunday'},
  ];

  @override
  Widget build(BuildContext context) {
    final mealPlan = ref.watch(mealPlanProvider);
    final dayKey = _days[_selectedDayIndex]['key']!;
    final dayFull = _days[_selectedDayIndex]['full']!;

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
                        "Meal Planner",
                        style: GoogleFonts.playfairDisplay(
                          fontSize: 26,
                          fontWeight: FontWeight.w900,
                          color: CuisineTheme.cream,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        "Plan your week's culinary journey",
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
                      color: CuisineTheme.olive.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: CuisineTheme.olive.withValues(alpha: 0.2),
                      ),
                    ),
                    child: const Icon(LucideIcons.calendarDays,
                        size: 20, color: CuisineTheme.olive),
                  ),
                ],
              ),

              const SizedBox(height: 28),

              // Day selector strip
              SizedBox(
                height: 72,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  itemCount: _days.length,
                  itemBuilder: (context, index) {
                    final isSelected = index == _selectedDayIndex;
                    final dk = _days[index]['key']!;
                    final hasAnyMeal = MealSlot.values.any((slot) {
                      final key = '${dk}_${slot.name}';
                      return mealPlan[key]?.recipe != null;
                    });

                    return GestureDetector(
                      onTap: () => setState(() => _selectedDayIndex = index),
                      behavior: HitTestBehavior.opaque,
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 250),
                        width: 64,
                        margin: const EdgeInsets.only(right: 12),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? CuisineTheme.terracotta.withValues(alpha: 0.15)
                              : CuisineTheme.darkWalnut.withValues(alpha: 0.4),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: isSelected
                                ? CuisineTheme.terracotta.withValues(alpha: 0.4)
                                : CuisineTheme.cream.withValues(alpha: 0.05),
                          ),
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              _days[index]['label']!,
                              style: GoogleFonts.inter(
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                                color: isSelected
                                    ? CuisineTheme.saffron
                                    : CuisineTheme.cream.withValues(alpha: 0.4),
                              ),
                            ),
                            if (hasAnyMeal)
                              Container(
                                margin: const EdgeInsets.only(top: 6),
                                width: 6,
                                height: 6,
                                decoration: BoxDecoration(
                                  color: CuisineTheme.olive,
                                  shape: BoxShape.circle,
                                ),
                              ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),

              const SizedBox(height: 8),

              // Day title
              Text(
                dayFull,
                style: GoogleFonts.playfairDisplay(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                  color: CuisineTheme.cream.withValues(alpha: 0.8),
                ),
              ),
              const SizedBox(height: 20),

              // Meal slots
              Expanded(
                child: ListView(
                  children: MealSlot.values.map((slot) {
                    final key = '${dayKey}_${slot.name}';
                    final assignment = mealPlan[key];
                    return _MealSlotCard(
                      slot: slot,
                      assignment: assignment,
                      onAssign: () => _showRecipePicker(dayKey, slot),
                      onClear: () => ref.read(mealPlanProvider.notifier).clearSlot(dayKey, slot),
                    );
                  }).toList(),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showRecipePicker(String dayKey, MealSlot slot) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: CuisineTheme.espresso,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (context) {
        return Container(
          height: MediaQuery.of(context).size.height * 0.6,
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: CuisineTheme.darkWalnut,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
            border: Border(
              top: BorderSide(
                color: CuisineTheme.saffron.withValues(alpha: 0.15),
              ),
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: CuisineTheme.cream.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Text(
                "Choose a Recipe",
                style: GoogleFonts.playfairDisplay(
                  fontSize: 22,
                  fontWeight: FontWeight.w700,
                  color: CuisineTheme.cream,
                ),
              ),
              Text(
                "For ${slot.name} on ${_days[_selectedDayIndex]['full']}",
                style: GoogleFonts.inter(
                  fontSize: 12,
                  color: CuisineTheme.cream.withValues(alpha: 0.4),
                ),
              ),
              const SizedBox(height: 20),
              Expanded(
                child: ListView.separated(
                  itemCount: recipeLibraryData.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    final recipe = recipeLibraryData[index];
                    return GestureDetector(
                      onTap: () {
                        ref.read(mealPlanProvider.notifier)
                            .assignRecipe(dayKey, slot, recipe);
                        Navigator.pop(context);
                      },
                      behavior: HitTestBehavior.opaque,
                      child: Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              recipe.gradientColors.first.withValues(alpha: 0.3),
                              recipe.gradientColors.last.withValues(alpha: 0.2),
                            ],
                          ),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: CuisineTheme.cream.withValues(alpha: 0.06),
                          ),
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    recipe.name,
                                    style: GoogleFonts.playfairDisplay(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w700,
                                      color: CuisineTheme.cream,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    "${recipe.prepMinutes} min • ${recipe.calories} cal • ${recipe.servings} servings",
                                    style: GoogleFonts.inter(
                                      fontSize: 10,
                                      color: CuisineTheme.cream.withValues(alpha: 0.5),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Icon(LucideIcons.plus,
                                size: 18, color: CuisineTheme.saffron),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

// ════════════════════════════════════════════
// Meal Slot Card
// ════════════════════════════════════════════
class _MealSlotCard extends StatelessWidget {
  final MealSlot slot;
  final MealAssignment? assignment;
  final VoidCallback onAssign;
  final VoidCallback onClear;

  const _MealSlotCard({
    required this.slot,
    required this.assignment,
    required this.onAssign,
    required this.onClear,
  });

  @override
  Widget build(BuildContext context) {
    final recipe = assignment?.recipe;
    final hasRecipe = recipe != null;

    final slotConfig = _getSlotConfig(slot);

    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          gradient: hasRecipe
              ? LinearGradient(
                  colors: [
                    recipe.gradientColors.first.withValues(alpha: 0.15),
                    CuisineTheme.darkWalnut.withValues(alpha: 0.6),
                  ],
                )
              : null,
          color: hasRecipe ? null : CuisineTheme.darkWalnut.withValues(alpha: 0.4),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: hasRecipe
                ? slotConfig['color'] as Color
                : CuisineTheme.cream.withValues(alpha: 0.05),
            width: hasRecipe ? 0.5 : 0.5,
          ),
        ),
        child: Row(
          children: [
            // Slot icon
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: (slotConfig['color'] as Color).withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Icon(
                slotConfig['icon'] as IconData,
                size: 20,
                color: slotConfig['color'] as Color,
              ),
            ),
            const SizedBox(width: 16),
            // Content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    slotConfig['label'] as String,
                    style: GoogleFonts.inter(
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 1.5,
                      color: (slotConfig['color'] as Color).withValues(alpha: 0.7),
                    ),
                  ),
                  const SizedBox(height: 4),
                  if (hasRecipe) ...[
                    Text(
                      recipe.name,
                      style: GoogleFonts.playfairDisplay(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: CuisineTheme.cream,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      "${recipe.prepMinutes} min • ${recipe.calories} cal",
                      style: GoogleFonts.inter(
                        fontSize: 10,
                        color: CuisineTheme.cream.withValues(alpha: 0.4),
                      ),
                    ),
                  ] else
                    Text(
                      "Tap + to add a recipe",
                      style: GoogleFonts.inter(
                        fontSize: 13,
                        fontStyle: FontStyle.italic,
                        color: CuisineTheme.cream.withValues(alpha: 0.2),
                      ),
                    ),
                ],
              ),
            ),
            // Action button
            if (hasRecipe)
              GestureDetector(
                onTap: onClear,
                behavior: HitTestBehavior.opaque,
                child: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: CuisineTheme.cranberry.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(LucideIcons.x,
                      size: 14, color: CuisineTheme.cranberry.withValues(alpha: 0.6)),
                ),
              )
            else
              GestureDetector(
                onTap: onAssign,
                behavior: HitTestBehavior.opaque,
                child: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: CuisineTheme.terracotta.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: CuisineTheme.terracotta.withValues(alpha: 0.2),
                    ),
                  ),
                  child: const Icon(LucideIcons.plus,
                      size: 16, color: CuisineTheme.terracotta),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Map<String, dynamic> _getSlotConfig(MealSlot slot) {
    switch (slot) {
      case MealSlot.breakfast:
        return {
          'label': 'BREAKFAST',
          'icon': LucideIcons.sunrise,
          'color': CuisineTheme.saffron,
        };
      case MealSlot.lunch:
        return {
          'label': 'LUNCH',
          'icon': LucideIcons.sun,
          'color': CuisineTheme.terracotta,
        };
      case MealSlot.dinner:
        return {
          'label': 'DINNER',
          'icon': LucideIcons.moon,
          'color': CuisineTheme.olive,
        };
    }
  }
}
