import 'package:flutter/material.dart';

import '../services/garden_service.dart';
import '../theme/hiro_theme.dart';

class PomodoroDialog extends StatelessWidget {
  final GardenService service;

  const PomodoroDialog({super.key, required this.service});

  @override
  Widget build(BuildContext context) {
    final pom = service.pomodoro;
    final boundSyn = pom.boundSynapseId != null
        ? service.findSynapseById(pom.boundSynapseId!)
        : null;

    return Dialog(
      backgroundColor: HiroColors.surfaceElevated,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(24),
        side: const BorderSide(color: HiroColors.crimsonFlare, width: 1.2),
      ),
      child: Container(
        constraints: const BoxConstraints(maxWidth: 380),
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Header
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: HiroColors.crimsonFlare.withOpacity(0.18),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Text('⏱', style: TextStyle(fontSize: 20)),
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'FOCUS TIMER',
                      style: TextStyle(
                        color: HiroColors.crimsonFlare,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.2,
                      ),
                    ),
                    Text(
                      boundSyn != null
                          ? 'Bound: ${boundSyn.title}'
                          : 'No synapse bound',
                      style: const TextStyle(
                        color: HiroColors.textSecondary,
                        fontSize: 13,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
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
            const SizedBox(height: 24),

            // Circular Timer
            Stack(
              alignment: Alignment.center,
              children: [
                SizedBox(
                  width: 180,
                  height: 180,
                  child: CircularProgressIndicator(
                    value: pom.progressRatio,
                    strokeWidth: 8,
                    backgroundColor: HiroColors.surface,
                    valueColor: AlwaysStoppedAnimation<Color>(
                      pom.mode == 'work' ? HiroColors.crimsonFlare : HiroColors.neuralEmerald,
                    ),
                  ),
                ),
                Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      pom.formattedTime,
                      style: const TextStyle(
                        fontSize: 42,
                        fontWeight: FontWeight.w800,
                        color: HiroColors.textPrimary,
                        letterSpacing: 2.0,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      pom.mode.toUpperCase(),
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.5,
                        color: pom.mode == 'work'
                            ? HiroColors.crimsonFlare
                            : HiroColors.neuralEmerald,
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Mode switcher
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                ChoiceChip(
                  label: const Text('Work 25m'),
                  selected: pom.mode == 'work',
                  onSelected: (val) {
                    if (val) service.setPomodoroMode('work');
                  },
                  selectedColor: HiroColors.crimsonFlare.withOpacity(0.25),
                  backgroundColor: HiroColors.surface,
                  labelStyle: TextStyle(
                    color: pom.mode == 'work'
                        ? HiroColors.crimsonFlare
                        : HiroColors.textSecondary,
                    fontWeight: FontWeight.bold,
                  ),
                  side: BorderSide(
                    color: pom.mode == 'work'
                        ? HiroColors.crimsonFlare
                        : HiroColors.borderSubtle,
                  ),
                ),
                const SizedBox(width: 12),
                ChoiceChip(
                  label: const Text('Break 5m'),
                  selected: pom.mode == 'break',
                  onSelected: (val) {
                    if (val) service.setPomodoroMode('break');
                  },
                  selectedColor: HiroColors.neuralEmerald.withOpacity(0.25),
                  backgroundColor: HiroColors.surface,
                  labelStyle: TextStyle(
                    color: pom.mode == 'break'
                        ? HiroColors.neuralEmerald
                        : HiroColors.textSecondary,
                    fontWeight: FontWeight.bold,
                  ),
                  side: BorderSide(
                    color: pom.mode == 'break'
                        ? HiroColors.neuralEmerald
                        : HiroColors.borderSubtle,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Controls (Start/Pause, Reset)
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () {
                      if (pom.isRunning) {
                        service.pausePomodoro();
                      } else {
                        service.startPomodoro();
                      }
                    },
                    icon: Icon(
                      pom.isRunning ? Icons.pause_rounded : Icons.play_arrow_rounded,
                      size: 20,
                    ),
                    label: Text(pom.isRunning ? 'Pause' : 'Start Focus'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: HiroColors.crimsonFlare.withOpacity(0.25),
                      foregroundColor: HiroColors.crimsonFlare,
                      side: const BorderSide(color: HiroColors.crimsonFlare),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                IconButton.filledTonal(
                  onPressed: () => service.resetPomodoro(),
                  icon: const Icon(Icons.refresh_rounded, color: HiroColors.textSecondary),
                  tooltip: 'Reset Timer',
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
