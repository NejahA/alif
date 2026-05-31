import 'package:flutter/material.dart';
import 'dart:math' as math;

void main() {
  runApp(const JjjanApp());
}

class JjjanApp extends StatelessWidget {
  const JjjanApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'JJJAN - Linux Edition',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.light,
        scaffoldBackgroundColor: const Color(0xFFF0F2F5),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF2C3E50),
          primary: const Color(0xFF34495E),
          secondary: const Color(0xFF27AE60),
          tertiary: const Color(0xFFE67E22),
          surface: Colors.white,
        ),
        useMaterial3: true,
        // Desktop-style text theme
        textTheme: const TextTheme(
          displayLarge: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Color(0xFF2C3E50)),
          titleLarge: TextStyle(fontSize: 20, fontWeight: FontWeight.w600),
          bodyMedium: TextStyle(fontSize: 14, color: Colors.black87),
        ),
      ),
      home: const LinuxDashboard(),
    );
  }
}

class LinuxDashboard extends StatefulWidget {
  const LinuxDashboard({super.key});

  @override
  State<LinuxDashboard> createState() => _LinuxDashboardState();
}

class _LinuxDashboardState extends State<LinuxDashboard> {
  int _selectedIndex = 0;
  int _carbonCount = 1;
  int _hydrogenCount = 4;
  String _moleculeName = "Methane";

  void _updateMolecule(int carbons) {
    setState(() {
      _carbonCount = carbons;
      _hydrogenCount = (carbons * 2) + 2;
      final names = ["Methane", "Ethane", "Propane", "Butane", "Pentane", "Hexane", "Heptane", "Octane", "Nonane", "Decane"];
      _moleculeName = carbons <= names.length ? names[carbons - 1] : "Alkane (C$_carbonCount)";
    });
  }

