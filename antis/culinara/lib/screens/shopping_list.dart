import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:culinara/core/providers.dart';
import 'package:culinara/core/theme.dart';

class ShoppingListScreen extends ConsumerStatefulWidget {
  const ShoppingListScreen({super.key});

  @override
  ConsumerState<ShoppingListScreen> createState() => _ShoppingListScreenState();
}

class _ShoppingListScreenState extends ConsumerState<ShoppingListScreen> {
  final _categories = ['All', 'Proteins', 'Produce', 'Dairy', 'Pantry', 'Spices'];
  String _selectedCategory = 'All';

  @override
  Widget build(BuildContext context) {
    final items = ref.watch(shoppingListProvider);
    ref.watch(mealPlanProvider); // watch for changes

    final filteredItems = _selectedCategory == 'All'
        ? items
        : items.where((i) => i.category == _selectedCategory).toList();

    final checkedCount = items.where((i) => i.isChecked).length;

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
                        "Market List",
                        style: GoogleFonts.playfairDisplay(
                          fontSize: 26,
                          fontWeight: FontWeight.w900,
                          color: CuisineTheme.cream,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        items.isEmpty
                            ? "Generate from your meal plan"
                            : "$checkedCount of ${items.length} items acquired",
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          fontStyle: FontStyle.italic,
                          color: CuisineTheme.cream.withValues(alpha: 0.4),
                        ),
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      // Generate button
                      GestureDetector(
                        onTap: () {
                          final recipes = ref.read(mealPlanProvider.notifier).assignedRecipes;
                          ref.read(shoppingListProvider.notifier).generateFromMealPlan(recipes);
                        },
                        behavior: HitTestBehavior.opaque,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 14, vertical: 10),
                          decoration: BoxDecoration(
                            color: CuisineTheme.olive.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(
                              color: CuisineTheme.olive.withValues(alpha: 0.25),
                            ),
                          ),
                          child: Row(
                            children: [
                              const Icon(LucideIcons.refreshCw,
                                  size: 14, color: CuisineTheme.olive),
                              const SizedBox(width: 6),
                              Text(
                                "Generate",
                                style: GoogleFonts.inter(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                  color: CuisineTheme.olive,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      // Add custom item
                      GestureDetector(
                        onTap: () => _showAddItemDialog(),
                        behavior: HitTestBehavior.opaque,
                        child: Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: CuisineTheme.terracotta.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(
                              color: CuisineTheme.terracotta.withValues(alpha: 0.25),
                            ),
                          ),
                          child: const Icon(LucideIcons.plus,
                              size: 18, color: CuisineTheme.terracotta),
                        ),
                      ),
                    ],
                  ),
                ],
              ),

              const SizedBox(height: 20),

              // Progress bar
              if (items.isNotEmpty) ...[
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: items.isEmpty ? 0 : checkedCount / items.length,
                    minHeight: 4,
                    backgroundColor: CuisineTheme.darkWalnut,
                    valueColor:
                        const AlwaysStoppedAnimation<Color>(CuisineTheme.olive),
                  ),
                ),
                const SizedBox(height: 20),
              ],

              // Category filter
              SizedBox(
                height: 36,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  itemCount: _categories.length,
                  itemBuilder: (context, index) {
                    final cat = _categories[index];
                    final isSelected = _selectedCategory == cat;
                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: GestureDetector(
                        onTap: () => setState(() => _selectedCategory = cat),
                        behavior: HitTestBehavior.opaque,
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          padding: const EdgeInsets.symmetric(
                              horizontal: 14, vertical: 6),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? CuisineTheme.saffron.withValues(alpha: 0.15)
                                : CuisineTheme.darkWalnut.withValues(alpha: 0.4),
                            borderRadius: BorderRadius.circular(18),
                            border: Border.all(
                              color: isSelected
                                  ? CuisineTheme.saffron.withValues(alpha: 0.4)
                                  : CuisineTheme.cream.withValues(alpha: 0.05),
                            ),
                          ),
                          child: Text(
                            cat,
                            style: GoogleFonts.inter(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: isSelected
                                  ? CuisineTheme.saffron
                                  : CuisineTheme.cream.withValues(alpha: 0.35),
                            ),
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),

              const SizedBox(height: 20),

              // Items list
              Expanded(
                child: items.isEmpty
                    ? _buildEmptyState()
                    : filteredItems.isEmpty
                        ? Center(
                            child: Text(
                              "No items in this category",
                              style: GoogleFonts.inter(
                                fontSize: 13,
                                color: CuisineTheme.cream.withValues(alpha: 0.3),
                              ),
                            ),
                          )
                        : ListView.separated(
                            itemCount: filteredItems.length,
                            separatorBuilder: (_, __) =>
                                const SizedBox(height: 8),
                            itemBuilder: (context, index) {
                              final item = filteredItems[index];
                              return _ShoppingItemTile(item: item);
                            },
                          ),
              ),

              // Clear all button
              if (items.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(top: 16),
                  child: Center(
                    child: GestureDetector(
                      onTap: () =>
                          ref.read(shoppingListProvider.notifier).clearAll(),
                      behavior: HitTestBehavior.opaque,
                      child: Text(
                        "Clear all items",
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: CuisineTheme.cranberry.withValues(alpha: 0.6),
                          decoration: TextDecoration.underline,
                          decorationColor: CuisineTheme.cranberry.withValues(alpha: 0.3),
                        ),
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(LucideIcons.shoppingBag,
              size: 56, color: CuisineTheme.cream.withValues(alpha: 0.08)),
          const SizedBox(height: 16),
          Text(
            "Your market list is empty",
            style: GoogleFonts.playfairDisplay(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: CuisineTheme.cream.withValues(alpha: 0.3),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            "Assign recipes to your meal plan,\nthen tap Generate to fill your list.",
            textAlign: TextAlign.center,
            style: GoogleFonts.inter(
              fontSize: 12,
              height: 1.5,
              color: CuisineTheme.cream.withValues(alpha: 0.2),
            ),
          ),
          const SizedBox(height: 24),
          GestureDetector(
            onTap: () => _showAddItemDialog(),
            behavior: HitTestBehavior.opaque,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              decoration: BoxDecoration(
                color: CuisineTheme.terracotta.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: CuisineTheme.terracotta.withValues(alpha: 0.25),
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(LucideIcons.plus,
                      size: 14, color: CuisineTheme.terracotta),
                  const SizedBox(width: 8),
                  Text(
                    "Add item manually",
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: CuisineTheme.terracotta,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showAddItemDialog() {
    final nameController = TextEditingController();
    final qtyController = TextEditingController();
    String selectedCat = 'Pantry';

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          backgroundColor: CuisineTheme.darkWalnut,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(24),
            side: BorderSide(
                color: CuisineTheme.saffron.withValues(alpha: 0.15)),
          ),
          title: Text(
            "Add to Market List",
            style: GoogleFonts.playfairDisplay(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: CuisineTheme.cream,
            ),
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildDialogField(nameController, "Item name", LucideIcons.tag),
              const SizedBox(height: 12),
              _buildDialogField(qtyController, "Quantity", LucideIcons.hash),
              const SizedBox(height: 16),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: ['Proteins', 'Produce', 'Dairy', 'Pantry', 'Spices']
                    .map((cat) => GestureDetector(
                          onTap: () =>
                              setDialogState(() => selectedCat = cat),
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: selectedCat == cat
                                  ? CuisineTheme.terracotta
                                      .withValues(alpha: 0.15)
                                  : Colors.transparent,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: selectedCat == cat
                                    ? CuisineTheme.terracotta
                                    : CuisineTheme.cream
                                        .withValues(alpha: 0.1),
                              ),
                            ),
                            child: Text(
                              cat,
                              style: GoogleFonts.inter(
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                                color: selectedCat == cat
                                    ? CuisineTheme.terracotta
                                    : CuisineTheme.cream
                                        .withValues(alpha: 0.4),
                              ),
                            ),
                          ),
                        ))
                    .toList(),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text("Cancel",
                  style: GoogleFonts.inter(
                      color: CuisineTheme.cream.withValues(alpha: 0.4))),
            ),
            TextButton(
              onPressed: () {
                if (nameController.text.isNotEmpty) {
                  ref.read(shoppingListProvider.notifier).addCustomItem(
                        nameController.text,
                        qtyController.text.isEmpty
                            ? "1"
                            : qtyController.text,
                        selectedCat,
                      );
                  Navigator.pop(context);
                }
              },
              child: Text("Add",
                  style: GoogleFonts.inter(
                      fontWeight: FontWeight.w700,
                      color: CuisineTheme.saffron)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDialogField(
      TextEditingController controller, String hint, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: CuisineTheme.espresso.withValues(alpha: 0.5),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
            color: CuisineTheme.cream.withValues(alpha: 0.06)),
      ),
      child: Row(
        children: [
          Icon(icon,
              size: 14, color: CuisineTheme.cream.withValues(alpha: 0.3)),
          const SizedBox(width: 10),
          Expanded(
            child: TextField(
              controller: controller,
              style: GoogleFonts.inter(
                  fontSize: 13, color: CuisineTheme.cream),
              decoration: InputDecoration(
                hintText: hint,
                hintStyle: GoogleFonts.inter(
                  fontSize: 13,
                  color: CuisineTheme.cream.withValues(alpha: 0.2),
                ),
                border: InputBorder.none,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ════════════════════════════════════════════
// Shopping Item Tile
// ════════════════════════════════════════════
class _ShoppingItemTile extends ConsumerWidget {
  final ShoppingItem item;

  const _ShoppingItemTile({required this.item});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Dismissible(
      key: Key(item.id),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        decoration: BoxDecoration(
          color: CuisineTheme.cranberry.withValues(alpha: 0.15),
          borderRadius: BorderRadius.circular(16),
        ),
        child: const Icon(LucideIcons.trash2,
            size: 18, color: CuisineTheme.cranberry),
      ),
      onDismissed: (_) =>
          ref.read(shoppingListProvider.notifier).removeItem(item.id),
      child: GestureDetector(
        onTap: () =>
            ref.read(shoppingListProvider.notifier).toggleCheck(item.id),
        behavior: HitTestBehavior.opaque,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          decoration: BoxDecoration(
            color: item.isChecked
                ? CuisineTheme.olive.withValues(alpha: 0.06)
                : CuisineTheme.darkWalnut.withValues(alpha: 0.4),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: item.isChecked
                  ? CuisineTheme.olive.withValues(alpha: 0.2)
                  : CuisineTheme.cream.withValues(alpha: 0.04),
            ),
          ),
          child: Row(
            children: [
              AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                width: 22,
                height: 22,
                decoration: BoxDecoration(
                  color: item.isChecked
                      ? CuisineTheme.olive.withValues(alpha: 0.2)
                      : Colors.transparent,
                  borderRadius: BorderRadius.circular(7),
                  border: Border.all(
                    color: item.isChecked
                        ? CuisineTheme.olive
                        : CuisineTheme.cream.withValues(alpha: 0.15),
                    width: 1.5,
                  ),
                ),
                child: item.isChecked
                    ? const Icon(LucideIcons.check,
                        size: 13, color: CuisineTheme.olive)
                    : null,
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.name,
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: CuisineTheme.cream.withValues(
                            alpha: item.isChecked ? 0.3 : 0.9),
                        decoration:
                            item.isChecked ? TextDecoration.lineThrough : null,
                      ),
                    ),
                    Row(
                      children: [
                        Text(
                          item.category,
                          style: GoogleFonts.inter(
                            fontSize: 9,
                            fontWeight: FontWeight.w600,
                            color: CuisineTheme.terracotta.withValues(alpha: 0.5),
                            letterSpacing: 0.5,
                          ),
                        ),
                        if (ref.watch(pantryProvider)[item.name] ?? false) ...[
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                            decoration: BoxDecoration(
                              color: CuisineTheme.olive.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(4),
                              border: Border.all(color: CuisineTheme.olive.withValues(alpha: 0.2)),
                            ),
                            child: Text(
                              "STOCKED",
                              style: GoogleFonts.inter(
                                fontSize: 7,
                                fontWeight: FontWeight.w900,
                                color: CuisineTheme.olive,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
              Text(
                item.qty,
                style: GoogleFonts.inter(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: CuisineTheme.saffron.withValues(alpha: 0.7),
                ),
              ),
              if (item.isCustom) ...[
                const SizedBox(width: 8),
                Icon(LucideIcons.pencil,
                    size: 10,
                    color: CuisineTheme.cream.withValues(alpha: 0.2)),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
