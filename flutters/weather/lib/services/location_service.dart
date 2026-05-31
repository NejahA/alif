import 'dart:async';
import 'package:geolocator/geolocator.dart';

/// Enum representing different types of location errors
enum LocationError {
  serviceDisabled,
  permissionDenied,
  permissionDeniedForever,
  timeout,
  unknown
}

/// Result class containing location data or error information
class LocationResult {
  final double? latitude;
  final double? longitude;
  final String? hemisphere;
  final LocationError? error;

  LocationResult({
    this.latitude,
    this.longitude,
    this.hemisphere,
    this.error,
  });

  bool get hasError => error != null;
  bool get isSuccess => error == null && latitude != null && longitude != null;
}

/// Service class for handling GPS location operations
class LocationService {
  /// Timeout duration for GPS coordinate retrieval
  static const Duration _locationTimeout = Duration(seconds: 10);

  /// Gets the current GPS location with timeout and error handling
  /// 
  /// Returns a [LocationResult] containing coordinates and hemisphere,
  /// or an error if the operation fails.
  Future<LocationResult> getCurrentLocation() async {
    try {
      // Check if location service is enabled
      bool serviceEnabled = await isLocationServiceEnabled();
      if (!serviceEnabled) {
        return LocationResult(error: LocationError.serviceDisabled);
      }

      // Check permissions
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          return LocationResult(error: LocationError.permissionDenied);
        }
      }

      if (permission == LocationPermission.deniedForever) {
        return LocationResult(error: LocationError.permissionDeniedForever);
      }

      // Get current position with timeout
      Position position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
        ),
      ).timeout(_locationTimeout);

      // Determine hemisphere
      String hemisphere = determineHemisphere(position.latitude);

      return LocationResult(
        latitude: position.latitude,
        longitude: position.longitude,
        hemisphere: hemisphere,
      );
    } on TimeoutException {
      return LocationResult(error: LocationError.timeout);
    } catch (e) {
      return LocationResult(error: LocationError.unknown);
    }
  }

  /// Checks if location permission is granted
  /// 
  /// Returns true if permission is granted, false otherwise
  Future<bool> checkLocationPermission() async {
    LocationPermission permission = await Geolocator.checkPermission();
    return permission == LocationPermission.always ||
        permission == LocationPermission.whileInUse;
  }

  /// Requests location permission from the user
  /// 
  /// Returns true if permission is granted, false otherwise
  Future<bool> requestLocationPermission() async {
    LocationPermission permission = await Geolocator.requestPermission();
    return permission == LocationPermission.always ||
        permission == LocationPermission.whileInUse;
  }

  /// Checks if location service is enabled on the device
  /// 
  /// Returns true if GPS service is enabled, false otherwise
  Future<bool> isLocationServiceEnabled() async {
    return await Geolocator.isLocationServiceEnabled();
  }

  /// Determines the hemisphere based on latitude
  /// 
  /// Returns "Northern" if latitude >= 0, "Southern" if latitude < 0
  String determineHemisphere(double latitude) {
    return latitude >= 0 ? 'Northern' : 'Southern';
  }
}