  @override
  Widget build(BuildContext context) {
    // Determine if we should show sidebar or bottom nav
    final bool isWide = MediaQuery.of(context).size.width > 700;

    return Scaffold(
      body: Row(
        children: [
          if (isWide)
            NavigationRail(
              selectedIndex: _selectedIndex,
              onDestinationSelected: (int index) => setState(() => _selectedIndex = index),
              labelType: NavigationRailLabelType.all,
              backgroundColor: Theme.of(context).colorScheme.primary,
              unselectedIconTheme: const IconThemeData(color: Colors.white54),
              selectedIconTheme: const IconThemeData(color: Colors.white),
              unselectedLabelTextStyle: const TextStyle(color: Colors.white54, fontSize: 10),
              selectedLabelTextStyle: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
              destinations: const [
                NavigationRailDestination(icon: Icon(Icons.science_outlined), selectedIcon: Icon(Icons.science), label: Text('Analyze')),
                NavigationRailDestination(icon: Icon(Icons.history_outlined), selectedIcon: Icon(Icons.history), label: Text('History')),
                NavigationRailDestination(icon: Icon(Icons.settings_outlined), selectedIcon: Icon(Icons.settings), label: Text('Settings')),
              ],
            ),
          Expanded(
            child: _selectedIndex == 0 
                ? _buildMainView(isWide) 
                : Center(child: Text("Section ${_selectedIndex + 1} coming soon...")),
          ),
        ],
      ),
      bottomNavigationBar: isWide ? null : BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) => setState(() => _selectedIndex = index),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.science), label: 'Analyze'),
          BottomNavigationBarItem(icon: Icon(Icons.history), label: 'History'),
          BottomNavigationBarItem(icon: Icon(Icons.settings), label: 'Settings'),
        ],
      ),
    );
  }

  Widget _buildMainView(bool isWide) {
    return CustomScrollView(
      slivers: [
        SliverAppBar.large(
          title: const Text("JJJAN", style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 2)),
          backgroundColor: Colors.transparent,
          surfaceTintColor: Colors.transparent,
        ),
        SliverPadding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
          sliver: SliverToBoxAdapter(
            child: Wrap(
              spacing: 24,
              runSpacing: 24,
              children: [
                // Info Card (Wider on Desktop)
                SizedBox(
                  width: isWide ? 400 : double.infinity,
                  child: _buildInfoCard(),
                ),
                // Visualizer
                SizedBox(
                  width: isWide ? 400 : double.infinity,
                  child: _buildVisualizer(),
                ),
              ],
            ),
          ),
        ),
        SliverPadding(
          padding: const EdgeInsets.all(24),
          sliver: SliverToBoxAdapter(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildControls(),
                const SizedBox(height: 32),
                const Text("PHYSICAL_PROPERTIES", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, letterSpacing: 1.5, color: Colors.grey)),
                const SizedBox(height: 16),
                _buildPropertiesGrid(isWide),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildInfoCard() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.primary,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("DESKTOP_ANALYSIS_ACTIVE", style: TextStyle(color: Colors.white38, fontSize: 10, letterSpacing: 1.5, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          Text(_moleculeName.toUpperCase(), style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Row(
            children: [
              const Icon(Icons.hub_outlined, color: Color(0xFF27AE60), size: 16),
              const SizedBox(width: 8),
              Text("C${_carbonCount}H${_hydrogenCount}", style: const TextStyle(color: Color(0xFF27AE60), fontFamily: 'monospace', fontSize: 18, fontWeight: FontWeight.bold)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildVisualizer() {
    return Container(
      height: 250,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.black.withOpacity(0.05)),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10)],
      ),
      child: Center(
        child: CustomPaint(
          size: const Size(250, 200),
          painter: MoleculePainter(carbons: _carbonCount),
        ),
      ),
    );
  }

  Widget _buildControls() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.black.withOpacity(0.05)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text("CARBON_CHAIN_LENGTH", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, letterSpacing: 1)),
              Text("${_carbonCount}C", style: TextStyle(color: Theme.of(context).colorScheme.secondary, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 16),
          Slider(
            value: _carbonCount.toDouble(),
            min: 1,
            max: 10,
            divisions: 9,
            activeColor: Theme.of(context).colorScheme.secondary,
            inactiveColor: Colors.black.withOpacity(0.05),
            onChanged: (value) => _updateMolecule(value.toInt()),
          ),
        ],
      ),
    );
  }

  Widget _buildPropertiesGrid(bool isWide) {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: isWide ? 4 : 2,
      mainAxisSpacing: 16,
      crossAxisSpacing: 16,
      childAspectRatio: 1.8,
      children: [
        _buildPropItem("MOLAR_MASS", "${(_carbonCount * 12.01 + _hydrogenCount * 1.008).toStringAsFixed(2)} g/mol", Icons.balance_outlined),
        _buildPropItem("C:H_RATIO", "1:${(_hydrogenCount / _carbonCount).toStringAsFixed(1)}", Icons.compare_arrows),
        _buildPropItem("BOND_TYPE", "Single (σ)", Icons.link),
        _buildPropItem("STATE", _carbonCount < 5 ? "Gas" : "Liquid", Icons.waves_outlined),
      ],
    );
  }

  Widget _buildPropItem(String label, String value, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.black.withOpacity(0.05)),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 12, color: Colors.grey),
              const SizedBox(width: 6),
              Text(label, style: const TextStyle(fontSize: 9, color: Colors.grey, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 8),
          Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}

class MoleculePainter extends CustomPainter {
  final int carbons;
  MoleculePainter({required this.carbons});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = const Color(0xFF34495E)..strokeWidth = 3;
    final carbonPaint = Paint()..color = const Color(0xFF2C3E50);
    final hydrogenPaint = Paint()..color = const Color(0xFFBDC3C7);

    double spacing = 45;
    double startX = (size.width - (carbons - 1) * spacing) / 2;
    double y = size.height / 2;

    for (int i = 0; i < carbons; i++) {
      double cx = startX + i * spacing;
      if (i < carbons - 1) canvas.drawLine(Offset(cx, y), Offset(cx + spacing, y), paint);
      canvas.drawCircle(Offset(cx, y), 14, carbonPaint);
      
      // Top H
      canvas.drawLine(Offset(cx, y), Offset(cx, y - 28), paint..strokeWidth = 1.5);
      canvas.drawCircle(Offset(cx, y - 28), 7, hydrogenPaint);
      
      // Bottom H
      canvas.drawLine(Offset(cx, y), Offset(cx, y + 28), paint..strokeWidth = 1.5);
      canvas.drawCircle(Offset(cx, y + 28), 7, hydrogenPaint);

      if (i == 0) {
        canvas.drawLine(Offset(cx, y), Offset(cx - 28, y), paint..strokeWidth = 1.5);
        canvas.drawCircle(Offset(cx - 28, y), 7, hydrogenPaint);
      }
      if (i == carbons - 1) {
        canvas.drawLine(Offset(cx, y), Offset(cx + 28, y), paint..strokeWidth = 1.5);
        canvas.drawCircle(Offset(cx + 28, y), 7, hydrogenPaint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
