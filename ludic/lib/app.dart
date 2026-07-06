import 'package:flutter/material.dart';
import 'theme.dart';
import 'screens/playground_screen.dart';

class LudicApp extends StatelessWidget {
  const LudicApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Ludic',
      debugShowCheckedModeBanner: false,
      theme: LudicTheme.theme,
      home: const PlaygroundScreen(),
    );
  }
}