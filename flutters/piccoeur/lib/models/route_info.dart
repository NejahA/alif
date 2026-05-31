class RouteInfo {
  final String from;
  final String to;
  final String distance;
  final String duration;
  final String fare;
  final RouteType type;

  const RouteInfo({
    required this.from,
    required this.to,
    required this.distance,
    required this.duration,
    required this.fare,
    required this.type,
  });
}

enum RouteType {
  flight,
  shopping,
  business,
  beach,
  train,
  city,
  historic,
}
