class RateCategory {
  final String name;
  final List<RateItem> items;

  const RateCategory({required this.name, required this.items});
}

class RateItem {
  final String label;
  final String price;

  const RateItem({required this.label, required this.price});
}
