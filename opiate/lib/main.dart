import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'theme/opiate_theme.dart';
import 'providers/quran_provider.dart';
import 'screens/home_dashboard.dart';

void main() {
  runApp(
    ChangeNotifierProvider(
      create: (_) => QuranProvider(),
      child: const OpiateApp(),
    ),
  );
}

class OpiateApp extends StatelessWidget {
  const OpiateApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Opiate • Quran Recitation & Tranquility',
      debugShowCheckedModeBanner: false,
      theme: OpiateTheme.darkTheme,
      home: const HomeDashboard(),
    );
  }
}
