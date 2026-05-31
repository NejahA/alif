import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'dart:io';
import '../providers/usage_provider.dart';
import '../widgets/usage_chart.dart';
import 'app_list_screen.dart';
import 'system_stats_screen.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<UsageProvider>(context);

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Runtine',
                        style: Theme.of(context).textTheme.displayLarge?.copyWith(
                          color: Theme.of(context).primaryColor,
                          letterSpacing: -1,
                        ),
                      ),
                      const Text(
                        'Your Digital Rhythm',
                        style: TextStyle(color: Colors.white38, fontSize: 14),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Theme.of(context).colorScheme.surface,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(LucideIcons.activity, color: Colors.white, size: 20),
                  ),
                ],
              ),
              const SizedBox(height: 48),
              if (!provider.isPermissionGranted)
                Center(
                  child: Column(
                    children: [
                      Icon(LucideIcons.lock, size: 64, color: Colors.white24),
                      const SizedBox(height: 24),
                      const Text(
                        'Usage Statistics Required',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
                      ),
                      const SizedBox(height: 12),
                      const Text(
                        'To analyze your digital habits, Runtine needs permission to access app usage data.',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: Colors.white54),
                      ),
                      const SizedBox(height: 32),
                      ElevatedButton(
                        onPressed: () => provider.requestPermission(),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Theme.of(context).primaryColor,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        ),
                        child: const Text('Grant Access'),
                      ),
                    ],
                  ),
                )
              else ...[
                _buildTotalUsageCard(context, provider),
                const SizedBox(height: 32),
                const Text(
                  'Insights',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 16),
                const Expanded(child: UsageChart()),
                const SizedBox(height: 24),
                _buildActionButtons(context),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTotalUsageCard(BuildContext context, UsageProvider provider) {
    final totalMinutes = provider.getTotalTimeInMinutes();
    final hours = (totalMinutes / 60).floor();
    final minutes = (totalMinutes % 60).floor();

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(28),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Theme.of(context).primaryColor, const Color(0xFF8E78FF)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(32),
        boxShadow: [
          BoxShadow(
            color: Theme.of(context).primaryColor.withOpacity(0.3),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Total Time Today',
            style: TextStyle(color: Colors.white70, fontSize: 16),
          ),
          const SizedBox(height: 12),
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(
                '$hours',
                style: const TextStyle(fontSize: 48, fontWeight: FontWeight.bold, color: Colors.white),
              ),
              const SizedBox(width: 4),
              const Text('h', style: TextStyle(fontSize: 20, color: Colors.white70)),
              const SizedBox(width: 12),
              Text(
                '$minutes',
                style: const TextStyle(fontSize: 48, fontWeight: FontWeight.bold, color: Colors.white),
              ),
              const SizedBox(width: 4),
              const Text('m', style: TextStyle(fontSize: 20, color: Colors.white70)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildActionButtons(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _buildTile(
            context,
            'App List',
            LucideIcons.list,
            () => Navigator.push(context, MaterialPageRoute(builder: (_) => AppListScreen())),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: _buildTile(
            context,
            'System',
            LucideIcons.activity,
            () => Navigator.push(context, MaterialPageRoute(builder: (_) => SystemStatsScreen())),
          ),
        ),
      ],
    );
  }

  Widget _buildTile(BuildContext context, String title, IconData icon, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(24),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 20),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: Colors.white.withOpacity(0.05)),
        ),
        child: Column(
          children: [
            Icon(icon, color: Colors.white70, size: 28),
            const SizedBox(height: 12),
            Text(title, style: const TextStyle(color: Colors.white70, fontWeight: FontWeight.w500)),
          ],
        ),
      ),
    );
  }
}
