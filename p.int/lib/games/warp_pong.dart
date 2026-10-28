import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

const double _paddleWidthNorm = 0.24; // 24% of the play-area width
const double _paddleHeight = 14.0;
const double _ballRadius = 8.0;
const double _edgeInset = 30.0;

class WarpPongGameScreen extends StatefulWidget {
  final Function(int coins, int xp) onGameFinished;

  const WarpPongGameScreen({super.key, required this.onGameFinished});

  @override
  State<WarpPongGameScreen> createState() => _WarpPongGameScreenState();
}

class _Star {
  final double x;
  final double y;
  final double radius;
  final double alpha;

  const _Star({required this.x, required this.y, required this.radius, required this.alpha});
}

class _WarpPongGameScreenState extends State<WarpPongGameScreen> with SingleTickerProviderStateMixin {
  static const double _roundSeconds = 60.0;
  static const double _baseSpeedFactor = 0.62; // fraction of play-area height per second
  static const double _speedStep = 0.045;
  static const double _maxSpeedFactor = 1.20;
  static const double _aiMaxSpeed = 0.9; // normalized paddle units per second (beatable)

  late final AnimationController _ticker;

  final List<_Star> _stars = [];
  final List<Offset> _trail = [];

  Duration _lastTick = Duration.zero;

  bool _isPlaying = false;
  bool _isGameOver = false;
  bool _rewardGranted = false;

  double _timeRemaining = _roundSeconds;

  double _playerPaddleX = 0.5;
  double _aiPaddleX = 0.5;

  double _ballX = 0.5;
  double _ballY = 0.5;
  double _ballDirX = 0.0;
  double _ballDirY = 1.0;
  double _ballSpeedFactor = _baseSpeedFactor;

  double _serveDelay = 0.0;
  bool _nextServeDown = true;

  double _bannerTimer = 0.0;
  String _banner = '';

  int _playerScore = 0;
  int _aiScore = 0;

  Size _playSize = Size.zero;

  @override
  void initState() {
    super.initState();
    final rand = Random(11);
    for (int i = 0; i < 80; i++) {
      _stars.add(
        _Star(
          x: rand.nextDouble(),
          y: rand.nextDouble(),
          radius: 0.6 + rand.nextDouble() * 1.7,
          alpha: 0.12 + rand.nextDouble() * 0.6,
        ),
      );
    }
    _ticker = AnimationController(vsync: this, duration: const Duration(minutes: 10))..addListener(_gameLoop);
  }

  @override
  void dispose() {
    _ticker.dispose();
    super.dispose();
  }

  void _startGame() {
    final rand = Random();
    setState(() {
      _isPlaying = true;
      _isGameOver = false;
      _rewardGranted = false;
      _timeRemaining = _roundSeconds;
      _playerScore = 0;
      _aiScore = 0;
      _playerPaddleX = 0.5;
      _aiPaddleX = 0.5;
      _ballSpeedFactor = _baseSpeedFactor;
      _serveDelay = 0.0;
      _bannerTimer = 0.0;
      _banner = '';
      _trail.clear();
      _serve(rand: rand, towardDown: rand.nextBool());
    });
    _lastTick = Duration.zero;
    _ticker.forward(from: 0.0);
  }

  void _serve({required Random rand, required bool towardDown}) {
    final angle = (rand.nextDouble() * 0.5 - 0.25) * pi; // ±45° from vertical
    _ballDirX = sin(angle);
    _ballDirY = cos(angle) * (towardDown ? 1.0 : -1.0);
    _normalizeDir();
    _ballX = 0.5;
    _ballY = 0.5;
    _nextServeDown = towardDown;
  }

  void _normalizeDir() {
    final magnitude = sqrt(_ballDirX * _ballDirX + _ballDirY * _ballDirY);
    if (magnitude <= 0.0001) {
      _ballDirX = 0.0;
      _ballDirY = 1.0;
      return;
    }
    _ballDirX /= magnitude;
    _ballDirY /= magnitude;
  }

  void _gameLoop() {
    if (!mounted) return;

    final now = _ticker.lastElapsedDuration ?? Duration.zero;
    var dt = (now - _lastTick).inMicroseconds / 1000000.0;
    _lastTick = now;
    if (dt <= 0 || dt > 0.05) dt = 0.016;

    if (!_isPlaying || _isGameOver) return;

    final size = _playSize;
    if (size.width <= 0 || size.height <= 0) return;

    var timeUp = false;
    setState(() {
      _timeRemaining -= dt;
      if (_timeRemaining <= 0) {
        _timeRemaining = 0.0;
        timeUp = true;
        return;
      }

      if (_bannerTimer > 0) _bannerTimer = max(0.0, _bannerTimer - dt);

      if (_serveDelay > 0) {
        _serveDelay -= dt;
        if (_serveDelay <= 0) {
          _serveDelay = 0.0;
          _serve(rand: Random(), towardDown: _nextServeDown);
        }
        return;
      }

      _updateBall(dt, size);
      _updateAi(dt);
    });

    if (timeUp) _finishGame();
  }

