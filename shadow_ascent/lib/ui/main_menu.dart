import 'package:flutter/material.dart';
import '../game/game_state.dart';
import 'dojo_shop.dart';

class MainMenuScreen extends StatelessWidget {
  final GameStateNotifier gameState;
  final Function(GameMode) onStartGame;

  const MainMenuScreen({
    super.key,
    required this.gameState,
    required this.onStartGame,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF030712),
      body: Stack(
        children: [
          // Background Aesthetic Grid & Glow
          Positioned.fill(
            child: CustomPaint(
              painter: MenuBackgroundPainter(),
            ),
          ),

          SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // Ninja Helmet / Kanji Emblem
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: const Color(0xFF1E293B),
                        border: Border.all(color: const Color(0xFF38BDF8), width: 3),
                        boxShadow: const [
                          BoxShadow(color: Color(0xFF0284C7), blurRadius: 25, spreadRadius: 2),
                        ],
                      ),
                      child: const Icon(
                        Icons.shield,
                        size: 64,
                        color: Color(0xFF38BDF8),
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Game Title Header
                    const Text(
                      'SHADOW TACTICS',
                      style: TextStyle(
                        color: Color(0xFF38BDF8),
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 6,
                      ),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'NINJA ASCENT',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 38,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 2,
                        shadows: [
                          Shadow(color: Color(0xFF38BDF8), blurRadius: 16),
                        ],
                      ),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      height: 2,
                      width: 140,
                      color: const Color(0xFF38BDF8),
                    ),
                    const SizedBox(height: 36),

                    // High Score & Coins Card
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F172A).withValues(alpha: 0.8),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: Colors.white12),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.workspace_premium, color: Color(0xFFF59E0B), size: 20),
                          const SizedBox(width: 8),
                          Text(
                            'BEST SCORE: ${gameState.highScore}',
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                          ),
                          const SizedBox(width: 20),
                          const Icon(Icons.monetization_on, color: Color(0xFFF59E0B), size: 20),
                          const SizedBox(width: 8),
                          Text(
                            '${gameState.coins}',
                            style: const TextStyle(
                              color: Color(0xFFFDE047),
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 32),

                    // Mode Selection Buttons
                    _buildMenuButton(
                      context,
                      label: 'PAGODA ASCENT',
                      subtitle: 'Campaign level progression & stealth',
                      icon: Icons.shield,
                      color: const Color(0xFF38BDF8),
                      onTap: () => onStartGame(GameMode.campaign),
                    ),
                    const SizedBox(height: 16),

                    _buildMenuButton(
                      context,
                      label: 'ENDLESS SHADOW RUSH',
                      subtitle: 'Outrun the rising void corruption',
                      icon: Icons.local_fire_department,
                      color: const Color(0xFFEF4444),
                      onTap: () => onStartGame(GameMode.endless),
                    ),
                    const SizedBox(height: 16),

                    _buildMenuButton(
                      context,
                      label: 'SHINOBI DOJO & SHOP',
                      subtitle: 'Unlock Ninja Skins & Sword Effects',
                      icon: Icons.storefront,
                      color: const Color(0xFFF59E0B),
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => DojoShopScreen(gameState: gameState),
                          ),
                        );
                      },
                    ),
                    const SizedBox(height: 24),

                    // Controls Guide & Audio Settings Row
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        IconButton(
                          icon: Icon(
                            gameState.isMuted ? Icons.volume_off : Icons.volume_up,
                            color: Colors.white70,
                          ),
                          onPressed: gameState.toggleAudio,
                        ),
                        TextButton.icon(
                          onPressed: () => _showControlsDialog(context),
                          icon: const Icon(Icons.help_outline, color: Colors.white70),
                          label: const Text('CONTROLS & SKILLS', style: TextStyle(color: Colors.white70)),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMenuButton(
    BuildContext context, {
    required String label,
    required String subtitle,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Container(
      width: double.infinity,
      constraints: const BoxConstraints(maxWidth: 420),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withValues(alpha: 0.6), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: color.withValues(alpha: 0.2),
            blurRadius: 12,
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(20),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.15),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(icon, color: color, size: 28),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        label,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.1,
                        ),
                      ),
                      Text(
                        subtitle,
                        style: const TextStyle(color: Colors.white60, fontSize: 12),
                      ),
                    ],
                  ),
                ),
                Icon(Icons.arrow_forward_ios, color: color, size: 18),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _showControlsDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF0F172A),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Row(
          children: [
            Icon(Icons.sports_esports, color: Color(0xFF38BDF8)),
            SizedBox(width: 10),
            Text('HOW TO PLAY', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            _ControlItem(keys: 'A / D or Left/Right', action: 'Move Ninja'),
            _ControlItem(keys: 'W or Space', action: 'Jump / Double Jump / Wall Jump'),
            _ControlItem(keys: 'Shift or J', action: 'Shadow Dash (Invulnerable teleport)'),
            _ControlItem(keys: 'K or E', action: 'Katana Slash (Deflect arrows!)'),
            SizedBox(height: 12),
            Text(
              'STEALTH MECHANIC:',
              style: TextStyle(color: Color(0xFFF59E0B), fontWeight: FontWeight.bold, fontSize: 13),
            ),
            SizedBox(height: 4),
            Text(
              'Hide in dark lantern alcoves to become invisible to Watchers. Strike enemies from behind for Instant Stealth Takedowns!',
              style: TextStyle(color: Colors.white70, fontSize: 12),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('GOT IT!', style: TextStyle(color: Color(0xFF38BDF8), fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
}

class _ControlItem extends StatelessWidget {
  final String keys;
  final String action;

  const _ControlItem({required this.keys, required this.action});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(6),
              border: Border.all(color: Colors.white24),
            ),
            child: Text(keys, style: const TextStyle(color: Color(0xFF38BDF8), fontSize: 11, fontWeight: FontWeight.bold)),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(action, textAlign: TextAlign.right, style: const TextStyle(color: Colors.white, fontSize: 12)),
          ),
        ],
      ),
    );
  }
}

class MenuBackgroundPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final gridPaint = Paint()
      ..color = const Color(0xFF1E293B).withValues(alpha: 0.3)
      ..strokeWidth = 1.0;

    for (double x = 0; x < size.width; x += 40) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), gridPaint);
    }
    for (double y = 0; y < size.height; y += 40) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), gridPaint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
