import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class EclipseGridGameScreen extends StatefulWidget {
  final Function(int coins, int xp) onGameFinished;

  const EclipseGridGameScreen({super.key, required this.onGameFinished});

  @override
  State<EclipseGridGameScreen> createState() => _EclipseGridGameScreenState();
}

class _EclipseGridGameScreenState extends State<EclipseGridGameScreen> with SingleTickerProviderStateMixin {
  static const int _gridSize = 5;
  static const int _cellCount = _gridSize * _gridSize;

  late final AnimationController _ticker;

  final List<bool> _lit = List<bool>.filled(_cellCount, false);

  Duration _lastTick = Duration.zero;
  Duration _elapsed = Duration.zero;

  bool _isPlaying = false;
  bool _isGameOver = false;
  bool _rewardGranted = false;

  int _moves = 0;

  @override
  void initState() {
    super.initState();
    _ticker = AnimationController(vsync: this, duration: const Duration(minutes: 10))..addListener(_gameLoop);
  }

  @override
  void dispose() {
    _ticker.dispose();
    super.dispose();
  }

  void _startGame() {
    setState(() {
      _isPlaying = true;
      _isGameOver = false;
      _rewardGranted = false;
      _moves = 0;
      _elapsed = Duration.zero;
      _generatePuzzle(Random());
    });
    _lastTick = Duration.zero;
    _ticker.forward(from: 0.0);
  }

  void _generatePuzzle(Random rand) {
    for (int i = 0; i < _cellCount; i++) {
      _lit[i] = false;
    }
    final taps = 8 + rand.nextInt(7); // 8..14 random taps on an all-DARK board
    for (int t = 0; t < taps; t++) {
      _toggle(rand.nextInt(_cellCount));
    }
    if (_isAllDark()) _toggle(rand.nextInt(_cellCount));
  }

  void _toggle(int index) {
    final row = index ~/ _gridSize;
    final col = index % _gridSize;

    void flip(int r, int c) {
      if (r < 0 || r >= _gridSize || c < 0 || c >= _gridSize) return;
      final i = r * _gridSize + c;
      _lit[i] = !_lit[i];
    }

    flip(row, col);
    flip(row - 1, col);
    flip(row + 1, col);
    flip(row, col - 1);
    flip(row, col + 1);
  }

  bool _isAllDark() {
    for (int i = 0; i < _cellCount; i++) {
      if (_lit[i]) return false;
    }
    return true;
  }

  void _handleTap(int index) {
    if (!_isPlaying || _isGameOver) return;
    HapticFeedback.selectionClick();
    setState(() {
      _moves += 1;
      _toggle(index);
    });
    if (_isAllDark()) _solveGame();
  }

  void _gameLoop() {
    if (!mounted) return;

    final now = _ticker.lastElapsedDuration ?? Duration.zero;
    var dt = (now - _lastTick).inMicroseconds / 1000000.0;
    _lastTick = now;
    if (dt <= 0 || dt > 0.05) dt = 0.016;

    if (!_isPlaying || _isGameOver) return;

    setState(() {
      _elapsed += Duration(microseconds: (dt * 1000000).round());
    });
  }

  void _solveGame() {
    if (_rewardGranted) return;
    _rewardGranted = true;
    _ticker.stop();

    final earnedCoins = (90 - _moves * 3).clamp(25, 90).toInt();
    final earnedXP = (70 - _moves * 3).clamp(20, 70).toInt();

    if (!mounted) return;

    setState(() {
      _isGameOver = true;
      _isPlaying = false;
    });

    widget.onGameFinished(earnedCoins, earnedXP);
    _showResultDialog(won: true, coins: earnedCoins, xp: earnedXP);
  }

  void _giveUp() {
    if (_rewardGranted) return;
    _rewardGranted = true;
    _ticker.stop();

    const earnedCoins = 10;
    const earnedXP = 5;

    if (!mounted) return;

    setState(() {
      _isGameOver = true;
      _isPlaying = false;
    });

    widget.onGameFinished(earnedCoins, earnedXP);
    _showResultDialog(won: false, coins: earnedCoins, xp: earnedXP);
  }

