import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class Cosmic2048GameScreen extends StatefulWidget {
  final Function(int coins, int xp) onGameFinished;

  const Cosmic2048GameScreen({super.key, required this.onGameFinished});

  @override
  State<Cosmic2048GameScreen> createState() => _Cosmic2048GameScreenState();
}

class _Cosmic2048GameScreenState extends State<Cosmic2048GameScreen> {
  static const int size = 4;
  late List<List<int>> _grid;

  bool _isPlaying = false;
  bool _isGameOver = false;
  int _score = 0;
  int _maxTile = 2;

  static const Map<int, Color> tileColors = {
    2: Color(0xFF334155),
    4: Color(0xFF475569),
    8: Color(0xFF0284C7),
    16: Color(0xFF0EA5E9),
    32: Color(0xFF00E5FF),
    64: Color(0xFF10B981),
    128: Color(0xFFF59E0B),
    256: Color(0xFFFFB703),
    512: Color(0xFFFB8500),
    1024: Color(0xFFEC4899),
    2048: Color(0xFF8B5CF6),
  };

  static const Map<int, String> tileNames = {
    2: 'Dust',
    4: 'Comet',
    8: 'Moon',
    16: 'Asteroid',
    32: 'Planet',
    64: 'Gas Giant',
    128: 'White Dwarf',
    256: 'Neutron',
    512: 'Supernova',
    1024: 'Pulsar',
    2048: 'Black Hole',
  };

  @override
  void initState() {
    super.initState();
    _resetGrid();
  }

  void _resetGrid() {
    _grid = List.generate(size, (_) => List.filled(size, 0));
  }

  void _startGame() {
    setState(() {
      _isPlaying = true;
      _isGameOver = false;
      _score = 0;
      _maxTile = 2;
      _resetGrid();
      _spawnRandomTile();
      _spawnRandomTile();
    });
  }

  void _spawnRandomTile() {
    final emptyCells = <Point<int>>[];
    for (int r = 0; r < size; r++) {
      for (int c = 0; c < size; c++) {
        if (_grid[r][c] == 0) {
          emptyCells.add(Point(r, c));
        }
      }
    }

    if (emptyCells.isNotEmpty) {
      final rand = Random();
      final cell = emptyCells[rand.nextInt(emptyCells.length)];
      _grid[cell.x][cell.y] = rand.nextDouble() < 0.9 ? 2 : 4;
    }
  }

  void _move(int dr, int dc) {
    if (!_isPlaying || _isGameOver) return;

    bool moved = false;

    // Helper to merge a single 1D line
    List<int> mergeLine(List<int> line) {
      final nonZero = line.where((v) => v != 0).toList();
      final merged = <int>[];
      int i = 0;
      while (i < nonZero.length) {
        if (i + 1 < nonZero.length && nonZero[i] == nonZero[i + 1]) {
          final val = nonZero[i] * 2;
          merged.add(val);
          _score += val;
          if (val > _maxTile) _maxTile = val;
          i += 2;
        } else {
          merged.add(nonZero[i]);
          i += 1;
        }
      }
      while (merged.length < size) {
        merged.add(0);
      }
      return merged;
    }

    setState(() {
      if (dc != 0) {
        // Horizontal move
        for (int r = 0; r < size; r++) {
          List<int> row = List.from(_grid[r]);
          if (dc == 1) row = row.reversed.toList(); // Right
          final newRow = mergeLine(row);
          final finalRow = dc == 1 ? newRow.reversed.toList() : newRow;

          for (int c = 0; c < size; c++) {
            if (_grid[r][c] != finalRow[c]) moved = true;
            _grid[r][c] = finalRow[c];
          }
        }
      } else if (dr != 0) {
        // Vertical move
        for (int c = 0; c < size; c++) {
          List<int> col = [_grid[0][c], _grid[1][c], _grid[2][c], _grid[3][c]];
          if (dr == 1) col = col.reversed.toList(); // Down
          final newCol = mergeLine(col);
          final finalCol = dr == 1 ? newCol.reversed.toList() : newCol;

          for (int r = 0; r < size; r++) {
            if (_grid[r][c] != finalCol[r]) moved = true;
            _grid[r][c] = finalCol[r];
          }
        }
      }

      if (moved) {
        HapticFeedback.lightImpact();
        _spawnRandomTile();

        // Check Game Over
        if (_isBoardLocked()) {
          _onGameOver();
        }
      }
    });
  }

  bool _isBoardLocked() {
    for (int r = 0; r < size; r++) {
      for (int c = 0; c < size; c++) {
        if (_grid[r][c] == 0) return false;
        if (c + 1 < size && _grid[r][c] == _grid[r][c + 1]) return false;
        if (r + 1 < size && _grid[r][c] == _grid[r + 1][c]) return false;
      }
    }
    return true;
  }

