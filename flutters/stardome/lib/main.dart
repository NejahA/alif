import 'package:flutter/material.dart';
import 'dart:math';

void main() => runApp(const StardomeApp());

class StardomeApp extends StatelessWidget {
  const StardomeApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Stardome',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        primaryColor: const Color(0xFF1A1A2E),
        scaffoldBackgroundColor: const Color(0xFF0F0F1E),
      ),
      home: const StarGazingScreen(),
    );
  }
}

class StarGazingScreen extends StatefulWidget {
  const StarGazingScreen({super.key});

  @override
  State<StarGazingScreen> createState() => _StarGazingScreenState();
}

class _StarGazingScreenState extends State<StarGazingScreen> {
  List<String> constellations = ['Orion', 'Ursa Major', 'Cassiopeia', 'Leo', 'Scorpius'];
  int discoveredCount = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('🌌 Stardome'),
        actions: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Center(child: Text('$discoveredCount/${constellations.length}', style: const TextStyle(fontSize: 16))),
          ),
        ],
      ),
      body: Stack(
        children: [
          // Star field background
          ...List.generate(50, (i) => Positioned(
            left: Random().nextDouble() * 400,
            top: Random().nextDouble() * 800,
            child: Icon(
              Icons.star,
              size: Random().nextDouble() * 8 + 2,
              color: Colors.white.withOpacity(Random().nextDouble() * 0.5 + 0.5),
            ),
          )),
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.stars, size: 100, color: Colors.amber),
                const SizedBox(height: 20),
                const Text('Space Exploration', style: TextStyle(fontSize: 28, color: Colors.white70)),
                const SizedBox(height: 40),
                ElevatedButton.icon(
                  onPressed: () {
                    if (discoveredCount < constellations.length) {
                      setState(() {
                        discoveredCount++;
                      });
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('✨ Discovered ${constellations[discoveredCount - 1]}!')),
                      );
                    } else {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('🎉 All constellations discovered!')),
                      );
                    }
                  },
                  icon: const Icon(Icons.camera_alt),
                  label: const Text('Scan Night Sky'),
                ),
                const SizedBox(height: 20),
                ElevatedButton.icon(
                  onPressed: () {
                    showDialog(
                      context: context,
                      builder: (context) => AlertDialog(
                        backgroundColor: const Color(0xFF1A1A2E),
                        title: const Text('Discovered Constellations', style: TextStyle(color: Colors.white)),
                        content: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: List.generate(
                            constellations.length,
                            (i) => ListTile(
                              leading: Icon(
                                i < discoveredCount ? Icons.star : Icons.star_border,
                                color: i < discoveredCount ? Colors.amber : Colors.grey,
                              ),
                              title: Text(
                                constellations[i],
                                style: TextStyle(
                                  color: i < discoveredCount ? Colors.white : Colors.grey,
                                ),
                              ),
                            ),
                          ),
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
                  icon: const Icon(Icons.list),
                  label: const Text('View Collection'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
