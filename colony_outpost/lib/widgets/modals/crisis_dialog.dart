import 'package:flutter/material.dart';
import '../../theme/colony_theme.dart';
import '../../state/colony_state.dart';
import '../../models/crisis_event.dart';

class CrisisDialog extends StatelessWidget {
  final ColonyState state;
  final CrisisEvent crisis;

  const CrisisDialog({
    super.key,
    required this.state,
    required this.crisis,
  });

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: ColonyTheme.darkSlate,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: crisis.urgencyColor, width: 2),
      ),
      child: Container(
        constraints: const BoxConstraints(maxWidth: 480),
        padding: const EdgeInsets.all(18),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Emergency Banner
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: crisis.urgencyColor.withValues(alpha: 0.2),
                    shape: BoxShape.circle,
                    border: Border.all(color: crisis.urgencyColor),
                  ),
                  child: Icon(crisis.icon, color: crisis.urgencyColor, size: 28),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        crisis.subtitle,
                        style: TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.0,
                          color: crisis.urgencyColor,
                        ),
                      ),
                      Text(
                        crisis.title,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 0.8,
                          color: ColonyTheme.textBright,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            const Divider(color: ColonyTheme.borderGlow, height: 1),
            const SizedBox(height: 14),

            // Narrative Story
            Text(
              crisis.story,
              style: const TextStyle(
                fontSize: 12,
                height: 1.5,
                color: ColonyTheme.textBright,
              ),
            ),
            const SizedBox(height: 16),

            const Text(
              'EXECUTIVE ORDERS (SELECT RESPONSE):',
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.bold,
                letterSpacing: 0.8,
                color: ColonyTheme.textMuted,
              ),
            ),
            const SizedBox(height: 10),

            // Choice Buttons
            ...crisis.choices.map((choice) {
              final bool canAfford = state.canAfford(choice.cost);

              return Padding(
                padding: const EdgeInsets.only(bottom: 8.0),
                child: InkWell(
                  onTap: canAfford
                      ? () {
                          state.resolveCrisis(choice);
                        }
                      : null,
                  borderRadius: BorderRadius.circular(10),
                  child: Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: canAfford ? ColonyTheme.cardBg : ColonyTheme.cardBg.withValues(alpha: 0.4),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                        color: canAfford ? ColonyTheme.neonCyan.withValues(alpha: 0.4) : ColonyTheme.borderGlow,
                      ),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(
                          choice.icon,
                          size: 18,
                          color: canAfford ? ColonyTheme.neonCyan : ColonyTheme.textMuted,
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                choice.label,
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  color: canAfford ? ColonyTheme.textBright : ColonyTheme.textMuted,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                choice.outcomeDescription,
                                style: const TextStyle(fontSize: 10, color: ColonyTheme.textMuted),
                              ),
                              const SizedBox(height: 4),
                              // Cost & Reward tags
                              Wrap(
                                spacing: 8,
                                children: [
                                  ...choice.cost.entries.map((e) {
                                    final res = state.resources[e.key]!;
                                    return Text(
                                      '-${e.value.toInt()} ${res.name}',
                                      style: const TextStyle(
                                        fontSize: 9,
                                        fontWeight: FontWeight.bold,
                                        color: ColonyTheme.alertCrimson,
                                      ),
                                    );
                                  }),
                                  ...choice.reward.entries.map((e) {
                                    final res = state.resources[e.key]!;
                                    return Text(
                                      '+${e.value.toInt()} ${res.name}',
                                      style: const TextStyle(
                                        fontSize: 9,
                                        fontWeight: FontWeight.bold,
                                        color: ColonyTheme.bioEmerald,
                                      ),
                                    );
                                  }),
                                  if (choice.moraleDelta != 0)
                                    Text(
                                      '${choice.moraleDelta > 0 ? "+" : ""}${choice.moraleDelta.toInt()}% Morale',
                                      style: TextStyle(
                                        fontSize: 9,
                                        fontWeight: FontWeight.bold,
                                        color: choice.moraleDelta > 0 ? ColonyTheme.bioEmerald : ColonyTheme.alertCrimson,
                                      ),
                                    ),
                                  if (choice.colonistDelta > 0)
                                    Text(
                                      '+${choice.colonistDelta} Colonists',
                                      style: const TextStyle(
                                        fontSize: 9,
                                        fontWeight: FontWeight.bold,
                                        color: ColonyTheme.bioEmerald,
                                      ),
                                    ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }),
          ],
        ),
      ),
    );
  }
}
