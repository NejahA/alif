import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class NebulaRhythmGameScreen extends StatefulWidget {
  final Function(int coins, int xp) onGameFinished;

  const NebulaRhythmGameScreen({super.key, required this.onGameFinished});

  @override
  State<NebulaRhythmGameScreen> createState() => _NebulaRhythmGameScreenState();
}

class _RhythmNote {
  final int lane; // 0, 1, 2, 3
  double y; // normalized 0..1+
  bool hit = false;
  bool missed = false;

  _RhythmNote({required this.lane, required this.y});
}

class _NebulaRhythmGameScreenState extends State<NebulaRhythmGameScreen> with SingleTickerProviderStateMixin {
  late AnimationController _ticker;

  bool _isPlaying = false;
  bool _isGameOver = false;

  final List<_RhythmNote> _notes = [];
  double _songTimeRemaining = 35.0; // 35 second track
  double _spawnTimer = 0.0;
  final double _fallSpeed = 0.009;

  int _score = 0;
  int _combo = 0;
  int _maxCombo = 0;
  int _perfectHits = 0;
  int _greatHits = 0;
  String _feedbackText = '';
  Color _feedbackColor = Colors.white;

  static const List<Color> laneColors = [
    Color(0xFF00E5FF), // Cyan
    Color(0xFFEC4899), // Pink
    Color(0xFFFFD700), // Gold
    Color(0xFF8B5CF6), // Purple
  ];

  static const List<IconData> laneIcons = [
    Icons.music_note_rounded,
    Icons.auto_awesome_rounded,
    Icons.bolt_rounded,
    Icons.star_rounded,
  ];