  void _updateBall(double dt, Size size) {
    final w = size.width;
    final h = size.height;
    const r = _ballRadius;
    final speed = _ballSpeedFactor * h;

    var bx = _ballX * w + _ballDirX * speed * dt;
    var by = _ballY * h + _ballDirY * speed * dt;

    // Bounce off the left / right warp walls.
    if (bx - r < 0) {
      bx = r;
      _ballDirX = _ballDirX.abs();
    }
    if (bx + r > w) {
      bx = w - r;
      _ballDirX = -_ballDirX.abs();
    }

    final paddleW = _paddleWidthNorm * w;

    final aiCenter = _aiPaddleX * w;
    final aiLeft = aiCenter - paddleW / 2;
    final aiRight = aiCenter + paddleW / 2;
    final aiTop = _edgeInset;
    final aiBottom = _edgeInset + _paddleHeight;

    final playerCenter = _playerPaddleX * w;
    final playerLeft = playerCenter - paddleW / 2;
    final playerRight = playerCenter + paddleW / 2;
    final playerTop = h - _edgeInset - _paddleHeight;
    final playerBottom = h - _edgeInset;

    // AI paddle deflects the ball back down.
    if (_ballDirY < 0 && by - r <= aiBottom && by + r >= aiTop && bx >= aiLeft - r && bx <= aiRight + r) {
      by = aiBottom + r;
      _onPaddleHit(aiCenter, paddleW, bx, 1.0);
    }

    // Player paddle deflects the ball back up.
    if (_ballDirY > 0 && by + r >= playerTop && by - r <= playerBottom && bx >= playerLeft - r && bx <= playerRight + r) {
      by = playerTop - r;
      _onPaddleHit(playerCenter, paddleW, bx, -1.0);
    }

    // Short fading trail.
    _trail.insert(0, Offset((bx / w).clamp(0.0, 1.0), (by / h).clamp(0.0, 1.0)));
    if (_trail.length > 16) _trail.removeLast();

    // Point scoring.
    if (by - r > h) {
      _scorePoint(false);
      return;
    }
    if (by + r < 0) {
      _scorePoint(true);
      return;
    }

    _ballX = (bx / w).clamp(0.0, 1.0);
    _ballY = (by / h).clamp(0.0, 1.0);
  }

  void _onPaddleHit(double paddleCenter, double paddleW, double ballXpx, double dirSign) {
    _ballSpeedFactor = min(_maxSpeedFactor, _ballSpeedFactor + _speedStep);
    final offset = ((ballXpx - paddleCenter) / (paddleW / 2)).clamp(-1.0, 1.0);
    final angle = offset * (pi / 3); // ±60° from vertical
    _ballDirX = sin(angle);
    _ballDirY = cos(angle) * dirSign;
    _normalizeDir();
    HapticFeedback.selectionClick();
  }

  void _scorePoint(bool playerScored) {
    if (playerScored) {
      _playerScore += 1;
      _banner = 'YOU SCORE!';
      _nextServeDown = false;
    } else {
      _aiScore += 1;
      _banner = 'AI SCORES!';
      _nextServeDown = true;
    }
    _bannerTimer = 0.9;
    _serveDelay = 0.7;
    _trail.clear();
    _ballX = 0.5;
    _ballY = 0.5;
    _ballSpeedFactor = _baseSpeedFactor;
    HapticFeedback.mediumImpact();
  }

  void _updateAi(double dt) {
    final maxStep = _aiMaxSpeed * dt;
    final diff = _ballX - _aiPaddleX;
    if (diff.abs() <= maxStep) {
      _aiPaddleX = _ballX;
    } else {
      _aiPaddleX += maxStep * diff.sign;
    }
    _aiPaddleX = _aiPaddleX.clamp(_paddleWidthNorm / 2, 1.0 - _paddleWidthNorm / 2);
  }

  void _movePaddle(double normalizedX) {
    if (!_isPlaying || _isGameOver) return;
    setState(() {
      _playerPaddleX = normalizedX.clamp(_paddleWidthNorm / 2, 1.0 - _paddleWidthNorm / 2);
    });
  }

