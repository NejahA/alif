import 'package:flutter/material.dart';
import 'screens/home_screen.dart';
import 'screens/study_screen.dart';
import 'screens/add_card_screen.dart';
import 'screens/settings_screen.dart';
import 'screens/statistics_screen.dart';
import 'screens/deck_screen.dart';
import 'services/shared_prefs_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final prefsService = SharedPrefsService();
  final isDarkMode = await prefsService.getDarkMode();
  runApp(CramierApp(isDarkMode: isDarkMode));
}

class CramierApp extends StatefulWidget {
  final bool isDarkMode;

  const CramierApp({super.key, required this.isDarkMode});

  @override
  State<CramierApp> createState() => _CramierAppState();
}

class _CramierAppState extends State<CramierApp> {
  late bool _isDarkMode;

  @override
  void initState() {
    super.initState();
    _isDarkMode = widget.isDarkMode;
  }

  void toggleTheme(bool isDark) {
    setState(() {
      _isDarkMode = isDark;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Cramier',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF6C63FF),
          brightness: Brightness.light,
        ),
        useMaterial3: true,
        fontFamily: 'Roboto',
      ),
      darkTheme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF6C63FF),
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
        fontFamily: 'Roboto',
      ),
      themeMode: _isDarkMode ? ThemeMode.dark : ThemeMode.light,
      initialRoute: '/',
      routes: {
        '/': (context) => HomeScreen(onThemeChanged: toggleTheme),
        '/study': (context) => const StudyScreen(),
        '/add': (context) => const AddCardScreen(),
        '/settings': (context) => const SettingsScreen(),
        '/statistics': (context) => const StatisticsScreen(),
        '/decks': (context) => const DeckScreen(),
      },
    );
  }
}