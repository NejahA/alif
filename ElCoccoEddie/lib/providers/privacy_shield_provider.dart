import 'dart:async';
import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';
import '../services/native_blocker_service.dart';

enum ThreatLevel { low, medium, high, critical }

enum CameraFilter { none, monochrome, nightVision, thermal, fullScreen }

class AuditedApp {
  final String name;
  final String packageName;
  final bool hasCamera;
  final bool hasMic;
  final ThreatLevel risk;
  final String lastAccessed;

  AuditedApp({
    required this.name,
    required this.packageName,
    required this.hasCamera,
    required this.hasMic,
    required this.risk,
    required this.lastAccessed,
  });
}

class PrivacyShieldProvider extends ChangeNotifier {
  bool _cameraBlocked = false;
  bool _micBlocked = false;
  bool _volButtonsBlocked = false;
  bool _masterLockActive = false;
  bool _acousticJammerActive = false;
  double _jammerFrequency = 18500.0;
  bool _stealthMode = false;
  bool _isAuditing = false;
  int _blockedAttemptsCount = 14;
  bool _isDeviceAdminActive = false;
  bool _canDrawOverlays = false;
  CameraFilter _cameraFilter = CameraFilter.fullScreen;
  Color _cameraFilterColor = Colors.black;
  bool _privacyAutomationEnabled = true;
  int _lockDelaySeconds = 10;
  int _unlockDelaySeconds = 1;

  PermissionStatus _cameraPermissionStatus = PermissionStatus.denied;
  PermissionStatus _micPermissionStatus = PermissionStatus.denied;

  List<AuditedApp> _auditedApps = [];

  bool get cameraBlocked => _cameraBlocked;
  bool get micBlocked => _micBlocked;
  bool get volumeButtonsBlocked => _volButtonsBlocked;
  bool get masterLockActive => _masterLockActive;
  bool get acousticJammerActive => _acousticJammerActive;
  double get jammerFrequency => _jammerFrequency;
  bool get stealthMode => _stealthMode;
  bool get isAuditing => _isAuditing;
  int get blockedAttemptsCount => _blockedAttemptsCount;
  bool get isDeviceAdminActive => _isDeviceAdminActive;
  bool get canDrawOverlays => _canDrawOverlays;
  CameraFilter get cameraFilter => _cameraFilter;
  Color get cameraFilterColor => _cameraFilterColor;
  bool get privacyAutomationEnabled => _privacyAutomationEnabled;
  int get lockDelaySeconds => _lockDelaySeconds;
  int get unlockDelaySeconds => _unlockDelaySeconds;
  List<AuditedApp> get auditedApps => _auditedApps;
  PermissionStatus get cameraPermissionStatus => _cameraPermissionStatus;
  PermissionStatus get micPermissionStatus => _micPermissionStatus;

  PrivacyShieldProvider() {
    _initPermissionsAndAudit();
  }

  Future<void> _initPermissionsAndAudit() async {
    _cameraPermissionStatus = await Permission.camera.status;
    _micPermissionStatus = await Permission.microphone.status;
    final statusMap = await NativeBlockerService.getShieldStatus();
    _isDeviceAdminActive = statusMap['isAdminActive'] ?? false;
    _canDrawOverlays = statusMap['canDrawOverlays'] ?? false;
    _cameraBlocked = statusMap['cameraBlocked'] ?? false;
    _micBlocked = statusMap['micBlocked'] ?? false;
    _volButtonsBlocked = statusMap['volButtonsBlocked'] ?? false;
    _masterLockActive = _cameraBlocked && _micBlocked;
    await _loadPrivacyEngineStatus();
    _generateInitialAuditData();
    notifyListeners();
  }

