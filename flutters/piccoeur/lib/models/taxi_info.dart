class TaxiInfo {
  final IconType icon;
  final String title;
  final String subtitle;

  const TaxiInfo({
    required this.icon,
    required this.title,
    required this.subtitle,
  });
}

enum IconType {
  taxi,
  airportShuttle,
  bus,
  rickshaw,
  train,
  boat,
  car,
}