  @override
  void initState() {
    super.initState();
    _ticker = AnimationController(vsync: this, duration: const Duration(seconds: 1000))
      ..addListener(_gameLoop);
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
      _songTimeRemaining = 35.0;
      _notes.clear();
      _score = 0;
      _combo = 0;
      _maxCombo = 0;
      _perfectHits = 0;
      _greatHits = 0;
      _spawnTimer = 0.0;
      _feedbackText = 'READY! GO!';
      _feedbackColor = const Color(0xFF00E5FF);
    });
    _ticker.forward(from: 0.0);
  }

  void _tapLane(int lane) {
    if (!_isPlaying || _isGameOver) return;

    // Find the closest unhit note in this lane near hit line (hit line is at y = 0.82)
    _RhythmNote? closestNote;
    double minDistance = 999.0;

    for (final note in _notes) {
      if (note.lane == lane && !note.hit && !note.missed) {
        final dist = (note.y - 0.82).abs();
        if (dist < minDistance) {
          minDistance = dist;
          closestNote = note;
        }
      }
    }

    if (closestNote != null && minDistance < 0.12) {
      closestNote.hit = true;
      HapticFeedback.lightImpact();

      double multiplier = 1.0;
      if (_combo >= 20) {
        multiplier = 4.0;
      } else if (_combo >= 10) {
        multiplier = 2.0;
      } else if (_combo >= 5) {
        multiplier = 1.5;
      }

      if (minDistance < 0.045) {
        // Perfect
        _perfectHits += 1;
        _combo += 1;
        _score += (100 * multiplier).round();
        _feedbackText = 'PERFECT! ★ (${multiplier}x)';
        _feedbackColor = const Color(0xFFFFD700);
      } else {
        // Great
        _greatHits += 1;
        _combo += 1;
        _score += (50 * multiplier).round();
        _feedbackText = 'GREAT! (${multiplier}x)';
        _feedbackColor = const Color(0xFF00E5FF);
      }

      if (_combo > _maxCombo) {
        _maxCombo = _combo;
      }
    } else {
      // Tapped with no note close by
      _combo = 0;
      _feedbackText = 'OFF BEAT';
      _feedbackColor = Colors.white38;
    }

    setState(() {});
  }

  void _gameLoop() {
    if (!_isPlaying || _isGameOver) return;

    setState(() {
      _songTimeRemaining -= 0.016;
      if (_songTimeRemaining <= 0) {
        _onSongCompleted();
        return;
      }

      // Spawn notes on rhythm beats
      _spawnTimer += 0.016;
      if (_spawnTimer > 0.42) {
        _spawnTimer = 0.0;
        final rand = Random();
        final lane = rand.nextInt(4);
        _notes.add(_RhythmNote(lane: lane, y: -0.05));

        // Occasionally spawn simultaneous double beats
        if (rand.nextDouble() < 0.28) {
          int secondLane = (lane + 1 + rand.nextInt(3)) % 4;
          _notes.add(_RhythmNote(lane: secondLane, y: -0.05));
        }
      }

      // Move notes downward
      for (int i = _notes.length - 1; i >= 0; i--) {
        final note = _notes[i];
        note.y += _fallSpeed;

        // Check if missed (fell past y = 0.92)
        if (!note.hit && !note.missed && note.y > 0.92) {
          note.missed = true;
          _combo = 0;
          _feedbackText = 'MISS';
          _feedbackColor = const Color(0xFFFF5252);
        }

        // Remove offscreen
        if (note.y > 1.1) {
          _notes.removeAt(i);
        }
      }
    });
  }

  void _onSongCompleted() {
    _ticker.stop();
    HapticFeedback.vibrate();

    final earnedCoins = (_score / 25).round() + (_maxCombo * 3) + 25;
    final earnedXP = (_score / 30).round() + 30;

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
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24), side: const BorderSide(color: Color(0xFFEC4899), width: 1.8)),
        title: const Row(
          children: [
            Icon(Icons.audiotrack_rounded, color: Color(0xFFEC4899), size: 28),
            SizedBox(width: 8),
            Text('Track Complete!', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Score: $_score', style: const TextStyle(color: Color(0xFFFFD700), fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            Text('Max Combo: $_maxCombo | Perfect: $_perfectHits | Great: $_greatHits', style: const TextStyle(color: Colors.white70, fontSize: 13)),
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
              backgroundColor: const Color(0xFFEC4899),
              foregroundColor: Colors.white,
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
        title: const Text('Nebula Rhythm Beats', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
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
      body: Stack(
        children: [
          // 4-Lane Canvas
          Positioned.fill(
            child: CustomPaint(
              painter: _RhythmTrackPainter(
                notes: _notes,
                feedbackText: _feedbackText,
                feedbackColor: _feedbackColor,
                combo: _combo,
              ),
            ),
          ),

          // Top Track Progress Bar
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: LinearProgressIndicator(
              value: (_songTimeRemaining / 35.0).clamp(0.0, 1.0),
              backgroundColor: Colors.white10,
              valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFFEC4899)),
              minHeight: 4,
            ),
          ),

          // Bottom 4-Lane Touch Buttons
          Positioned(
            bottom: 16,
            left: 12,
            right: 12,
            child: Row(
              children: List.generate(4, (index) {
                final color = laneColors[index];
                return Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    child: InkWell(
                      onTap: () => _tapLane(index),
                      borderRadius: BorderRadius.circular(18),
                      child: Container(
                        height: 72,
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [color.withValues(alpha: 0.25), color.withValues(alpha: 0.65)],
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                          ),
                          borderRadius: BorderRadius.circular(18),
                          border: Border.all(color: color, width: 2),
                          boxShadow: [
                            BoxShadow(color: color.withValues(alpha: 0.35), blurRadius: 10, spreadRadius: 1),
                          ],
                        ),
                        child: Center(
                          child: Icon(laneIcons[index], color: Colors.white, size: 28),
                        ),
                      ),
                    ),
                  ),
                );
              }),
            ),
          ),

          // Start Screen Overlay
          if (!_isPlaying && !_isGameOver)
            Center(
              child: Container(
                constraints: const BoxConstraints(maxWidth: 340),
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A).withValues(alpha: 0.95),
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: const Color(0xFFEC4899), width: 2),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.audiotrack_rounded, color: Color(0xFFEC4899), size: 48),
                    const SizedBox(height: 12),
                    const Text(
                      'NEBULA RHYTHM',
                      style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w900, letterSpacing: 1.2),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'TAP 4 LANES AS MUSIC NOTES CROSS THE TARGET ZONE!\nBUILD COMBOS FOR UP TO 4X MULTIPLIER.',
                      style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold, height: 1.4),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 20),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFEC4899),
                        foregroundColor: Colors.white,
                        minimumSize: const Size.fromHeight(48),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                      onPressed: _startGame,
                      child: const Text('START TRACK', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
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

class _RhythmTrackPainter extends CustomPainter {
  final List<_RhythmNote> notes;
  final String feedbackText;
  final Color feedbackColor;
  final int combo;

  _RhythmTrackPainter({
    required this.notes,
    required this.feedbackText,
    required this.feedbackColor,
    required this.combo,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final laneWidth = size.width / 4;

    // 1. Draw 4 Lane dividers
    final dividerPaint = Paint()
      ..color = Colors.white.withValues(alpha: 0.08)
      ..strokeWidth = 1.5;

    for (int i = 1; i < 4; i++) {
      canvas.drawLine(Offset(i * laneWidth, 0), Offset(i * laneWidth, size.height), dividerPaint);
    }

    // 2. Draw Target Hit Line at y = 0.82
    final hitLineY = size.height * 0.82;
    final hitLinePaint = Paint()
      ..shader = const LinearGradient(
        colors: [Color(0xFF00E5FF), Color(0xFFEC4899), Color(0xFFFFD700), Color(0xFF8B5CF6)],
      ).createShader(Rect.fromLTWH(0, hitLineY, size.width, 3))
      ..strokeWidth = 3.0;

    canvas.drawLine(Offset(0, hitLineY), Offset(size.width, hitLineY), hitLinePaint);

    // Target receptors (rings on hit line)
    for (int i = 0; i < 4; i++) {
      final centerX = (i + 0.5) * laneWidth;
      final receptorPaint = Paint()
        ..color = _NebulaRhythmGameScreenState.laneColors[i].withValues(alpha: 0.45)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2.5;
      canvas.drawCircle(Offset(centerX, hitLineY), 20.0, receptorPaint);
    }

    // 3. Draw falling notes
    for (final note in notes) {
      if (note.hit) continue;

      final noteY = note.y * size.height;
      final noteX = (note.lane + 0.5) * laneWidth;
      final color = _NebulaRhythmGameScreenState.laneColors[note.lane];

      // Note aura
      final auraPaint = Paint()
        ..color = color.withValues(alpha: 0.4)
        ..style = PaintingStyle.fill;
      canvas.drawCircle(Offset(noteX, noteY), 22.0, auraPaint);

      // Note core orb
      final notePaint = Paint()
        ..color = color
        ..style = PaintingStyle.fill;
      canvas.drawCircle(Offset(noteX, noteY), 16.0, notePaint);

      final centerWhite = Paint()..color = Colors.white;
      canvas.drawCircle(Offset(noteX, noteY), 6.0, centerWhite);
    }

    // 4. Draw Feedback text & Combo counter in upper center
    if (feedbackText.isNotEmpty) {
      final textSpan = TextSpan(
        text: feedbackText,
        style: TextStyle(
          color: feedbackColor,
          fontSize: 22,
          fontWeight: FontWeight.w900,
          letterSpacing: 1.5,
          shadows: [
            Shadow(color: feedbackColor.withValues(alpha: 0.6), blurRadius: 12),
          ],
        ),
      );
      final textPainter = TextPainter(text: textSpan, textDirection: TextDirection.ltr);
      textPainter.layout();
      textPainter.paint(canvas, Offset((size.width - textPainter.width) / 2, size.height * 0.42));
    }

    if (combo > 1) {
      final comboSpan = TextSpan(
        text: '$combo COMBO!',
        style: const TextStyle(
          color: Color(0xFFFFD700),
          fontSize: 18,
          fontWeight: FontWeight.w900,
          letterSpacing: 1.2,
        ),
      );
      final comboPainter = TextPainter(text: comboSpan, textDirection: TextDirection.ltr);
      comboPainter.layout();
      comboPainter.paint(canvas, Offset((size.width - comboPainter.width) / 2, size.height * 0.48));
    }
  }

  @override
  bool shouldRepaint(covariant _RhythmTrackPainter oldDelegate) => true;
}
