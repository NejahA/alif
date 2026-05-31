import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/route_info.dart';

class ApiService {
  static const String _baseUrl = 'http://10.0.2.2:3000/api/routes';

  static Future<List<RouteInfo>> fetchRoutes() async {
    try {
      final res = await http.get(Uri.parse(_baseUrl)).timeout(const Duration(seconds: 10));
      if (res.statusCode == 200) {
        final List data = jsonDecode(res.body);
        return data.map((json) => RouteInfo(
          from: json['from'],
          to: json['to'],
          distance: json['distance'],
          duration: json['duration'],
          fare: json['fare'],
          type: _parseType(json['type']),
        )).toList();
      }
    } catch (_) {}
    return [];
  }

  static Future<bool> addRoute(RouteInfo route) async {
    try {
      final res = await http.post(
        Uri.parse(_baseUrl),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'from': route.from,
          'to': route.to,
          'distance': route.distance,
          'duration': route.duration,
          'fare': route.fare,
          'type': route.type.name,
        }),
      ).timeout(const Duration(seconds: 10));
      return res.statusCode == 201;
    } catch (_) {
      return false;
    }
  }

  static RouteType _parseType(String? type) {
    switch (type) {
      case 'flight': return RouteType.flight;
      case 'shopping': return RouteType.shopping;
      case 'business': return RouteType.business;
      case 'beach': return RouteType.beach;
      case 'train': return RouteType.train;
      case 'historic': return RouteType.historic;
      default: return RouteType.city;
    }
  }
}
