import 'package:flutter/material.dart';

void main() => runApp(const ShifterApp());

class ShifterApp extends StatelessWidget {
  const ShifterApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Shifter',
      theme: ThemeData.light(),
      home: const ColorTherapyScreen(),
    );
  }
}

class ColorTherapyScreen extends StatefulWidget {
  const ColorTherapyScreen({super.key});

  @override
  State<ColorTherapyScreen> createState() => _ColorTherapyScreenState();
}

class _ColorTherapyScreenState extends State<ColorTherapyScreen> {
  Color currentColor = Colors.blue;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: AnimatedContainer(
        duration: const Duration(seconds: 2),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [currentColor, currentColor.withOpacity(0.3)],
          ),
        ),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text('🌈 Shifter', style: TextStyle(fontSize: 48, color: Colors.white)),
              const SizedBox(height: 40),
              const Text('Color Therapy', style: TextStyle(fontSize: 24, color: Colors.white70)),
              const SizedBox(height: 60),
              Wrap(
                spacing: 20,
                children: [Colors.red, Colors.blue, Colors.green, Colors.purple, Colors.orange]
                    .map((c) => GestureDetector(
                          onTap: () => setState(() => currentColor = c),
                          child: Container(
                            width: 60,
                            height: 60,
                            decoration: BoxDecoration(shape: BoxShape.circle, color: c),
                          ),
                        ))
                    .toList(),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
