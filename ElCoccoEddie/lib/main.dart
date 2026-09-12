import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:provider/provider.dart';
import 'theme/illuminati_theme.dart';
import 'providers/privacy_shield_provider.dart';
import 'bloc/camera/camera_bloc.dart';
import 'screens/home_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const ElCoccoApp());
}

class ElCoccoApp extends StatelessWidget {
  const ElCoccoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => PrivacyShieldProvider()),
        BlocProvider<CameraBloc>(create: (_) => CameraBloc()),
      ],
      child: MaterialApp(
        title: 'ElCocco - Privacy Shield',
        debugShowCheckedModeBanner: false,
        theme: IlluminatiTheme.darkTheme,
        home: const HomeScreen(),
      ),
    );
  }
}