  void _onGameOver() {
    HapticFeedback.vibrate();

    final earnedCoins = (_score / 20).round() + (_maxTile / 10).round() + 20;
    final earnedXP = (_score / 25).round() + (_maxTile / 8).round() + 25;

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
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24), side: const BorderSide(color: Color(0xFF8B5CF6), width: 1.8)),
        title: const Row(
          children: [
            Icon(Icons.grid_view_rounded, color: Color(0xFF8B5CF6), size: 28),
            SizedBox(width: 8),
            Text('Cosmic Singularity!', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Score: $_score', style: const TextStyle(color: Color(0xFFFFD700), fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            Text('Highest Fusion: $_maxTile (${tileNames[_maxTile] ?? 'Cosmos'})', style: const TextStyle(color: Colors.white70, fontSize: 14)),
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
        title: const Text('Cosmic 2048 Fusion', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        actions: [
          Center(
            child: Padding(
              padding: const EdgeInsets.only(right: 16),
              child: Row(
                children: [
                  const Icon(Icons.stars, color: Color(0xFFFFD700), size: 18),
                  const SizedBox(width: 4),
                  Text('$_score', style: const TextStyle(color: Color(0xFFFFD700), fontWeight: FontWeight.bold, fontSize: 16)),
                ],
              ),
            ),
          ),
        ],
      ),
      body: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onVerticalDragEnd: (details) {
          if ((details.primaryVelocity ?? 0) < -200) _move(-1, 0); // Up
          if ((details.primaryVelocity ?? 0) > 200) _move(1, 0); // Down
        },
        onHorizontalDragEnd: (details) {
          if ((details.primaryVelocity ?? 0) < -200) _move(0, -1); // Left
          if ((details.primaryVelocity ?? 0) > 200) _move(0, 1); // Right
        },
        child: Column(
          children: [
            const SizedBox(height: 12),

            // 4x4 Fusion Grid
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
                      border: Border.all(color: const Color(0xFF8B5CF6).withValues(alpha: 0.4), width: 2),
                      boxShadow: [
                        BoxShadow(color: const Color(0xFF8B5CF6).withValues(alpha: 0.15), blurRadius: 20, spreadRadius: 2),
                      ],
                    ),
                    child: Stack(
                      children: [
                        GridView.builder(
                          physics: const NeverScrollableScrollPhysics(),
                          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: size,
                            crossAxisSpacing: 10,
                            mainAxisSpacing: 10,
                          ),
                          itemCount: size * size,
                          itemBuilder: (context, index) {
                            final r = index ~/ size;
                            final c = index % size;
                            final val = _grid[r][c];
                            final color = tileColors[val] ?? const Color(0xFF1E293B);
                            final name = tileNames[val] ?? '';

                            return AnimatedContainer(
                              duration: const Duration(milliseconds: 150),
                              decoration: BoxDecoration(
                                color: val == 0 ? const Color(0xFF1E293B).withValues(alpha: 0.5) : color,
                                borderRadius: BorderRadius.circular(16),
                                border: val > 0 ? Border.all(color: Colors.white24, width: 1.5) : null,
                                boxShadow: val >= 64
                                    ? [BoxShadow(color: color.withValues(alpha: 0.4), blurRadius: 10)]
                                    : null,
                              ),
                              child: val == 0
                                  ? null
                                  : Column(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        Text(
                                          '$val',
                                          style: TextStyle(
                                            color: Colors.white,
                                            fontWeight: FontWeight.w900,
                                            fontSize: val >= 1024 ? 17 : (val >= 128 ? 20 : 24),
                                          ),
                                        ),
                                        Text(
                                          name,
                                          style: const TextStyle(color: Colors.white70, fontSize: 9.5, fontWeight: FontWeight.bold),
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ],
                                    ),
                            );
                          },
                        ),

                        // Start Screen Overlay
                        if (!_isPlaying && !_isGameOver)
                          Center(
                            child: Container(
                              constraints: const BoxConstraints(maxWidth: 320),
                              padding: const EdgeInsets.all(22),
                              decoration: BoxDecoration(
                                color: const Color(0xFF0F172A).withValues(alpha: 0.95),
                                borderRadius: BorderRadius.circular(24),
                                border: Border.all(color: const Color(0xFF8B5CF6), width: 2),
                              ),
                              child: SingleChildScrollView(
                                child: Column(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    const Icon(Icons.grid_view_rounded, color: Color(0xFF8B5CF6), size: 44),
                                    const SizedBox(height: 10),
                                    const Text(
                                      'COSMIC 2048 FUSION',
                                      style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900, letterSpacing: 1.2),
                                    ),
                                    const SizedBox(height: 6),
                                    const Text(
                                      'SWIPE OR USE D-PAD TO SLIDE & MERGE MATCHING CELESTIAL BODIES INTO A BLACK HOLE!',
                                      style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold, height: 1.4),
                                      textAlign: TextAlign.center,
                                    ),
                                    const SizedBox(height: 16),
                                    ElevatedButton(
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: const Color(0xFF8B5CF6),
                                        foregroundColor: Colors.white,
                                        minimumSize: const Size.fromHeight(46),
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                                      ),
                                      onPressed: _startGame,
                                      child: const Text('START FUSION', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
              ),
            ),

            // Onscreen Neon D-Pad Controls
            Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: Column(
                children: [
                  _buildPadButton(Icons.arrow_drop_up_rounded, () => _move(-1, 0)),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _buildPadButton(Icons.arrow_left_rounded, () => _move(0, -1)),
                      const SizedBox(width: 48),
                      _buildPadButton(Icons.arrow_right_rounded, () => _move(0, 1)),
                    ],
                  ),
                  _buildPadButton(Icons.arrow_drop_down_rounded, () => _move(1, 0)),
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
          border: Border.all(color: const Color(0xFF8B5CF6).withValues(alpha: 0.4), width: 1.5),
        ),
        child: Icon(icon, color: const Color(0xFF8B5CF6), size: 36),
      ),
    );
  }
}
