import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:culinara/core/theme.dart';
import 'package:culinara/screens/nexus_home.dart';

void main() {
  runApp(
    const ProviderScope(
      child: Culinara(),
    ),
  );
}

class Culinara extends StatelessWidget {
  const Culinara({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Culinara: Epicurean Nexus',
      debugShowCheckedModeBanner: false,
      themeMode: ThemeMode.dark,
      theme: GourmetTheme.dark,
      darkTheme: GourmetTheme.dark,
      home: const NexusHome(),
    );
  }
}
