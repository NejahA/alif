import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class WheelReward {
  final String label;
  final int coins;
  final int xp;
  final Color color;
  final IconData icon;

  const WheelReward({
    required this.label,
    required this.coins,
    required this.xp,
    required this.color,
    required this.icon,
  });
}

class LuckyWheelModal extends StatefulWidget {
  final int currentCoins;
  final bool hasFreeSpin;
  final Function(int coins, int xp, bool usedFreeSpin) onRewardClaimed;

  const LuckyWheelModal({
    super.key,
    required this.currentCoins,
    required this.hasFreeSpin,
    required this.onRewardClaimed,
  });

  static const List<WheelReward> rewards = [
    WheelReward(label: '+30 Coins', coins: 30, xp: 10, color: Color(0xFF10B981), icon: Icons.monetization_on_rounded),
    WheelReward(label: '+40 XP', coins: 0, xp: 40, color: Color(0xFF6366F1), icon: Icons.auto_awesome_rounded),
    WheelReward(label: '+60 Coins', coins: 60, xp: 15, color: Color(0xFFF59E0B), icon: Icons.diamond_rounded),
    WheelReward(label: '+75 XP', coins: 0, xp: 75, color: Color(0xFF8B5CF6), icon: Icons.bolt_rounded),
    WheelReward(label: '+100 Coins', coins: 100, xp: 25, color: Color(0xFFEC4899), icon: Icons.star_rounded),
    WheelReward(label: '+120 XP', coins: 0, xp: 120, color: Color(0xFF0EA5E9), icon: Icons.rocket_launch_rounded),
    WheelReward(label: '+150 Coins', coins: 150, xp: 35, color: Color(0xFF00E5FF), icon: Icons.workspace_premium_rounded),
    WheelReward(label: '★ 300 JACKPOT ★', coins: 300, xp: 100, color: Color(0xFFFFD700), icon: Icons.stars_rounded),
  ];

  @override
  State<LuckyWheelModal> createState() => _LuckyWheelModalState();
}

class _LuckyWheelModalState extends State<LuckyWheelModal> with SingleTickerProviderStateMixin {
  late AnimationController _spinController;
  late Animation<double> _spinAnimation;
  double _currentAngle = 0.0;
  bool _isSpinning = false;
  late bool _freeSpinAvailable;

  static const List<WheelReward> rewards = LuckyWheelModal.rewards;

