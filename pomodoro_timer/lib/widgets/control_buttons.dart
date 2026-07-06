import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/pomodoro_timer.dart';

class ControlButtons extends StatelessWidget {
  const ControlButtons({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<PomodoroTimerModel>(
      builder: (context, timer, _) {
        final isRunning = timer.state == TimerState.running;
        final isPaused = timer.state == TimerState.paused;

        return Column(
          children: [
            // Main action row
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Reset button
                _buildIconButton(
                  context,
                  icon: Icons.replay_rounded,
                  onPressed: (isRunning || isPaused) ? timer.reset : null,
                  tooltip: 'Reset',
                ),
                const SizedBox(width: 24),
                // Start/Pause button
                _buildMainButton(
                  context,
                  icon: isRunning ? Icons.pause_rounded : Icons.play_arrow_rounded,
                  label: isRunning ? 'Pause' : (isPaused ? 'Resume' : 'Start'),
                  onPressed: () {
                    if (isRunning) {
                      timer.pause();
                    } else {
                      timer.start();
                    }
                  },
                  color: timer.isWorkSession
                      ? const Color(0xFFE53935)
                      : const Color(0xFF43A047),
                ),
                const SizedBox(width: 24),
                // Skip button
                _buildIconButton(
                  context,
                  icon: Icons.skip_next_rounded,
                  onPressed: (isRunning || isPaused) ? timer.skip : null,
                  tooltip: 'Skip',
                ),
              ],
            ),
            const SizedBox(height: 32),
            // Session counter dots
            Consumer<PomodoroTimerModel>(
              builder: (context, timer, _) {
                return Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(4, (index) {
                    final isCompleted = index < timer.sessionCount % 4;
                    final isCurrentWorkSession = timer.isWorkSession &&
                        index == timer.sessionCount % 4;
                    return Container(
                      width: 10,
                      height: 10,
                      margin: const EdgeInsets.symmetric(horizontal: 4),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: isCompleted
                            ? const Color(0xFFE53935)
                            : isCurrentWorkSession
                                ? Colors.white38
                                : Colors.white10,
                        border: isCurrentWorkSession
                            ? Border.all(color: Colors.white38, width: 2)
                            : null,
                      ),
                    );
                  }),
                );
              },
            ),
          ],
        );
      },
    );
  }

  Widget _buildIconButton(
    BuildContext context, {
    required IconData icon,
    required VoidCallback? onPressed,
    required String tooltip,
  }) {
    return Tooltip(
      message: tooltip,
      child: Material(
        color: Colors.white.withValues(alpha: 0.05),
        shape: const CircleBorder(),
        child: InkWell(
          customBorder: const CircleBorder(),
          onTap: onPressed,
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Icon(
              icon,
              color: onPressed != null ? Colors.white70 : Colors.white24,
              size: 28,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildMainButton(
    BuildContext context, {
    required IconData icon,
    required String label,
    required VoidCallback onPressed,
    required Color color,
  }) {
    return Tooltip(
      message: label,
      child: Material(
        color: color,
        shape: const CircleBorder(),
        elevation: 8,
        shadowColor: color.withValues(alpha: 0.5),
        child: InkWell(
          customBorder: const CircleBorder(),
          onTap: onPressed,
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Icon(
              icon,
              color: Colors.white,
              size: 40,
            ),
          ),
        ),
      ),
    );
  }
}