  void _finishGame() {
    if (_rewardGranted) return;
    _rewardGranted = true;
    _ticker.stop();

    final won = _playerScore > _aiScore;
    var baseCoins = 20 + _playerScore * 2;
    var baseXp = 15 + _playerScore * 2;
    if (won) {
      baseCoins += 10;
      baseXp += 8;
    }
    final earnedCoins = baseCoins.clamp(25, 90).toInt();
    final earnedXP = baseXp.clamp(20, 70).toInt();

    if (!mounted) return;

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
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24), side: const BorderSide(color: Color(0xFF00E5FF), width: 1.8)),
        title: const Row(
          children: [
            Icon(Icons.sports_esports_rounded, color: Color(0xFF00E5FF), size: 28),
            SizedBox(width: 8),
            Flexible(child: Text('Match Complete!', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold))),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('You $_playerScore  •  AI $_aiScore', style: const TextStyle(color: Color(0xFFFFD700), fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            Text(won ? 'You outplayed the AI in the rally duel!' : 'The AI edged you out this time!', style: const TextStyle(color: Colors.white70, fontSize: 13)),
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF070514),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        title: const FittedBox(
          fit: BoxFit.scaleDown,
          alignment: Alignment.centerLeft,
          child: Text('Warp Pong', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        ),
        actions: [
          Center(
            child: Padding(
              padding: const EdgeInsets.only(right: 12),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.timer_outlined, color: Color(0xFF00E5FF), size: 16),
                  const SizedBox(width: 3),
                  Text('${_timeRemaining.ceil()}s', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                  const SizedBox(width: 10),
                  const Icon(Icons.sports_esports_rounded, color: Color(0xFFFFD700), size: 16),
                  const SizedBox(width: 3),
                  Text('$_playerScore', style: const TextStyle(color: Color(0xFFFFD700), fontWeight: FontWeight.bold, fontSize: 14)),
                  const SizedBox(width: 6),
                  const Text('-', style: TextStyle(color: Colors.white38, fontWeight: FontWeight.bold, fontSize: 14)),
                  const SizedBox(width: 6),
                  Text('$_aiScore', style: const TextStyle(color: Color(0xFFEC4899), fontWeight: FontWeight.bold, fontSize: 14)),
                  const SizedBox(width: 3),
                  const Icon(Icons.smart_toy_rounded, color: Color(0xFFEC4899), size: 16),
                ],
              ),
            ),
          ),
        ],
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          final size = Size(constraints.maxWidth, constraints.maxHeight);
          if (size.width > 0 && size.height > 0) _playSize = size;

          return GestureDetector(
            behavior: HitTestBehavior.opaque,
            onHorizontalDragUpdate: (details) {
              if (_playSize.width <= 0) return;
              _movePaddle(_playerPaddleX + details.delta.dx / _playSize.width);
            },
            onTapDown: (details) {
              if (_playSize.width <= 0) return;
              _movePaddle(details.localPosition.dx / _playSize.width);
            },
            child: Stack(
              children: [
                Positioned.fill(
                  child: CustomPaint(
                    painter: _WarpPongPainter(
                      stars: _stars,
                      trail: _trail,
                      ballX: _ballX,
                      ballY: _ballY,
                      playerX: _playerPaddleX,
                      aiX: _aiPaddleX,
                      showBall: _isPlaying,
                    ),
                  ),
                ),

                // Rally banner
                if (_bannerTimer > 0 && _banner.isNotEmpty)
                  Positioned(
                    top: 16,
                    left: 0,
                    right: 0,
                    child: IgnorePointer(
                      child: Center(
                        child: Opacity(
                          opacity: (_bannerTimer / 0.9).clamp(0.0, 1.0),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
                            decoration: BoxDecoration(
                              color: Colors.black.withValues(alpha: 0.55),
                              borderRadius: BorderRadius.circular(18),
                              border: Border.all(color: const Color(0xFF00E5FF), width: 1.5),
                              boxShadow: [
                                BoxShadow(color: const Color(0xFF00E5FF).withValues(alpha: 0.35), blurRadius: 16, spreadRadius: 1),
                              ],
                            ),
                            child: Text(
                              _banner,
                              style: const TextStyle(color: Color(0xFF00E5FF), fontSize: 16, fontWeight: FontWeight.w900, letterSpacing: 1.4),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),

                // Control hint
                if (_isPlaying && !_isGameOver)
                  Positioned(
                    bottom: 6,
                    left: 0,
                    right: 0,
                    child: IgnorePointer(
                      child: Center(
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.black.withValues(alpha: 0.45),
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: const Text(
                            '◀ DRAG OR TAP TO MOVE YOUR PADDLE ▶',
                            style: TextStyle(color: Colors.white60, fontSize: 10, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ),
                    ),
                  ),

                // Start overlay
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
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.sports_esports_rounded, color: Color(0xFF00E5FF), size: 48),
                          const SizedBox(height: 12),
                          const Text(
                            'WARP PONG',
                            style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900, letterSpacing: 1.2),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            'Drag or tap to move your paddle — outplay the AI and win the rally duel!',
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
                            child: const Text('START MATCH', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _WarpPongPainter extends CustomPainter {
  final List<_Star> stars;
  final List<Offset> trail;
  final double ballX;
  final double ballY;
  final double playerX;
  final double aiX;
  final bool showBall;

  const _WarpPongPainter({
    required this.stars,
    required this.trail,
    required this.ballX,
    required this.ballY,
    required this.playerX,
    required this.aiX,
    required this.showBall,
  });

  @override
  void paint(Canvas canvas, Size size) {
    // Starfield backdrop.
    final starPaint = Paint();
    for (final s in stars) {
      starPaint.color = Colors.white.withValues(alpha: s.alpha * 0.85);
      canvas.drawCircle(Offset(s.x * size.width, s.y * size.height), s.radius, starPaint);
    }

    // Centre warp line.
    final linePaint = Paint()
      ..color = const Color(0xFF00E5FF).withValues(alpha: 0.12)
      ..strokeWidth = 2;
    for (double y = 0; y < size.height; y += 24) {
      canvas.drawLine(Offset(size.width / 2, y), Offset(size.width / 2, y + 12), linePaint);
    }

    // Goal zones.
    final goalPaint = Paint()..color = const Color(0xFFEC4899).withValues(alpha: 0.06);
    canvas.drawRect(Rect.fromLTWH(0, 0, size.width, _edgeInset), goalPaint);
    final playerGoalPaint = Paint()..color = const Color(0xFF00E5FF).withValues(alpha: 0.06);
    canvas.drawRect(Rect.fromLTWH(0, size.height - _edgeInset, size.width, _edgeInset), playerGoalPaint);

    final paddleW = _paddleWidthNorm * size.width;

    // AI paddle (top).
    final aiRect = Rect.fromCenter(
      center: Offset(aiX * size.width, _edgeInset + _paddleHeight / 2),
      width: paddleW,
      height: _paddleHeight,
    );
    _drawPaddle(canvas, aiRect, const Color(0xFFEC4899));

    // Player paddle (bottom).
    final playerRect = Rect.fromCenter(
      center: Offset(playerX * size.width, size.height - _edgeInset - _paddleHeight / 2),
      width: paddleW,
      height: _paddleHeight,
    );
    _drawPaddle(canvas, playerRect, const Color(0xFF00E5FF));

    if (!showBall) return;

    // Ball trail.
    for (int i = 0; i < trail.length; i++) {
      final t = 1.0 - i / (trail.length + 1);
      final p = trail[i];
      final trailPaint = Paint()..color = const Color(0xFF8B5CF6).withValues(alpha: 0.35 * t);
      canvas.drawCircle(Offset(p.dx * size.width, p.dy * size.height), _ballRadius * (0.35 + 0.6 * t), trailPaint);
    }

    // Ball.
    final ballCenter = Offset(ballX * size.width, ballY * size.height);
    canvas.drawCircle(ballCenter, _ballRadius * 2.1, Paint()..color = const Color(0xFFFFD700).withValues(alpha: 0.20));
    canvas.drawCircle(ballCenter, _ballRadius, Paint()..color = const Color(0xFFFFD700));
    canvas.drawCircle(ballCenter, _ballRadius * 0.42, Paint()..color = Colors.white.withValues(alpha: 0.9));
  }

  void _drawPaddle(Canvas canvas, Rect rect, Color color) {
    final radius = Radius.circular(rect.height / 2);
    canvas.drawRRect(
      RRect.fromRectAndRadius(rect.inflate(5), radius),
      Paint()..color = color.withValues(alpha: 0.22),
    );
    canvas.drawRRect(
      RRect.fromRectAndRadius(rect, radius),
      Paint()
        ..shader = LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Colors.white.withValues(alpha: 0.9), color],
        ).createShader(rect),
    );
  }

  @override
  bool shouldRepaint(covariant _WarpPongPainter oldDelegate) => true;
}
