import 'package:flutter/material.dart';
import '../services/jungle_state.dart';
import '../theme/jungle_theme.dart';

class JungleLogoHeader extends StatefulWidget {
  final JungleState state;

  const JungleLogoHeader({
    super.key,
    required this.state,
  });

  @override
  State<JungleLogoHeader> createState() => _JungleLogoHeaderState();
}

class _JungleLogoHeaderState extends State<JungleLogoHeader>
    with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2400),
    )..repeat(reverse: true);

    _pulseAnimation = CurvedAnimation(
      parent: _pulseController,
      curve: Curves.easeInOut,
    );
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
      decoration: BoxDecoration(
        color: JungleColors.deepCanopy.withOpacity(0.75),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: JungleColors.foliageBorder.withOpacity(0.5),
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
      child: Row(
        children: [
          // Animated Logo Badge
          GestureDetector(
            onTap: () {
              widget.state.triggerBirdChirp();
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  behavior: SnackBarBehavior.floating,
                  backgroundColor: JungleColors.foliageSurface,
                  duration: const Duration(seconds: 2),
                  content: Row(
                    children: const [
                      Icon(Icons.eco_rounded, color: JungleColors.neonJade, size: 20),
                      SizedBox(width: 10),
                      Text(
                        '🌿 DJANGGUIIL • Sanctuary Resonance Active',
                        style: TextStyle(color: JungleColors.textPrimary),
                      ),
                    ],
                  ),
                ),
              );
            },
            child: AnimatedBuilder(
              animation: _pulseAnimation,
              builder: (context, child) {
                final glow = _pulseAnimation.value;
                return Container(
                  width: 58,
                  height: 58,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: JungleColors.emerald.withOpacity(0.3 + glow * 0.4),
                        blurRadius: 12 + glow * 10,
                        spreadRadius: 1 + glow * 2,
                      ),
                    ],
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(16),
                    child: Image.asset(
                      'assets/images/logo.jpg',
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) {
                        return Container(
                          color: JungleColors.foliageSurface,
                          child: const Icon(
                            Icons.forest_rounded,
                            color: JungleColors.neonJade,
                            size: 32,
                          ),
                        );
                      },
                    ),
                  ),
                );
              },
            ),
          ),
          const SizedBox(width: 16),

          // Titles
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  children: [
                    Text(
                      'DJANGGUIIL',
                      style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                            fontWeight: FontWeight.w800,
                            letterSpacing: 1.5,
                            color: JungleColors.textPrimary,
                          ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: JungleColors.sunAmber.withOpacity(0.18),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: JungleColors.sunAmber.withOpacity(0.5),
                          width: 0.8,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.bolt_rounded, color: JungleColors.sunAmber, size: 12),
                          const SizedBox(width: 2),
                          Text(
                            '${widget.state.streakDays}d Streak',
                            style: const TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              color: JungleColors.sunAmber,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 3),
                Text(
                  'Bio-Sanctuary • ${widget.state.treeStageName}',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: JungleColors.neonJade,
                        fontWeight: FontWeight.w500,
                      ),
                ),
              ],
            ),
          ),

          // Audio pulse button
          GestureDetector(
            onTap: () => widget.state.toggleSoundscape(),
            child: Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: widget.state.isPlayingSoundscape
                    ? JungleColors.emerald.withOpacity(0.25)
                    : JungleColors.understory,
                shape: BoxShape.circle,
                border: Border.all(
                  color: widget.state.isPlayingSoundscape
                      ? JungleColors.emerald
                      : JungleColors.foliageBorder,
                  width: 1.5,
                ),
              ),
              child: Icon(
                widget.state.isPlayingSoundscape
                    ? Icons.volume_up_rounded
                    : Icons.volume_mute_rounded,
                color: widget.state.isPlayingSoundscape
                    ? JungleColors.neonJade
                    : JungleColors.textSubtle,
                size: 20,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
