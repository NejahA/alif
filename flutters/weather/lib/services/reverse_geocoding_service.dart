import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;

/// Result of a reverse geocoding operation
class CityResult {
  final String cityName;
  final String? countryCode;
  final GeocodingError? error;

  CityResult({
    required this.cityName,
    this.countryCode,
    this.error,
  });

  bool get hasError => error != null;
}

/// Possible errors during reverse geocoding
enum GeocodingError {
  noResults,
  timeout,
  networkError,
  apiError,
}

/// Service for converting GPS coordinates to city names using Nominatim API
class ReverseGeocodingService {
  static const String _baseUrl = 'https://nominatim.openstreetmap.org/reverse';
  static const Duration _timeout = Duration(seconds: 10);

  /// Reverse geocode coordinates to get city name
  /// 
  /// Returns a [CityResult] with the formatted city name and country code,
  /// or an error if the operation fails.
  Future<CityResult> reverseGeocode(double latitude, double longitude) async {
    try {
      final uri = Uri.parse(_baseUrl).replace(queryParameters: {
        'lat': latitude.toString(),
        'lon': longitude.toString(),
        'format': 'json',
        'addressdetails': '1',
        'accept-language': 'en',
      });

      final response = await http.get(
        uri,
        headers: {
          'User-Agent': 'WeatherApp/1.0',
        },
      ).timeout(_timeout);

      if (response.statusCode != 200) {
        return CityResult(
          cityName: 'Your Location',
          error: GeocodingError.apiError,
        );
      }

      final data = jsonDecode(response.body) as Map<String, dynamic>;
      
      if (data['error'] != null) {
        return CityResult(
          cityName: 'Your Location',
          error: GeocodingError.noResults,
        );
      }

      final cityName = formatCityName(data);
      final countryCode = data['address']?['country_code'] as String?;

      return CityResult(
        cityName: cityName,
        countryCode: countryCode?.toUpperCase(),
      );
    } on TimeoutException {
      return CityResult(
        cityName: 'Your Location',
        error: GeocodingError.timeout,
      );
    } catch (e) {
      return CityResult(
        cityName: 'Your Location',
        error: GeocodingError.networkError,
      );
    }
  }

  /// Format city name from API result
  /// 
  /// Returns "City, Region, Country" when region is available,
  /// otherwise "City, Country"
  String formatCityName(Map<String, dynamic> apiResult) {
    final address = apiResult['address'] as Map<String, dynamic>?;
    
    if (address == null) {
      return 'Your Location';
    }

    // Try to get city name from various fields
    final city = address['city'] as String? ??
                 address['town'] as String? ??
                 address['village'] as String? ??
                 address['municipality'] as String? ??
                 address['county'] as String?;
    
    final state = address['state'] as String?;
    final country = address['country'] as String?;

    if (city == null || country == null) {
      return 'Your Location';
    }

    if (state != null && state.isNotEmpty && state != city) {
      return '$city, $state, $country';
    }

    return '$city, $country';
  }
}
