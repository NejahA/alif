import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/colonye_provider.dart';
import '../theme/app_theme.dart';
import '../widgets/colonye_logo_widget.dart';
import '../widgets/custom_orbit_sheet.dart';
import '../widgets/glass_card.dart';
import '../widgets/moon_phase_widget.dart';
import '../widgets/orbital_canvas_painter.dart';

class OrbitalDashboardScreen extends StatefulWidget {
  const OrbitalDashboardScreen({super.key});

  @override
  State<OrbitalDashboardScreen> createState() => _OrbitalDashboardScreenState();
}

class _OrbitalDashboardScreenState extends State<OrbitalDashboardScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _rotationController;

  void _openCustomOrbitSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => const CustomOrbitSheet(),
    );
  }

  @override
  void initState() {
    super.initState();
    _rotationController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 40),
    )..repeat();
  }

  @override
  void dispose() {
    _rotationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<ColonyeProvider>(context);

    return Scaffold(
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppTheme.quantumCyan,
        onPressed: () => _openCustomOrbitSheet(context),
        icon: const Icon(Icons.add_circle_outline_rounded, color: Colors.black),
        label: const Text('Add Orbit', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 18.0, vertical: 12.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top Header Bar
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const ColonyeLogoWidget(size: 36, showText: true),
                        const SizedBox(height: 2),
                        Text(
                          'Cosmic Mind & Daily Resonance',
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                color: AppTheme.textSecondary,
                                fontSize: 13,
                              ),
                        ),
                      ],
                    ),
                    // Daily Streak Badge
                    GlassCard(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      borderColor: AppTheme.astralGold,
                      child: Row(
                        children: [
                          const Icon(Icons.star_rounded, color: AppTheme.astralGold, size: 20),
                          const SizedBox(width: 6),
                          Text(
                            '15 Days',
                            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                  fontSize: 14,
                                  color: AppTheme.astralGold,
                                  fontWeight: FontWeight.bold,
                                ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 16),

                // Moon Phase Guide
                const MoonPhaseWidget(),

                const SizedBox(height: 16),

                // Orbital Resonance Canvas Container
                GlassCard(
                  padding: EdgeInsets.zero,
                  borderRadius: 24,
                  borderColor: AppTheme.nebulaViolet.withOpacity(0.4),
                  child: SizedBox(
                    height: 340,
                    width: double.infinity,
                    child: AnimatedBuilder(
                      animation: _rotationController,
                      builder: (context, child) {
                        return CustomPaint(
                          painter: OrbitalCanvasPainter(
                            nodes: provider.nodes,
                            animationValue: _rotationController.value,
                          ),
                          child: Stack(
                            children: [
                              // Center Label Overlay
                              Center(
                                child: Container(
                                  padding: const EdgeInsets.all(12),
                                  child: Column(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Text(
                                        '${(provider.dailyCompletionPercentage * 100).toInt()}%',
                                        style: Theme.of(context).textTheme.displayMedium?.copyWith(
                                              fontWeight: FontWeight.bold,
                                              color: Colors.white,
                                            ),
                                      ),
                                      Text(
                                        'Resonance',
                                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                              color: AppTheme.quantumCyan,
                                              fontSize: 11,
                                              letterSpacing: 1.1,
                                            ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),

                              // Bottom Canvas Info Bar
                              Positioned(
                                bottom: 12,
                                left: 16,
                                right: 16,
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      '${provider.totalCompletedToday} of ${provider.totalNodesCount} Orbit Nodes Aligned',
                                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                            color: Colors.white70,
                                            fontSize: 12,
                                          ),
                                    ),
                                    const Icon(Icons.touch_app_rounded, color: AppTheme.quantumCyan, size: 16),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  ),
                ),

                const SizedBox(height: 24),

                // Section Header: Focus Orbit Nodes
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Orbital Focus Nodes',
                      style: Theme.of(context).textTheme.headlineMedium,
                    ),
                    Text(
                      'Tap to Toggle',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: AppTheme.quantumCyan,
                          ),
                    ),
                  ],
                ),

                const SizedBox(height: 12),

                // Orbit Nodes List Cards
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: provider.nodes.length,
                  itemBuilder: (context, index) {
                    final node = provider.nodes[index];
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 10.0),
                      child: GlassCard(
                        borderRadius: 16,
                        borderColor: node.isCompletedToday ? node.color : AppTheme.glassBorder,
                        onTap: () => provider.toggleNodeCompletion(node.id),
                        child: Row(
                          children: [
                            // Icon Avatar
                            Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: node.color.withOpacity(0.18),
                                shape: BoxShape.circle,
                                border: Border.all(color: node.color.withOpacity(0.5)),
                              ),
                              child: Icon(node.icon, color: node.color, size: 22),
                            ),
                            const SizedBox(width: 14),

                            // Node details
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    node.title,
                                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                          fontSize: 15,
                                          decoration: node.isCompletedToday
                                              ? TextDecoration.lineThrough
                                              : null,
                                        ),
                                  ),
                                  const SizedBox(height: 2),
                                  Row(
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: Colors.white.withOpacity(0.08),
                                          borderRadius: BorderRadius.circular(4),
                                        ),
                                        child: Text(
                                          node.category,
                                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                                fontSize: 10,
                                                color: AppTheme.textSecondary,
                                              ),
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      Icon(Icons.local_fire_department_rounded,
                                          color: node.color, size: 14),
                                      const SizedBox(width: 2),
                                      Text(
                                        '${node.currentStreak} day streak',
                                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                              fontSize: 11,
                                              color: node.color,
                                            ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),

                            // Checkmark Checkbox
                            Container(
                              width: 28,
                              height: 28,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: node.isCompletedToday ? node.color : Colors.transparent,
                                border: Border.all(
                                  color: node.isCompletedToday ? node.color : AppTheme.textSecondary,
                                  width: 2,
                                ),
                              ),
                              child: node.isCompletedToday
                                  ? const Icon(Icons.check_rounded, color: Colors.black, size: 18)
                                  : null,
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
