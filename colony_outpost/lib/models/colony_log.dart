import 'package:flutter/material.dart';
import '../theme/colony_theme.dart';

enum LogSeverity {
  info,
  success,
  warning,
  danger,
}

class ColonyLogEntry {
  final String id;
  final String solTimestamp;
  final String title;
  final String message;
  final LogSeverity severity;
  final IconData icon;

  ColonyLogEntry({
    required this.id,
    required this.solTimestamp,
    required this.title,
    required this.message,
    required this.severity,
    this.icon = Icons.info_outline,
  });

  Color get color {
    switch (severity) {
      case LogSeverity.info:
        return ColonyTheme.neonCyan;
      case LogSeverity.success:
        return ColonyTheme.bioEmerald;
      case LogSeverity.warning:
        return ColonyTheme.laserAmber;
      case LogSeverity.danger:
        return ColonyTheme.alertCrimson;
    }
  }
}
