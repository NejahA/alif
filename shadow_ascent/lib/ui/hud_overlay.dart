import 'package:flutter/material.dart';
import '../game/game_state.dart';

class HudOverlay extends StatelessWidget {
  final GameStateNotifier gameState;
  final VoidCallback onPause;

  const HudOverlay({super.key, required this.gameState, required this.onPause});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            // Left Status: Score & Combo Streak
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  children: [
                    const Icon(Icons.stars, color: Color(0xFFF59E0B), size: 22),
                    const SizedBox(width: 6),
                    Text(
                      '${gameState.currentScore}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.2,
                        shadows: [Shadow(color: Colors.cyanAccent, blurRadius: 10)],
                      ),
                    ),
                  ],
                ),
                if (gameState.comboStreak > 1)
                  Container(
                    margin: const EdgeInsets.only(top: 4),
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: const Color(0xFFDC2626),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      '${gameState.comboStreak}x COMBO!',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ),
              ],
            ),

            // Center Status: Coins & High Score
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.black54,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(0xFFF59E0B).withValues(alpha: 0.5)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.monetization_on, color: Color(0xFFF59E0B), size: 18),
                      const SizedBox(width: 6),
                      Text(
                        '${gameState.coins}',
                        style: const TextStyle(
                          color: Color(0xFFFDE047),
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),

            // Right Status: Pause & Audio Toggle
            Row(
              children: [
                IconButton(
                  icon: Icon(
                    gameState.isMuted ? Icons.volume_off : Icons.volume_up,
                    color: Colors.white70,
                  ),
                  onPressed: gameState.toggleAudio,
                ),
                IconButton(
                  icon: const Icon(Icons.pause_circle_filled, color: Colors.white, size: 32),
                  onPressed: onPause,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
