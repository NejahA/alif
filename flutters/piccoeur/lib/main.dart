import 'package:flutter/material.dart';
import 'screens/home_screen.dart';
import 'screens/rates_screen.dart';
import 'screens/routes_screen.dart';
import 'screens/favorites_screen.dart';
import 'models/route_info.dart';
import 'data/tunisia_data.dart';
import 'services/api_service.dart';

void main() {
  runApp(const PiccoeurApp());
}

class PiccoeurApp extends StatelessWidget {
  const PiccoeurApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Piccoeur',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFFFFC107),
          brightness: Brightness.light,
        ),
        useMaterial3: true,
        appBarTheme: const AppBarTheme(
          centerTitle: true,
          elevation: 2,
        ),
      ),
      home: const MainScreen(),
    );
  }
}

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _currentIndex = 0;
  final Set<String> _favorites = {};
  List<RouteInfo> _apiRoutes = [];
  bool _loadingRoutes = true;

  @override
  void initState() {
    super.initState();
    _refreshRoutes();
  }

  Future<void> _refreshRoutes() async {
    setState(() => _loadingRoutes = true);
    final routes = await ApiService.fetchRoutes();
    if (mounted) {
      setState(() {
        _apiRoutes = routes;
        _loadingRoutes = false;
      });
    }
  }

  List<RouteInfo> get _allRoutes => [...TunisiaData.popularRoutes, ..._apiRoutes];

  void _toggleFavorite(String routeId) {
    setState(() {
      if (_favorites.contains(routeId)) {
        _favorites.remove(routeId);
      } else {
        _favorites.add(routeId);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final screens = [
      const HomeScreen(),
      const RatesScreen(),
      RoutesScreen(
        routes: _allRoutes,
        favorites: _favorites,
        onToggleFavorite: _toggleFavorite,
        loading: _loadingRoutes,
        onRefresh: _refreshRoutes,
      ),
      FavoritesScreen(
        allRoutes: _allRoutes,
        favorites: _favorites,
        onToggleFavorite: _toggleFavorite,
      ),
    ];

    return Scaffold(
      body: screens[_currentIndex],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) {
          setState(() => _currentIndex = index);
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.attach_money_outlined),
            selectedIcon: Icon(Icons.attach_money),
            label: 'Rates',
          ),
          NavigationDestination(
            icon: Icon(Icons.route_outlined),
            selectedIcon: Icon(Icons.route),
            label: 'Routes',
          ),
          NavigationDestination(
            icon: Icon(Icons.favorite_outline),
            selectedIcon: Icon(Icons.favorite),
            label: 'Favorites',
          ),
        ],
      ),
    );
  }
}
