import 'package:flutter/material.dart';
import 'package:usage_stats/usage_stats.dart';
import '../services/usage_service.dart';

class UsageProvider extends ChangeNotifier {
  List<UsageInfo> _usageStats = [];
  bool _isPermissionGranted = false;
  bool _isLoading = false;

  List<UsageInfo> get usageStats => _usageStats;
  bool get isPermissionGranted => _isPermissionGranted;
  bool get isLoading => _isLoading;

  UsageProvider() {
    init();
  }

  Future<void> init() async {
    _isPermissionGranted = await UsageService.checkPermission();
    if (_isPermissionGranted) {
      await refreshUsage();
    }
    notifyListeners();
  }

  Future<void> requestPermission() async {
    await UsageService.grantPermission();
    _isPermissionGranted = await UsageService.checkPermission();
    if (_isPermissionGranted) {
      await refreshUsage();
    }
    notifyListeners();
  }

  Future<void> refreshUsage() async {
    _isLoading = true;
    notifyListeners();

    DateTime endDate = DateTime.now();
    DateTime startDate = DateTime(endDate.year, endDate.month, endDate.day, 0, 0, 0);

    List<UsageInfo> stats = await UsageService.getUsageStats(startDate, endDate);
    
    // Sort by time spent
    stats.sort((a, b) => int.parse(b.totalTimeInForeground ?? '0')
        .compareTo(int.parse(a.totalTimeInForeground ?? '0')));
    
    // Filter out 0 time
    _usageStats = stats.where((info) => int.parse(info.totalTimeInForeground ?? '0') > 0).toList();

    _isLoading = false;
    notifyListeners();
  }

  double getTotalTimeInMinutes() {
    int totalMs = 0;
    for (var info in _usageStats) {
      totalMs += int.parse(info.totalTimeInForeground ?? '0');
    }
    return totalMs / (1000 * 60);
  }
}
