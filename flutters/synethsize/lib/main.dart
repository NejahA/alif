import 'package:flutter/material.dart';

void main() => runApp(const SynethsizeApp());

class SynethsizeApp extends StatelessWidget {
  const SynethsizeApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Synethsize',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        primaryColor: const Color(0xFFFF00FF),
        scaffoldBackgroundColor: const Color(0xFF0A0E27),
      ),
      home: const BeatMakerScreen(),
    );
  }
}

class BeatMakerScreen extends StatefulWidget {
  const BeatMakerScreen({super.key});

  @override
  State<BeatMakerScreen> createState() => _BeatMakerScreenState();
}

class _BeatMakerScreenState extends State<BeatMakerScreen> {
  List<bool> activePads = List.generate(8, (i) => false);
  List<Color> padColors = [
    Colors.pinkAccent,
    Colors.cyanAccent,
    Colors.purpleAccent,
    Colors.greenAccent,
    Colors.orangeAccent,
    Colors.blueAccent,
    Colors.redAccent,
    Colors.yellowAccent,
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('🎵 Synethsize')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text('Cyberpunk Music Visualizer', style: TextStyle(fontSize: 24, color: Colors.cyanAccent)),
            const SizedBox(height: 20),
            Text(
              'Active: ${activePads.where((p) => p).length}/8',
              style: const TextStyle(fontSize: 18, color: Colors.white70),
            ),
            const SizedBox(height: 40),
            Wrap(
              spacing: 20,
              runSpacing: 20,
              children: List.generate(8, (i) => _buildBeatPad(i)),
            ),
            const SizedBox(height: 40),
            ElevatedButton(
              onPressed: () {
                setState(() {
                  activePads = List.generate(8, (i) => false);
                });
              },
              child: const Text('Clear All'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBeatPad(int index) {
    return GestureDetector(
      onTap: () {
        setState(() {
          activePads[index] = !activePads[index];
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Pad ${index + 1} ${activePads[index] ? "ON" : "OFF"}'),
            duration: const Duration(milliseconds: 500),
          ),
        );
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        width: 80,
        height: 80,
        decoration: BoxDecoration(
          color: activePads[index] ? padColors[index].withOpacity(0.8) : padColors[index].withOpacity(0.2),
          border: Border.all(
            color: activePads[index] ? padColors[index] : Colors.cyanAccent,
            width: activePads[index] ? 3 : 2,
          ),
          boxShadow: activePads[index]
              ? [BoxShadow(color: padColors[index].withOpacity(0.8), blurRadius: 20, spreadRadius: 2)]
              : [BoxShadow(color: Colors.cyanAccent.withOpacity(0.3), blurRadius: 10)],
        ),
        child: Center(
          child: Text(
            '${index + 1}',
            style: TextStyle(
              fontSize: 24,
              fontWeight: activePads[index] ? FontWeight.bold : FontWeight.normal,
            ),
          ),
        ),
      ),
    );
  }
}
