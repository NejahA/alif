import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:culinara/core/theme.dart';
import 'package:culinara/screens/app_shell.dart';

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
      title: 'Culinara — V Cooks Cuisine',
      debugShowCheckedModeBanner: false,
      themeMode: ThemeMode.dark,
      theme: CuisineTheme.dark,
      darkTheme: CuisineTheme.dark,
      home: const AppShell(),
    );
  }
}
