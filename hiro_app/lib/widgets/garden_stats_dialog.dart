import 'package:flutter/material.dart';

import '../services/garden_service.dart';
import '../theme/hiro_theme.dart';
import 'hiro_logo.dart';

class GardenStatsDialog extends StatelessWidget {
  final GardenService service;

  const GardenStatsDialog({super.key, required this.service});

  @override
  Widget build(BuildContext context) {
    final syns = service.synapses;
    final conns = service.connections;

    final totalSynapses = syns.length;
    final totalConnections = conns.length;
    final starredCount = syns.where((s) => s.starred).length;
    final completedTasks = syns.where((s) => s.isCompleted).length;

    final avgCharge = totalSynapses > 0
        ? (syns.map((s) => s.charge).reduce((a, b) => a + b) / totalSynapses)
        : 0.0;

    final maxPossibleEdges = totalSynapses > 1
        ? (totalSynapses * (totalSynapses - 1)) / 2
        : 1;
    final density = totalSynapses > 1
        ? (totalConnections / maxPossibleEdges) * 100
        : 0.0;

    return Dialog(
      backgroundColor: HiroColors.surfaceElevated,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(24),
        side: const BorderSide(color: HiroColors.neonCyan, width: 1.2),
      ),
      child: Container(
        constraints: const BoxConstraints(maxWidth: 400),
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Center(
              child: Padding(
                padding: EdgeInsets.only(bottom: 16),
                child: HiroLogo(
                  size: HiroLogoSize.medium,
                  showTagline: true,
                ),
              ),
            ),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: HiroColors.neonCyan.withOpacity(0.18),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Text('📊', style: TextStyle(fontSize: 20)),
                ),
                const SizedBox(width: 12),
                const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'GARDEN METRICS',
                      style: TextStyle(
                        color: HiroColors.neonCyan,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.2,
                      ),
                    ),
                    Text(
                      'Neural Garden Statistics',
                      style: TextStyle(
                        color: HiroColors.textPrimary,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const Spacer(),
                IconButton(
                  onPressed: () => Navigator.of(context).pop(),
                  icon: const Icon(Icons.close_rounded, color: HiroColors.textMuted),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Metrics Grid
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              mainAxisSpacing: 10,
              crossAxisSpacing: 10,
              childAspectRatio: 2.2,
              children: [
                _buildMetricBox('Total Synapses', '$totalSynapses', HiroColors.neonCyan),
                _buildMetricBox('Axon Connections', '$totalConnections', HiroColors.electricTeal),
                _buildMetricBox('Network Density', '${density.toStringAsFixed(1)}%', HiroColors.astralViolet),
                _buildMetricBox('Avg Vitality Charge', '${(avgCharge * 100).round()}%', HiroColors.neuralEmerald),
                _buildMetricBox('Starred Synapses', '$starredCount ⭐', HiroColors.solarAmber),
                _buildMetricBox('Completed Tasks', '$completedTasks ✅', HiroColors.neuralEmerald),
              ],
            ),
            const SizedBox(height: 20),

            Center(
              child: TextButton(
                onPressed: () => Navigator.of(context).pop(),
                child: const Text('Close', style: TextStyle(color: HiroColors.textSecondary)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMetricBox(String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: HiroColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: HiroColors.borderSubtle),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(label, style: const TextStyle(fontSize: 10, color: HiroColors.textMuted)),
          const SizedBox(height: 2),
          Text(
            value,
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}
