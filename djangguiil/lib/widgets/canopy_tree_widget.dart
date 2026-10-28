import 'package:flutter/material.dart';
import '../services/jungle_state.dart';
import '../theme/jungle_theme.dart';

class CanopyTreeWidget extends StatelessWidget {
  final JungleState state;

  const CanopyTreeWidget({
    super.key,
    required this.state,
  });

  @override
  Widget build(BuildContext context) {
    final progress = state.treeProgressPercentage;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: JungleColors.deepCanopy,
        borderRadius: BorderRadius.circular(28),
        border: Border.all(
          color: JungleColors.foliageBorder,
          width: 1.2,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.35),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header info
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: JungleColors.emerald.withOpacity(0.18),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.park_rounded,
                  color: JungleColors.neonJade,
                  size: 22,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'SACRED CEIBA SANCTUARY',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 1.2,
                        color: JungleColors.textMuted.withOpacity(0.85),
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      state.treeStageName,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: JungleColors.textPrimary,
                      ),
                    ),
                  ],
                ),
              ),
              // Vitality Score
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    '${state.vitalityXP} / 1000',
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w800,
                      color: JungleColors.sunAmber,
                    ),
                  ),
                  const Text(
                    'Sanctuary Vitality',
                    style: TextStyle(
                      fontSize: 10,
                      color: JungleColors.textSubtle,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 18),

          // Progress Bar
          ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: Stack(
              children: [
                Container(
                  height: 12,
                  color: JungleColors.abyss,
                ),
                FractionallySizedBox(
                  widthFactor: progress,
                  child: Container(
                    height: 12,
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          JungleColors.emerald,
                          JungleColors.neonJade,
                          JungleColors.sunAmber,
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),

          // Action row
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () {
                    state.nourishSanctuary();
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        behavior: SnackBarBehavior.floating,
                        backgroundColor: JungleColors.foliageSurface,
                        duration: const Duration(seconds: 1),
                        content: Row(
                          children: const [
                            Icon(Icons.water_drop_rounded, color: JungleColors.azureLagoon, size: 18),
                            SizedBox(width: 8),
                            Text(
                              '💧 Nourished Ceiba Tree (+25 Vitality XP)',
                              style: TextStyle(color: JungleColors.textPrimary),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                  icon: const Icon(Icons.water_drop_rounded, color: JungleColors.azureLagoon, size: 18),
                  label: const Text('Nourish Tree (+25 XP)'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: JungleColors.textPrimary,
                    side: const BorderSide(color: JungleColors.foliageBorder),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              OutlinedButton.icon(
                onPressed: () {
                  state.triggerBirdChirp();
                },
                icon: const Icon(Icons.music_note_rounded, color: JungleColors.sunAmber, size: 18),
                label: const Text('Chirp'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: JungleColors.textPrimary,
                  side: const BorderSide(color: JungleColors.foliageBorder),
                  padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
