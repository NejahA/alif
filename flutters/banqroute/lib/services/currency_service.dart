import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:connectivity_plus/connectivity_plus.dart';

class CurrencyService {
  static const String _apiUrl = 'https://open.er-api.com/v6/latest/TND';
  static const String _cacheKey = 'cached_rates';
  static const String _timestampKey = 'last_update';

  Future<Map<String, dynamic>?> fetchRates() async {
    final connectivityResult = await Connectivity().checkConnectivity();
    if (connectivityResult == ConnectivityResult.none) {
      return await _getCachedRates();
    }

    try {
      final response = await http.get(Uri.parse(_apiUrl));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['result'] == 'success') {
          await _cacheRates(data['rates'], DateTime.now().toIso8601String());
          return data['rates'];
        }
      }
    } catch (e) {
      // Silent fail → use cache
    }
    return await _getCachedRates();
  }

  Future<void> _cacheRates(Map<String, dynamic> rates, String timestamp) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_cacheKey, jsonEncode(rates));
    await prefs.setString(_timestampKey, timestamp);
  }

  Future<Map<String, dynamic>?> _getCachedRates() async {
    final prefs = await SharedPreferences.getInstance();
    final ratesJson = prefs.getString(_cacheKey);
    if (ratesJson != null) {
      return jsonDecode(ratesJson) as Map<String, dynamic>;
    }
    return null;
  }

  Future<String?> getLastUpdate() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_timestampKey);
  }
}