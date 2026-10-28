import 'package:flutter/material.dart';
import '../game/game_state.dart';

class GameOverScreen extends StatelessWidget {
  final GameState gameState;
  final VoidCallback onRestart;
  final VoidCallback onHangar;

  const GameOverScreen({
    super.key,
    required this.gameState,
    required this.onRestart,
    required this.onHangar,
  });

  @override
  Widget build(BuildContext context) {
    final stats = gameState.stats;
    final isNewHigh = stats.score >= gameState.highScore && stats.score > 0;

    return Container(
      color: Colors.black87,
      child: Center(
        child: Container(
          constraints: const BoxConstraints(maxWidth: 520),
          margin: const EdgeInsets.symmetric(horizontal: 20),
          padding: const EdgeInsets.all(28),
          decoration: BoxDecoration(
            color: const Color(0xFF0F172A),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: const Color(0xFFFF1744), width: 2.0),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFFFF1744).withValues(alpha: 0.35),
                blurRadius: 28,
                spreadRadius: 2,
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Icon
              Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: const Color(0xFFFF1744).withValues(alpha: 0.2),
                ),
                child: const Icon(Icons.warning_amber_rounded, color: Color(0xFFFF1744), size: 36),
              ),
              const SizedBox(height: 12),

              const Text(
                'CHRONO DISSOLUTION',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 22,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 2.0,
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                'Quantum timeline collapsed. Vessel retrieved.',
                style: TextStyle(color: Colors.white60, fontSize: 13),
              ),
              const SizedBox(height: 20),

              // Score Box
              Container(
                padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 20),
                decoration: BoxDecoration(
                  color: const Color(0xFF0B0F19),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: isNewHigh ? const Color(0xFFFFD600) : Colors.white12),
                ),
                child: Column(
                  children: [
                    if (isNewHigh)
                      const Text(
                        '★ NEW HIGH SCORE ★',
                        style: TextStyle(
                          color: Color(0xFFFFD600),
                          fontWeight: FontWeight.w900,
                          fontSize: 12,
                          letterSpacing: 1.5,
                        ),
                      ),
                    Text(
                      '${stats.score}',
                      style: TextStyle(
                        color: isNewHigh ? const Color(0xFFFFD600) : const Color(0xFF00E5FF),
                        fontSize: 36,
                        fontWeight: FontWeight.w900,
                        fontFamily: 'monospace',
                      ),
                    ),
                    Text(
                      'BEST RECORD: ${gameState.highScore}',
                      style: const TextStyle(color: Colors.white54, fontSize: 11),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 18),

              // Stats Breakdown Grid
              Row(
                children: [
                  _statTile('WAVE REACHED', '${stats.currentWave}', Icons.waves_rounded),
                  const SizedBox(width: 10),
                  _statTile('TIME SURVIVED', '${stats.timeSurvived.round()}s', Icons.timer_outlined),
                ],
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  _statTile('ENEMIES FELLED', '${stats.enemiesKilled}', Icons.pest_control_rounded),
                  const SizedBox(width: 10),
                  _statTile('CORES SECURED', '+${stats.coresCollected}', Icons.diamond_rounded, const Color(0xFF00E5FF)),
                ],
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  _statTile('BULLETS GRAZED', '${stats.bulletsGrazed}', Icons.timelapse_rounded, const Color(0xFF7C4DFF)),
                  const SizedBox(width: 10),
                  _statTile('KINETIC PARRIES', '${stats.bulletsParried}', Icons.shield_moon_rounded, const Color(0xFFFFD600)),
                ],
              ),
              const SizedBox(height: 24),

              // Actions
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.white70,
                        side: const BorderSide(color: Colors.white24),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: onHangar,
                      child: const Text('HANGAR', style: TextStyle(fontWeight: FontWeight.bold)),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF00E5FF),
                        foregroundColor: Colors.black,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: onRestart,
                      child: const Text('DEPLOY AGAIN', style: TextStyle(fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _statTile(String label, String value, IconData icon, [Color color = Colors.white]) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
        decoration: BoxDecoration(
          color: const Color(0xFF131D31),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Icon(icon, color: color, size: 18),
            const SizedBox(width: 8),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: const TextStyle(color: Colors.white38, fontSize: 9, fontWeight: FontWeight.bold)),
                Text(
                  value,
                  style: TextStyle(color: color, fontSize: 14, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
