import 'package:flutter/material.dart';
import '../models/category.dart';

/// Category selector widget
/// Requirements: 2.1, 2.2, 2.4
class CategorySelector extends StatelessWidget {
  final Category activeCategory;
  final Function(Category) onSelectCategory;

  const CategorySelector({
    super.key,
    required this.activeCategory,
    required this.onSelectCategory,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: Category.values.map((category) {
          final isActive = category == activeCategory;
          return GestureDetector(
            onTap: () => onSelectCategory(category),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: isActive ? Colors.blue : Colors.grey[200],
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                _getCategoryShortName(category),
                style: TextStyle(
                  color: isActive ? Colors.white : Colors.black87,
                  fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
                  fontSize: 12,
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  String _getCategoryShortName(Category category) {
    switch (category) {
      case Category.funAndLight:
        return 'Fun';
      case Category.philosophical:
        return 'Deep';
      case Category.aboutYourPast:
        return 'Past';
    }
  }
}
