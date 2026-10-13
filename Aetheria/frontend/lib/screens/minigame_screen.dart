import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/api_service.dart';

class ArcadeItem {
  double x;
  double y;
  bool isGood;
  ArcadeItem({required this.x, required this.y, required this.isGood});
}

class MiniGameScreen extends StatefulWidget {
  final Function() onScoreSubmitted;
  const MiniGameScreen({super.key, required this.onScoreSubmitted});

  @override
  State<MiniGameScreen> createState() => _MiniGameScreenState();
}

class _MiniGameScreenState extends State<MiniGameScreen> {
  double paddleX = 0.5; // Normalized 0.0 to 1.0
  int score = 0;
  bool isGameRunning = false;
  List<ArcadeItem> items = [];
  Timer? gameTimer;
  final Random rand = Random();

  void _startGame() {
    setState(() {
      score = 0;
      items.clear();
      isGameRunning = true;
      paddleX = 0.5;
    });

    gameTimer?.cancel();
    gameTimer = Timer.periodic(const Duration(milliseconds: 50), (timer) {
      if (!mounted || !isGameRunning) {
        timer.cancel();
        return;
      }

      // Spawn new items
      if (rand.nextDouble() < 0.15) {
        items.add(ArcadeItem(
          x: rand.nextDouble(),
          y: 0.0,
          isGood: rand.nextDouble() > 0.3,
        ));
      }

      // Move items down
      for (var item in items) {
        item.y += 0.03;
      }

      // Check paddle collisions (y >= 0.85)
      items.removeWhere((item) {
        if (item.y >= 0.85 && item.y <= 0.92) {
          if ((item.x - paddleX).abs() < 0.12) {
            if (item.isGood) {
              score += 10;
            } else {
              score = max(0, score - 15);
            }
            return true; // Caught!
          }
        }
        return item.y > 1.0; // Off screen
      });

      setState(() {});
    });
  }

  void _submitScore() async {
    isGameRunning = false;
    gameTimer?.cancel();

    final xpEarned = await ApiService.submitMinigameScore(score);
    if (!mounted) return;

    widget.onScoreSubmitted();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: const Color(0xFF00F5FF),
        content: Text(
          '👾 Arcade Game Over! Scored $score pts (+$xpEarned XP)!',
          style: GoogleFonts.outfit(color: Colors.black, fontWeight: FontWeight.bold),
        ),
      ),
    );
  }

  @override
  void dispose() {
    gameTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Controls Header
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          color: const Color(0xFF161B22),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '👾 Cyber Deflector Arcade',
                    style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  Text(
                    'Catch Green Orbs (+10) • Avoid Red Hazards (-15)',
                    style: GoogleFonts.outfit(color: const Color(0xFF00F5FF), fontSize: 11),
                  ),
                ],
              ),
              Row(
                children: [
                  Text(
                    'Score: $score',
                    style: GoogleFonts.outfit(color: const Color(0xFFFFB800), fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  const SizedBox(width: 12),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: isGameRunning ? Colors.redAccent : const Color(0xFF00F5FF),
                    ),
                    onPressed: isGameRunning ? _submitScore : _startGame,
                    child: Text(
                      isGameRunning ? 'Finish & Claim' : 'Start Game',
                      style: GoogleFonts.outfit(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 12),
                    ),
                  )
                ],
              )
            ],
          ),
        ),

        // Interactive Arcade Canvas Area
        Expanded(
          child: GestureDetector(
            onPanUpdate: (details) {
              final RenderBox renderBox = context.findRenderObject() as RenderBox;
              final double newX = details.localPosition.dx / renderBox.size.width;
              setState(() => paddleX = newX.clamp(0.08, 0.92));
            },
            child: Container(
              color: const Color(0xFF0D1117),
              child: CustomPaint(
                painter: CyberArcadePainter(
                  paddleX: paddleX,
                  items: items,
                ),
                child: Container(),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class CyberArcadePainter extends CustomPainter {
  final double paddleX;
  final List<ArcadeItem> items;

  CyberArcadePainter({required this.paddleX, required this.items});

  @override
  void paint(Canvas canvas, Size size) {
    // Draw Falling Items
    for (var item in items) {
      final pos = Offset(item.x * size.width, item.y * size.height);
      final paintGlow = Paint()
        ..color = (item.isGood ? const Color(0xFF00F5FF) : Colors.redAccent).withValues(alpha: 0.6)
        ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 8);

      final paintCore = Paint()..color = item.isGood ? const Color(0xFF00F5FF) : Colors.redAccent;

      canvas.drawCircle(pos, 10, paintGlow);
      canvas.drawCircle(pos, 6, paintCore);
    }

    // Draw Shield Paddle at y = 0.88
    final double px = paddleX * size.width;
    final double py = 0.88 * size.height;

    final paintPaddleGlow = Paint()
      ..color = const Color(0xFFFF007F).withValues(alpha: 0.5)
      ..strokeWidth = 10
      ..strokeCap = StrokeCap.round
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 8);

    final paintPaddleCore = Paint()
      ..color = Colors.white
      ..strokeWidth = 6
      ..strokeCap = StrokeCap.round;

    canvas.drawLine(Offset(px - 40, py), Offset(px + 40, py), paintPaddleGlow);
    canvas.drawLine(Offset(px - 40, py), Offset(px + 40, py), paintPaddleCore);
  }

  @override
  bool shouldRepaint(covariant CyberArcadePainter oldDelegate) => true;
}
