import 'package:flutter/material.dart';
import 'dart:math';

void main() => runApp(const MindamazeApp());

class MindamazeApp extends StatelessWidget {
  const MindamazeApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Mindamaze',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        primaryColor: const Color(0xFF9C27B0),
        scaffoldBackgroundColor: const Color(0xFF1A1A2E),
      ),
      home: const PuzzleGameScreen(),
    );
  }
}

class PuzzleGameScreen extends StatefulWidget {
  const PuzzleGameScreen({super.key});

  @override
  State<PuzzleGameScreen> createState() => _PuzzleGameScreenState();
}

class _PuzzleGameScreenState extends State<PuzzleGameScreen> {
  List<bool> tiles = List.generate(25, (i) => Random().nextBool());
  int score = 0;

  void flipTile(int index) {
    setState(() {
      tiles[index] = !tiles[index];
      // Flip adjacent tiles
      if (index % 5 > 0) tiles[index - 1] = !tiles[index - 1];
      if (index % 5 < 4) tiles[index + 1] = !tiles[index + 1];
      if (index >= 5) tiles[index - 5] = !tiles[index - 5];
      if (index < 20) tiles[index + 5] = !tiles[index + 5];
      
      score++;
      
      if (tiles.every((t) => t)) {
        Future.delayed(const Duration(milliseconds: 500), () {
          showDialog(
            context: context,
            builder: (context) => AlertDialog(
              title: const Text('🎉 Puzzle Solved!'),
              content: Text('Score: $score moves'),
              actions: [
                TextButton(
                  onPressed: () {
                    Navigator.pop(context);
                    resetPuzzle();
                  },
                  child: const Text('New Puzzle'),
                ),
              ],
            ),
          );
        });
      }
    });
  }

  void resetPuzzle() {
    setState(() {
      tiles = List.generate(25, (i) => Random().nextBool());
      score = 0;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('🧠 Mindamaze'),
        actions: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Center(child: Text('Moves: $score', style: const TextStyle(fontSize: 16))),
          ),
        ],
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text('Brain Training', style: TextStyle(fontSize: 28, color: Colors.purpleAccent)),
            const SizedBox(height: 20),
            const Text('Tap to flip tiles and make all purple!', style: TextStyle(color: Colors.white70)),
            const SizedBox(height: 40),
            Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                border: Border.all(color: Colors.purpleAccent, width: 2),
                color: Colors.purple.withOpacity(0.1),
              ),
              child: GridView.builder(
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 5),
                itemCount: 25,
                itemBuilder: (context, index) => GestureDetector(
                  onTap: () => flipTile(index),
                  child: Container(
                    margin: const EdgeInsets.all(2),
                    color: tiles[index] ? Colors.purpleAccent : Colors.grey[800],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 40),
            ElevatedButton(
              onPressed: resetPuzzle,
              child: const Text('New Puzzle'),
            ),
          ],
        ),
      ),
    );
  }
}
