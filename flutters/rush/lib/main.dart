import 'package:flutter/material.dart';
import 'screens/meadow_screen.dart';
import 'services/hive_controller.dart';
import 'services/storage_service.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const RushApp());
}

class RushApp extends StatelessWidget {
  const RushApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'RUSH',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.light,
        scaffoldBackgroundColor: const Color(0xFFFDF6E3),
        colorScheme: const ColorScheme.light(
          primary: Color(0xFFFFB300),
          secondary: Color(0xFF8BC34A),
          surface: Color(0xFFFFF8E1),
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.transparent,
          elevation: 0,
          iconTheme: IconThemeData(color: Color(0xFF5D4037)),
          titleTextStyle: TextStyle(
            color: Color(0xFF5D4037),
            fontSize: 20,
            fontWeight: FontWeight.w600,
          ),
        ),
        textSelectionTheme: const TextSelectionThemeData(
          cursorColor: Color(0xFFFFB300),
          selectionColor: Color(0x33FFB300),
        ),
      ),
      home: const _Home(),
    );
  }
}

class _Home extends StatefulWidget {
  const _Home();

  @override
  State<_Home> createState() => _HomeState();
}

class _HomeState extends State<_Home> {
  late final HiveController _controller;

  @override
  void initState() {
    super.initState();
    _controller = HiveController(StorageService())..load();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, _) {
        if (!_controller.loaded) {
          return const Scaffold(
            backgroundColor: Color(0xFF87CEEB),
            body: Center(
              child: CircularProgressIndicator(color: Color(0xFFFFB300)),
            ),
          );
        }
        return MeadowScreen(controller: _controller);
      },
    );
  }
}