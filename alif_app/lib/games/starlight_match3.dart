import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class StarlightMatch3GameScreen extends StatefulWidget {
  final Function(int coins, int xp) onGameFinished;

  const StarlightMatch3GameScreen({super.key, required this.onGameFinished});

  @override
  State<StarlightMatch3GameScreen> createState() => _StarlightMatch3GameScreenState();
}

class _StarlightMatch3GameScreenState extends State<StarlightMatch3GameScreen> {
  static const int rows = 6;
  static const int cols = 6;

  bool _isPlaying = false;
  bool _isGameOver = false;

  late List<List<int>> _grid;
  int? _selectedRow;
  int? _selectedCol;

  int _score = 0;
  int _combo = 0;
  double _timeRemaining = 45.0;
  Timer? _countdownTimer;

  static const List<Color> gemColors = [
    Color(0xFFFF5252), // 0: Ruby
    Color(0xFF00E5FF), // 1: Sapphire
    Color(0xFF10B981), // 2: Emerald
    Color(0xFFFFD700), // 3: Topaz
    Color(0xFF8B5CF6), // 4: Amethyst
  ];

  static const List<IconData> gemIcons = [
    Icons.diamond_rounded,
    Icons.auto_awesome,
    Icons.square_rounded,
    Icons.star_rounded,
    Icons.lens_rounded,
  ];

  @override
  void initState() {
    super.initState();
    _initGrid();
  }

  @override
  void dispose() {
    _countdownTimer?.cancel();
    super.dispose();
  }

  void _initGrid() {
    final rand = Random();
    _grid = List.generate(rows, (_) => List.generate(cols, (_) => rand.nextInt(5)));

    // Prevent pre-existing matches on initial spawn
    for (int r = 0; r < rows; r++) {
      for (int c = 0; c < cols; c++) {
        while ((c >= 2 && _grid[r][c] == _grid[r][c - 1] && _grid[r][c] == _grid[r][c - 2]) ||
            (r >= 2 && _grid[r][c] == _grid[r - 1][c] && _grid[r][c] == _grid[r - 2][c])) {
          _grid[r][c] = rand.nextInt(5);
        }
      }
    }
  }

  void _startGame() {
    _countdownTimer?.cancel();
    setState(() {
      _isPlaying = true;
      _isGameOver = false;
      _score = 0;
      _combo = 0;
      _timeRemaining = 45.0;
      _selectedRow = null;
      _selectedCol = null;
      _initGrid();
    });

    _countdownTimer = Timer.periodic(const Duration(milliseconds: 100), (t) {
      if (!mounted) return;
      setState(() {
        _timeRemaining -= 0.1;
        if (_timeRemaining <= 0) {
          t.cancel();
          _onGameOver();
        }
      });
    });
  }

  void _tapGem(int r, int c) {
    if (!_isPlaying || _isGameOver) return;

    if (_selectedRow == null || _selectedCol == null) {
      setState(() {
        _selectedRow = r;
        _selectedCol = c;
      });
      HapticFeedback.selectionClick();
      return;
    }

    final sr = _selectedRow!;
    final sc = _selectedCol!;

    // Same gem tapped -> deselect
    if (sr == r && sc == c) {
      setState(() {
        _selectedRow = null;
        _selectedCol = null;
      });
      return;
    }

    // Check if adjacent (Manhattan distance == 1)
    final isAdjacent = (sr - r).abs() + (sc - c).abs() == 1;
    if (!isAdjacent) {
      setState(() {
        _selectedRow = r;
        _selectedCol = c;
      });
      HapticFeedback.selectionClick();
      return;
    }

    // Attempt swap
    setState(() {
      final temp = _grid[sr][sc];
      _grid[sr][sc] = _grid[r][c];
      _grid[r][c] = temp;
      _selectedRow = null;
      _selectedCol = null;
    });

    final hasMatches = _checkAndClearMatches();
    if (!hasMatches) {
      // Revert swap if no match formed
      Future.delayed(const Duration(milliseconds: 200), () {
        if (!mounted) return;
        setState(() {
          final temp = _grid[sr][sc];
          _grid[sr][sc] = _grid[r][c];
          _grid[r][c] = temp;
        });
      });
    } else {
      HapticFeedback.mediumImpact();
    }
  }

