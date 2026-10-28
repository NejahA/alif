import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class NebulaSequenceGameScreen extends StatefulWidget {
  final Function(int coins, int xp) onGameFinished;

  const NebulaSequenceGameScreen({super.key, required this.onGameFinished});

  @override
  State<NebulaSequenceGameScreen> createState() => _NebulaSequenceGameScreenState();
}

class _NebulaSequenceGameScreenState extends State<NebulaSequenceGameScreen>
    with SingleTickerProviderStateMixin {
  static const int padCount = 4;
  static const int startLength = 2;

  // Reward bounds shared with the rest of the arcade (25-90 coins / 20-70 xp).
  static const int minCoins = 25;
  static const int maxCoins = 90;
  static const int minXp = 20;
  static const int maxXp = 70;

  // Flash cadence: ~450ms on / ~250ms off, short pause between rounds.
  static const int flashOnMs = 450;
  static const int flashOffMs = 250;
  static const int settleMs = 350;
  static const int roundPauseMs = 800;

  static const List<String> _padLabels = ['NOVA', 'PULSAR', 'QUASAR', 'COMET'];

  static const List<Color> _padColors = [
    Color(0xFFFFD700),
    Color(0xFF00E5FF),
    Color(0xFFEC4899),
    Color(0xFF8B5CF6),
  ];

  static const List<IconData> _padIcons = [
    Icons.flare_rounded,
    Icons.graphic_eq_rounded,
    Icons.brightness_7_rounded,
    Icons.auto_awesome_rounded,
  ];

  late AnimationController _ticker;
  Timer? _flashTimer;
  Timer? _pauseTimer;
  final Random _rand = Random();

  bool _isPlaying = false;
  bool _isGameOver = false;
  bool _rewarded = false;
  bool _isShowingSequence = false;

  final List<int> _sequence = [];
  int _inputIndex = 0;
  int _round = 0;
  int _bestLength = 0;
  int _achievedLength = 0;

  int? _activePad;
  int? _pressedPad;
  double _pressedFlash = 0.0;

  String _statusText = 'Watch closely...';

  @override
  void initState() {
    super.initState();
    _ticker = AnimationController(vsync: this, duration: const Duration(seconds: 1000))
      ..addListener(_gameLoop);
  }

  @override
  void dispose() {
    _flashTimer?.cancel();
    _pauseTimer?.cancel();
    _ticker.dispose();
    super.dispose();
  }

  // --- Game lifecycle -------------------------------------------------------
  void _startGame() {
    _flashTimer?.cancel();
    _pauseTimer?.cancel();
    setState(() {
      _isPlaying = true;
      _isGameOver = false;
      _rewarded = false;
      _isShowingSequence = true;
      _sequence.clear();
      _inputIndex = 0;
      _round = 0;
      _achievedLength = 0;
      _activePad = null;
      _pressedPad = null;
      _pressedFlash = 0.0;
      _statusText = 'Watch closely...';
    });
    _ticker.forward(from: 0.0);
    _nextRound(immediate: true);
  }

  void _nextRound({bool immediate = false}) {
    if (!mounted || !_isPlaying || _isGameOver) return;
    _flashTimer?.cancel();
    _pauseTimer?.cancel();

    setState(() {
      final int addCount = _sequence.isEmpty ? startLength : 1;
      for (int i = 0; i < addCount; i++) {
        _sequence.add(_rand.nextInt(padCount));
      }
      _round += 1;
      _inputIndex = 0;
      _isShowingSequence = true;
      _activePad = null;
      _statusText = 'Watch closely...';
    });

    if (immediate) {
      _playStep(0);
    } else {
      _pauseTimer = Timer(const Duration(milliseconds: roundPauseMs), () {
        if (!mounted || !_isPlaying || _isGameOver) return;
        _playStep(0);
      });
    }
  }

  // --- Sequence playback (timer driven) -------------------------------------
  void _playStep(int step) {
    if (!mounted || !_isPlaying || _isGameOver) return;

    if (step >= _sequence.length) {
      _flashTimer = Timer(const Duration(milliseconds: settleMs), () {
        if (!mounted || !_isPlaying || _isGameOver) return;
        setState(() {
          _isShowingSequence = false;
          _activePad = null;
          _statusText = 'Your turn!';
        });
      });
      return;
    }

    setState(() {
      _activePad = _sequence[step];
      _statusText = 'Watch closely...';
    });

    _flashTimer = Timer(const Duration(milliseconds: flashOnMs), () {
      if (!mounted || !_isPlaying || _isGameOver) return;
      setState(() {
        _activePad = null;
      });
      _flashTimer = Timer(const Duration(milliseconds: flashOffMs), () {
        if (!mounted || !_isPlaying || _isGameOver) return;
        _playStep(step + 1);
      });
    });
  }

  // --- Player input ---------------------------------------------------------
  void _tapPad(int index) {
    if (!mounted || !_isPlaying || _isGameOver || _isShowingSequence) return;
    if (_sequence.isEmpty || _inputIndex >= _sequence.length) return;

    final bool isCorrect = _sequence[_inputIndex] == index;

    if (!isCorrect) {
      setState(() {
        _pressedPad = index;
        _pressedFlash = 0.3;
        _statusText = 'Wrong node!';
      });
      _onGameOver();
      return;
    }

    HapticFeedback.selectionClick();
    setState(() {
      _pressedPad = index;
      _pressedFlash = 0.22;
      _inputIndex += 1;
    });

    if (_inputIndex >= _sequence.length) {
      setState(() {
        _achievedLength = _sequence.length;
        if (_achievedLength > _bestLength) _bestLength = _achievedLength;
        _statusText = 'Sequence recalled!';
      });
      _pauseTimer?.cancel();
      _pauseTimer = Timer(const Duration(milliseconds: roundPauseMs), () {
        if (!mounted || !_isPlaying || _isGameOver) return;
        _nextRound();
      });
    }
  }

  // --- Frame loop (decays the tap flash) ------------------------------------
  void _gameLoop() {
    if (!mounted || !_isPlaying || _isGameOver) return;
    if (_pressedFlash <= 0) return;
    setState(() {
      _pressedFlash = max(0.0, _pressedFlash - 0.016);
      if (_pressedFlash <= 0) _pressedPad = null;
    });
  }

  // --- Game over ------------------------------------------------------------
  void _onGameOver() {
    if (_isGameOver) return;
    _flashTimer?.cancel();
    _pauseTimer?.cancel();
    _ticker.stop();
    HapticFeedback.vibrate();

    final int earnedCoins = (22 + _achievedLength * 4).clamp(minCoins, maxCoins).toInt();
    final int earnedXP = (18 + _achievedLength * 3).clamp(minXp, maxXp).toInt();

    setState(() {
      _isGameOver = true;
      _isPlaying = false;
      _isShowingSequence = false;
      _activePad = null;
    });

    if (!_rewarded) {
      _rewarded = true;
      widget.onGameFinished(earnedCoins, earnedXP);
    }

    if (!mounted) return;

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
            Icon(Icons.bolt_rounded, color: Color(0xFFEC4899), size: 28),
            SizedBox(width: 8),
            Flexible(
              child: Text(
                'Signal Lost!',
                style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Length recalled: $_achievedLength',
                style: const TextStyle(color: Color(0xFFFFD700), fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Text('Reached round $_round | Best length $_bestLength',
                style: const TextStyle(color: Colors.white70, fontSize: 13)),
            const SizedBox(height: 8),
            Text('Earned: +$earnedCoins Coins & +$earnedXP XP',
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
              _startGame();
            },
            child: const Text('TRY AGAIN', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  // --- UI -------------------------------------------------------------------
  Widget _buildPad(int index) {
    final Color color = _padColors[index];
    final bool isActive = _activePad == index;
    final bool isPressed = _pressedPad == index && _pressedFlash > 0;
    final bool lit = isActive || isPressed;

    return GestureDetector(
      onTap: () => _tapPad(index),
      behavior: HitTestBehavior.opaque,
      child: AnimatedScale(
        scale: lit ? 1.05 : 1.0,
        duration: const Duration(milliseconds: 120),
        curve: Curves.easeOut,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 120),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            color: lit ? null : const Color(0xFF1E293B),
            gradient: lit
                ? RadialGradient(
                    colors: [
                      Colors.white,
                      color,
                      color.withValues(alpha: 0.55),
                    ],
                  )
                : LinearGradient(
                    colors: [
                      color.withValues(alpha: 0.18),
                      const Color(0xFF0F172A),
                    ],
                  ),
            border: Border.all(
              color: lit ? Colors.white : color.withValues(alpha: 0.6),
              width: lit ? 3.0 : 1.6,
            ),
            boxShadow: lit
                ? [
                    BoxShadow(
                      color: color.withValues(alpha: 0.65),
                      blurRadius: 22,
                      spreadRadius: 3,
                    ),
                  ]
                : null,
          ),
          child: LayoutBuilder(
            builder: (context, constraints) {
              final double box =
                  constraints.maxHeight.isFinite ? constraints.maxHeight : constraints.maxWidth;
              return Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      _padIcons[index],
                      color: lit ? Colors.white : color,
                      size: box * 0.3,
                    ),
                    SizedBox(height: box * 0.07),
                    FittedBox(
                      fit: BoxFit.scaleDown,
                      child: Text(
                        _padLabels[index],
                        style: TextStyle(
                          color: lit ? Colors.white : Colors.white70,
                          fontSize: box * 0.12,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 1.2,
                        ),
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
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
        title: const FittedBox(
          fit: BoxFit.scaleDown,
          alignment: Alignment.centerLeft,
          child: Text(
            'Nebula Sequence',
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
          ),
        ),
        actions: [
          Center(
            child: Padding(
              padding: const EdgeInsets.only(right: 10),
              child: FittedBox(
                fit: BoxFit.scaleDown,
                alignment: Alignment.centerRight,
                child: Row(
                  children: [
                    const Icon(Icons.radar_rounded, color: Color(0xFF8B5CF6), size: 15),
                    const SizedBox(width: 3),
                    Text('ROUND $_round',
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
                    const SizedBox(width: 8),
                    const Icon(Icons.timeline_rounded, color: Color(0xFF00E5FF), size: 15),
                    const SizedBox(width: 3),
                    Text('LENGTH ${_sequence.length}',
                        style: const TextStyle(
                            color: Color(0xFF00E5FF), fontWeight: FontWeight.bold, fontSize: 12)),
                    const SizedBox(width: 8),
                    const Icon(Icons.emoji_events_rounded, color: Color(0xFFFFD700), size: 15),
                    const SizedBox(width: 3),
                    Text('BEST $_bestLength',
                        style: const TextStyle(
                            color: Color(0xFFFFD700), fontWeight: FontWeight.bold, fontSize: 12)),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
      body: Stack(
        children: [
          Column(
            children: [
              const SizedBox(height: 8),
              SizedBox(
                height: 24,
                child: Center(
                  child: FittedBox(
                    fit: BoxFit.scaleDown,
                    child: Text(
                      _statusText,
                      style: TextStyle(
                        color: _isShowingSequence ? const Color(0xFF00E5FF) : const Color(0xFFFFD700),
                        fontSize: 15,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 1.1,
                      ),
                    ),
                  ),
                ),
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
                        border: Border.all(color: const Color(0xFF8B5CF6).withValues(alpha: 0.45), width: 2),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF8B5CF6).withValues(alpha: 0.18),
                            blurRadius: 22,
                            spreadRadius: 2,
                          ),
                        ],
                      ),
                      child: GridView.builder(
                        physics: const NeverScrollableScrollPhysics(),
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          crossAxisSpacing: 12,
                          mainAxisSpacing: 12,
                        ),
                        itemCount: padCount,
                        itemBuilder: (context, index) => _buildPad(index),
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 8),
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
                      const Icon(Icons.bubble_chart_rounded, color: Color(0xFF00E5FF), size: 48),
                      const SizedBox(height: 12),
                      const Text(
                        'NEBULA SEQUENCE',
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
                        'Watch the nebula nodes flash, then tap them back in the exact same order — each round grows longer!',
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
                        child: const Text('START SEQUENCE', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
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
