import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'screens/garden_screen.dart';
import 'services/garden_service.dart';
import 'theme/hiro_theme.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: HiroColors.abyss,
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );

  runApp(const HiroApp());
}

class HiroApp extends StatefulWidget {
  const HiroApp({super.key});

  @override
  State<HiroApp> createState() => _HiroAppState();
}

class _HiroAppState extends State<HiroApp> {
  final GardenService _gardenService = GardenService();

  @override
  void dispose() {
    _gardenService.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'hi§ro — synapse garden',
      debugShowCheckedModeBanner: false,
      theme: HiroTheme.darkTheme,
      home: GardenScreen(service: _gardenService),
    );
  }
}
