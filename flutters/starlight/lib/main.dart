import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:starlight/theme/starlight_theme.dart';
import 'package:starlight/views/home_view.dart';

void main() {
  runApp(
    const ProviderScope(
      child: StarlightApp(),
    ),
  );
}

class StarlightApp extends StatelessWidget {
  const StarlightApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Star Light',
      debugShowCheckedModeBanner: false,
      theme: StarlightTheme.darkTheme,
      home: const HomeView(),
    );
  }
}
