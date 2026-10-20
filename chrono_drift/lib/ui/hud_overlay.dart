import 'package:flutter/material.dart';
import '../game/game_state.dart';
import 'virtual_joystick.dart';

class HudOverlay extends StatelessWidget {
  final GameState gameState;
  final VoidCallback onPause;
  final VoidCallback onRewind;
  final VoidCallback onDash;

  const HudOverlay({
    super.key,
    required this.gameState,
    required this.onPause,
    required this.onRewind,
    required this.onDash,
  });

  @override
  Widget build(BuildContext context) {
    final player = gameState.player;
    final hpPct = (player.health / player.maxHealth).clamp(0.0, 1.0);
    final shieldPct = (player.shield / player.maxShield).clamp(0.0, 1.0);
    final expPct = (gameState.stats.currentExp / gameState.stats.expToNextLevel).clamp(0.0, 1.0);
    final rewindProgress = player.rewindProgress;
    final canRewind = player.canRewind();
    final canDash = player.canDash();
    final dashProgress = player.dashProgress;

    return SafeArea(
      child: Stack(
        children: [
          // 1. Top HUD Bar
          Positioned(
            top: 12,
            left: 16,
            right: 16,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // Health & Shield Container
                    Expanded(
                      flex: 3,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.favorite_rounded, color: Color(0xFFFF1744), size: 16),
                              const SizedBox(width: 4),
                              Text(
                                '${player.health.round()} / ${player.maxHealth.round()} HP',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  fontFamily: 'monospace',
                                ),
                              ),
                              if (player.shield > 0) ...[
                                const SizedBox(width: 8),
                                const Icon(Icons.shield_rounded, color: Color(0xFF00E5FF), size: 14),
                                Text(
                                  '${player.shield.round()}',
                                  style: const TextStyle(
                                    color: Color(0xFF00E5FF),
                                    fontSize: 12,
                                    fontFamily: 'monospace',
                                  ),
                                ),
                              ],
                            ],
                          ),
                          const SizedBox(height: 4),
                          // Health Bar
                          Stack(
                            children: [
                              Container(
                                height: 8,
                                decoration: BoxDecoration(
                                  color: const Color(0xFF1E293B),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                              ),
                              FractionallySizedBox(
                                widthFactor: hpPct,
                                child: Container(
                                  height: 8,
                                  decoration: BoxDecoration(
                                    gradient: const LinearGradient(
                                      colors: [Color(0xFFFF1744), Color(0xFFFF5252)],
                                    ),
                                    borderRadius: BorderRadius.circular(4),
                                    boxShadow: [
                                      BoxShadow(
                                        color: const Color(0xFFFF1744).withValues(alpha: 0.5),
                                        blurRadius: 6,
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                              if (player.shield > 0)
                                FractionallySizedBox(
                                  widthFactor: shieldPct,
                                  child: Container(
                                    height: 3,
                                    decoration: BoxDecoration(
                                      color: const Color(0xFF00E5FF),
                                      borderRadius: BorderRadius.circular(2),
                                    ),
                                  ),
                                ),
                            ],
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(width: 16),

                    // Wave & Score Badge
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F172A).withValues(alpha: 0.85),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: gameState.isBossWave ? const Color(0xFFFF0055) : const Color(0xFF38BDF8),
                          width: 1.5,
                        ),
                      ),
                      child: Column(
                        children: [
                          Text(
                            gameState.isBossWave ? 'BOSS WAVE ${gameState.stats.currentWave}' : 'WAVE ${gameState.stats.currentWave}',
                            style: TextStyle(
                              color: gameState.isBossWave ? const Color(0xFFFF0055) : const Color(0xFF38BDF8),
                              fontWeight: FontWeight.w900,
                              fontSize: 13,
                              letterSpacing: 1.2,
                            ),
                          ),
                          Text(
                            '${gameState.stats.score} PTS',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 11,
                              fontFamily: 'monospace',
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(width: 12),

                    // Cores collected
                    Row(
                      children: [
                        const Icon(Icons.diamond_rounded, color: Color(0xFF00E5FF), size: 18),
                        const SizedBox(width: 4),
                        Text(
                          '${gameState.stats.coresCollected}',
                          style: const TextStyle(
                            color: Color(0xFF00E5FF),
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                            fontFamily: 'monospace',
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(width: 12),

                    // Pause Button
                    IconButton(
                      icon: const Icon(Icons.pause_circle_filled_rounded, color: Colors.white70, size: 28),
                      onPressed: onPause,
                    ),
                  ],
                ),

                const SizedBox(height: 8),

                // EXP Bar
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                      decoration: BoxDecoration(
                        color: const Color(0xFF00E5FF),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        'LV ${gameState.stats.level}',
                        style: const TextStyle(
                          color: Colors.black,
                          fontSize: 10,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Stack(
                        children: [
                          Container(
                            height: 5,
                            decoration: BoxDecoration(
                              color: const Color(0xFF1E293B),
                              borderRadius: BorderRadius.circular(3),
                            ),
                          ),
                          FractionallySizedBox(
                            widthFactor: expPct,
                            child: Container(
                              height: 5,
                              decoration: BoxDecoration(
                                gradient: const LinearGradient(
                                  colors: [Color(0xFF00E5FF), Color(0xFFD500F9)],
                                ),
                                borderRadius: BorderRadius.circular(3),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Temporal Overdrive Status Banner
          if (player.isOverdrive)
            Positioned(
              top: 84,
              left: 0,
              right: 0,
              child: Center(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF00FFCC), Color(0xFFE040FB)],
                    ),
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF00FFCC).withValues(alpha: 0.6),
                        blurRadius: 14,
                        spreadRadius: 2,
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.flash_on_rounded, color: Colors.black, size: 18),
                      const SizedBox(width: 6),
                      Text(
                        'TEMPORAL OVERDRIVE [${player.overdriveTimer.toStringAsFixed(1)}s]',
                        style: const TextStyle(
                          color: Colors.black,
                          fontWeight: FontWeight.w900,
                          fontSize: 12,
                          letterSpacing: 1.5,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

          // 2. Virtual Joystick for Movement (Bottom Left)
          Positioned(
            bottom: 30,
            left: 30,
            child: VirtualJoystick(
              radius: 65,
              onDirectionChanged: (dir) {
                gameState.moveInput = dir;
              },
            ),
          ),

          // 3. Action Buttons Pod: Phase Dash & Rewind (Bottom Right)
          Positioned(
            bottom: 26,
            right: 24,
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Phase Dash Button
                GestureDetector(
                  onTap: canDash ? onDash : null,
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    width: 78,
                    height: 78,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: canDash ? const Color(0xFF0F172A) : const Color(0xFF0F172A).withValues(alpha: 0.4),
                      border: Border.all(
                        color: canDash ? const Color(0xFFE040FB) : Colors.white24,
                        width: canDash ? 2.5 : 1.5,
                      ),
                      boxShadow: canDash
                          ? [
                              BoxShadow(
                                color: const Color(0xFFE040FB).withValues(alpha: 0.55),
                                blurRadius: 16,
                                spreadRadius: 2,
                              ),
                            ]
                          : [],
                    ),
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        // Cooldown radial sweep
                        if (!canDash)
                          CircularProgressIndicator(
                            value: dashProgress,
                            strokeWidth: 3.5,
                            color: const Color(0xFFE040FB).withValues(alpha: 0.7),
                            backgroundColor: Colors.white10,
                          ),
                        Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.bolt_rounded,
                              color: canDash ? const Color(0xFFE040FB) : Colors.white38,
                              size: 28,
                            ),
                            const SizedBox(height: 2),
                            Text(
                              canDash ? 'DASH' : '${player.dashCooldownTimer.toStringAsFixed(1)}s',
                              style: TextStyle(
                                color: canDash ? Colors.white : Colors.white38,
                                fontSize: 9.5,
                                fontWeight: FontWeight.w900,
                                letterSpacing: 0.8,
                              ),
                            ),
                            const Text(
                              '[Shift]',
                              style: TextStyle(
                                color: Colors.white30,
                                fontSize: 7.5,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(width: 14),

                // Rewind Button
                GestureDetector(
                  onTap: canRewind ? onRewind : null,
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    width: 78,
                    height: 78,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: canRewind ? const Color(0xFF0F172A) : const Color(0xFF0F172A).withValues(alpha: 0.4),
                      border: Border.all(
                        color: canRewind ? const Color(0xFF00E5FF) : Colors.white24,
                        width: canRewind ? 2.5 : 1.5,
                      ),
                      boxShadow: canRewind
                          ? [
                              BoxShadow(
                                color: const Color(0xFF00E5FF).withValues(alpha: 0.55),
                                blurRadius: 16,
                                spreadRadius: 2,
                              ),
                            ]
                          : [],
                    ),
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        // Cooldown radial sweep
                        if (!canRewind)
                          CircularProgressIndicator(
                            value: rewindProgress,
                            strokeWidth: 3.5,
                            color: const Color(0xFF00E5FF).withValues(alpha: 0.7),
                            backgroundColor: Colors.white10,
                          ),
                        Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.replay_rounded,
                              color: canRewind ? const Color(0xFF00E5FF) : Colors.white38,
                              size: 28,
                            ),
                            const SizedBox(height: 2),
                            Text(
                              canRewind ? 'REWIND' : '${player.rewindCooldownTimer.toStringAsFixed(1)}s',
                              style: TextStyle(
                                color: canRewind ? Colors.white : Colors.white38,
                                fontSize: 9.5,
                                fontWeight: FontWeight.w900,
                                letterSpacing: 0.8,
                              ),
                            ),
                            const Text(
                              '[Space]',
                              style: TextStyle(
                                color: Colors.white30,
                                fontSize: 7.5,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
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