  Future<void> checkStatus() async {
    final statusMap = await NativeBlockerService.getShieldStatus();
    _isDeviceAdminActive = statusMap['isAdminActive'] ?? false;
    _canDrawOverlays = statusMap['canDrawOverlays'] ?? false;
    _cameraBlocked = statusMap['cameraBlocked'] ?? false;
    _micBlocked = statusMap['micBlocked'] ?? false;
    _volButtonsBlocked = statusMap['volButtonsBlocked'] ?? false;
    _masterLockActive = _cameraBlocked && _micBlocked;
    await _loadPrivacyEngineStatus();
    notifyListeners();
  }

  Future<void> _loadPrivacyEngineStatus() async {
    final status = await NativeBlockerService.getPrivacyEngineStatus();
    _privacyAutomationEnabled = status['automationEnabled'] ?? _privacyAutomationEnabled;
    _lockDelaySeconds = status['lockDelaySeconds'] ?? _lockDelaySeconds;
    _unlockDelaySeconds = status['unlockDelaySeconds'] ?? _unlockDelaySeconds;
  }

  Future<void> setPrivacyAutomationEnabled(bool enabled) async {
    if (await NativeBlockerService.setPrivacyAutomationEnabled(enabled)) {
      _privacyAutomationEnabled = enabled;
      notifyListeners();
    }
  }

  Future<void> setPrivacyFeaturePolicy(String feature, {
    required bool disableOnLock,
    required bool enableOnUnlock,
  }) async {
    await NativeBlockerService.setPrivacyFeaturePolicy(
      feature: feature,
      disableOnLock: disableOnLock,
      enableOnUnlock: enableOnUnlock,
    );
  }

  Future<void> setPrivacyTimerSettings({required int lockDelaySeconds, required int unlockDelaySeconds}) async {
    if (await NativeBlockerService.setPrivacyTimerSettings(
      lockDelaySeconds: lockDelaySeconds,
      unlockDelaySeconds: unlockDelaySeconds,
    )) {
      _lockDelaySeconds = lockDelaySeconds;
      _unlockDelaySeconds = unlockDelaySeconds;
      notifyListeners();
    }
  }

  Future<void> requestOverlayPermission() async {
    await NativeBlockerService.requestOverlayPermission();
    await Future.delayed(const Duration(seconds: 1));
    await checkStatus();
  }

  Future<void> requestDeviceAdmin() async {
    await NativeBlockerService.requestDeviceAdmin();
    await Future.delayed(const Duration(seconds: 1));
    await checkStatus();
    if (_isDeviceAdminActive) {
      await syncNativeHardwareState();
    }
  }

  Future<void> syncNativeHardwareState() async {
    final cameraApplied = await NativeBlockerService.setCameraBlocked(_cameraBlocked);
    await NativeBlockerService.setMicrophoneBlocked(_micBlocked);
    await NativeBlockerService.setVolumeButtonsBlocked(_volButtonsBlocked);
    if (!cameraApplied) {
      await checkStatus();
    }
  }

  Future<bool> _ensureRequiredPermissions({bool requireCamera = false, bool requireMic = false}) async {
    final adminActive = await NativeBlockerService.isDeviceAdminActive();

    if (!adminActive) {
      // Camera control stores the requested state natively and applies it when
      // the user returns from the Device Admin approval screen.
      return requireCamera;
    }

    // DevicePolicyManager controls the camera system-wide and does not require
    // the app's camera runtime permission or overlay permission.
    if (requireCamera) {
      return true;
    }

    final overlayReady = await NativeBlockerService.canDrawOverlays();
    if (requireMic && !overlayReady) {
      return false;
    }

    final permissionsToCheck = <Permission>[];
    if (requireCamera) permissionsToCheck.add(Permission.camera);
    if (requireMic) permissionsToCheck.add(Permission.microphone);

    if (permissionsToCheck.isNotEmpty) {
      await requestPermissions();

      if (requireCamera && _cameraPermissionStatus.isDenied) {
        return false;
      }
      if (requireMic && _micPermissionStatus.isDenied) {
        return false;
      }
    }

    return true;
  }

