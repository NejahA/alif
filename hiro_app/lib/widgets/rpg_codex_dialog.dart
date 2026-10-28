import 'package:flutter/material.dart';

import '../services/garden_service.dart';
import '../theme/hiro_theme.dart';

class RpgCodexDialog extends StatelessWidget {
  final GardenService service;

  const RpgCodexDialog({super.key, required this.service});

  @override
  Widget build(BuildContext context) {
    final rpg = service.rpg;
    final xpRatio = rpg.maxXp > 0 ? (rpg.xp / rpg.maxXp).clamp(0.0, 1.0) : 0.0;
    final energyRatio = rpg.maxEnergy > 0 ? (rpg.spiritualEnergy / rpg.maxEnergy).clamp(0.0, 1.0) : 0.0;

    return Dialog(
      backgroundColor: HiroColors.surfaceElevated,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(24),
        side: const BorderSide(color: HiroColors.solarAmber, width: 1.2),
      ),
      child: Container(
        constraints: const BoxConstraints(maxWidth: 480),
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Title Row
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: HiroColors.solarAmber.withOpacity(0.18),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Text('⚔️', style: TextStyle(fontSize: 22)),
                ),
                const SizedBox(width: 14),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'SOUL CODEX',
                      style: TextStyle(
                        color: HiroColors.solarAmber,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.2,
                      ),
                    ),
                    Text(
                      'Reincarnation Level ${rpg.level}',
                      style: const TextStyle(
                        color: HiroColors.textPrimary,
                        fontSize: 20,
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

            // Stats 2x2 Grid
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              mainAxisSpacing: 10,
              crossAxisSpacing: 10,
              childAspectRatio: 2.2,
              children: [
                _buildStatBox(
                  'Spiritual Energy',
                  '${rpg.spiritualEnergy} ✨',
                  HiroColors.solarAmber,
                ),
                _buildStatBox(
                  'Harvested Souls',
                  '${rpg.harvestedSouls} 👻',
                  HiroColors.hotPink,
                ),
                _buildStatBox(
                  'Karma Balance',
                  '${rpg.karmaBalance} ⚖️',
                  HiroColors.neuralEmerald,
                ),
                _buildStatBox(
                  'Rank Title',
                  rpg.rankTitle,
                  HiroColors.astralViolet,
                ),
              ],
            ),
            const SizedBox(height: 18),

            // Energy Bar
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Astral Energy Reserve',
                  style: TextStyle(fontSize: 12, color: HiroColors.textSecondary),
                ),
                Text(
                  '${rpg.spiritualEnergy} / ${rpg.maxEnergy}',
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: HiroColors.solarAmber,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            ClipRRect(
              borderRadius: BorderRadius.circular(6),
              child: LinearProgressIndicator(
                value: energyRatio,
                backgroundColor: HiroColors.surface,
                valueColor: const AlwaysStoppedAnimation<Color>(HiroColors.solarAmber),
                minHeight: 7,
              ),
            ),
            const SizedBox(height: 16),

            // XP Progress Bar
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Level Progress',
                  style: TextStyle(fontSize: 12, color: HiroColors.textSecondary),
                ),
                Text(
                  '${rpg.xp} / ${rpg.maxXp} XP',
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: HiroColors.neonCyan,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            ClipRRect(
              borderRadius: BorderRadius.circular(6),
              child: LinearProgressIndicator(
                value: xpRatio,
                backgroundColor: HiroColors.surface,
                valueColor: const AlwaysStoppedAnimation<Color>(HiroColors.neonCyan),
                minHeight: 7,
              ),
            ),
            const SizedBox(height: 20),

            // Equipped Relics
            const Text(
              'EQUIPPED RELICS & BUFFS',
              style: TextStyle(
                color: HiroColors.textMuted,
                fontSize: 11,
                fontWeight: FontWeight.bold,
                letterSpacing: 0.8,
              ),
            ),
            const SizedBox(height: 8),
            Column(
              children: rpg.equippedRelics.map((relic) {
                return Container(
                  margin: const EdgeInsets.only(bottom: 6),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: HiroColors.surface,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: HiroColors.borderSubtle),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.check_circle_rounded, size: 14, color: HiroColors.neuralEmerald),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          relic,
                          style: const TextStyle(fontSize: 12, color: HiroColors.textPrimary),
                        ),
                      ),
                    ],
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 20),

            // Action Buttons
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: rpg.spiritualEnergy >= 25
                        ? () {
                            service.performSeance();
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('✨ Séance Performed! Karma & Souls Ascended!'),
                                backgroundColor: HiroColors.surfaceElevated,
                                duration: Duration(seconds: 2),
                              ),
                            );
                          }
                        : null,
                    icon: const Icon(Icons.auto_awesome_rounded, size: 18),
                    label: const Text('Séance (-25 ✨)'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: HiroColors.solarAmber.withOpacity(0.2),
                      foregroundColor: HiroColors.solarAmber,
                      side: const BorderSide(color: HiroColors.solarAmber),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                TextButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: const Text('Close', style: TextStyle(color: HiroColors.textSecondary)),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatBox(String title, String val, Color color) {
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
          Text(
            title,
            style: const TextStyle(fontSize: 10, color: HiroColors.textMuted),
          ),
          const SizedBox(height: 2),
          Text(
            val,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: color,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}
