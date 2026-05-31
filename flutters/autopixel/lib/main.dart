import 'package:flutter/material.dart';
import 'dart:math';

void main() => runApp(const AutoPixelApp());

class AutoPixelApp extends StatelessWidget {
  const AutoPixelApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AutoPixel',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.light().copyWith(
        primaryColor: const Color(0xFF8BC34A),
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF8BC34A)),
      ),
      home: const TravelLogScreen(),
    );
  }
}

class TravelLogScreen extends StatefulWidget {
  const TravelLogScreen({super.key});

  @override
  State<TravelLogScreen> createState() => _TravelLogScreenState();
}

class _TravelLogScreenState extends State<TravelLogScreen> {
  List<String> locations = ['Paris', 'Tokyo', 'New York', 'London', 'Dubai', 'Sydney'];
  int visitedCount = 3;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('🗺️ AutoPixel'),
        actions: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Center(child: Text('$visitedCount/${locations.length}', style: const TextStyle(fontSize: 18))),
          ),
        ],
      ),
      body: Column(
        children: [
          Container(
            height: 200,
            color: Colors.green[100],
            child: Stack(
              children: [
                const Center(
                  child: Text('8-BIT MAP', style: TextStyle(fontSize: 32, fontFamily: 'monospace', color: Colors.black54)),
                ),
                ...List.generate(visitedCount, (i) => Positioned(
                  left: Random().nextDouble() * 300,
                  top: Random().nextDouble() * 150,
                  child: const Icon(Icons.location_on, color: Colors.red, size: 30),
                )),
              ],
            ),
          ),
          Expanded(
            child: GridView.builder(
              padding: const EdgeInsets.all(16),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                crossAxisSpacing: 10,
                mainAxisSpacing: 10,
              ),
              itemCount: locations.length,
              itemBuilder: (context, index) => GestureDetector(
                onTap: () {
                  setState(() {
                    if (index >= visitedCount) visitedCount = index + 1;
                  });
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Visited ${locations[index]}!')),
                  );
                },
                child: Container(
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.black, width: 2),
                    color: index < visitedCount 
                        ? Colors.primaries[index % Colors.primaries.length].withOpacity(0.6)
                        : Colors.grey.withOpacity(0.2),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(index < visitedCount ? '📍' : '🔒', style: const TextStyle(fontSize: 32)),
                      const SizedBox(height: 4),
                      Text(locations[index], style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          showDialog(
            context: context,
            builder: (context) => AlertDialog(
              title: const Text('Add Location'),
              content: const Text('Take a photo to add a new location to your travel map!'),
              actions: [
                TextButton(
                  onPressed: () {
                    Navigator.pop(context);
                    setState(() {
                      locations.add('New Place ${locations.length + 1}');
                    });
                  },
                  child: const Text('Add'),
                ),
              ],
            ),
          );
        },
        child: const Icon(Icons.add_a_photo),
      ),
    );
  }
}
