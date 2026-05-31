import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'dart:io';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';

void main() {
  runApp(const DrawingApp());
}

class DrawingApp extends StatelessWidget {
  const DrawingApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Advanced Drawing Canvas',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        useMaterial3: true,
      ),
      home: const DrawingCanvas(),
    );
  }
}

class DrawingCanvas extends StatefulWidget {
  const DrawingCanvas({super.key});

  @override
  State<DrawingCanvas> createState() => _DrawingCanvasState();
}

class _DrawingCanvasState extends State<DrawingCanvas> {
  // Drawing state
  List<DrawingStroke> _strokes = [];
  List<DrawingStroke> _undoStack = [];
  List<Offset> _currentStrokePoints = [];
  Color _currentColor = Colors.black;
  double _strokeWidth = 3.0;
  String _selectedTool = 'pencil';
  GlobalKey _canvasKey = GlobalKey();
  
  // Available tools
  final List<Map<String, dynamic>> _tools = [
    {'icon': Icons.edit, 'label': 'Pencil', 'id': 'pencil', 'color': Colors.blue},
    {'icon': Icons.brush, 'label': 'Brush', 'id': 'brush', 'color': Colors.green},
    {'icon': Icons.highlight, 'label': 'Marker', 'id': 'marker', 'color': Colors.orange},
    {'icon': Icons.auto_fix_high, 'label': 'Eraser', 'id': 'eraser', 'color': Colors.grey},
    {'icon': Icons.circle_outlined, 'label': 'Circle', 'id': 'circle', 'color': Colors.purple},
    {'icon': Icons.crop_square, 'label': 'Rectangle', 'id': 'rectangle', 'color': Colors.red},
    {'icon': Icons.show_chart, 'label': 'Line', 'id': 'line', 'color': Colors.teal},
  ];
  
  // Available colors
  final List<Color> _colors = [
    Colors.black,
    Colors.red,
    Colors.blue,
    Colors.green,
    Colors.orange,
    Colors.purple,
    Colors.pink,
    Colors.brown,
    Colors.yellow,
    Colors.teal,
    Colors.cyan,
    Colors.indigo,
  ];

  void _clearCanvas() {
    setState(() {
      _strokes.clear();
      _undoStack.clear();
      _currentStrokePoints.clear();
    });
  }

  void _selectTool(String toolId) {
    setState(() {
      _selectedTool = toolId;
    });
  }

  void _selectColor(Color color) {
    setState(() {
      _currentColor = color;
    });
  }

  void _adjustStrokeWidth(double width) {
    setState(() {
      _strokeWidth = width;
    });
  }

  void _undo() {
    if (_strokes.isNotEmpty) {
      setState(() {
        _undoStack.add(_strokes.removeLast());
      });
    }
  }

  void _redo() {
    if (_undoStack.isNotEmpty) {
      setState(() {
        _strokes.add(_undoStack.removeLast());
      });
    }
  }

  void _startDrawing(Offset position) {
    setState(() {
      _currentStrokePoints = [position];
    });
  }

  void _updateDrawing(Offset position) {
    setState(() {
      _currentStrokePoints.add(position);
    });
  }

  void _endDrawing() {
    if (_currentStrokePoints.length > 1) {
      setState(() {
        _strokes.add(DrawingStroke(
          points: List.from(_currentStrokePoints),
          color: _selectedTool == 'eraser' ? Colors.white : _currentColor,
          strokeWidth: _strokeWidth,
          tool: _selectedTool,
        ));
        _undoStack.clear(); // Clear redo stack when new drawing is made
        _currentStrokePoints.clear();
      });
    } else {
      setState(() {
        _currentStrokePoints.clear();
      });
    }
  }

