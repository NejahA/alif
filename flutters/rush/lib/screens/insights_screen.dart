import 'package:flutter/material.dart';
import '../services/hive_controller.dart';

/// Shows analytics about the meadow.
class InsightsScreen extends StatelessWidget {
  final HiveController controller;
  const InsightsScreen({super.key, required this.controller});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFDF6E3),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        foregroundColor: const Color(0xFF5D4037),
        title: const Text(
          'Insights',
          style: TextStyle(color: Color(0xFF5D4037)),
        ),
      ),
      body: AnimatedBuilder(
        animation: controller,
        builder: (context, _) {
          final blooms = controller.blooms;
          final hub = controller.queenHub;
          final avgNectar = controller.averageNectar;
          final tag = controller.dominantTag;
          final lonely = controller.unvisitedBlooms;
          final honey = controller.totalHoney;

          return ListView(
            padding: const EdgeInsets.all(20),
            children: [
              _statCard(
                icon: Icons.local_florist,
                color: const Color(0xFFE91E63),
                label: 'Blooms',
                value: '${blooms.length}',
                sub: 'flowers in your meadow',
              ),
              const SizedBox(height: 12),
              _statCard(
                icon: Icons.flight_takeoff,
                color: const Color(0xFFFFB300),
                label: 'Flight paths',
                value: '${controller.paths.length}',
                sub: 'connections between blooms',
              ),
              const SizedBox(height: 12),
              _statCard(
                icon: Icons.opacity,
                color: const Color(0xFFFFC107),
                label: 'Honey',
                value: honey.toStringAsFixed(1),
                sub: 'total strength of the hive',
              ),
              const SizedBox(height: 12),
              _statCard(
                icon: Icons.water_drop,
                color: const Color(0xFF66BB6A),
                label: 'Average nectar',
                value: avgNectar.toStringAsFixed(1),
                sub: 'out of 5',
              ),
              const SizedBox(height: 24),
              if (hub != null) ...[
                _insightTile(
                  icon: Icons.emoji_nature,
                  color: const Color(0xFFFFB300),
                  title: 'Queen bloom',
                  body:
                      '"${hub.title}" is your most-connected bloom. It anchors '
                      '${controller.pathsFor(hub.id).length} flight paths.',
                ),
                const SizedBox(height: 12),
              ],
              if (tag != null) ...[
                _insightTile(
                  icon: Icons.tag,
                  color: const Color(0xFF66BB6A),
                  title: 'Dominant theme',
                  body: 'The tag "$tag" appears most often across your blooms.',
                ),
                const SizedBox(height: 12),
              ],
              if (lonely.isNotEmpty) ...[
                _insightTile(
                  icon: Icons.local_florist_outlined,
                  color: const Color(0xFFAED581),
                  title: 'Unvisited blooms',
                  body: '${lonely.length} bloom(s) have no flight paths yet: '
                      '${lonely.take(3).map((b) => b.title).join(', ')}'
                      '${lonely.length > 3 ? '…' : ''}',
                ),
                const SizedBox(height: 12),
              ],
              _insightTile(
                icon: Icons.lightbulb_outline,
                color: const Color(0xFFFFC107),
                title: 'Tip',
                body: 'Long-press a bloom then tap another to draw a flight path. '
                    'Drag blooms to shape your meadow.',
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _statCard({
    required IconData icon,
    required Color color,
    required String label,
    required String value,
    required String sub,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.7),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0x338D6E63)),
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: color.withValues(alpha: 0.2),
            ),
            child: Icon(icon, color: color),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  value,
                  style: const TextStyle(
                    color: Color(0xFF3E2723),
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  label,
                  style: const TextStyle(
                    color: Color(0xFF5D4037),
                    fontSize: 14,
                  ),
                ),
                Text(
                  sub,
                  style: TextStyle(
                    color: const Color(0xFF8D6E63).withValues(alpha: 0.8),
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _insightTile({
    required IconData icon,
    required Color color,
    required String title,
    required String body,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.5),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withValues(alpha: 0.5)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 28),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    color: Color(0xFF3E2723),
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  body,
                  style: const TextStyle(
                    color: Color(0xFF5D4037),
                    fontSize: 13,
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}