  Future<void> toggleMasterLock() async {
    final canActivate = await _ensureRequiredPermissions(requireCamera: true, requireMic: true);
    if (!canActivate) {
      return;
    }

    _masterLockActive = !_masterLockActive;
    _cameraBlocked = _masterLockActive;
    _micBlocked = _masterLockActive;
    _volButtonsBlocked = _masterLockActive;
    if (_masterLockActive) {
      _blockedAttemptsCount += 1;
    }
    await syncNativeHardwareState();
    notifyListeners();
  }

  Future<void> toggleCameraShield() async {
    _cameraFilter = _cameraFilter == CameraFilter.fullScreen
        ? CameraFilter.none
        : CameraFilter.fullScreen;
    _cameraBlocked = _cameraFilter == CameraFilter.fullScreen;
    notifyListeners();
  }

  void setCameraFilter(CameraFilter filter) {
    _cameraFilter = filter;
    _cameraBlocked = filter == CameraFilter.fullScreen;
    notifyListeners();
  }

  void setCameraFilterColor(Color color) {
    _cameraFilterColor = color;
    notifyListeners();
  }

  Future<void> toggleMicShield() async {
    final canActivate = await _ensureRequiredPermissions(requireMic: true);
    if (!canActivate) {
      return;
    }

    _micBlocked = !_micBlocked;
    if (_cameraBlocked && _micBlocked) {
      _masterLockActive = true;
    } else if (!_micBlocked) {
      _masterLockActive = false;
    }
    await NativeBlockerService.setMicrophoneBlocked(_micBlocked);
    notifyListeners();
  }

  Future<void> toggleVolumeButtonsShield() async {
    _volButtonsBlocked = !_volButtonsBlocked;
    await NativeBlockerService.setVolumeButtonsBlocked(_volButtonsBlocked);
    notifyListeners();
  }

  void toggleAcousticJammer() {
    _acousticJammerActive = !_acousticJammerActive;
    notifyListeners();
  }

  void setJammerFrequency(double freq) {
    _jammerFrequency = freq;
    notifyListeners();
  }

  void toggleStealthMode() {
    _stealthMode = !_stealthMode;
    notifyListeners();
  }

  Future<void> requestPermissions() async {
    Map<Permission, PermissionStatus> statuses = await [
      Permission.camera,
      Permission.microphone,
    ].request();

    _cameraPermissionStatus = statuses[Permission.camera] ?? PermissionStatus.denied;
    _micPermissionStatus = statuses[Permission.microphone] ?? PermissionStatus.denied;
    notifyListeners();
  }

  Future<void> scanThreats() async {
    _isAuditing = true;
    notifyListeners();

    await Future.delayed(const Duration(seconds: 2));

    _generateInitialAuditData();
    _isAuditing = false;
    _blockedAttemptsCount += 3;
    notifyListeners();
  }

  void _generateInitialAuditData() {
    _auditedApps = [
      AuditedApp(
        name: 'Social Cipher App',
        packageName: 'com.social.cipher',
        hasCamera: true,
        hasMic: true,
        risk: ThreatLevel.high,
        lastAccessed: '2 mins ago',
      ),
      AuditedApp(
        name: 'Voice Assistant Background',
        packageName: 'com.voice.listener',
        hasCamera: false,
        hasMic: true,
        risk: ThreatLevel.critical,
        lastAccessed: 'Just now',
      ),
      AuditedApp(
        name: 'Shadow Cam Tracker',
        packageName: 'com.spy.shadowcam',
        hasCamera: true,
        hasMic: false,
        risk: ThreatLevel.high,
        lastAccessed: '14 mins ago',
      ),
      AuditedApp(
        name: 'Browser WebRTC Agent',
        packageName: 'com.net.browser',
        hasCamera: true,
        hasMic: true,
        risk: ThreatLevel.medium,
        lastAccessed: '1 hour ago',
      ),
      AuditedApp(
        name: 'System Audio Service',
        packageName: 'android.system.audio',
        hasCamera: false,
        hasMic: true,
        risk: ThreatLevel.low,
        lastAccessed: '3 hours ago',
      ),
    ];
  }
}
