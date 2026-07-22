import 'dart:math';

import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Mickii',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.blue,
          brightness: Brightness.light,
        ),
        useMaterial3: true,
      ),
      home: const MouseApp(),
    );
  }
}

class MouseApp extends StatefulWidget {
  const MouseApp({super.key});

  @override
  State<MouseApp> createState() => _MouseAppState();
}

class _MouseAppState extends State<MouseApp> {
  double x = 0;
  double y = 0;
  bool isDragging = false;
  bool _hasInitializedPosition = false;
  bool snapToGrid = true;
  bool showGrid = true;
  int moveCount = 0;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();

    if (!_hasInitializedPosition) {
      _setPositionToCenter(MediaQuery.of(context).size);
      _hasInitializedPosition = true;
    }
  }

  void _setPositionToCenter(Size size) {
    final targetX = size.width / 2 - 20;
    final targetY = size.height / 2 - 20;

    x = snapToGrid ? _snapToGrid(targetX) : targetX;
    y = snapToGrid ? _snapToGrid(targetY) : targetY;
  }

  double _snapToGrid(double value) {
    const spacing = 40.0;
    return ((value / spacing).round() * spacing).toDouble();
  }

  void _randomizePosition(Size size) {
    final maxX = (size.width - 40).clamp(0.0, size.width - 40).toDouble();
    final maxY = (size.height - 40).clamp(0.0, size.height - 40).toDouble();
    final nextX = Random().nextDouble() * maxX;
    final nextY = Random().nextDouble() * maxY;

    setState(() {
      x = snapToGrid ? _snapToGrid(nextX) : nextX;
      y = snapToGrid ? _snapToGrid(nextY) : nextY;
      moveCount += 1;
    });
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Mickii'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                FilterChip(
                  label: const Text('Snap to Grid'),
                  selected: snapToGrid,
                  onSelected: (value) {
                    setState(() {
                      snapToGrid = value;
                      if (!value) {
                        x = x.clamp(0.0, size.width - 40);
                        y = y.clamp(0.0, size.height - 40);
                      } else {
                        x = _snapToGrid(x);
                        y = _snapToGrid(y);
                      }
                    });
                  },
                ),
                FilterChip(
                  label: const Text('Show Grid'),
                  selected: showGrid,
                  onSelected: (value) {
                    setState(() {
                      showGrid = value;
                    });
                  },
                ),
                ElevatedButton.icon(
                  onPressed: () {
                    setState(() {
                      _setPositionToCenter(size);
                      moveCount += 1;
                    });
                  },
                  icon: const Icon(Icons.center_focus_strong),
                  label: const Text('Reset'),
                ),
                ElevatedButton.icon(
                  onPressed: () => _randomizePosition(size),
                  icon: const Icon(Icons.shuffle),
                  label: const Text('Randomize'),
                ),
              ],
            ),
          ),
          Expanded(
            child: Stack(
              children: [
                if (showGrid)
                  CustomPaint(
                    painter: GridPainter(
                      horizontalSpacing: 40,
                      verticalSpacing: 40,
                      color: Colors.grey.shade200,
                      strokeWidth: 1,
                    ),
                  ),
                AnimatedPositioned(
                  duration: const Duration(milliseconds: 220),
                  curve: Curves.easeOutCubic,
                  left: x,
                  top: y,
                  child: GestureDetector(
                    onPanStart: (_) {
                      setState(() {
                        isDragging = true;
                      });
                    },
                    onPanUpdate: (details) {
                      setState(() {
                        final nextX = (x + details.delta.dx).clamp(0.0, size.width - 40);
                        final nextY = (y + details.delta.dy).clamp(0.0, size.height - 40);
                        x = snapToGrid ? _snapToGrid(nextX) : nextX;
                        y = snapToGrid ? _snapToGrid(nextY) : nextY;
                      });
                    },
                    onPanEnd: (_) {
                      setState(() {
                        isDragging = false;
                        moveCount += 1;
                      });
                    },
                    onPanCancel: () {
                      setState(() {
                        isDragging = false;
                      });
                    },
                    child: Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.blue,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.blue.withOpacity(0.3),
                            blurRadius: 10,
                            spreadRadius: 2,
                          ),
                        ],
                      ),
                      child: Center(
                        child: Text(
                          'M',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
                Positioned(
                  bottom: 20,
                  left: 20,
                  child: Container(
                    padding: const EdgeInsets.all(15),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(10),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.1),
                          blurRadius: 5,
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Position: ${x.toStringAsFixed(0)}, ${y.toStringAsFixed(0)}',
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                          ),
                        ),
                        const SizedBox(height: 5),
                        Text(
                          'Status: ${isDragging ? 'Dragging' : 'Idle'}',
                          style: TextStyle(
                            color: isDragging ? Colors.green : Colors.grey,
                            fontSize: 12,
                          ),
                        ),
                        const SizedBox(height: 5),
                        Text(
                          'Moves: $moveCount',
                          style: const TextStyle(fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class GridPainter extends CustomPainter {
  final double horizontalSpacing;
  final double verticalSpacing;
  final Color color;
  final double strokeWidth;

  GridPainter({
    required this.horizontalSpacing,
    required this.verticalSpacing,
    required this.color,
    this.strokeWidth = 1.0,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = strokeWidth
      ..style = PaintingStyle.stroke;

    // Vertical lines
    for (double x = 0; x < size.width; x += horizontalSpacing) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }

    // Horizontal lines
    for (double y = 0; y < size.height; y += verticalSpacing) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
