import 'dart:math';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../services/api_service.dart';

class ConstellationsScreen extends StatefulWidget {
  const ConstellationsScreen({super.key});

  @override
  State<ConstellationsScreen> createState() => _ConstellationsScreenState();
}

class _ConstellationsScreenState extends State<ConstellationsScreen> with SingleTickerProviderStateMixin {
  List<ConstellationStar> stars = [];
  bool isLoading = true;
  late AnimationController _animController;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    )..repeat(reverse: true);
    _loadConstellations();
  }

  void _loadConstellations() async {
    final fetched = await ApiService.fetchConstellations();
    if (!mounted) return;
    setState(() {
      stars = fetched;
      isLoading = false;
    });
  }

  void _showAddStarDialog(Offset tapOffset, Size canvasSize) {
    final nameCtrl = TextEditingController();
    String selectedMood = 'Calm';
    Color selectedColor = const Color(0xFF00F5FF);

    final double normX = (tapOffset.dx / canvasSize.width).clamp(0.05, 0.95);
    final double normY = (tapOffset.dy / canvasSize.height).clamp(0.05, 0.95);

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF161B22),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text(
          '✨ Anchor Celestial Mood Star',
          style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nameCtrl,
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(
                labelText: 'Star Name / Thought',
                labelStyle: TextStyle(color: Colors.white70),
                enabledBorder: OutlineInputBorder(borderSide: BorderSide(color: Colors.white24)),
                focusedBorder: OutlineInputBorder(borderSide: BorderSide(color: Color(0xFF00F5FF))),
              ),
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              initialValue: selectedMood,
              dropdownColor: const Color(0xFF161B22),
              style: const TextStyle(color: Colors.white),
              items: const [
                DropdownMenuItem(value: 'Calm', child: Text('🌊 Calm (Cyan)')),
                DropdownMenuItem(value: 'Inspired', child: Text('🎨 Inspired (Pink)')),
                DropdownMenuItem(value: 'Deep Focus', child: Text('🧘 Focus (Violet)')),
                DropdownMenuItem(value: 'Euphoria', child: Text('⚡ Euphoria (Gold)')),
              ],
              onChanged: (val) {
                selectedMood = val ?? 'Calm';
                if (selectedMood == 'Calm') selectedColor = const Color(0xFF00F5FF);
                if (selectedMood == 'Inspired') selectedColor = const Color(0xFFFF007F);
                if (selectedMood == 'Deep Focus') selectedColor = const Color(0xFF7000FF);
                if (selectedMood == 'Euphoria') selectedColor = const Color(0xFFFFB800);
              },
              decoration: const InputDecoration(
                labelText: 'Mood Frequency',
                labelStyle: TextStyle(color: Colors.white70),
              ),
            )
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel', style: TextStyle(color: Colors.white54)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00F5FF)),
            onPressed: () async {
              if (nameCtrl.text.isNotEmpty) {
                final hexColor = '#${selectedColor.toARGB32().toRadixString(16).substring(2)}';
                final updated = await ApiService.addConstellationStar(
                  nameCtrl.text,
                  selectedMood,
                  hexColor,
                  normX,
                  normY,
                );
                if (mounted) {
                  setState(() => stars = updated);
                }
                if (ctx.mounted) Navigator.pop(ctx);
              }
            },
            child: Text('Anchor Star', style: GoogleFonts.outfit(color: Colors.black, fontWeight: FontWeight.bold)),
          )
        ],
      ),
    );
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Header
        Container(
          padding: const EdgeInsets.all(16),
          color: const Color(0xFF161B22),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '🌌 Aether Constellations',
                    style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                  Text(
                    'Tap anywhere on the celestial grid to anchor a new mood star',
                    style: GoogleFonts.outfit(fontSize: 12, color: const Color(0xFF00F5FF)),
                  ),
                ],
              ),
              IconButton(
                icon: const Icon(Icons.refresh, color: Color(0xFF00F5FF)),
                onPressed: _loadConstellations,
              )
            ],
          ),
        ),

        // Constellation Star Grid Canvas
        Expanded(
          child: LayoutBuilder(
            builder: (ctx, constraints) {
              final Size canvasSize = Size(constraints.maxWidth, constraints.maxHeight);

              return GestureDetector(
                onTapUp: (details) => _showAddStarDialog(details.localPosition, canvasSize),
                child: Container(
                  color: const Color(0xFF0D1117),
                  child: AnimatedBuilder(
                    animation: _animController,
                    builder: (ctx, child) {
                      return CustomPaint(
                        painter: ConstellationPainter(
                          stars: stars,
                          animProgress: _animController.value,
                        ),
                        child: Container(),
                      );
                    },
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

class ConstellationPainter extends CustomPainter {
  final List<ConstellationStar> stars;
  final double animProgress;

  ConstellationPainter({required this.stars, required this.animProgress});

  @override
  void paint(Canvas canvas, Size size) {
    if (stars.isEmpty) return;

    final List<Offset> points = stars.map((s) => Offset(s.x * size.width, s.y * size.height)).toList();

    // Draw Constellation Lines connecting stars
    final paintLine = Paint()
      ..color = const Color(0xFF00F5FF).withValues(alpha: 0.2 + animProgress * 0.15)
      ..strokeWidth = 1.2
      ..style = PaintingStyle.stroke;

    final path = Path();
    path.moveTo(points[0].dx, points[0].dy);
    for (int i = 1; i < points.length; i++) {
      path.lineTo(points[i].dx, points[i].dy);
    }
    canvas.drawPath(path, paintLine);

    // Draw Stars & Orbs
    for (int i = 0; i < stars.length; i++) {
      final s = stars[i];
      final pos = points[i];
      Color starColor = const Color(0xFF00F5FF);
      try {
        final hexStr = s.color.replaceAll('#', '');
        starColor = Color(int.parse('FF$hexStr', radix: 16));
      } catch (_) {}

      final double pulse = 4.0 + sin(animProgress * 2 * pi + i) * 2.0;

      // Glow Halo
      final paintGlow = Paint()
        ..color = starColor.withValues(alpha: 0.4)
        ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 10);
      canvas.drawCircle(pos, pulse * 2, paintGlow);

      // Core Star
      final paintCore = Paint()..color = Colors.white;
      canvas.drawCircle(pos, 4, paintCore);

      // Text Label
      TextSpan span = TextSpan(
        text: '${s.name} (${s.mood})',
        style: GoogleFonts.outfit(color: starColor, fontSize: 11, fontWeight: FontWeight.bold),
      );
      TextPainter tp = TextPainter(text: span, textDirection: TextDirection.ltr);
      tp.layout();
      tp.paint(canvas, Offset(pos.dx - tp.width / 2, pos.dy + 8));
    }
  }

  @override
  bool shouldRepaint(covariant ConstellationPainter oldDelegate) => true;
}
