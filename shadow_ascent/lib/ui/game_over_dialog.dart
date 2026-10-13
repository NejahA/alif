import 'package:flutter/material.dart';
import '../game/game_state.dart';

class GameOverDialog extends StatelessWidget {
  final GameStateNotifier gameState;
  final VoidCallback onRestart;
  final VoidCallback onMainMenu;

  const GameOverDialog({
    super.key,
    required this.gameState,
    required this.onRestart,
    required this.onMainMenu,
  });

  @override
  Widget build(BuildContext context) {
    final isVictory = gameState.isVictory;

    return Dialog(
      backgroundColor: Colors.transparent,
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: const Color(0xFF0F172A),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: isVictory ? const Color(0xFFF59E0B) : const Color(0xFFEF4444),
            width: 2,
          ),
          boxShadow: [
            BoxShadow(
              color: (isVictory ? const Color(0xFFF59E0B) : const Color(0xFFEF4444)).withValues(alpha: 0.3),
              blurRadius: 20,
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              isVictory ? Icons.emoji_events : Icons.sentiment_very_dissatisfied,
              color: isVictory ? const Color(0xFFF59E0B) : const Color(0xFFEF4444),
              size: 64,
            ),
            const SizedBox(height: 12),

            Text(
              isVictory ? 'PAGODA ASCENDED!' : 'SHADOW CLAIMED',
              style: TextStyle(
                color: isVictory ? const Color(0xFFFDE047) : const Color(0xFFF87171),
                fontSize: 24,
                fontWeight: FontWeight.w900,
                letterSpacing: 2,
              ),
            ),
            const SizedBox(height: 16),

            // Stat breakdown
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                children: [
                  _buildStatRow('FINAL SCORE', '${gameState.currentScore}', Icons.stars, Colors.amber),
                  const Divider(color: Colors.white10),
                  _buildStatRow('HIGH SCORE', '${gameState.highScore}', Icons.workspace_premium, Colors.cyanAccent),
                  const Divider(color: Colors.white10),
                  _buildStatRow('ENEMIES SLAIN', '${gameState.enemiesKilled}', Icons.flash_on, Colors.redAccent),
                  const Divider(color: Colors.white10),
                  _buildStatRow('STEALTH TAKEDOWNS', '${gameState.stealthTakedowns}', Icons.visibility_off, Colors.purpleAccent),
                ],
              ),
            ),
            const SizedBox(height: 24),

            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: onMainMenu,
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Colors.white30),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    child: const Text('DOJO MENU', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: onRestart,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: isVictory ? const Color(0xFFF59E0B) : const Color(0xFFEF4444),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    child: const Text('RETRY ASCENT', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatRow(String title, String value, IconData icon, Color color) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [
            Icon(icon, color: color, size: 18),
            const SizedBox(width: 8),
            Text(title, style: const TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.w600)),
          ],
        ),
        Text(value, style: TextStyle(color: color, fontSize: 16, fontWeight: FontWeight.bold)),
      ],
    );
  }
}
