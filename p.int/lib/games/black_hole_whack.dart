import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class BlackHoleWhackGameScreen extends StatefulWidget {
  final Function(int coins, int xp) onGameFinished;

  const BlackHoleWhackGameScreen({super.key, required this.onGameFinished});

  @override
  State<BlackHoleWhackGameScreen> createState() => _BlackHoleWhackGameScreenState();
}

class _VoidCreature {
  final IconData icon;
  final Color color;
  final double lifetime;
  double lifeRemaining;
  double scale = 0.0;

  _VoidCreature({
    required this.icon,
    required this.color,
    required this.lifetime,
  }) : lifeRemaining = lifetime;
}

class _BlackHoleWhackGameScreenState extends State<BlackHoleWhackGameScreen> with SingleTickerProviderStateMixin {
  static const int _gridCount = 9;
  static const double _roundSeconds = 45.0;
  static const int _basePoints = 10;

  static const List<IconData> _creatureIcons = [
    Icons.blur_on_rounded,
    Icons.face_retouching_natural,
    Icons.brightness_1,
  ];

  static const List<Color> _creatureColors = [
    Color(0xFF8B5CF6),
    Color(0xFF00E5FF),
    Color(0xFFEC4899),
    Color(0xFFFFD700),
  ];

  late AnimationController _ticker;
  Timer? _spawnTimer;

  bool _isPlaying = false;
  bool _isGameOver = false;

  final Map<int, _VoidCreature> _creatures = {};

  int _score = 0;
  int _combo = 0;
  int _maxCombo = 0;
  int _hits = 0;
  int _misses = 0;

  double _timeRemaining = _roundSeconds;
  double _elapsed = 0.0;

  int? _hitIndex;
  double _hitFlashRemaining = 0.0;
  int? _missIndex;
  double _missFlashRemaining = 0.0;

  String _feedbackText = '';
  Color _feedbackColor = Colors.white;
  double _feedbackRemaining = 0.0;

  @override
  void initState() {
    super.initState();
    _ticker = AnimationController(vsync: this, duration: const Duration(seconds: 1000))
      ..addListener(_gameLoop);
  }

  @override
  void dispose() {
    _spawnTimer?.cancel();
    _ticker.dispose();
    super.dispose();
  }

  void _startGame() {
    _spawnTimer?.cancel();
    setState(() {
      _isPlaying = true;
      _isGameOver = false;
      _score = 0;
      _combo = 0;
      _maxCombo = 0;
      _hits = 0;
      _misses = 0;
      _timeRemaining = _roundSeconds;
      _elapsed = 0.0;
      _creatures.clear();
      _hitIndex = null;
      _hitFlashRemaining = 0.0;
      _missIndex = null;
      _missFlashRemaining = 0.0;
      _feedbackText = '';
      _feedbackRemaining = 0.0;
    });
    _ticker.forward(from: 0.0);
    _scheduleNextSpawn();
  }

  void _scheduleNextSpawn() {
    _spawnTimer?.cancel();
    final t = (_elapsed / _roundSeconds).clamp(0.0, 1.0);
    // Spawn cadence shortens from ~950ms down to ~450ms as the round ramps up.
    final intervalMs = (950 - 500 * t).round();
    _spawnTimer = Timer(Duration(milliseconds: intervalMs), () {
      if (!mounted || !_isPlaying || _isGameOver) return;
      _spawnCreature();
      _scheduleNextSpawn();
    });
  }

  void _spawnCreature() {
    final occupied = _creatures.keys.toSet();
    final available = [for (int i = 0; i < _gridCount; i++) if (!occupied.contains(i)) i];
    if (available.isEmpty) return;

    final rand = Random();
    final spot = available[rand.nextInt(available.length)];
    final t = (_elapsed / _roundSeconds).clamp(0.0, 1.0);
    // Visible window shrinks from ~1100ms down to ~450ms.
    final lifetime = (1100 - 650 * t) / 1000.0;
    final icon = _creatureIcons[rand.nextInt(_creatureIcons.length)];
    final color = _creatureColors[rand.nextInt(_creatureColors.length)];

    setState(() {
      _creatures[spot] = _VoidCreature(icon: icon, color: color, lifetime: lifetime);
    });
    HapticFeedback.selectionClick();
  }

