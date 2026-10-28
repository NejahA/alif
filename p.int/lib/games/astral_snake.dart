import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

enum _Direction { up, down, left, right }

class _GridPoint {
  final int x;
  final int y;
  const _GridPoint(this.x, this.y);

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is _GridPoint && runtimeType == other.runtimeType && x == other.x && y == other.y;

  @override
  int get hashCode => x.hashCode ^ y.hashCode;
}

class AstralSnakeGameScreen extends StatefulWidget {
  final Function(int coins, int xp) onGameFinished;

  const AstralSnakeGameScreen({super.key, required this.onGameFinished});

  @override
  State<AstralSnakeGameScreen> createState() => _AstralSnakeGameScreenState();
}

class _AstralSnakeGameScreenState extends State<AstralSnakeGameScreen> {
  static const int gridSize = 18;
  Timer? _gameTimer;

  bool _isPlaying = false;
  bool _isGameOver = false;

  final List<_GridPoint> _snake = [];
  _Direction _currentDir = _Direction.right;
  _Direction _nextDir = _Direction.right;

  _GridPoint _food = const _GridPoint(12, 9);
  _GridPoint? _bonusFruit;
  int _bonusTimer = 0;

  int _score = 0;
  int _speedMs = 150;

  @override
  void dispose() {
    _gameTimer?.cancel();
    super.dispose();
  }

  void _startGame() {
    _gameTimer?.cancel();
    setState(() {
      _isPlaying = true;
      _isGameOver = false;
      _score = 0;
      _speedMs = 150;
      _currentDir = _Direction.right;
      _nextDir = _Direction.right;
      _snake.clear();
      _snake.addAll([
        const _GridPoint(6, 9),
        const _GridPoint(5, 9),
        const _GridPoint(4, 9),
      ]);
      _spawnFood();
      _bonusFruit = null;
      _bonusTimer = 0;
    });

    _gameTimer = Timer.periodic(Duration(milliseconds: _speedMs), (_) => _tick());
  }

  void _spawnFood() {
    final rand = Random();
    _GridPoint p;
    do {
      p = _GridPoint(rand.nextInt(gridSize), rand.nextInt(gridSize));
    } while (_snake.contains(p));
    _food = p;

    // 25% chance to spawn bonus nebula fruit
    if (rand.nextDouble() < 0.25 && _bonusFruit == null) {
      _GridPoint bp;
      do {
        bp = _GridPoint(rand.nextInt(gridSize), rand.nextInt(gridSize));
      } while (_snake.contains(bp) || bp == _food);
      _bonusFruit = bp;
      _bonusTimer = 25; // lasts 25 ticks
    }
  }

  void _changeDirection(_Direction newDir) {
    if (!_isPlaying || _isGameOver) return;
    // Disallow 180 reverse
    if ((_currentDir == _Direction.up && newDir == _Direction.down) ||
        (_currentDir == _Direction.down && newDir == _Direction.up) ||
        (_currentDir == _Direction.left && newDir == _Direction.right) ||
        (_currentDir == _Direction.right && newDir == _Direction.left)) {
      return;
    }
    _nextDir = newDir;
    HapticFeedback.selectionClick();
  }

  void _tick() {
    if (!_isPlaying || _isGameOver) return;

    _currentDir = _nextDir;
    final head = _snake.first;
    _GridPoint newHead;

    switch (_currentDir) {
      case _Direction.up:
        newHead = _GridPoint(head.x, head.y - 1);
        break;
      case _Direction.down:
        newHead = _GridPoint(head.x, head.y + 1);
        break;
      case _Direction.left:
        newHead = _GridPoint(head.x - 1, head.y);
        break;
      case _Direction.right:
        newHead = _GridPoint(head.x + 1, head.y);
        break;
    }

    // Wall collision
    if (newHead.x < 0 || newHead.x >= gridSize || newHead.y < 0 || newHead.y >= gridSize) {
      _onGameOver();
      return;
    }

    // Self collision
    if (_snake.contains(newHead)) {
      _onGameOver();
      return;
    }

    setState(() {
      _snake.insert(0, newHead);

      // Check food consumption
      if (newHead == _food) {
        _score += 10;
        HapticFeedback.lightImpact();
        _spawnFood();
        // Speed up slightly
        if (_speedMs > 80 && _score % 30 == 0) {
          _speedMs -= 6;
          _gameTimer?.cancel();
          _gameTimer = Timer.periodic(Duration(milliseconds: _speedMs), (_) => _tick());
        }
      } else if (_bonusFruit != null && newHead == _bonusFruit) {
        _score += 35;
        _bonusFruit = null;
        HapticFeedback.mediumImpact();
      } else {
        _snake.removeLast();
      }

      // Decrement bonus timer
      if (_bonusFruit != null) {
        _bonusTimer--;
        if (_bonusTimer <= 0) {
          _bonusFruit = null;
        }
      }
    });
  }

