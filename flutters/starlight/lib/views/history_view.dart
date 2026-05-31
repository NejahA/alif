import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:starlight/providers/star_provider.dart';
import 'package:starlight/theme/starlight_theme.dart';
import 'package:starlight/widgets/celestial_background.dart';
import 'package:intl/intl.dart';

class HistoryView extends ConsumerWidget {
  const HistoryView({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final starState = ref.watch(starProvider);

    return Scaffold(
      body: CelestialBackground(
        child: SafeArea(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildHeader(context, starState.stardust),
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildHeatmapSection(starState),
                      const SizedBox(height: 32),
                      _buildForgeSection(ref, starState),
                      const SizedBox(height: 32),
                      const Text(
                        'SESSION_LOGS',
                        style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 2, color: Colors.white38),
                      ),
                      const SizedBox(height: 16),
                      starState.history.isEmpty
                          ? _buildEmptyState()
                          : _buildHistoryList(starState),
                      const SizedBox(height: 40),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context, int stardust) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              IconButton(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white70, size: 18),
              ),
              const SizedBox(width: 8),
              const Text(
                'NEURAL_ARCHIVE',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, letterSpacing: 4, color: Colors.white),
              ),
            ],
          ),
          Text(
            '0x$stardust',
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: StarlightTheme.glowGold, letterSpacing: 2),
          ),
        ],
      ),
    );
  }

  Widget _buildHeatmapSection(StarState state) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'GALACTIC_INTENSITY_MAP',
          style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 2, color: Colors.white38),
        ),
        const SizedBox(height: 16),
        Container(
          height: 100,
          padding: const EdgeInsets.all(16),
          decoration: StarlightTheme.glassDecoration,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: List.generate(7, (index) {
              final date = DateTime.now().subtract(Duration(days: 6 - index));
              final sessionsOnDay = state.history.where((m) => 
                m.timestamp.day == date.day && m.timestamp.month == date.month).length;
              final opacity = (sessionsOnDay * 0.3).clamp(0.05, 1.0);
              
              return Column(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Container(
                    width: 25,
                    height: 40 + (sessionsOnDay * 10.0).clamp(0.0, 30.0),
                    decoration: BoxDecoration(
                      color: StarlightTheme.stellarBlue.withOpacity(opacity),
                      borderRadius: BorderRadius.circular(4),
                      boxShadow: [
                        if (sessionsOnDay > 0)
                          BoxShadow(color: StarlightTheme.stellarBlue.withOpacity(opacity * 0.5), blurRadius: 10),
                      ],
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    DateFormat('E').format(date).toUpperCase()[0],
                    style: const TextStyle(fontSize: 8, color: Colors.white24, fontWeight: FontWeight.bold),
                  ),
                ],
              );
            }),
          ),
        ),
      ],
    );
  }

  Widget _buildForgeSection(WidgetRef ref, StarState state) {
    final hasRings = state.unlockedUpgrades.contains('planetary_rings');
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'THE_STARDUST_FORGE',
          style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 2, color: Colors.white38),
        ),
        const SizedBox(height: 16),
        GestureDetector(
          onTap: () {
            if (!hasRings && state.stardust >= 500) {
              ref.read(starProvider.notifier).buyUpgrade('planetary_rings', 500);
            }
          },
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: StarlightTheme.glassDecoration.copyWith(
              border: Border.all(color: hasRings ? StarlightTheme.stellarBlue.withOpacity(0.5) : Colors.white12),
            ),
            child: Row(
              children: [
                Icon(Icons.vibration, color: hasRings ? StarlightTheme.stellarBlue : Colors.white24),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'PLANETARY_RINGS',
                        style: TextStyle(
                          fontSize: 12, 
                          fontWeight: FontWeight.bold, 
                          color: hasRings ? Colors.white : Colors.white70,
                          letterSpacing: 1
                        ),
                      ),
                      Text(
                        hasRings ? 'UPGRADE_ACTIVE' : 'COST: 500_STARDUST',
                        style: TextStyle(fontSize: 9, color: hasRings ? StarlightTheme.stellarBlue : Colors.white24),
                      ),
                    ],
                  ),
                ),
                if (hasRings) const Icon(Icons.check_circle_outline, color: StarlightTheme.stellarBlue, size: 16),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildEmptyState() {
    return const Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.blur_on, color: Colors.white10, size: 80),
          SizedBox(height: 20),
          Text(
            'THE_SKY_IS_EMPTY',
            style: TextStyle(fontSize: 10, letterSpacing: 3, color: Colors.white24, fontWeight: FontWeight.bold),
          ),
          SizedBox(height: 8),
          const Text(
            'BIRTH_YOUR_FIRST_STAR_TO_BEGIN',
            style: TextStyle(fontSize: 8, letterSpacing: 1, color: Colors.white10),
          ),
        ],
      ),
    );
  }

  Widget _buildHistoryList(StarState state) {
    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: state.history.length,
      separatorBuilder: (c, i) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final memory = state.history[index];
        return _StarCard(memory: memory);
      },
    );
  }
}

class _StarCard extends StatelessWidget {
  final dynamic memory;
  const _StarCard({required this.memory});

  @override
  Widget build(BuildContext context) {
    final dateStr = DateFormat('MMM_dd').format(memory.timestamp).toUpperCase();
    
    return Container(
      decoration: StarlightTheme.glassDecoration.copyWith(
        color: Colors.white.withOpacity(0.02),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                width: 12,
                height: 12,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: StarlightTheme.stellarBlue,
                  boxShadow: [
                    BoxShadow(color: StarlightTheme.stellarBlue.withOpacity(0.4), blurRadius: 8),
                  ],
                ),
              ),
              Text(
                dateStr,
                style: const TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: Colors.white24, letterSpacing: 1),
              ),
            ],
          ),
          const Spacer(),
          Text(
            memory.intent.toUpperCase(),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.white, letterSpacing: 1.5, height: 1.2),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              const Icon(Icons.timer_outlined, size: 10, color: StarlightTheme.nebulaPink),
              const SizedBox(width: 4),
              Text(
                '${memory.duration.inMinutes}M',
                style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: StarlightTheme.nebulaPink, letterSpacing: 1),
              ),
              const Spacer(),
              Text(
                '+${memory.stardustEarned}',
                style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: StarlightTheme.glowGold, letterSpacing: 1),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
