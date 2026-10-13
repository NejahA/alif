import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;

class TouchStroke {
  final List<Offset> points;
  final Color color;
  final double width;
  final String waveform;

  TouchStroke({
    required this.points,
    required this.color,
    required this.width,
    required this.waveform,
  });
}

class SynesthesiaScreen extends StatefulWidget {
  const SynesthesiaScreen({super.key});

  @override
  State<SynesthesiaScreen> createState() => _SynesthesiaScreenState();
}

class _SynesthesiaScreenState extends State<SynesthesiaScreen> {
  List<TouchStroke> strokes = [];
  List<Offset> currentPoints = [];

  Color activeColor = const Color(0xFF00F5FF);
  double activeWidth = 4.0;
  String activeWaveform = 'Sine Wave';
  io.Socket? socket;

  final List<Color> palette = const [
    Color(0xFF00F5FF), // Quantum Cyan
    Color(0xFFFF007F), // Solar Pink
    Color(0xFF7000FF), // Electric Violet
    Color(0xFFFFB800), // Gold Pulse
    Color(0xFF00FF66), // Cyber Neon Green
  ];

  final List<String> waveforms = const [
    'Sine Wave',
    'Square Synth',
    'Cosmic Chimes',
    'Deep Bass',
  ];

  final List<String> synthKeys = const ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];

  @override
  void initState() {
    super.initState();
    _connectSocket();
  }

  void _connectSocket() {
    try {
      socket = io.io('http://localhost:4000', <String, dynamic>{
        'transports': ['websocket'],
        'autoConnect': true,
      });

      socket?.on('synesthesia_stroke_receive', (data) {
        if (data != null && data['points'] != null) {
          final List pts = data['points'];
          final parsed = pts.map((p) => Offset(p['x'].toDouble(), p['y'].toDouble())).toList();
          if (mounted) {
            setState(() {
              strokes.add(TouchStroke(
                points: parsed,
                color: const Color(0xFFFF007F),
                width: 3.0,
                waveform: 'Cosmic Chimes',
              ));
            });
          }
        }
      });
    } catch (e) {
      debugPrint('Socket connection exception: $e');
    }
  }

  void _playSynthKeyNote(String keyNote, double xRatio) {
    final newStroke = TouchStroke(
      points: [
        Offset(xRatio * 350, 150),
        Offset(xRatio * 350, 250),
        Offset(xRatio * 350 + 20, 320),
      ],
      color: activeColor,
      width: 5.0,
      waveform: activeWaveform,
    );
    setState(() {
      strokes.add(newStroke);
    });

    socket?.emit('synesthesia_stroke', {
      'points': newStroke.points.map((p) => {'x': p.dx, 'y': p.dy}).toList(),
      'color': activeColor.toARGB32(),
      'waveform': activeWaveform,
      'note': keyNote,
    });
  }

  void _clearCanvas() {
    setState(() {
      strokes.clear();
      currentPoints.clear();
    });
  }

  @override
  void dispose() {
    socket?.disconnect();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Controls Bar
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          color: const Color(0xFF161B22),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '🎨 Synesthesia Touch Pad',
                    style: GoogleFonts.outfit(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                  Row(
                    children: [
                      ...palette.map((c) {
                        final bool isSel = activeColor == c;
                        return GestureDetector(
                          onTap: () => setState(() => activeColor = c),
                          child: Container(
                            margin: const EdgeInsets.only(right: 8),
                            width: 24,
                            height: 24,
                            decoration: BoxDecoration(
                              color: c,
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: isSel ? Colors.white : Colors.transparent,
                                width: 2,
                              ),
                            ),
                          ),
                        );
                      }),
                      IconButton(
                        icon: const Icon(Icons.delete_sweep, color: Colors.white70),
                        onPressed: _clearCanvas,
                      )
                    ],
                  )
                ],
              ),
              const SizedBox(height: 8),
              // Waveform Synthesizer Selector
              Row(
                children: [
                  Text(
                    '🎛️ Synth Engine: ',
                    style: GoogleFonts.outfit(color: Colors.white54, fontSize: 12),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: waveforms.map((wave) {
                          final bool isSelected = activeWaveform == wave;
                          return GestureDetector(
                            onTap: () => setState(() => activeWaveform = wave),
                            child: Container(
                              margin: const EdgeInsets.only(right: 8),
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: isSelected ? const Color(0xFF00F5FF) : Colors.white10,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                wave,
                                style: GoogleFonts.outfit(
                                  color: isSelected ? Colors.black : Colors.white70,
                                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                                  fontSize: 11,
                                ),
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                  ),
                ],
              )
            ],
          ),
        ),

        // Interactive Touch Canvas Area
        Expanded(
          child: GestureDetector(
            onPanStart: (details) {
              setState(() {
                currentPoints = [details.localPosition];
              });
            },
            onPanUpdate: (details) {
              setState(() {
                currentPoints.add(details.localPosition);
              });
            },
            onPanEnd: (details) {
              if (currentPoints.isNotEmpty) {
                final newStroke = TouchStroke(
                  points: List.from(currentPoints),
                  color: activeColor,
                  width: activeWidth,
                  waveform: activeWaveform,
                );
                setState(() {
                  strokes.add(newStroke);
                  currentPoints = [];
                });

                // Emit stroke to Socket server
                socket?.emit('synesthesia_stroke', {
                  'points': newStroke.points.map((p) => {'x': p.dx, 'y': p.dy}).toList(),
                  'color': activeColor.toARGB32(),
                  'waveform': activeWaveform,
                });
              }
            },
            child: Container(
              color: const Color(0xFF0D1117),
              child: CustomPaint(
                painter: SynesthesiaPainter(
                  strokes: strokes,
                  currentPoints: currentPoints,
                  currentColor: activeColor,
                  currentWidth: activeWidth,
                ),
                child: Container(),
              ),
            ),
          ),
        ),

        // 8-Key Neon Synth Keyboard Pad Bar
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          color: const Color(0xFF161B22),
          child: Column(
            children: [
              Text(
                '🎹 8-Key Neon Synth Keyboard (Tap keys to play harmonic notes)',
                style: GoogleFonts.outfit(color: Colors.white70, fontSize: 11),
              ),
              const SizedBox(height: 8),
              Row(
                children: List.generate(synthKeys.length, (idx) {
                  final keyNote = synthKeys[idx];
                  final double ratio = (idx + 1) / (synthKeys.length + 1);

                  return Expanded(
                    child: GestureDetector(
                      onTap: () => _playSynthKeyNote(keyNote, ratio),
                      child: Container(
                        height: 54,
                        margin: const EdgeInsets.symmetric(horizontal: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFF1E293B),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: activeColor.withValues(alpha: 0.6)),
                          boxShadow: [
                            BoxShadow(
                              color: activeColor.withValues(alpha: 0.2),
                              blurRadius: 6,
                            )
                          ],
                        ),
                        alignment: Alignment.bottomCenter,
                        padding: const EdgeInsets.only(bottom: 6),
                        child: Text(
                          keyNote,
                          style: GoogleFonts.outfit(
                            color: activeColor,
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    ),
                  );
                }),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class SynesthesiaPainter extends CustomPainter {
  final List<TouchStroke> strokes;
  final List<Offset> currentPoints;
  final Color currentColor;
  final double currentWidth;

  SynesthesiaPainter({
    required this.strokes,
    required this.currentPoints,
    required this.currentColor,
    required this.currentWidth,
  });

  @override
  void paint(Canvas canvas, Size size) {
    // Render existing strokes
    for (var stroke in strokes) {
      final paintGlow = Paint()
        ..color = stroke.color.withValues(alpha: 0.5)
        ..strokeCap = StrokeCap.round
        ..strokeWidth = stroke.width * 2.5
        ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 8);

      final paintCore = Paint()
        ..color = Colors.white
        ..strokeCap = StrokeCap.round
        ..strokeWidth = stroke.width;

      for (int i = 0; i < stroke.points.length - 1; i++) {
        canvas.drawLine(stroke.points[i], stroke.points[i + 1], paintGlow);
        canvas.drawLine(stroke.points[i], stroke.points[i + 1], paintCore);
      }
    }

    // Render current active stroke
    if (currentPoints.length > 1) {
      final paintGlow = Paint()
        ..color = currentColor.withValues(alpha: 0.6)
        ..strokeCap = StrokeCap.round
        ..strokeWidth = currentWidth * 3
        ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 10);

      final paintCore = Paint()
        ..color = currentColor
        ..strokeCap = StrokeCap.round
        ..strokeWidth = currentWidth;

      for (int i = 0; i < currentPoints.length - 1; i++) {
        canvas.drawLine(currentPoints[i], currentPoints[i + 1], paintGlow);
        canvas.drawLine(currentPoints[i], currentPoints[i + 1], paintCore);
      }
    }
  }

  @override
  bool shouldRepaint(covariant SynesthesiaPainter oldDelegate) => true;
}
