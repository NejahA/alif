import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/colonye_provider.dart';
import '../theme/app_theme.dart';
import '../widgets/glass_card.dart';

class ConstellationMilestonesScreen extends StatelessWidget {
  const ConstellationMilestonesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<ColonyeProvider>(context);

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 18.0, vertical: 12.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header
                Text(
                  'Constellation Map',
                  style: Theme.of(context).textTheme.displayLarge?.copyWith(fontSize: 26),
                ),
                Text(
                  'Track your cosmic journey & milestone alignments',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),

                const SizedBox(height: 20),

                // Overall Stats Grid
                Row(
                  children: [
                    Expanded(
                      child: GlassCard(
                        borderRadius: 18,
                        borderColor: AppTheme.astralGold,
                        child: Column(
                          children: [
                            const Icon(Icons.stars_rounded, color: AppTheme.astralGold, size: 28),
                            const SizedBox(height: 6),
                            Text(
                              '15 Days',
                              style: Theme.of(context).textTheme.displayMedium?.copyWith(
                                    fontSize: 20,
                                    color: AppTheme.astralGold,
                                  ),
                            ),
                            Text(
                              'Current Streak',
                              style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontSize: 11),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: GlassCard(
                        borderRadius: 18,
                        borderColor: AppTheme.quantumCyan,
                        child: Column(
                          children: [
                            const Icon(Icons.nature_people_rounded, color: AppTheme.quantumCyan, size: 28),
                            const SizedBox(height: 6),
                            Text(
                              '${provider.breathCompletedCount * 5}m',
                              style: Theme.of(context).textTheme.displayMedium?.copyWith(
                                    fontSize: 20,
                                    color: AppTheme.quantumCyan,
                                  ),
                            ),
                            Text(
                              'Mindful Breath',
                              style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontSize: 11),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 24),

                // Weekly Alignment Progress Chart
                GlassCard(
                  borderRadius: 20,
                  borderColor: AppTheme.nebulaViolet,
                  padding: const EdgeInsets.all(18),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Weekly Resonance Flow',
                            style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 16),
                          ),
                          Text(
                            '92% Alignment',
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  color: AppTheme.nebulaViolet,
                                  fontWeight: FontWeight.bold,
                                ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),

                      // Day Columns
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          _buildDayBar(context, day: 'M', heightFactor: 0.8, isToday: false),
                          _buildDayBar(context, day: 'T', heightFactor: 0.9, isToday: false),
                          _buildDayBar(context, day: 'W', heightFactor: 0.7, isToday: false),
                          _buildDayBar(context, day: 'T', heightFactor: 1.0, isToday: true),
                          _buildDayBar(context, day: 'F', heightFactor: 0.6, isToday: false),
                          _buildDayBar(context, day: 'S', heightFactor: 0.85, isToday: false),
                          _buildDayBar(context, day: 'S', heightFactor: 0.95, isToday: false),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                Text(
                  'Celestial Badges',
                  style: Theme.of(context).textTheme.headlineMedium,
                ),
                const SizedBox(height: 12),

                // Celestial Badges Cards
                _buildBadgeCard(
                  context,
                  title: "Starlight Pioneer",
                  description: "Maintained an unbroken 14-day daily orbit resonance streak.",
                  icon: Icons.brightness_7_rounded,
                  color: AppTheme.astralGold,
                  isUnlocked: true,
                ),
                const SizedBox(height: 10),
                _buildBadgeCard(
                  context,
                  title: "Soundscape Artisan",
                  description: "Listened to over 3 hours of ambient frequencies & rain.",
                  icon: Icons.graphic_eq_rounded,
                  color: AppTheme.quantumCyan,
                  isUnlocked: true,
                ),
                const SizedBox(height: 10),
                _buildBadgeCard(
                  context,
                  title: "Mindweaver Sage",
                  description: "Authored 10 reflective journal entries in the Mindweaver sanctuary.",
                  icon: Icons.auto_stories_rounded,
                  color: AppTheme.nebulaViolet,
                  isUnlocked: false,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildDayBar(BuildContext context, {required String day, required double heightFactor, required bool isToday}) {
    return Column(
      children: [
        Container(
          height: 80 * heightFactor,
          width: 14,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(8),
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: isToday
                  ? [AppTheme.quantumCyan, AppTheme.nebulaViolet]
                  : [Colors.white24, Colors.white10],
            ),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          day,
          style: TextStyle(
            color: isToday ? AppTheme.quantumCyan : AppTheme.textSecondary,
            fontWeight: isToday ? FontWeight.bold : FontWeight.normal,
            fontSize: 12,
          ),
        ),
      ],
    );
  }

  Widget _buildBadgeCard(
    BuildContext context, {
    required String title,
    required String description,
    required IconData icon,
    required Color color,
    required bool isUnlocked,
  }) {
    return GlassCard(
      borderRadius: 16,
      borderColor: isUnlocked ? color : AppTheme.glassBorder,
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isUnlocked ? color.withOpacity(0.18) : Colors.white10,
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: isUnlocked ? color : Colors.white38, size: 26),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      title,
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 15),
                    ),
                    if (isUnlocked) ...[
                      const SizedBox(width: 6),
                      const Icon(Icons.verified_rounded, color: AppTheme.quantumCyan, size: 16),
                    ],
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  description,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontSize: 11),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
