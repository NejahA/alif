import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/colonye_provider.dart';
import 'theme/app_theme.dart';
import 'screens/main_navigation_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const ColonyeApp());
}

class ColonyeApp extends StatelessWidget {
  const ColonyeApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => ColonyeProvider(),
      child: MaterialApp(
        title: 'Colonye',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.darkTheme,
        home: const MainNavigationScreen(),
      ),
    );
  }
}
