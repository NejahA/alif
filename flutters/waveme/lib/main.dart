import 'package:flutter/material.dart';
import 'dart:math';

void main() => runApp(const WavemeApp());

class WavemeApp extends StatelessWidget {
  const WavemeApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Waveme',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.light().copyWith(
        primaryColor: const Color(0xFF00BCD4),
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF00BCD4)),
      ),
      home: const VoiceJournalScreen(),
    );
  }
}

class VoiceJournalScreen extends StatefulWidget {
  const VoiceJournalScreen({super.key});

  @override
  State<VoiceJournalScreen> createState() => _VoiceJournalScreenState();
}

class _VoiceJournalScreenState extends State<VoiceJournalScreen> {
  bool isRecording = false;
  List<String> recordings = ['Morning thoughts', 'Evening reflection', 'Quick note'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('🎙️ Waveme'),
        actions: [
          IconButton(
            icon: const Icon(Icons.list),
            onPressed: () {
              showDialog(
                context: context,
                builder: (context) => AlertDialog(
                  title: const Text('Recordings'),
                  content: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: recordings.map((r) => ListTile(
                      leading: const Icon(Icons.mic),
                      title: Text(r),
                      trailing: IconButton(
                        icon: const Icon(Icons.play_arrow),
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Playing: $r')),
                          );
                        },
                      ),
                    )).toList(),
                  ),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Close'),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              child: CustomPaint(
                size: Size(300, isRecording ? 150 : 100),
                painter: WaveformPainter(isRecording: isRecording),
              ),
            ),
            const SizedBox(height: 40),
            Text(
              isRecording ? 'Recording...' : 'Voice Journaling',
              style: const TextStyle(fontSize: 24),
            ),
            const SizedBox(height: 40),
            FloatingActionButton.large(
              onPressed: () {
                setState(() {
                  isRecording = !isRecording;
                });
                if (!isRecording) {
                  setState(() {
                    recordings.insert(0, 'Recording ${recordings.length + 1}');
                  });
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Recording saved!')),
                  );
                }
              },
              backgroundColor: isRecording ? Colors.red : const Color(0xFF00BCD4),
              child: Icon(isRecording ? Icons.stop : Icons.mic, size: 40),
            ),
            const SizedBox(height: 20),
            Text(
              isRecording ? 'Tap to stop' : 'Tap to record',
              style: const TextStyle(color: Colors.grey),
            ),
          ],
        ),
      ),
    );
  }
}

class WaveformPainter extends CustomPainter {
  final bool isRecording;

  WaveformPainter({required this.isRecording});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFF00BCD4)
      ..strokeWidth = 3
      ..style = PaintingStyle.stroke;
    
    final path = Path();
    final random = Random();
    
    for (int i = 0; i < size.width; i += 10) {
      final amplitude = isRecording ? random.nextDouble() * 40 : 15;
      path.lineTo(i.toDouble(), size.height / 2 + (i % 30 - amplitude));
    }
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
