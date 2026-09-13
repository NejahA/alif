import 'package:flutter/services.dart';

class NativeBlockerService {
  static const MethodChannel _channel = MethodChannel('com.elcoccoeddy.privacy/blocker');

  /// Check if the app has Device Administrator privileges active on Android
  static Future<bool> isDeviceAdminActive() async {
    try {
      final bool result = await _channel.invokeMethod('isDeviceAdminActive');
      return result;
    } on PlatformException catch (e) {
      print("Failed to check device admin: ${e.message}");
      return false;
    }
  }

  /// Launch Android native Device Administrator prompt
  static Future<bool> requestDeviceAdmin() async {
    try {
      final bool result = await _channel.invokeMethod('requestDeviceAdmin');
      return result;
    } on PlatformException catch (e) {
      print("Failed to request device admin: ${e.message}");
      return false;
    }
  }

  /// Check if Display Over Other Apps permission is granted
  static Future<bool> canDrawOverlays() async {
    try {
      final bool result = await _channel.invokeMethod('canDrawOverlays');
      return result;
    } on PlatformException catch (e) {
      print("Failed to check overlay permission: ${e.message}");
      return false;
    }
  }

  /// Launch Android Display Over Other Apps permission screen
  static Future<bool> requestOverlayPermission() async {
    try {
      final bool result = await _channel.invokeMethod('requestOverlayPermission');
      return result;
    } on PlatformException catch (e) {
      print("Failed to request overlay permission: ${e.message}");
      return false;
    }
  }

  /// Physically block/unblock hardware camera systemwide across all apps
  static Future<bool> setCameraBlocked(bool blocked) async {
    try {
      final bool result = await _channel.invokeMethod('setCameraBlocked', {'blocked': blocked});
      return result;
    } on PlatformException catch (e) {
      print("Failed to set camera block: ${e.message}");
      return false;
    }
  }

  /// Block/unblock system microphone recording input
  static Future<bool> setMicrophoneBlocked(bool blocked) async {
    try {
      final bool result = await _channel.invokeMethod('setMicrophoneBlocked', {'blocked': blocked});
      return result;
    } on PlatformException catch (e) {
      print("Failed to set mic block: ${e.message}");
      return false;
    }
  }

  /// Trap/untrap volume hardware buttons
  static Future<bool> setVolumeButtonsBlocked(bool blocked) async {
    try {
      final bool result = await _channel.invokeMethod('setVolumeButtonsBlocked', {'blocked': blocked});
      return result;
    } on PlatformException catch (e) {
      print("Failed to set volume buttons trap: ${e.message}");
      return false;
    }
  }

  /// Open native Android Privacy & Security settings
  static Future<bool> openPrivacySettings() async {
    try {
      final bool result = await _channel.invokeMethod('openPrivacySettings');
      return result;
    } on PlatformException catch (e) {
      print("Failed to open privacy settings: ${e.message}");
      return false;
    }
  }

  /// Get status map from Android native layer
  static Future<Map<String, dynamic>> getShieldStatus() async {
    try {
      final Map<dynamic, dynamic>? result = await _channel.invokeMethod('getShieldStatus');
      if (result != null) {
        return Map<String, dynamic>.from(result);
      }
    } on PlatformException catch (e) {
      print("Failed to get shield status: ${e.message}");
    }
    return {};
  }

  static Future<bool> setPrivacyAutomationEnabled(bool enabled) async {
    try {
      return await _channel.invokeMethod<bool>('setPrivacyAutomationEnabled', {'enabled': enabled}) ?? false;
    } on PlatformException catch (e) {
      print('Failed to set privacy automation: ${e.message}');
      return false;
    }
  }

  static Future<bool> setPrivacyFeaturePolicy({
    required String feature,
    required bool disableOnLock,
    required bool enableOnUnlock,
  }) async {
    try {
      return await _channel.invokeMethod<bool>('setPrivacyFeaturePolicy', {
        'feature': feature,
        'disableOnLock': disableOnLock,
        'enableOnUnlock': enableOnUnlock,
      }) ?? false;
    } on PlatformException catch (e) {
      print('Failed to set privacy feature policy: ${e.message}');
      return false;
    }
  }

  static Future<bool> setPrivacyTimerSettings({
    required int lockDelaySeconds,
    required int unlockDelaySeconds,
    bool showCountdown = true,
  }) async {
    try {
      return await _channel.invokeMethod<bool>('setPrivacyTimerSettings', {
        'lockDelaySeconds': lockDelaySeconds,
        'unlockDelaySeconds': unlockDelaySeconds,
        'showCountdown': showCountdown,
      }) ?? false;
    } on PlatformException catch (e) {
      print('Failed to set privacy timers: ${e.message}');
      return false;
    }
  }

  static Future<Map<String, dynamic>> getPrivacyEngineStatus() async {
    try {
      final result = await _channel.invokeMethod<dynamic>('getPrivacyEngineStatus');
      if (result is Map) {
        return Map<String, dynamic>.from(result);
      }
    } on TypeError catch (e) {
      print('Invalid privacy engine status response: $e');
    } on PlatformException catch (e) {
      print('Failed to read privacy engine status: ${e.message}');
    }
    return {};
  }
}
