import 'category.dart';

/// Category information with metadata
/// Requirements: 2.1, 2.3
class CategoryInfo {
  final Category category;
  final String name;
  final String description;
  final int questionCount;
  final String icon;

  const CategoryInfo({
    required this.category,
    required this.name,
    required this.description,
    required this.questionCount,
    required this.icon,
  });
}
