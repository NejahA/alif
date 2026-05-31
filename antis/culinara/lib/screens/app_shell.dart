import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:culinara/core/providers.dart';
import 'package:culinara/core/theme.dart';
import 'package:culinara/screens/nexus_home.dart';
import 'package:culinara/screens/recipe_library.dart';
import 'package:culinara/screens/meal_planner.dart';
import 'package:culinara/screens/shopping_list.dart';
import 'package:culinara/screens/cooking_tips.dart';
import 'package:culinara/screens/kitchen_notebook.dart';

class AppShell extends ConsumerStatefulWidget {
  const AppShell({super.key});

  @override
  ConsumerState<AppShell> createState() => _AppShellState();
}

class _AppShellState extends ConsumerState<AppShell>
    with SingleTickerProviderStateMixin {
  late PageController _pageController;
  late AnimationController _fabPulse;

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
    _fabPulse = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _pageController.dispose();
    _fabPulse.dispose();
    super.dispose();
  }

  void _onTabChange(int index) {
    ref.read(navigationProvider.notifier).setTab(index);
    _pageController.animateToPage(
      index,
      duration: const Duration(milliseconds: 400),
      curve: Curves.easeOutCubic,
    );
  }

  @override
  Widget build(BuildContext context) {
    final currentTab = ref.watch(navigationProvider);
    final isNarrow = MediaQuery.of(context).size.width < 500;

    return PopScope(
      canPop: currentTab == 0,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;
        if (currentTab != 0) {
          _onTabChange(0);
        }
      },
      child: Scaffold(
        backgroundColor: CuisineTheme.espresso,
        body: PageView(
          controller: _pageController,
          physics: const NeverScrollableScrollPhysics(),
          children: [
            const NexusHome(),
            RecipeLibrary(onRecipeSelected: () => _onTabChange(0)),
            const MealPlannerScreen(),
            const ShoppingListScreen(),
            const KitchenNotebookScreen(),
            const CookingTipsScreen(),
          ],
        ),
        bottomNavigationBar: Container(
          decoration: BoxDecoration(
            color: CuisineTheme.charredAmber,
            border: Border(
              top: BorderSide(
                color: CuisineTheme.saffron.withValues(alpha: 0.08),
                width: 0.5,
              ),
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.4),
                blurRadius: 20,
                offset: const Offset(0, -8),
              ),
            ],
          ),
          child: SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildNavItem(0, LucideIcons.chefHat, "Kitchen", currentTab, isNarrow),
                  _buildNavItem(1, LucideIcons.bookOpen, "Recipes", currentTab, isNarrow),
                  _buildNavItem(2, LucideIcons.calendarDays, "Plan", currentTab, isNarrow),
                  _buildNavItem(3, LucideIcons.shoppingBag, "Market", currentTab, isNarrow),
                  _buildNavItem(4, LucideIcons.scrollText, "Notes", currentTab, isNarrow),
                  _buildNavItem(5, LucideIcons.lightbulb, "Tips", currentTab, isNarrow),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(int index, IconData icon, String label, int currentTab, bool isNarrow) {
    final isActive = currentTab == index;
    final showLabel = isActive && !isNarrow;

    return GestureDetector(
      onTap: () => _onTabChange(index),
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOutCubic,
        padding: EdgeInsets.symmetric(
          horizontal: isActive ? 20 : 12,
          vertical: 10,
        ),
        decoration: BoxDecoration(
          color: isActive
              ? CuisineTheme.terracotta.withValues(alpha: 0.12)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(16),
          border: isActive
              ? Border.all(
                  color: CuisineTheme.terracotta.withValues(alpha: 0.2),
                  width: 0.5,
                )
              : null,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: isNarrow ? 20 : 18,
              color: isActive
                  ? CuisineTheme.saffron
                  : CuisineTheme.cream.withValues(alpha: 0.3),
            ),
            if (showLabel) ...[
              const SizedBox(width: 8),
              Text(
                label,
                style: GoogleFonts.inter(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.5,
                  color: CuisineTheme.saffron,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
