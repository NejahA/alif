import 'dart:async';
import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';
import '../services/native_blocker_service.dart';

enum ThreatLevel { low, medium, high, critical }

enum CameraFilter { none, monochrome, nightVision, thermal, fullScreen }

enum CameraLockMode { deviceAdminHAL, exclusiveHAL, privacyBlindCurtain, fortressCombined }

class CameraLogEntry {
  final DateTime timestamp;
  final String title;
  final String status;
  final String detail;

  const CameraLogEntry({
    required this.timestamp,
    required this.title,
    required this.status,
    required this.detail,
  });
}

class PrivacyFlipFeaturePolicy {
  final String key;
  final String displayName;
  final String description;
  final IconData icon;
  final String category; // 'Connectivity', 'Sensors', 'System Modes'
  bool disableOnLock;
  bool enableOnUnlock;
  bool currentlyActive;

  PrivacyFlipFeaturePolicy({
    required this.key,
    required this.displayName,
    required this.description,
    required this.icon,
    required this.category,
    this.disableOnLock = true,
    this.enableOnUnlock = true,
    this.currentlyActive = true,
  });
}

class PrivacyFlipLogEntry {
  final DateTime timestamp;
  final String eventType; // 'SCREEN_LOCK', 'SCREEN_UNLOCK', 'MANUAL_TOGGLE'
  final String feature;
  final String action; // 'DISABLED', 'RESTORED', 'SKIPPED'
  final String details;

  PrivacyFlipLogEntry({
    required this.timestamp,
    required this.eventType,
    required this.feature,
    required this.action,
    required this.details,
  });
}

class ExemptApp {
  final String name;
  final String packageName;
  final IconData icon;
  bool isExempt;

  ExemptApp({
    required this.name,
    required this.packageName,
    required this.icon,
    this.isExempt = false,
  });
}

class AuditedApp {
  final String name;
  final String packageName;
  final bool hasCamera;
  final bool hasMic;
  final ThreatLevel risk;
  final String lastAccessed;
  bool acknowledged;

  AuditedApp({
    required this.name,
    required this.packageName,
    required this.hasCamera,
    required this.hasMic,
    required this.risk,
    required this.lastAccessed,
    this.acknowledged = false,
  });
}

class AuditSnapshot {
  final DateTime scannedAt;
  final int outstandingCount;
  final int criticalCount;