  int _multiplierFor(int combo) {
    if (combo >= 10) return 3;
    if (combo >= 5) return 2;
    return 1;
  }

  void _tapSpot(int index) {
    if (!_isPlaying || _isGameOver) return;

    final creature = _creatures[index];
    if (creature != null) {
      _creatures.remove(index);
      _combo += 1;
      if (_combo > _maxCombo) _maxCombo = _combo;
      final multiplier = _multiplierFor(_combo);
      _score += _basePoints * multiplier;
      _hits += 1;
      HapticFeedback.lightImpact();
      _hitIndex = index;
      _hitFlashRemaining = 0.18;
      _feedbackText = multiplier > 1 ? 'SMASH! x$multiplier COMBO' : 'VOID SMASH!';
      _feedbackColor = const Color(0xFF00E5FF);
      _feedbackRemaining = 0.6;
    } else {
      // Mistake: tapping an empty porthole.
      _combo = 0;
      _misses += 1;
      _timeRemaining = max(0.0, _timeRemaining - 2.0);
      HapticFeedback.mediumImpact();
      _missIndex = index;
      _missFlashRemaining = 0.3;
      _feedbackText = 'MISS! -2s';
      _feedbackColor = const Color(0xFFFF5252);
      _feedbackRemaining = 0.6;
      if (_timeRemaining <= 0) {
        setState(() {});
        _onGameOver();
        return;
      }
    }

    setState(() {});
  }

  void _gameLoop() {
    if (!_isPlaying || _isGameOver) return;

    setState(() {
      const dt = 0.016;
      _elapsed += dt;
      _timeRemaining -= dt;
      if (_timeRemaining <= 0) {
        _timeRemaining = 0.0;
        _onGameOver();
        return;
      }

      // Update active creatures and expire those whose window elapsed.
      final expired = <int>[];
      _creatures.forEach((spot, creature) {
        creature.lifeRemaining -= dt;
        final emerge = ((creature.lifetime - creature.lifeRemaining) / 0.15).clamp(0.0, 1.0);
        final vanish = (creature.lifeRemaining / 0.15).clamp(0.0, 1.0);
        creature.scale = min(emerge, vanish);
        if (creature.lifeRemaining <= 0) expired.add(spot);
      });
      for (final spot in expired) {
        _creatures.remove(spot);
      }

      if (_hitFlashRemaining > 0) {
        _hitFlashRemaining -= dt;
        if (_hitFlashRemaining <= 0) _hitIndex = null;
      }
      if (_missFlashRemaining > 0) {
        _missFlashRemaining -= dt;
        if (_missFlashRemaining <= 0) _missIndex = null;
      }
      if (_feedbackRemaining > 0) {
        _feedbackRemaining = max(0.0, _feedbackRemaining - dt);
      }
    });
  }

