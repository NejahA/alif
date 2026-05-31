import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'models.dart';

const String apiBase = String.fromEnvironment(
  'API_BASE',
  defaultValue: 'https://domoiq-server.onrender.com/api',
);

Uri _apiUri(String path, [Map<String, dynamic>? query]) {
  final encoded = query?.map((key, value) => MapEntry(key, '$value'));
  return Uri.parse('$apiBase$path').replace(queryParameters: encoded);
}

class ApiService {
  static Future<List<Insight>> fetchInsights(String category, String timeline) async {
    final query = <String, dynamic>{'timeline': timeline};
    if (category.isNotEmpty && category != 'All') {
      query['category'] = category;
    }
    final uri = _apiUri('/insights', query);
    final response = await http.get(uri);
    if (response.statusCode != 200) {
      throw Exception('Failed to load insights');
    }
    final body = json.decode(response.body) as List<dynamic>;
    return body.map((item) => Insight.fromJson(item as Map<String, dynamic>)).toList();
  }

  static Future<Stats> fetchStats() async {
    final uri = _apiUri('/stats');
    final response = await http.get(uri);
    if (response.statusCode != 200) {
      throw Exception('Failed to load stats');
    }
    return Stats.fromJson(json.decode(response.body) as Map<String, dynamic>);
  }

  static Future<List<String>> fetchNews(String timeline) async {
    final uri = _apiUri('/news', {'timeline': timeline});
    final response = await http.get(uri);
    if (response.statusCode != 200) {
      throw Exception('Failed to load news');
    }
    final body = json.decode(response.body) as List<dynamic>;
    return body.map((item) => item.toString()).toList();
  }

  static Future<List<Broadcast>> fetchBroadcasts() async {
    final uri = _apiUri('/broadcasts');
    final response = await http.get(uri);
    if (response.statusCode != 200) {
      throw Exception('Failed to load broadcasts');
    }
    final body = json.decode(response.body) as List<dynamic>;
    return body.map((item) => Broadcast.fromJson(item as Map<String, dynamic>)).toList();
  }

  static Future<List<SystemEvent>> fetchEvents(String timeline) async {
    final uri = _apiUri('/events', {'timeline': timeline});
    final response = await http.get(uri);
    if (response.statusCode != 200) {
      throw Exception('Failed to load events');
    }
    final body = json.decode(response.body) as List<dynamic>;
    return body.map((item) => SystemEvent.fromJson(item as Map<String, dynamic>)).toList();
  }

  static Future<List<Mission>> fetchMissions() async {
    final uri = _apiUri('/missions');
    final response = await http.get(uri);
    if (response.statusCode != 200) {
      throw Exception('Failed to load missions');
    }
    final body = json.decode(response.body) as List<dynamic>;
    return body.map((item) => Mission.fromJson(item as Map<String, dynamic>)).toList();
  }

  static Future<List<Anomaly>> fetchAnomalies() async {
    final uri = _apiUri('/anomalies');
    final response = await http.get(uri);
    if (response.statusCode != 200) {
      throw Exception('Failed to load anomalies');
    }
    final body = json.decode(response.body) as List<dynamic>;
    return body.map((item) => Anomaly.fromJson(item as Map<String, dynamic>)).toList();
  }

  static Future<List<Seer>> fetchSeers() async {
    final uri = _apiUri('/seers');
    final response = await http.get(uri);
    if (response.statusCode != 200) {
      throw Exception('Failed to load seers');
    }
    final body = json.decode(response.body) as List<dynamic>;
    return body.map((item) => Seer.fromJson(item as Map<String, dynamic>)).toList();
  }

  static Future<Weather> fetchWeather() async {
    final uri = _apiUri('/weather');
    final response = await http.get(uri);
    if (response.statusCode != 200) {
      throw Exception('Failed to load weather');
    }
    return Weather.fromJson(json.decode(response.body) as Map<String, dynamic>);
  }

  static Future<SystemState> fetchSystemState() async {
    final uri = _apiUri('/system');
    final response = await http.get(uri);
    if (response.statusCode != 200) {
      throw Exception('Failed to load system state');
    }
    return SystemState.fromJson(json.decode(response.body) as Map<String, dynamic>);
  }

  static Future<String> postOracle(String query, String mode, String userName) async {
    final uri = _apiUri('/oracle');
    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'query': query, 'mode': mode, 'context': {'userName': userName}}),
    );
    if (response.statusCode != 200) {
      throw Exception('Failed to submit oracle query');
    }
    final body = json.decode(response.body) as Map<String, dynamic>;
    return body['response'] as String? ?? 'No response available';
  }

  static Future<void> postBroadcast(String sender, String message) async {
    final uri = _apiUri('/broadcasts');
    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'sender': sender, 'message': message}),
    );
    if (response.statusCode != 201) {
      throw Exception('Failed to send broadcast');
    }
  }

  // Admin Methods
  static Future<List<dynamic>> fetchAdminData(String tab) async {
    final uri = _apiUri('/admin/$tab');
    final response = await http.get(uri);
    if (response.statusCode != 200) {
      throw Exception('Failed to fetch $tab');
    }
    return json.decode(response.body) as List<dynamic>;
  }

  static Future<void> saveAdminItem(String tab, Map<String, dynamic> item) async {
    final isNew = item['_id'] == null;
    final uri = isNew ? _apiUri('/admin/$tab') : _apiUri('/admin/$tab/${item['_id']}');
    final method = isNew ? http.post : http.patch;
    
    final response = await method(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: json.encode(item),
    );
    if (response.statusCode != 200 && response.statusCode != 201) {
      throw Exception('Failed to save $tab');
    }
  }

  static Future<void> deleteAdminItem(String tab, String id) async {
    final uri = _apiUri('/admin/$tab/$id');
    final response = await http.delete(uri);
    if (response.statusCode != 204) {
      throw Exception('Failed to delete $tab');
    }
  }
}