  Future<void> _saveDrawing() async {
    try {
      final boundary = _canvasKey.currentContext!.findRenderObject() as RenderRepaintBoundary;
      final image = await boundary.toImage();
      final byteData = await image.toByteData(format: ui.ImageByteFormat.png);
      final bytes = byteData!.buffer.asUint8List();
      
      final directory = await getTemporaryDirectory();
      final imagePath = '${directory.path}/drawing_${DateTime.now().millisecondsSinceEpoch}.png';
      final file = File(imagePath);
      await file.writeAsBytes(bytes);
      
      await Share.shareXFiles([XFile(imagePath)], text: 'Check out my drawing!');
      
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Drawing saved and ready to share!')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error saving drawing: $e')),
      );
    }
  }

  String _colorToString(Color color) {
    if (color == Colors.black) return 'Black';
    if (color == Colors.red) return 'Red';
    if (color == Colors.blue) return 'Blue';
    if (color == Colors.green) return 'Green';
    if (color == Colors.orange) return 'Orange';
    if (color == Colors.purple) return 'Purple';
    if (color == Colors.pink) return 'Pink';
    if (color == Colors.brown) return 'Brown';
    if (color == Colors.yellow) return 'Yellow';
    if (color == Colors.teal) return 'Teal';
    if (color == Colors.cyan) return 'Cyan';
    if (color == Colors.indigo) return 'Indigo';
    return 'Custom';
  }

  Widget _buildToolButton(Map<String, dynamic> tool) {
    final isSelected = _selectedTool == tool['id'];
    return GestureDetector(
      onTap: () => _selectTool(tool['id']),
      child: Container(
        width: 60,
        height: 60,
        margin: const EdgeInsets.all(4),
        decoration: BoxDecoration(
          color: isSelected 
              ? (tool['color'] as Color).withOpacity(0.2)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? tool['color'] as Color : Colors.grey.withOpacity(0.3),
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(tool['icon'] as IconData, 
                 color: isSelected ? tool['color'] as Color : Colors.grey, size: 20),
            const SizedBox(height: 4),
            Text(
              tool['label'] as String,
              style: TextStyle(
                fontSize: 9,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                color: isSelected ? tool['color'] as Color : Colors.grey,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildColorButton(Color color) {
    final isSelected = _currentColor.value == color.value;
    return GestureDetector(
      onTap: () => _selectColor(color),
      child: Container(
        width: 30,
        height: 30,
        margin: const EdgeInsets.all(2),
        decoration: BoxDecoration(
          color: color,
          borderRadius: BorderRadius.circular(15),
          border: Border.all(
            color: isSelected ? Colors.black : Colors.transparent,
            width: isSelected ? 2 : 0,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 2,
              offset: const Offset(0, 1),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Advanced Drawing Canvas'),
        actions: [
          IconButton(
            icon: const Icon(Icons.undo),
            onPressed: _undo,
            tooltip: 'Undo',
          ),
          IconButton(
            icon: const Icon(Icons.redo),
            onPressed: _redo,
            tooltip: 'Redo',
          ),
          IconButton(
            icon: const Icon(Icons.save),
            onPressed: _saveDrawing,
            tooltip: 'Save & Share',
          ),
          IconButton(
            icon: const Icon(Icons.delete),
            onPressed: _clearCanvas,
            tooltip: 'Clear Canvas',
          ),
        ],
      ),
      body: Column(
        children: [
          // Drawing Canvas
          Expanded(
            child: Container(
              color: Colors.grey[100],
              child: RepaintBoundary(
                key: _canvasKey,
                child: GestureDetector(
                  onPanStart: (details) => _startDrawing(details.localPosition),
                  onPanUpdate: (details) => _updateDrawing(details.localPosition),
                  onPanEnd: (details) => _endDrawing(),
                  child: CustomPaint(
                    painter: _DrawingPainter(
                      strokes: _strokes,
                      currentStroke: DrawingStroke(
                        points: _currentStrokePoints,
                        color: _selectedTool == 'eraser' ? Colors.white : _currentColor,
                        strokeWidth: _strokeWidth,
                        tool: _selectedTool,
                      ),
                    ),
                    size: Size.infinite,
                  ),
                ),
              ),
            ),
          ),
          
          // Controls
          Container(
            color: Colors.white,
            padding: const EdgeInsets.all(12),
            child: Column(
              children: [
                // Tool Selection
                SizedBox(
                  height: 70,
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    children: _tools.map((tool) => _buildToolButton(tool)).toList(),
                  ),
                ),
                
                const SizedBox(height: 10),
                
                // Color Palette
                SizedBox(
                  height: 40,
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    children: _colors.map((color) => _buildColorButton(color)).toList(),
                  ),
                ),
                
                const SizedBox(height: 10),
                
                // Brush Size and Info
                Row(
                  children: [
                    const Icon(Icons.brush, size: 20),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Slider(
                        value: _strokeWidth,
                        min: 1,
                        max: 30,
                        divisions: 29,
                        label: '${_strokeWidth.round()}px',
                        onChanged: _adjustStrokeWidth,
                      ),
                    ),
                    Text(
                      '${_strokeWidth.round()}px',
                      style: const TextStyle(fontSize: 12),
                    ),
                    const SizedBox(width: 16),
                    Text(
                      'Strokes: ${_strokes.length}',
                      style: const TextStyle(fontSize: 12, color: Colors.grey),
                    ),
                  ],
                ),
                
                const SizedBox(height: 10),
                
                // Quick Actions
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    ElevatedButton.icon(
                      onPressed: _undo,
                      icon: const Icon(Icons.undo, size: 16),
                      label: const Text('Undo'),
                    ),
                    ElevatedButton.icon(
                      onPressed: _redo,
                      icon: const Icon(Icons.redo, size: 16),
                      label: const Text('Redo'),
                    ),
                    ElevatedButton.icon(
                      onPressed: _saveDrawing,
                      icon: const Icon(Icons.save, size: 16),
                      label: const Text('Save'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// Class to represent a drawing stroke
class DrawingStroke {
  final List<Offset> points;
  final Color color;
  final double strokeWidth;
  final String tool;

  DrawingStroke({
    required this.points,
    required this.color,
    required this.strokeWidth,
    required this.tool,
  });
}

class _DrawingPainter extends CustomPainter {
  final List<DrawingStroke> strokes;
  final DrawingStroke currentStroke;

  _DrawingPainter({
    required this.strokes,
    required this.currentStroke,
  });

  @override
  void paint(Canvas canvas, Size size) {
    // Draw background
    final backgroundPaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;
    canvas.drawRect(Rect.fromLTWH(0, 0, size.width, size.height), backgroundPaint);

    // Draw grid
    final gridPaint = Paint()
      ..color = Colors.grey.withOpacity(0.1)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1;
    
    // Draw vertical lines
    for (double x = 0; x < size.width; x += 20) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), gridPaint);
    }
    
    // Draw horizontal lines
    for (double y = 0; y < size.height; y += 20) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), gridPaint);
    }

    // Draw all saved strokes
    for (final stroke in strokes) {
      _drawStroke(canvas, stroke);
    }

    // Draw current stroke (in progress)
    if (currentStroke.points.length > 1) {
      _drawStroke(canvas, currentStroke);
    }

    // Draw instructions if canvas is empty
    if (strokes.isEmpty && currentStroke.points.length <= 1) {
      final textStyle = const TextStyle(
        color: Colors.grey,
        fontSize: 18,
      );
      final textSpan = TextSpan(
        text: 'Draw here!\nDrag to draw',
        style: textStyle,
      );
      final textPainter = TextPainter(
        text: textSpan,
        textAlign: TextAlign.center,
        textDirection: TextDirection.ltr,
      );
      textPainter.layout(maxWidth: size.width);
      textPainter.paint(
        canvas,
        Offset(
          (size.width - textPainter.width) / 2,
          (size.height - textPainter.height) / 2,
        ),
      );
    }
  }

  void _drawStroke(Canvas canvas, DrawingStroke stroke) {
    if (stroke.points.length < 2) return;

    final paint = Paint()
      ..color = stroke.color
      ..strokeWidth = stroke.strokeWidth
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;

    // Different drawing styles based on tool
    if (stroke.tool == 'circle' && stroke.points.length >= 2) {
      final start = stroke.points.first;
      final end = stroke.points.last;
      final center = Offset((start.dx + end.dx) / 2, (start.dy + end.dy) / 2);
      final radius = (end - start).distance / 2;
      canvas.drawCircle(center, radius, paint);
    } else if (stroke.tool == 'rectangle' && stroke.points.length >= 2) {
      final start = stroke.points.first;
      final end = stroke.points.last;
      final rect = Rect.fromPoints(start, end);
      canvas.drawRect(rect, paint);
    } else if (stroke.tool == 'line' && stroke.points.length >= 2) {
      final start = stroke.points.first;
      final end = stroke.points.last;
      canvas.drawLine(start, end, paint);
    } else {
      // For pencil, brush, marker, eraser - draw connected lines
      for (int i = 0; i < stroke.points.length - 1; i++) {
        canvas.drawLine(stroke.points[i], stroke.points[i + 1], paint);
      }
    }
  }

  @override
  bool shouldRepaint(_DrawingPainter oldDelegate) {
    return oldDelegate.strokes != strokes ||
           oldDelegate.currentStroke != currentStroke;
  }
}