import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/pomodoro_timer.dart';

class SessionInfo extends StatelessWidget {
  const SessionInfo({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<PomodoroTimerModel>(
      builder: (context, timer, _) {
        return Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _buildInfoChip(
              context,
              icon: timer.isWorkSession ? Icons.work_outline : Icons.free_breakfast_outlined,
              label: timer.sessionInfo,
            ),
            const SizedBox(width: 12),
            _buildInfoChip(
              context,
              icon: Icons.timer_outlined,
              label: timer.isWorkSession
                  ? '25 min'
                  : timer.sessionCount > 0 && timer.sessionCount % 4 == 0
                      ? '15 min'
                      : '5 min',
            ),
          ],
        );
      },
    );
  }

  Widget _buildInfoChip(
    BuildContext context, {
    required IconData icon,
    required String label,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: Colors.white.withValues(alpha: 0.1),
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: Colors.white54),
          const SizedBox(width: 6),
          Text(
            label,
            style: const TextStyle(
              color: Colors.white54,
              fontSize: 13,
              letterSpacing: 1,
            ),
          ),
        ],
      ),
    );
  }
}