  void _showResultDialog({required bool won, required int coins, required int xp}) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24), side: const BorderSide(color: Color(0xFF00E5FF), width: 1.8)),
        title: Row(
          children: [
            Icon(won ? Icons.emoji_events_rounded : Icons.flag_rounded, color: const Color(0xFF00E5FF), size: 28),
            const SizedBox(width: 8),
            Flexible(
              child: Text(
                won ? 'Eclipse Solved!' : 'Run Ended',
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              won ? 'Every cell went dark in $_moves moves!' : 'You gave up after $_moves moves — nice try!',
              style: const TextStyle(color: Color(0xFFFFD700), fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 6),
            Text('Time: ${_formatTime(_elapsed)}', style: const TextStyle(color: Colors.white70, fontSize: 13)),
            const SizedBox(height: 8),
            Text('Earned: +$coins Coins & +$xp XP', style: const TextStyle(color: Color(0xFF00E5FF), fontSize: 15, fontWeight: FontWeight.bold)),
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
              backgroundColor: const Color(0xFF00E5FF),
              foregroundColor: const Color(0xFF070514),
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

  String _formatTime(Duration d) {
    final m = d.inMinutes;
    final s = d.inSeconds % 60;
    return '$m:${s.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF070514),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        title: const FittedBox(
          fit: BoxFit.scaleDown,
          alignment: Alignment.centerLeft,
          child: Text('Eclipse Grid', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        ),
        actions: [
          Center(
            child: Padding(
              padding: const EdgeInsets.only(right: 12),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.touch_app_rounded, color: Color(0xFF00E5FF), size: 16),
                  const SizedBox(width: 3),
                  Text('$_moves', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                  const SizedBox(width: 10),
                  const Icon(Icons.timer_outlined, color: Color(0xFFFFD700), size: 16),
                  const SizedBox(width: 3),
                  Text(_formatTime(_elapsed), style: const TextStyle(color: Color(0xFFFFD700), fontWeight: FontWeight.bold, fontSize: 14)),
                ],
              ),
            ),
          ),
        ],
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          return Stack(
            children: [
              Positioned.fill(
                child: DecoratedBox(
                  decoration: const BoxDecoration(
                    gradient: RadialGradient(
                      center: Alignment.center,
                      radius: 0.9,
                      colors: [Color(0xFF120B2E), Color(0xFF070514)],
                    ),
                  ),
                ),
              ),
              Column(
                children: [
                  Expanded(
                    child: Center(
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: AspectRatio(
                          aspectRatio: 1,
                          child: GridView.count(
                            crossAxisCount: _gridSize,
                            mainAxisSpacing: 8,
                            crossAxisSpacing: 8,
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            children: List<Widget>.generate(_cellCount, _buildCell),
                          ),
                        ),
                      ),
                    ),
                  ),
                  if (_isPlaying && !_isGameOver)
                    Padding(
                      padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                      child: Row(
                        children: [
                          Expanded(
                            child: OutlinedButton.icon(
                              style: OutlinedButton.styleFrom(
                                foregroundColor: const Color(0xFF00E5FF),
                                side: const BorderSide(color: Color(0xFF00E5FF)),
                                minimumSize: const Size.fromHeight(46),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                              ),
                              onPressed: _startGame,
                              icon: const Icon(Icons.refresh_rounded, size: 18),
                              label: const Text('RESET', style: TextStyle(fontWeight: FontWeight.bold)),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: OutlinedButton.icon(
                              style: OutlinedButton.styleFrom(
                                foregroundColor: const Color(0xFFEC4899),
                                side: const BorderSide(color: Color(0xFFEC4899)),
                                minimumSize: const Size.fromHeight(46),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                              ),
                              onPressed: _giveUp,
                              icon: const Icon(Icons.flag_rounded, size: 18),
                              label: const Text('GIVE UP', style: TextStyle(fontWeight: FontWeight.bold)),
                            ),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
              if (!_isPlaying && !_isGameOver)
                Center(
                  child: Container(
                    constraints: const BoxConstraints(maxWidth: 340),
                    margin: const EdgeInsets.symmetric(horizontal: 16),
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F172A).withValues(alpha: 0.95),
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: const Color(0xFF00E5FF), width: 2),
                    ),
                    child: SingleChildScrollView(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.dark_mode_rounded, color: Color(0xFF00E5FF), size: 48),
                          const SizedBox(height: 12),
                          const Text(
                            'ECLIPSE GRID',
                            style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900, letterSpacing: 1.2),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            'Tap a cell to flip it and its neighbors — make every cell go DARK.',
                            style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold, height: 1.4),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 20),
                          ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF00E5FF),
                              foregroundColor: const Color(0xFF070514),
                              minimumSize: const Size.fromHeight(48),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            ),
                            onPressed: _startGame,
                            child: const Text('BEGIN PUZZLE', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildCell(int index) {
    final lit = _lit[index];
    return GestureDetector(
      onTap: _isPlaying && !_isGameOver ? () => _handleTap(index) : null,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        decoration: BoxDecoration(
          color: lit ? const Color(0xFFFFD700).withValues(alpha: 0.9) : const Color(0xFF0F172A),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: lit ? const Color(0xFFFFD700) : const Color(0xFF334155), width: 2),
          boxShadow: lit
              ? [
                  BoxShadow(color: const Color(0xFFFFD700).withValues(alpha: 0.5), blurRadius: 12, spreadRadius: 1),
                ]
              : null,
        ),
        child: Center(
          child: Icon(
            lit ? Icons.wb_sunny_rounded : Icons.dark_mode_rounded,
            color: lit ? const Color(0xFF070514) : const Color(0xFF64748B),
            size: 20,
          ),
        ),
      ),
    );
  }
}
