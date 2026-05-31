import 'package:flutter/material.dart';
import 'screens/home_screen.dart';

void main() {
  runApp(const TruetoothApp());
}

class TruetoothApp extends StatelessWidget {
  const TruetoothApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Truetooth',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        useMaterial3: true,
      ),
      home: const HomeScreen(),
    );
  }
}
