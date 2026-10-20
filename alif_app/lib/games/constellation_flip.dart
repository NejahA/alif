import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class ConstellationFlipGameScreen extends StatefulWidget {
  final Function(int coins, int xp) onGameFinished;

  const ConstellationFlipGameScreen({super.key, required this.onGameFinished});

  @override
  State<ConstellationFlipGameScreen> createState() => _ConstellationFlipGameScreenState();
}

class _ConstellationFlipGameScreenState extends State<ConstellationFlipGameScreen>
    with SingleTickerProviderStateMixin {
  static const int gridSize = 4;
  static const int nodeCount = gridSize * gridSize;
  static const double roundSeconds = 60.0;

  // Reward bounds shared with the rest of the arcade (roughly 25-90 coins / 20-70 xp).
  static const int minCoins = 25;
  static const int maxCoins = 90;
  static const int minXp = 20;
  static const int maxXp = 70;

  late AnimationController _ticker;
  final Random _rand = Random();

  List<bool> _board = List<bool>.filled(nodeCount, true);

  bool _isPlaying = false;
  bool _isGameOver = false;
  bool _rewarded = false;

  int _moves = 0;
  int _scrambleDepth = 8;
  double _timeRemaining = roundSeconds;

  @override
  void initState() {
    super.initState();
    _generateBoard(_scrambleDepth);
    _ticker = AnimationController(vsync: this, duration: const Duration(seconds: 1000))
      ..addListener(_gameLoop);
  }

  @override
  void dispose() {
    _ticker.dispose();
    super.dispose();
  }

  // --- Board generation (always solvable) -----------------------------------
  // Start from the fully-lit board and apply N random legal taps. A tap is its
  // own inverse, so replaying the same taps from the scrambled board always
  // solves it. We never build a purely random (possibly unsolvable) board.
  void _applyTap(List<bool> b, int r, int c) {
    final int idx = r * gridSize + c;
    b[idx] = !b[idx];
    if (r > 0) b[(r - 1) * gridSize + c] = !b[(r - 1) * gridSize + c];
    if (r < gridSize - 1) b[(r + 1) * gridSize + c] = !b[(r + 1) * gridSize + c];
    if (c > 0) b[r * gridSize + (c - 1)] = !b[r * gridSize + (c - 1)];
    if (c < gridSize - 1) b[r * gridSize + (c + 1)] = !b[r * gridSize + (c + 1)];
  }

  void _generateBoard(int taps) {
    final b = List<bool>.filled(nodeCount, true);
    for (int i = 0; i < taps; i++) {
      _applyTap(b, _rand.nextInt(gridSize), _rand.nextInt(gridSize));
    }
    // Guarantee the puzzle is not already solved.
    if (!b.contains(false)) {
      _applyTap(b, _rand.nextInt(gridSize), _rand.nextInt(gridSize));
    }
    _board = b;
  }

  bool get _isSolved => !_board.contains(false);

  // --- Game lifecycle -------------------------------------------------------
  void _startGame() {
    setState(() {
      _isPlaying = true;
      _isGameOver = false;
      _rewarded = false;
      _moves = 0;
      _timeRemaining = roundSeconds;
      _generateBoard(_scrambleDepth);
    });
    _ticker.forward(from: 0.0);
  }

  void _nextPuzzle() {
    _scrambleDepth = min(_scrambleDepth + 4, 20);
    _startGame();
  }

  void _tapNode(int index) {
    if (!_isPlaying || _isGameOver) return;
    final int r = index ~/ gridSize;
    final int c = index % gridSize;
    setState(() {
      _applyTap(_board, r, c);
      _moves++;
    });
    HapticFeedback.lightImpact();
    if (_isSolved) {
      _onSolved();
    }
  }

  void _gameLoop() {
    if (!_isPlaying || _isGameOver || !mounted) return;
    _timeRemaining -= 0.016;
    if (_timeRemaining <= 0) {
      _timeRemaining = 0;
      _onTimeUp();
      return;
    }
    setState(() {});
  }

  // --- Rewards --------------------------------------------------------------
  int _computeCoins() {
    final double timeFrac = (_timeRemaining / roundSeconds).clamp(0.0, 1.0);
    final int extraMoves = (_moves - _scrambleDepth);
    final double moveFrac = 1.0 - (extraMoves.clamp(0, 30) / 30.0);
    final int coins = (30 + timeFrac * 40 + moveFrac * 20).round();
    return coins.clamp(minCoins, maxCoins);
  }

  int _computeXp() {
    final double timeFrac = (_timeRemaining / roundSeconds).clamp(0.0, 1.0);
    final int extraMoves = (_moves - _scrambleDepth);
    final double moveFrac = 1.0 - (extraMoves.clamp(0, 30) / 30.0);
    final int xp = (25 + timeFrac * 25 + moveFrac * 20).round();
    return xp.clamp(minXp, maxXp);
  }

  void _onSolved() {
    if (_isGameOver) return;
    _isPlaying = false;
    _isGameOver = true;
    _ticker.stop();
    HapticFeedback.heavyImpact();

    final int coins = _computeCoins();
    final int xp = _computeXp();
    if (!mounted) return;
    setState(() {});
    if (!_rewarded) {
      _rewarded = true;
      widget.onGameFinished(coins, xp);
    }

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
          side: const BorderSide(color: Color(0xFFFFD700), width: 1.8),
        ),
        title: const Row(
          children: [
            Icon(Icons.auto_awesome_rounded, color: Color(0xFFFFD700), size: 28),
            SizedBox(width: 8),
            Flexible(
              child: Text(
                'Constellation Aligned!',
                style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Moves: $_moves',
                style: const TextStyle(color: Color(0xFFFFD700), fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Text('Time left: ${_timeRemaining.ceil()}s',
                style: const TextStyle(color: Colors.white70, fontSize: 14)),
            const SizedBox(height: 8),
            Text('Earned: +$coins Coins & +$xp XP',
                style: const TextStyle(color: Color(0xFF00E5FF), fontSize: 15, fontWeight: FontWeight.bold)),
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
              backgroundColor: const Color(0xFF8B5CF6),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
            onPressed: () {
              Navigator.pop(ctx);
              _nextPuzzle();
            },
            child: const Text('NEXT PUZZLE', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  void _onTimeUp() {
    if (_isGameOver) return;
    _isPlaying = false;
    _isGameOver = true;
    _ticker.stop();
    HapticFeedback.heavyImpact();

    const int coins = minCoins;
    const int xp = minXp;
    if (!mounted) return;
    setState(() {});
    if (!_rewarded) {
      _rewarded = true;
      widget.onGameFinished(coins, xp);
    }

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
          side: const BorderSide(color: Color(0xFFEC4899), width: 1.8),
        ),
        title: const Row(
          children: [
            Icon(Icons.nightlight_round, color: Color(0xFFEC4899), size: 28),
            SizedBox(width: 8),
            Flexible(
              child: Text(
                'Time\'s Up!',
                style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Nodes lit: ${_board.where((b) => b).length}/$nodeCount',
                style: const TextStyle(color: Color(0xFFFFD700), fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Text('Moves: $_moves', style: const TextStyle(color: Colors.white70, fontSize: 14)),
            const SizedBox(height: 8),
            Text('Earned: +$coins Coins & +$xp XP',
                style: const TextStyle(color: Color(0xFF00E5FF), fontSize: 15, fontWeight: FontWeight.bold)),
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
              backgroundColor: const Color(0xFFEC4899),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
            onPressed: () {
              Navigator.pop(ctx);
              _startGame();
            },
            child: const Text('TRY AGAIN', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  // --- UI -------------------------------------------------------------------
  Widget _buildStar(int index) {
    final bool lit = _board[index];
    return GestureDetector(
      onTap: () => _tapNode(index),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: lit ? null : const Color(0xFF1E293B),
          gradient: lit
              ? const RadialGradient(
                  colors: [Color(0xFFFFF8D6), Color(0xFFFFD700), Color(0xFFF59E0B)],
                )
              : null,
          border: Border.all(
            color: lit ? const Color(0xFFFFD700) : Colors.white24,
            width: lit ? 2.0 : 1.2,
          ),
          boxShadow: lit
              ? [
                  BoxShadow(
                    color: const Color(0xFFFFD700).withValues(alpha: 0.7),
                    blurRadius: 16,
                    spreadRadius: 2,
                  ),
                ]
              : null,
        ),
        child: LayoutBuilder(
          builder: (context, constraints) {
            return Center(
              child: Icon(
                lit ? Icons.star_rounded : Icons.star_outline_rounded,
                color: lit ? Colors.white : Colors.white38,
                size: constraints.maxHeight * 0.5,
              ),
            );
          },
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF070514),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        title: const Text('Constellation Flip', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        actions: [
          Center(
            child: Padding(
              padding: const EdgeInsets.only(right: 16),
              child: Row(
                children: [
                  const Icon(Icons.timer_outlined, color: Color(0xFF00E5FF), size: 18),
                  const SizedBox(width: 4),
                  Text('${_timeRemaining.ceil()}s',
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                  const SizedBox(width: 12),
                  const Icon(Icons.touch_app_outlined, color: Color(0xFFEC4899), size: 18),
                  const SizedBox(width: 4),
                  Text('$_moves',
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                ],
              ),
            ),
          ),
        ],
      ),
      body: Stack(
        children: [
          Column(
            children: [
              LinearProgressIndicator(
                value: (_timeRemaining / roundSeconds).clamp(0.0, 1.0),
                backgroundColor: Colors.white10,
                valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF8B5CF6)),
                minHeight: 4,
              ),
              Expanded(
                child: Center(
                  child: AspectRatio(
                    aspectRatio: 1.0,
                    child: Container(
                      margin: const EdgeInsets.all(16),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F172A),
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: const Color(0xFF8B5CF6).withValues(alpha: 0.5), width: 2),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF8B5CF6).withValues(alpha: 0.15),
                            blurRadius: 24,
                            spreadRadius: 2,
                          ),
                        ],
                      ),
                      child: GridView.builder(
                        physics: const NeverScrollableScrollPhysics(),
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: gridSize,
                          crossAxisSpacing: 10,
                          mainAxisSpacing: 10,
                        ),
                        itemCount: nodeCount,
                        itemBuilder: (context, index) => _buildStar(index),
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 12),
            ],
          ),

          // Start Screen Overlay
          if (!_isPlaying && !_isGameOver)
            Center(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Container(
                  constraints: const BoxConstraints(maxWidth: 340),
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A).withValues(alpha: 0.95),
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: const Color(0xFF8B5CF6), width: 2),
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.auto_awesome_rounded, color: Color(0xFFFFD700), size: 48),
                      const SizedBox(height: 12),
                      const Text(
                        'CONSTELLATION FLIP',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 20,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 1.2,
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Tap a star to flip it and its diagonal-free neighbours — light up the whole constellation!',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold, height: 1.4),
                      ),
                      const SizedBox(height: 20),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF8B5CF6),
                          foregroundColor: Colors.white,
                          minimumSize: const Size.fromHeight(48),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        ),
                        onPressed: _startGame,
                        child: const Text('START PUZZLE', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
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
}