  @override
  void initState() {
    super.initState();
    _freeSpinAvailable = widget.hasFreeSpin;
    _spinController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    );
  }

  @override
  void dispose() {
    _spinController.dispose();
    super.dispose();
  }

  void _spinWheel() {
    if (_isSpinning) return;
    if (!_freeSpinAvailable && widget.currentCoins < 30) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Need 30 Coins to spin again!')),
      );
      return;
    }

    final usedFree = _freeSpinAvailable;
    setState(() {
      _isSpinning = true;
      if (_freeSpinAvailable) {
        _freeSpinAvailable = false;
      }
    });

    final random = Random();
    // Pick winning sector
    final winningIndex = random.nextInt(rewards.length);
    final sectorAngle = (2 * pi) / rewards.length;

    // Pointer is at TOP (-pi / 2). Sector i starts at i * sectorAngle.
    // Calculate final target angle with 5-8 full spins
    final extraSpins = (5 + random.nextInt(3)) * 2 * pi;
    final targetSectorCenter = (winningIndex * sectorAngle) + (sectorAngle / 2);
    final targetAngle = _currentAngle + extraSpins + (2 * pi - (targetSectorCenter % (2 * pi)));

    _spinAnimation = Tween<double>(begin: _currentAngle, end: targetAngle).animate(
      CurvedAnimation(parent: _spinController, curve: Curves.easeOutCubic),
    )..addListener(() {
        setState(() {});
      });

    _spinController.forward(from: 0.0).then((_) {
      _currentAngle = targetAngle % (2 * pi);
      _isSpinning = false;
      final reward = rewards[winningIndex];

      HapticFeedback.vibrate();
      widget.onRewardClaimed(reward.coins, reward.xp, usedFree);

      _showRewardDialog(reward);
    });
  }

  void _showRewardDialog(WheelReward reward) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24), side: BorderSide(color: reward.color, width: 2)),
        title: Row(
          children: [
            Icon(reward.icon, color: reward.color, size: 28),
            const SizedBox(width: 8),
            const Text('Lucky Reward!', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              reward.label,
              style: TextStyle(color: reward.color, fontSize: 24, fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 8),
            Text(
              'Alifi received +${reward.coins} Coins and +${reward.xp} XP!',
              style: const TextStyle(color: Colors.white70, fontSize: 14),
              textAlign: TextAlign.center,
            ),
          ],
        ),
        actions: [
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: reward.color,
              foregroundColor: Colors.black,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
            onPressed: () {
              Navigator.of(ctx).pop(); // Close dialog
              Navigator.of(context).pop(); // Close wheel modal
            },
            child: const Text('AWESOME!', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.transparent,
      child: Container(
        constraints: const BoxConstraints(maxWidth: 380),
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: const Color(0xFF0F172A),
          borderRadius: BorderRadius.circular(28),
          border: Border.all(color: const Color(0xFFFFD700), width: 2),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFFFFD700).withValues(alpha: 0.25),
              blurRadius: 30,
              spreadRadius: 4,
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Row(
                  children: [
                    Icon(Icons.stars_rounded, color: Color(0xFFFFD700), size: 26),
                    SizedBox(width: 8),
                    Text(
                      'LUCKY WHEEL',
                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 18, letterSpacing: 1.2),
                    ),
                  ],
                ),
                IconButton(
                  icon: const Icon(Icons.close_rounded, color: Colors.white54),
                  onPressed: _isSpinning ? null : () => Navigator.pop(context),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              _freeSpinAvailable ? 'Daily Free Spin Ready! 🎁' : 'Extra Spin costs 30 Coins 🪙',
              style: TextStyle(
                color: _freeSpinAvailable ? const Color(0xFF10B981) : Colors.white60,
                fontSize: 12,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 20),

            // Wheel Container with Pointer
            SizedBox(
              width: 260,
              height: 260,
              child: Stack(
                alignment: Alignment.center,
                children: [
                  // Rotating Wheel Canvas
                  Transform.rotate(
                    angle: _isSpinning ? _spinAnimation.value : _currentAngle,
                    child: CustomPaint(
                      size: const Size(250, 250),
                      painter: _LuckyWheelPainter(rewards: rewards),
                    ),
                  ),

                  // Center Metallic Hub
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: const RadialGradient(
                        colors: [Color(0xFFFFEA00), Color(0xFFF59E0B), Color(0xFF78350F)],
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.6),
                          blurRadius: 8,
                        ),
                      ],
                    ),
                    child: const Center(
                      child: Icon(Icons.star, color: Colors.white, size: 22),
                    ),
                  ),

                  // Top Indicator Arrow
                  Positioned(
                    top: 0,
                    child: Container(
                      width: 20,
                      height: 26,
                      decoration: const BoxDecoration(
                        color: Color(0xFFFF1744),
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(color: Color(0xFFFF1744), blurRadius: 10, spreadRadius: 2),
                        ],
                      ),
                      child: const Icon(Icons.arrow_drop_down, color: Colors.white, size: 22),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Spin Action Button
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: _freeSpinAvailable ? const Color(0xFF10B981) : const Color(0xFFF59E0B),
                foregroundColor: Colors.black,
                minimumSize: const Size.fromHeight(50),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                elevation: 6,
              ),
              onPressed: _isSpinning ? null : _spinWheel,
              child: Text(
                _isSpinning
                    ? 'SPINNING...'
                    : _freeSpinAvailable
                        ? 'FREE SPIN NOW!'
                        : 'SPIN (30 COINS)',
                style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 15, letterSpacing: 1.2),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _LuckyWheelPainter extends CustomPainter {
  final List<WheelReward> rewards;

  _LuckyWheelPainter({required this.rewards});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;
    final rect = Rect.fromCircle(center: center, radius: radius);
    final sectorAngle = (2 * pi) / rewards.length;

    for (int i = 0; i < rewards.length; i++) {
      final reward = rewards[i];
      final startAngle = i * sectorAngle;

      // Slice background
      final slicePaint = Paint()
        ..color = reward.color
        ..style = PaintingStyle.fill;
      canvas.drawArc(rect, startAngle, sectorAngle, true, slicePaint);

      // Slice divider
      final strokePaint = Paint()
        ..color = Colors.white.withValues(alpha: 0.3)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1.5;
      canvas.drawArc(rect, startAngle, sectorAngle, true, strokePaint);

      // Text label inside slice
      canvas.save();
      canvas.translate(center.dx, center.dy);
      canvas.rotate(startAngle + sectorAngle / 2);

      final textSpan = TextSpan(
        text: reward.coins > 0 ? '${reward.coins}C' : '${reward.xp}XP',
        style: const TextStyle(
          color: Colors.white,
          fontSize: 11,
          fontWeight: FontWeight.w900,
          fontFamily: 'monospace',
          shadows: [Shadow(color: Colors.black87, blurRadius: 4)],
        ),
      );
      final textPainter = TextPainter(
        text: textSpan,
        textDirection: TextDirection.ltr,
      )..layout();

      textPainter.paint(canvas, Offset(radius * 0.45, -textPainter.height / 2));
      canvas.restore();
    }

    // Outer boundary rim
    final rimPaint = Paint()
      ..color = const Color(0xFFFFD700)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 4.0;
    canvas.drawCircle(center, radius, rimPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
