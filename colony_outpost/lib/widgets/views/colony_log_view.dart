import 'package:flutter/material.dart';
import '../../theme/colony_theme.dart';
import '../../state/colony_state.dart';
import '../../models/colony_log.dart';

class ColonyLogView extends StatefulWidget {
  final ColonyState state;

  const ColonyLogView({super.key, required this.state});

  @override
  State<ColonyLogView> createState() => _ColonyLogViewState();
}

class _ColonyLogViewState extends State<ColonyLogView> {
  LogSeverity? _filterSeverity;

  @override
  Widget build(BuildContext context) {
    final filteredLogs = _filterSeverity == null
        ? widget.state.logs
        : widget.state.logs.where((l) => l.severity == _filterSeverity).toList();

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 8.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header & Filter Chips
          Row(
            children: [
              const Icon(Icons.receipt_long, size: 16, color: ColonyTheme.neonCyan),
              const SizedBox(width: 8),
              const Text(
                'COLONY TELEMETRY LOGS',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 1.1,
                  color: ColonyTheme.neonCyan,
                ),
              ),
              const Spacer(),
              Text(
                '${filteredLogs.length} ENTRIES',
                style: const TextStyle(fontSize: 10, color: ColonyTheme.textMuted),
              ),
            ],
          ),
          const SizedBox(height: 8),

          // Severity Filter Row
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _buildFilterChip(null, 'ALL'),
                const SizedBox(width: 6),
                _buildFilterChip(LogSeverity.danger, 'ALERTS', color: ColonyTheme.alertCrimson),
                const SizedBox(width: 6),
                _buildFilterChip(LogSeverity.warning, 'WARNINGS', color: ColonyTheme.laserAmber),
                const SizedBox(width: 6),
                _buildFilterChip(LogSeverity.success, 'EVENTS', color: ColonyTheme.bioEmerald),
                const SizedBox(width: 6),
                _buildFilterChip(LogSeverity.info, 'COMMUNICATIONS', color: ColonyTheme.neonCyan),
              ],
            ),
          ),
          const SizedBox(height: 10),

          // Log List
          Expanded(
            child: filteredLogs.isEmpty
                ? const Center(
                    child: Text(
                      'No logs matching current filter.',
                      style: TextStyle(color: ColonyTheme.textMuted, fontSize: 12),
                    ),
                  )
                : ListView.separated(
                    physics: const BouncingScrollPhysics(),
                    itemCount: filteredLogs.length,
                    separatorBuilder: (context, index) => const SizedBox(height: 6),
                    itemBuilder: (context, index) {
                      final entry = filteredLogs[index];
                      return Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: ColonyTheme.cardBg,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: entry.color.withValues(alpha: 0.35),
                          ),
                        ),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              padding: const EdgeInsets.all(6),
                              decoration: BoxDecoration(
                                color: entry.color.withValues(alpha: 0.15),
                                shape: BoxShape.circle,
                              ),
                              child: Icon(entry.icon, size: 14, color: entry.color),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        entry.title,
                                        style: TextStyle(
                                          fontSize: 11,
                                          fontWeight: FontWeight.bold,
                                          color: entry.color,
                                          letterSpacing: 0.5,
                                        ),
                                      ),
                                      Text(
                                        entry.solTimestamp,
                                        style: const TextStyle(
                                          fontSize: 9,
                                          color: ColonyTheme.textMuted,
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    entry.message,
                                    style: const TextStyle(
                                      fontSize: 11,
                                      color: ColonyTheme.textBright,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(LogSeverity? severity, String label, {Color? color}) {
    final bool isSelected = _filterSeverity == severity;
    final chipColor = color ?? ColonyTheme.neonCyan;

    return InkWell(
      onTap: () {
        setState(() {
          _filterSeverity = severity;
        });
      },
      borderRadius: BorderRadius.circular(6),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: isSelected ? chipColor.withValues(alpha: 0.25) : ColonyTheme.cardBg,
          borderRadius: BorderRadius.circular(6),
          border: Border.all(
            color: isSelected ? chipColor : ColonyTheme.borderGlow,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 9,
            fontWeight: FontWeight.bold,
            color: isSelected ? chipColor : ColonyTheme.textMuted,
          ),
        ),
      ),
    );
  }
}