  void _onGameOver() {
    if (_isGameOver) return;
    _spawnTimer?.cancel();
    _ticker.stop();
    HapticFeedback.vibrate();

    final earnedCoins = max(25, min(90, (_score / 20).round() + 25));
    final earnedXP = max(20, min(70, (_score / 25).round() + 20));

    setState(() {
      _isGameOver = true;
      _isPlaying = false;
      _creatures.clear();
    });

    widget.onGameFinished(earnedCoins, earnedXP);

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24), side: const BorderSide(color: Color(0xFF8B5CF6), width: 1.8)),
        title: const Row(
          children: [
            Icon(Icons.blur_on_rounded, color: Color(0xFF8B5CF6), size: 28),
            SizedBox(width: 8),
            Text('Hunt Complete!', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Score: $_score', style: const TextStyle(color: Color(0xFFFFD700), fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            Text('Max Combo: $_maxCombo | Hits: $_hits | Misses: $_misses', style: const TextStyle(color: Colors.white70, fontSize: 13)),
            const SizedBox(height: 8),
            Text('Earned: +$earnedCoins Coins & +$earnedXP XP', style: const TextStyle(color: Color(0xFF00E5FF), fontSize: 15, fontWeight: FontWeight.bold)),
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
            child: const Text('HUNT AGAIN', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _buildPorthole(int index) {
    final creature = _creatures[index];
    final isHit = _hitIndex == index && _hitFlashRemaining > 0;
    final isMiss = _missIndex == index && _missFlashRemaining > 0;

    final Color? glowColor = creature != null ? creature.color : (isHit ? const Color(0xFF00E5FF) : null);

    return GestureDetector(
      onTap: () => _tapSpot(index),
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 110),
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: creature == null ? const Color(0xFF0F172A) : null,
          gradient: creature != null
              ? RadialGradient(
                  colors: [
                    creature.color.withValues(alpha: 0.95),
                    creature.color.withValues(alpha: 0.30),
                  ],
                )
              : null,
          border: Border.all(
            color: isMiss
                ? const Color(0xFFFF5252)
                : (creature != null ? Colors.white : Colors.white12),
            width: isMiss ? 3.0 : (creature != null ? 2.5 : 1.5),
          ),
          boxShadow: glowColor != null
              ? [BoxShadow(color: glowColor.withValues(alpha: 0.5), blurRadius: 16, spreadRadius: 2)]
              : null,
        ),
        child: Center(
          child: creature != null
              ? Transform.scale(
                  scale: creature.scale.clamp(0.0, 1.0),
                  child: Icon(creature.icon, color: Colors.white, size: 34),
                )
              : isHit
                  ? const Icon(Icons.flare_rounded, color: Color(0xFF00E5FF), size: 26)
                  : isMiss
                      ? const Icon(Icons.close_rounded, color: Color(0xFFFF5252), size: 26)
                      : const Icon(Icons.blur_circular_rounded, color: Colors.white24, size: 22),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final feedbackOpacity = (_feedbackRemaining / 0.6).clamp(0.0, 1.0);

    return Scaffold(
      backgroundColor: const Color(0xFF070514),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        title: const FittedBox(
          fit: BoxFit.scaleDown,
          alignment: Alignment.centerLeft,
          child: Text('Black Hole Whack', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        ),
        actions: [
          Center(
            child: Padding(
              padding: const EdgeInsets.only(right: 12),
              child: Row(
                children: [
                  const Icon(Icons.timer_outlined, color: Color(0xFF00E5FF), size: 17),
                  const SizedBox(width: 3),
                  Text('${_timeRemaining.toInt()}s', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                  const SizedBox(width: 10),
                  const Icon(Icons.stars, color: Color(0xFFFFD700), size: 17),
                  const SizedBox(width: 3),
                  Text('$_score', style: const TextStyle(color: Color(0xFFFFD700), fontWeight: FontWeight.bold, fontSize: 15)),
                  const SizedBox(width: 10),
                  const Icon(Icons.bolt_rounded, color: Color(0xFFEC4899), size: 17),
                  const SizedBox(width: 3),
                  Text('$_combo', style: const TextStyle(color: Color(0xFFEC4899), fontWeight: FontWeight.bold, fontSize: 15)),
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
                value: (_timeRemaining / _roundSeconds).clamp(0.0, 1.0),
                backgroundColor: Colors.white10,
                valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF8B5CF6)),
                minHeight: 4,
              ),

              const SizedBox(height: 10),

              SizedBox(
                height: 26,
                child: Center(
                  child: Opacity(
                    opacity: feedbackOpacity,
                    child: Text(
                      _feedbackText,
                      style: TextStyle(color: _feedbackColor, fontSize: 16, fontWeight: FontWeight.w900, letterSpacing: 1.1),
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
                          BoxShadow(color: const Color(0xFF8B5CF6).withValues(alpha: 0.18), blurRadius: 22, spreadRadius: 2),
                        ],
                      ),
                      child: GridView.builder(
                        physics: const NeverScrollableScrollPhysics(),
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 3,
                          crossAxisSpacing: 10,
                          mainAxisSpacing: 10,
                        ),
                        itemCount: _gridCount,
                        itemBuilder: (context, index) => _buildPorthole(index),
                      ),
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 8),
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
                  border: Border.all(color: const Color(0xFF8B5CF6), width: 2),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.blur_on_rounded, color: Color(0xFF8B5CF6), size: 48),
                    const SizedBox(height: 12),
                    const Text(
                      'BLACK HOLE WHACK',
                      style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900, letterSpacing: 1.2),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Tap the emerging void creatures before they vanish — never touch an empty porthole!',
                      style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold, height: 1.4),
                      textAlign: TextAlign.center,
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
                      child: const Text('START HUNT', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}