  bool _checkAndClearMatches() {
    final toRemove = <Point<int>>{};

    // Horizontal check
    for (int r = 0; r < rows; r++) {
      int matchLen = 1;
      for (int c = 1; c < cols; c++) {
        if (_grid[r][c] == _grid[r][c - 1]) {
          matchLen++;
        } else {
          if (matchLen >= 3) {
            for (int k = c - matchLen; k < c; k++) {
              toRemove.add(Point(r, k));
            }
          }
          matchLen = 1;
        }
      }
      if (matchLen >= 3) {
        for (int k = cols - matchLen; k < cols; k++) {
          toRemove.add(Point(r, k));
        }
      }
    }

    // Vertical check
    for (int c = 0; c < cols; c++) {
      int matchLen = 1;
      for (int r = 1; r < rows; r++) {
        if (_grid[r][c] == _grid[r - 1][c]) {
          matchLen++;
        } else {
          if (matchLen >= 3) {
            for (int k = r - matchLen; k < r; k++) {
              toRemove.add(Point(k, c));
            }
          }
          matchLen = 1;
        }
      }
      if (matchLen >= 3) {
        for (int k = rows - matchLen; k < rows; k++) {
          toRemove.add(Point(k, c));
        }
      }
    }

    if (toRemove.isEmpty) return false;

    // Award points
    _combo++;
    final pts = toRemove.length * 20 * _combo;
    _score += pts;

    // Collapse columns & refill
    final rand = Random();
    for (final p in toRemove) {
      _grid[p.x][p.y] = -1;
    }

    for (int c = 0; c < cols; c++) {
      final validPieces = <int>[];
      for (int r = rows - 1; r >= 0; r--) {
        if (_grid[r][c] != -1) {
          validPieces.add(_grid[r][c]);
        }
      }
      // Fill from bottom
      int idx = 0;
      for (int r = rows - 1; r >= 0; r--) {
        if (idx < validPieces.length) {
          _grid[r][c] = validPieces[idx++];
        } else {
          _grid[r][c] = rand.nextInt(5); // New falling gem
        }
      }
    }

    // Cascade check
    Future.delayed(const Duration(milliseconds: 250), () {
      if (!mounted) return;
      if (_checkAndClearMatches()) {
        setState(() {});
      } else {
        _combo = 0;
      }
    });

    return true;
  }

  void _onGameOver() {
    _countdownTimer?.cancel();
    HapticFeedback.vibrate();

    final earnedCoins = (_score / 25).round() + 20;
    final earnedXP = (_score / 30).round() + 25;

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
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24), side: const BorderSide(color: Color(0xFFFFD700), width: 1.8)),
        title: const Row(
          children: [
            Icon(Icons.diamond_rounded, color: Color(0xFFFFD700), size: 28),
            SizedBox(width: 8),
            Text('Time Up!', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Score: $_score', style: const TextStyle(color: Color(0xFFFFD700), fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            const Text('Supernova cascade complete!', style: TextStyle(color: Colors.white70, fontSize: 14)),
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
              backgroundColor: const Color(0xFFFFD700),
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
        title: const Text('Starlight Match-3', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        actions: [
          Center(
            child: Padding(
              padding: const EdgeInsets.only(right: 16),
              child: Row(
                children: [
                  const Icon(Icons.timer_outlined, color: Color(0xFF00E5FF), size: 18),
                  const SizedBox(width: 4),
                  Text('${_timeRemaining.toInt()}s', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                  const SizedBox(width: 14),
                  const Icon(Icons.stars, color: Color(0xFFFFD700), size: 18),
                  const SizedBox(width: 4),
                  Text('$_score', style: const TextStyle(color: Color(0xFFFFD700), fontWeight: FontWeight.bold, fontSize: 16)),
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
              // Timer progress bar
              LinearProgressIndicator(
                value: (_timeRemaining / 45.0).clamp(0.0, 1.0),
                backgroundColor: Colors.white10,
                valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFFFFD700)),
                minHeight: 4,
              ),

              const SizedBox(height: 12),

              // Match-3 Grid
              Expanded(
                child: Center(
                  child: AspectRatio(
                    aspectRatio: 1.0,
                    child: Container(
                      margin: const EdgeInsets.all(16),
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F172A),
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: const Color(0xFFFFD700).withValues(alpha: 0.4), width: 2),
                        boxShadow: [
                          BoxShadow(color: const Color(0xFFFFD700).withValues(alpha: 0.15), blurRadius: 20, spreadRadius: 2),
                        ],
                      ),
                      child: GridView.builder(
                        physics: const NeverScrollableScrollPhysics(),
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: cols,
                          crossAxisSpacing: 8,
                          mainAxisSpacing: 8,
                        ),
                        itemCount: rows * cols,
                        itemBuilder: (context, index) {
                          final r = index ~/ cols;
                          final c = index % cols;
                          final gemType = _grid[r][c];
                          final isSelected = _selectedRow == r && _selectedCol == c;
                          final color = gemColors[gemType];
                          final icon = gemIcons[gemType];

                          return GestureDetector(
                            onTap: () => _tapGem(r, c),
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 150),
                              decoration: BoxDecoration(
                                color: color.withValues(alpha: isSelected ? 0.45 : 0.20),
                                borderRadius: BorderRadius.circular(14),
                                border: Border.all(
                                  color: isSelected ? Colors.white : color,
                                  width: isSelected ? 3.0 : 1.5,
                                ),
                                boxShadow: isSelected
                                    ? [BoxShadow(color: color.withValues(alpha: 0.6), blurRadius: 12, spreadRadius: 2)]
                                    : null,
                              ),
                              child: Center(
                                child: Icon(icon, color: color, size: 28),
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 16),
            ],
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
                  border: Border.all(color: const Color(0xFFFFD700), width: 2),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.diamond_rounded, color: Color(0xFFFFD700), size: 48),
                    const SizedBox(height: 12),
                    const Text(
                      'STARLIGHT MATCH-3',
                      style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900, letterSpacing: 1.2),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'SWAP ADJACENT CELESTIAL GEMS TO FORM MATCHES OF 3+!\nTRIGGER CASCADES BEFORE TIME RUNS OUT.',
                      style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold, height: 1.4),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 20),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFFFD700),
                        foregroundColor: Colors.black,
                        minimumSize: const Size.fromHeight(48),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                      onPressed: _startGame,
                      child: const Text('START CASCADE', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
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
