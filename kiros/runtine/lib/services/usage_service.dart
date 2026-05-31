import 'package:usage_stats/usage_stats.dart';
import 'dart:async';
import 'dart:io';

class UsageService {
  static Future<bool> checkPermission() async {
    if (!Platform.isAndroid) return false;
    bool? isPermissionGranted = await UsageStats.checkUsagePermission();
    return isPermissionGranted ?? false;
  }

  static Future<void> grantPermission() async {
    if (!Platform.isAndroid) return;
    await UsageStats.grantUsagePermission();
  }

  static Future<List<UsageInfo>> getUsageStats(DateTime start, DateTime end) async {
    if (!Platform.isAndroid) return [];
    List<UsageInfo> tUsageStats = await UsageStats.queryUsageStats(start, end);
    return tUsageStats;
  }

  static Future<Map<String, UsageInfo>> getUsageStatsByPackage(DateTime start, DateTime end) async {
    if (!Platform.isAndroid) return {};
    List<UsageInfo> stats = await getUsageStats(start, end);
    Map<String, UsageInfo> result = {};
    for (var info in stats) {
      if (int.parse(info.totalTimeInForeground ?? '0') > 0) {
        result[info.packageName!] = info;
      }
    }
    return result;
  }
}
