import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/usage_provider.dart';
import 'screens/dashboard_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => UsageProvider()),
      ],
      child: const RuntineApp(),
    ),
  );
}

class RuntineApp extends StatelessWidget {
  const RuntineApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Runtine',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0F0F12),
        primaryColor: const Color(0xFF6C5CE7),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF6C5CE7),
          brightness: Brightness.dark,
          surface: const Color(0xFF1A1A24),
          primary: const Color(0xFF6C5CE7),
          secondary: const Color(0xFFA29BFE),
        ),
        textTheme: const TextTheme(
          displayLarge: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Colors.white),
          bodyLarge: TextStyle(fontSize: 16, color: Colors.white70),
        ),
        useMaterial3: true,
      ),
      home: const DashboardScreen(),
    );
  }
}
