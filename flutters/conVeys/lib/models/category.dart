/// Category enum for question types
/// Requirements: 2.1
enum Category {
  funAndLight('fun_and_light', 'Fun & Light'),
  philosophical('philosophical', 'Philosophical'),
  aboutYourPast('about_your_past', 'About Your Past');

  const Category(this.value, this.displayName);
  
  final String value;
  final String displayName;

  static Category fromString(String value) {
    return Category.values.firstWhere(
      (c) => c.value == value,
      orElse: () => Category.funAndLight,
    );
  }
}
