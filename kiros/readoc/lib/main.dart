import 'package:flutter/material.dart';
import 'package:media_kit/media_kit.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'services/youtube_service.dart';
import 'services/download_service.dart';
import 'ui/search_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  MediaKit.ensureInitialized();
  runApp(
    MultiProvider(
      providers: [
        Provider(create: (_) => YoutubeService()),
        Provider(create: (_) => DownloadService()),
        ChangeNotifierProvider(create: (_) => AppState()),
      ],
      child: const ReadocApp(),
    ),
  );
}

class AppState extends ChangeNotifier {
  // Global state logic can be added here (e.g. current video, library, etc.)
}

class ReadocApp extends StatelessWidget {
  const ReadocApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Readoc',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        primaryColor: const Color(0xff00d4ff),
        scaffoldBackgroundColor: const Color(0xff0a0e14),
        textTheme: GoogleFonts.outfitTextTheme(ThemeData.dark().textTheme),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xff00d4ff),
          secondary: Color(0xff00ff8e),
          surface: Color(0xff161b22),
        ),
      ),
      home: const SearchScreen(),
    );
  }
}