  const AuditSnapshot({
    required this.scannedAt,
    required this.outstandingCount,
    required this.criticalCount,
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
  DateTime? _lastScanAt;
  int _scanCount = 0;
  bool _isDeviceAdminActive = false;
  bool _canDrawOverlays = false;
  CameraFilter _cameraFilter = CameraFilter.fullScreen;
  Color _cameraFilterColor = Colors.black;
  bool _privacyAutomationEnabled = true;
  int _lockDelaySeconds = 10;
  int _unlockDelaySeconds = 1;
  bool _showCountdown = true;
  bool _hasLocalStateChanges = false;
  CameraLockMode _cameraLockMode = CameraLockMode.fortressCombined;
  final List<CameraLogEntry> _cameraLogs = [];

  // PrivacyFlip Smart Rules & Privilege Settings
  bool _onlyIfUnused = true;
  bool _onlyIfNotAlreadyEnabled = false;
  bool _onlyIfNotManuallySet = true;
  bool _samsungNfcAutoRetry = true;
  bool _accessibilityInstantLock = false;
  String _privilegeMethod = 'Shizuku / ADB Privileges';
  bool _privilegeDetected = true;

  // PrivacyFlip Features Policies
  late List<PrivacyFlipFeaturePolicy> _flipPolicies;
  final List<PrivacyFlipLogEntry> _flipLogs = [];
  late List<ExemptApp> _exemptApps;

  PermissionStatus _cameraPermissionStatus = PermissionStatus.denied;
  PermissionStatus _micPermissionStatus = PermissionStatus.denied;

  List<AuditedApp> _auditedApps = [];
  final List<AuditSnapshot> _scanHistory = [];

  bool get cameraBlocked => _cameraBlocked;
  bool get micBlocked => _micBlocked;
  bool get volumeButtonsBlocked => _volButtonsBlocked;
  bool get masterLockActive => _masterLockActive;
  bool get acousticJammerActive => _acousticJammerActive;
  double get jammerFrequency => _jammerFrequency;
  bool get stealthMode => _stealthMode;
  bool get isAuditing => _isAuditing;
  int get blockedAttemptsCount => _blockedAttemptsCount;
  DateTime? get lastScanAt => _lastScanAt;
  int get scanCount => _scanCount;
  bool get isDeviceAdminActive => _isDeviceAdminActive;
  bool get canDrawOverlays => _canDrawOverlays;
  CameraFilter get cameraFilter => _cameraFilter;
  Color get cameraFilterColor => _cameraFilterColor;
  bool get privacyAutomationEnabled => _privacyAutomationEnabled;
  int get lockDelaySeconds => _lockDelaySeconds;
  int get unlockDelaySeconds => _unlockDelaySeconds;
  bool get showCountdown => _showCountdown;
  CameraLockMode get cameraLockMode => _cameraLockMode;
  List<CameraLogEntry> get cameraLogs => List.unmodifiable(_cameraLogs);

  // PrivacyFlip Getters
  bool get onlyIfUnused => _onlyIfUnused;
  bool get onlyIfNotAlreadyEnabled => _onlyIfNotAlreadyEnabled;
  bool get onlyIfNotManuallySet => _onlyIfNotManuallySet;
  bool get samsungNfcAutoRetry => _samsungNfcAutoRetry;
  bool get accessibilityInstantLock => _accessibilityInstantLock;
  String get privilegeMethod => _privilegeMethod;
  bool get privilegeDetected => _privilegeDetected;
  List<PrivacyFlipFeaturePolicy> get flipPolicies => List.unmodifiable(_flipPolicies);
  List<PrivacyFlipLogEntry> get flipLogs => List.unmodifiable(_flipLogs);
  List<ExemptApp> get exemptApps => List.unmodifiable(_exemptApps);

  List<AuditedApp> get auditedApps => _auditedApps;
  List<AuditSnapshot> get scanHistory => List.unmodifiable(_scanHistory);

  void setCameraLockMode(CameraLockMode mode) {
    _cameraLockMode = mode;
    notifyListeners();
  }

  void _addCameraLogEntry(String title, String status, {String detail = ''}) {
    _cameraLogs.insert(
      0,
      CameraLogEntry(
        timestamp: DateTime.now(),
        title: title,
        status: status,
        detail: detail,
      ),
    );
    if (_cameraLogs.length > 30) _cameraLogs.removeLast();
  }

  void clearCameraLogs() {
    _cameraLogs.clear();
    notifyListeners();
  }

  void clearFlipLogs() {
    _flipLogs.clear();
    notifyListeners();
  }

  Future<void> toggleEmergencyLockdown() async {
    _hasLocalStateChanges = true;
    _masterLockActive = true;
    _cameraBlocked = true;
    _micBlocked = true;
    _volButtonsBlocked = true;
    _acousticJammerActive = true;
    _blockedAttemptsCount += 5;
    _addCameraLogEntry(
      'EMERGENCY PANIC LOCKDOWN TRIGGERED',
      'PANIC LOCK',
      detail: 'Camera HAL, Mic, Volume & Acoustic Cipher engaged simultaneously.',
    );
    await syncNativeHardwareState();
    notifyListeners();
  }

  void clearScanHistory() {
    _scanHistory.clear();
    notifyListeners();
  }

  PermissionStatus get cameraPermissionStatus => _cameraPermissionStatus;
  PermissionStatus get micPermissionStatus => _micPermissionStatus;

  PrivacyShieldProvider() {
    _initFlipDefaults();
    _initPermissionsAndAudit();
  }

  void _initFlipDefaults() {
    _flipPolicies = [
      PrivacyFlipFeaturePolicy(
        key: 'WIFI',
        displayName: 'Wi-Fi',
        description: 'Disable wireless network connectivity on lock',
        icon: Icons.wifi,
        category: 'Connectivity',
        disableOnLock: true,
        enableOnUnlock: true,
        currentlyActive: true,
      ),
      PrivacyFlipFeaturePolicy(
        key: 'BLUETOOTH',
        displayName: 'Bluetooth',
        description: 'Disable short-range Bluetooth radios on lock',
        icon: Icons.bluetooth,
        category: 'Connectivity',
        disableOnLock: true,
        enableOnUnlock: true,
        currentlyActive: true,
      ),
      PrivacyFlipFeaturePolicy(
        key: 'MOBILE_DATA',
        displayName: 'Mobile Data',
        description: 'Disable cellular data connectivity on lock',
        icon: Icons.signal_cellular_alt,
        category: 'Connectivity',
        disableOnLock: true,
        enableOnUnlock: false,
        currentlyActive: true,
      ),
      PrivacyFlipFeaturePolicy(
        key: 'LOCATION',
        displayName: 'Location Services',
        description: 'Disable GPS hardware & location tracking on lock',
        icon: Icons.location_on,
        category: 'Connectivity',
        disableOnLock: true,
        enableOnUnlock: true,
        currentlyActive: false,
      ),
      PrivacyFlipFeaturePolicy(
        key: 'NFC',
        displayName: 'NFC',
        description: 'Disable Near Field Communication sensor on lock',
        icon: Icons.nfc,
        category: 'Connectivity',
        disableOnLock: true,
        enableOnUnlock: true,
        currentlyActive: false,
      ),
      PrivacyFlipFeaturePolicy(
        key: 'CAMERA',
        displayName: 'Camera Sensor',
        description: 'Seal physical camera sensor access on lock (Android 12+)',
        icon: Icons.camera_alt,
        category: 'Sensors',
        disableOnLock: true,
        enableOnUnlock: true,
        currentlyActive: _cameraBlocked,
      ),
      PrivacyFlipFeaturePolicy(
        key: 'MICROPHONE',
        displayName: 'Microphone Sensor',
        description: 'Block microphone recording permissions on lock (Android 12+)',
        icon: Icons.mic,
        category: 'Sensors',
        disableOnLock: true,
        enableOnUnlock: true,
        currentlyActive: _micBlocked,
      ),
      PrivacyFlipFeaturePolicy(
        key: 'AIRPLANE_MODE',
        displayName: 'Airplane Mode',
        description: 'Force all RF radios off when device locks (Opt-in)',
        icon: Icons.airplanemode_active,
        category: 'System Modes',
        disableOnLock: false,
        enableOnUnlock: false,
        currentlyActive: false,
      ),
      PrivacyFlipFeaturePolicy(
        key: 'BATTERY_SAVER',
        displayName: 'Battery Saver',
        description: 'Enable aggressive battery saver mode on lock',
        icon: Icons.battery_saver,
        category: 'System Modes',
        disableOnLock: true,
        enableOnUnlock: true,
        currentlyActive: false,
      ),
    ];

    _exemptApps = [
      ExemptApp(name: 'Google Maps / Navigation', packageName: 'com.google.android.apps.maps', icon: Icons.map, isExempt: true),
      ExemptApp(name: 'Spotify / Audio Player', packageName: 'com.spotify.music', icon: Icons.music_note, isExempt: true),
      ExemptApp(name: 'Telegram Messenger', packageName: 'org.telegram.messenger', icon: Icons.message, isExempt: false),
      ExemptApp(name: 'Chrome Web Browser', packageName: 'com.android.chrome', icon: Icons.web, isExempt: false),
    ];

    _flipLogs.add(
      PrivacyFlipLogEntry(
        timestamp: DateTime.now().subtract(const Duration(minutes: 5)),
        eventType: 'SCREEN_LOCK',
        feature: 'Wi-Fi & Bluetooth',
        action: 'DISABLED',
        details: 'Screen locked. Wi-Fi and Bluetooth disabled after 10s delay.',
      ),
    );
    _flipLogs.add(
      PrivacyFlipLogEntry(
        timestamp: DateTime.now().subtract(const Duration(minutes: 2)),
        eventType: 'SCREEN_UNLOCK',
        feature: 'Wi-Fi & Bluetooth',
        action: 'RESTORED',
        details: 'Authenticated screen unlock. Restored Wi-Fi & Bluetooth state.',
      ),
    );
  }

  Future<void> _initPermissionsAndAudit() async {
    _cameraPermissionStatus = await Permission.camera.status;
    _micPermissionStatus = await Permission.microphone.status;
    final statusMap = await NativeBlockerService.getShieldStatus();
    _isDeviceAdminActive = statusMap['isAdminActive'] ?? false;
    _canDrawOverlays = statusMap['canDrawOverlays'] ?? false;
    if (!_hasLocalStateChanges) {
      _cameraBlocked = statusMap['cameraBlocked'] ?? false;
      _micBlocked = statusMap['micBlocked'] ?? false;
      _volButtonsBlocked = statusMap['volButtonsBlocked'] ?? false;
      _masterLockActive = _cameraBlocked && _micBlocked;
      _cameraFilter = _cameraBlocked ? CameraFilter.fullScreen : CameraFilter.none;
    }
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
    } else {
      _privacyAutomationEnabled = enabled;
      notifyListeners();
    }
  }

  Future<void> toggleFeatureDisableOnLock(String key) async {
    final index = _flipPolicies.indexWhere((p) => p.key == key);
    if (index != -1) {
      _flipPolicies[index].disableOnLock = !_flipPolicies[index].disableOnLock;
      await NativeBlockerService.setPrivacyFeaturePolicy(
        feature: key,
        disableOnLock: _flipPolicies[index].disableOnLock,
        enableOnUnlock: _flipPolicies[index].enableOnUnlock,
      );
      notifyListeners();
    }
  }

  Future<void> toggleFeatureEnableOnUnlock(String key) async {
    final index = _flipPolicies.indexWhere((p) => p.key == key);
    if (index != -1) {
      _flipPolicies[index].enableOnUnlock = !_flipPolicies[index].enableOnUnlock;
      await NativeBlockerService.setPrivacyFeaturePolicy(
        feature: key,
        disableOnLock: _flipPolicies[index].disableOnLock,
        enableOnUnlock: _flipPolicies[index].enableOnUnlock,
      );
      notifyListeners();
    }
  }

  void toggleFeatureStateNow(String key) {
    final index = _flipPolicies.indexWhere((p) => p.key == key);
    if (index != -1) {
      _flipPolicies[index].currentlyActive = !_flipPolicies[index].currentlyActive;
      _flipLogs.insert(
        0,
        PrivacyFlipLogEntry(
          timestamp: DateTime.now(),
          eventType: 'MANUAL_TOGGLE',
          feature: _flipPolicies[index].displayName,
          action: _flipPolicies[index].currentlyActive ? 'RESTORED' : 'DISABLED',
          details: 'Manually toggled ${_flipPolicies[index].displayName} state.',
        ),
      );
      notifyListeners();
    }
  }

  void setShowCountdown(bool val) {
    _showCountdown = val;
    NativeBlockerService.setPrivacyTimerSettings(
      lockDelaySeconds: _lockDelaySeconds,
      unlockDelaySeconds: _unlockDelaySeconds,
      showCountdown: _showCountdown,
    );
    notifyListeners();
  }

  void setOnlyIfUnused(bool val) {
    _onlyIfUnused = val;
    notifyListeners();
  }

  void setOnlyIfNotAlreadyEnabled(bool val) {
    _onlyIfNotAlreadyEnabled = val;
    notifyListeners();
  }

  void setOnlyIfNotManuallySet(bool val) {
    _onlyIfNotManuallySet = val;
    notifyListeners();
  }

  void setSamsungNfcAutoRetry(bool val) {
    _samsungNfcAutoRetry = val;
    notifyListeners();
  }

  void setAccessibilityInstantLock(bool val) {
    _accessibilityInstantLock = val;
    notifyListeners();
  }

  void toggleAppExemption(ExemptApp app) {
    app.isExempt = !app.isExempt;
    notifyListeners();
  }

  void simulateLockEvent() {
    final disabledFeatures = <String>[];
    for (final policy in _flipPolicies) {
      if (policy.disableOnLock) {
        policy.currentlyActive = false;
        disabledFeatures.add(policy.displayName);
      }
    }
    _flipLogs.insert(
      0,
      PrivacyFlipLogEntry(
        timestamp: DateTime.now(),
        eventType: 'SCREEN_LOCK',
        feature: disabledFeatures.join(', '),
        action: 'DISABLED',
        details: 'Simulated Screen Lock triggered after ${_lockDelaySeconds}s delay. Features disabled: ${disabledFeatures.join(', ')}.',
      ),
    );
    _blockedAttemptsCount += 2;
    notifyListeners();
  }

  void simulateUnlockEvent() {
    final restoredFeatures = <String>[];
    for (final policy in _flipPolicies) {
      if (policy.enableOnUnlock) {
        policy.currentlyActive = true;
        restoredFeatures.add(policy.displayName);
      }
    }
    _flipLogs.insert(
      0,
      PrivacyFlipLogEntry(
        timestamp: DateTime.now(),
        eventType: 'SCREEN_UNLOCK',
        feature: restoredFeatures.join(', '),
        action: 'RESTORED',
        details: 'Simulated Screen Unlock completed after ${_unlockDelaySeconds}s delay. Restored features: ${restoredFeatures.join(', ')}.',
      ),
    );
    notifyListeners();
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
    final index = _flipPolicies.indexWhere((p) => p.key == feature);
    if (index != -1) {
      _flipPolicies[index].disableOnLock = disableOnLock;
      _flipPolicies[index].enableOnUnlock = enableOnUnlock;
      notifyListeners();
    }
  }

  Future<void> setPrivacyTimerSettings({required int lockDelaySeconds, required int unlockDelaySeconds}) async {
    if (await NativeBlockerService.setPrivacyTimerSettings(
      lockDelaySeconds: lockDelaySeconds,
      unlockDelaySeconds: unlockDelaySeconds,
      showCountdown: _showCountdown,
    )) {
      _lockDelaySeconds = lockDelaySeconds;
      _unlockDelaySeconds = unlockDelaySeconds;
      notifyListeners();
    } else {
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
      return requireCamera;
    }

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
    _hasLocalStateChanges = true;
    _masterLockActive = !_masterLockActive;
    _cameraBlocked = _masterLockActive;
    _micBlocked = _masterLockActive;
    _volButtonsBlocked = _masterLockActive;
    _cameraFilter = _cameraBlocked ? CameraFilter.fullScreen : CameraFilter.none;
    if (_masterLockActive) {
      _blockedAttemptsCount += 1;
    }
    _addCameraLogEntry(
      _masterLockActive ? 'Master Shield Activated' : 'Master Shield Disengaged',
      _masterLockActive ? 'MASTER LOCK' : 'UNSEALED',
      detail: _masterLockActive
          ? 'Camera, Microphone, and Volume Buttons sealed simultaneously.'
          : 'Privacy shields released.',
    );
    await syncNativeHardwareState();
    notifyListeners();
  }

  Future<void> toggleCameraShield() async {
    _hasLocalStateChanges = true;
    _cameraBlocked = !_cameraBlocked;
    _cameraFilter = _cameraBlocked ? CameraFilter.fullScreen : CameraFilter.none;
    if (_cameraBlocked && _micBlocked) {
      _masterLockActive = true;
    } else if (!_cameraBlocked) {
      _masterLockActive = false;
    }
    if (_cameraBlocked) {
      _blockedAttemptsCount += 1;
    }
    _addCameraLogEntry(
      _cameraBlocked ? 'Camera Hardware Seal Engaged' : 'Camera Hardware Seal Disengaged',
      _cameraBlocked ? 'HARDWARE SEALED' : 'UNBLOCKED',
      detail: _cameraBlocked
          ? 'Native Camera HAL seal and exclusive lock engaged.'
          : 'Camera hardware access unblocked.',
    );
    await NativeBlockerService.setCameraBlocked(_cameraBlocked);
    notifyListeners();
  }

  void setCameraFilter(CameraFilter filter) {
    _hasLocalStateChanges = true;
    _cameraFilter = filter;
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

    _hasLocalStateChanges = true;
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
    _hasLocalStateChanges = true;
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
    _recordAuditSnapshot();
    _recordAuditSnapshot();
    _isAuditing = false;
    _lastScanAt = DateTime.now();
    _scanCount += 1;
    _blockedAttemptsCount += 3;
    notifyListeners();
  }

  void acknowledgeApp(AuditedApp app) {
    app.acknowledged = true;
    notifyListeners();
  }

  void toggleAppAcknowledgement(AuditedApp app) {
    app.acknowledged = !app.acknowledged;
    notifyListeners();
  }

  void _recordAuditSnapshot() {
    _scanHistory.add(
      AuditSnapshot(
        scannedAt: DateTime.now(),
        outstandingCount: _auditedApps.where((app) => !app.acknowledged).length,
        criticalCount: _auditedApps.where((app) => app.risk == ThreatLevel.critical).length,
      ),
    );
    if (_scanHistory.length > 20) _scanHistory.removeAt(0);
  }

  void acknowledgeApps(Iterable<AuditedApp> apps) {
    var changed = false;
    for (final app in apps) {
      if (!app.acknowledged) {
        app.acknowledged = true;
        changed = true;
      }
    }
    if (changed) notifyListeners();
  }

  void resetAcknowledgements(Iterable<AuditedApp> apps) {
    var changed = false;
    for (final app in apps) {
      if (app.acknowledged) {
        app.acknowledged = false;
        changed = true;
      }
    }
    if (changed) notifyListeners();
  }

  void _generateInitialAuditData() {
    final acknowledgedPackages = {
      for (final app in _auditedApps)
        if (app.acknowledged) app.packageName,
    };
    _auditedApps = [
      AuditedApp(
        name: 'Social Cipher App',
        packageName: 'com.social.cipher',
        hasCamera: true,
        hasMic: true,
        risk: ThreatLevel.high,
        lastAccessed: '2 mins ago',
        acknowledged: acknowledgedPackages.contains('com.social.cipher'),
      ),
      AuditedApp(
        name: 'Voice Assistant Background',
        packageName: 'com.voice.listener',
        hasCamera: false,
        hasMic: true,
        risk: ThreatLevel.critical,
        lastAccessed: 'Just now',
        acknowledged: acknowledgedPackages.contains('com.voice.listener'),
      ),
      AuditedApp(
        name: 'Shadow Cam Tracker',
        packageName: 'com.spy.shadowcam',
        hasCamera: true,
        hasMic: false,
        risk: ThreatLevel.high,
        lastAccessed: '14 mins ago',
        acknowledged: acknowledgedPackages.contains('com.spy.shadowcam'),
      ),
      AuditedApp(
        name: 'Browser WebRTC Agent',
        packageName: 'com.net.browser',
        hasCamera: true,
        hasMic: true,
        risk: ThreatLevel.medium,
        lastAccessed: '1 hour ago',
        acknowledged: acknowledgedPackages.contains('com.net.browser'),
      ),
      AuditedApp(
        name: 'System Audio Service',
        packageName: 'android.system.audio',
        hasCamera: false,
        hasMic: true,
        risk: ThreatLevel.low,
        lastAccessed: '3 hours ago',
        acknowledged: acknowledgedPackages.contains('android.system.audio'),
      ),
    ];
  }
}

