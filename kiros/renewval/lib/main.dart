import 'package:flutter/material.dart';
import 'screens/home_screen.dart';
void main() {
  runApp(const RenewValApp());
}
class RenewValApp extends StatelessWidget {
  const RenewValApp({Key? key}) : super(key: key);
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'renewval',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        primarySwatch: Colors.deepPurple,
        scaffoldBackgroundColor: const Color(0xFF1E1E2C),
      ),
      home: const HomeScreen(),
    );
  }
}