  void _onGameOver() {
    _gameTimer?.cancel();
    HapticFeedback.vibrate();

    final earnedCoins = (_score / 2).round() + 15;
    final earnedXP = (_score / 2.5).round() + 20;

    setState(() {
      _isGameOver = true;
      _isPlaying = false;
    });

    widget.onGameFinished(earnedCoins, earnedXP);

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24), side: const BorderSide(color: Color(0xFF10B981), width: 1.8)),
        title: const Row(
          children: [
            Icon(Icons.auto_awesome, color: Color(0xFF10B981), size: 28),
            SizedBox(width: 8),
            Text('Supernova Crash!', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Score: $_score', style: const TextStyle(color: Color(0xFFFFD700), fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            Text('Comet Length: ${_snake.length} nodes', style: const TextStyle(color: Colors.white70, fontSize: 14)),
            const SizedBox(height: 8),
            Text('Earned: +$earnedCoins Coins & +$earnedXP XP', style: const TextStyle(color: Color(0xFF10B981), fontSize: 15, fontWeight: FontWeight.bold)),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              Navigator.pop(context);
            },
            child: const Text('ARCADE HUB', style: TextStyle(color: Colors.white60)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF10B981),
              foregroundColor: Colors.black,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
            onPressed: () {
              Navigator.pop(ctx);
              _startGame();
            },
            child: const Text('PLAY AGAIN', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF070514),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        title: const Text('Astral Comet Snake', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        actions: [
          Center(
            child: Padding(
              padding: const EdgeInsets.only(right: 16),
              child: Row(
                children: [
                  const Icon(Icons.stars, color: Color(0xFFFFD700), size: 20),
                  const SizedBox(width: 4),
                  Text('$_score', style: const TextStyle(color: Color(0xFFFFD700), fontSize: 18, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
          ),
        ],
      ),
      body: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onVerticalDragUpdate: (details) {
          if (details.delta.dy < -6) _changeDirection(_Direction.up);
          if (details.delta.dy > 6) _changeDirection(_Direction.down);
        },
        onHorizontalDragUpdate: (details) {
          if (details.delta.dx < -6) _changeDirection(_Direction.left);
          if (details.delta.dx > 6) _changeDirection(_Direction.right);
        },
        child: Column(
          children: [
            // Game Board
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Center(
                  child: AspectRatio(
                    aspectRatio: 1.0,
                    child: Container(
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F172A),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.5), width: 2),
                        boxShadow: [
                          BoxShadow(color: const Color(0xFF10B981).withValues(alpha: 0.15), blurRadius: 20, spreadRadius: 2),
                        ],
                      ),
                      child: Stack(
                        children: [
                          Positioned.fill(
                            child: CustomPaint(
                              painter: _SnakeBoardPainter(
                                snake: _snake,
                                food: _food,
                                bonusFruit: _bonusFruit,
                                gridSize: gridSize,
                              ),
                            ),
                          ),

                          // Start overlay
                          if (!_isPlaying && !_isGameOver)
                            Center(
                              child: Container(
                                constraints: const BoxConstraints(maxWidth: 320),
                                padding: const EdgeInsets.all(22),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF0F172A).withValues(alpha: 0.95),
                                  borderRadius: BorderRadius.circular(24),
                                  border: Border.all(color: const Color(0xFF10B981), width: 2),
                                ),
                                child: Column(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    const Icon(Icons.gesture_rounded, color: Color(0xFF10B981), size: 44),
                                    const SizedBox(height: 10),
                                    const Text(
                                      'ASTRAL COMET SNAKE',
                                      style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900, letterSpacing: 1.2),
                                    ),
                                    const SizedBox(height: 6),
                                    const Text(
                                      'SWIPE OR USE D-PAD TO GUIDE ALIFI\'S COMET TAIL!\nEAT STARDUST ORBS TO EXPAND.',
                                      style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold, height: 1.4),
                                      textAlign: TextAlign.center,
                                    ),
                                    const SizedBox(height: 16),
                                    ElevatedButton(
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: const Color(0xFF10B981),
                                        foregroundColor: Colors.black,
                                        minimumSize: const Size.fromHeight(46),
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                                      ),
                                      onPressed: _startGame,
                                      child: const Text('LAUNCH COMET', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),

            // Onscreen Neon D-Pad Controls
            Padding(
              padding: const EdgeInsets.only(bottom: 16, top: 4),
              child: Column(
                children: [
                  _buildPadButton(Icons.arrow_drop_up_rounded, () => _changeDirection(_Direction.up)),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _buildPadButton(Icons.arrow_left_rounded, () => _changeDirection(_Direction.left)),
                      const SizedBox(width: 48),
                      _buildPadButton(Icons.arrow_right_rounded, () => _changeDirection(_Direction.right)),
                    ],
                  ),
                  _buildPadButton(Icons.arrow_drop_down_rounded, () => _changeDirection(_Direction.down)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPadButton(IconData icon, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        width: 52,
        height: 52,
        margin: const EdgeInsets.all(3),
        decoration: BoxDecoration(
          color: const Color(0xFF1E293B),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4), width: 1.5),
          boxShadow: [
            BoxShadow(color: const Color(0xFF10B981).withValues(alpha: 0.2), blurRadius: 8),
          ],
        ),
        child: Icon(icon, color: const Color(0xFF10B981), size: 36),
      ),
    );
  }
}

class _SnakeBoardPainter extends CustomPainter {
  final List<_GridPoint> snake;
  final _GridPoint food;
  final _GridPoint? bonusFruit;
  final int gridSize;

  _SnakeBoardPainter({
    required this.snake,
    required this.food,
    required this.bonusFruit,
    required this.gridSize,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final cellWidth = size.width / gridSize;
    final cellHeight = size.height / gridSize;

    // 1. Draw Food (Gold Stardust Orb)
    final foodCenter = Offset((food.x + 0.5) * cellWidth, (food.y + 0.5) * cellHeight);
    final foodGlow = Paint()
      ..color = const Color(0xFFFFD700).withValues(alpha: 0.4)
      ..style = PaintingStyle.fill;
    canvas.drawCircle(foodCenter, cellWidth * 0.48, foodGlow);

    final foodPaint = Paint()..color = const Color(0xFFFFD700);
    canvas.drawCircle(foodCenter, cellWidth * 0.32, foodPaint);

    final foodWhite = Paint()..color = Colors.white;
    canvas.drawCircle(foodCenter, cellWidth * 0.12, foodWhite);

    // 2. Draw Bonus Fruit (Pink Nebula Supernova)
    if (bonusFruit != null) {
      final bonusCenter = Offset((bonusFruit!.x + 0.5) * cellWidth, (bonusFruit!.y + 0.5) * cellHeight);
      final bonusGlow = Paint()
        ..color = const Color(0xFFEC4899).withValues(alpha: 0.5)
        ..style = PaintingStyle.fill;
      canvas.drawCircle(bonusCenter, cellWidth * 0.55, bonusGlow);

      final bonusPaint = Paint()..color = const Color(0xFFEC4899);
      canvas.drawCircle(bonusCenter, cellWidth * 0.38, bonusPaint);
    }

    // 3. Draw Snake Tail Segments with fading luminescence
    for (int i = snake.length - 1; i >= 1; i--) {
      final p = snake[i];
      final frac = 1.0 - (i / snake.length);
      final center = Offset((p.x + 0.5) * cellWidth, (p.y + 0.5) * cellHeight);
      final radius = (cellWidth * 0.34) * (0.65 + frac * 0.35);

      final tailPaint = Paint()
        ..color = Color.lerp(const Color(0xFF00E5FF), const Color(0xFF10B981), frac)!
        ..style = PaintingStyle.fill;
      canvas.drawCircle(center, radius, tailPaint);
    }

    // 4. Draw Snake Head (Alifi with eyes)
    if (snake.isNotEmpty) {
      final head = snake.first;
      final headCenter = Offset((head.x + 0.5) * cellWidth, (head.y + 0.5) * cellHeight);

      // Aura
      final auraPaint = Paint()
        ..color = const Color(0xFF10B981).withValues(alpha: 0.45)
        ..style = PaintingStyle.fill;
      canvas.drawCircle(headCenter, cellWidth * 0.5, auraPaint);

      // Body Head
      final headPaint = Paint()..color = const Color(0xFF10B981);
      canvas.drawCircle(headCenter, cellWidth * 0.40, headPaint);

      // Eyes
      final eyePaint = Paint()..color = Colors.white;
      final pupilPaint = Paint()..color = const Color(0xFF0F172A);

      canvas.drawCircle(headCenter + Offset(-cellWidth * 0.14, -cellWidth * 0.08), cellWidth * 0.11, eyePaint);
      canvas.drawCircle(headCenter + Offset(cellWidth * 0.14, -cellWidth * 0.08), cellWidth * 0.11, eyePaint);
      canvas.drawCircle(headCenter + Offset(-cellWidth * 0.14, -cellWidth * 0.08), cellWidth * 0.05, pupilPaint);
      canvas.drawCircle(headCenter + Offset(cellWidth * 0.14, -cellWidth * 0.08), cellWidth * 0.05, pupilPaint);
    }
  }

  @override
  bool shouldRepaint(covariant _SnakeBoardPainter oldDelegate) => true;
}
