import 'package:flutter/material.dart';
import '../models/creature.dart';
import '../services/jungle_state.dart';
import '../theme/jungle_theme.dart';
import '../widgets/audio_visualizer.dart';
import '../widgets/canopy_tree_widget.dart';
import '../widgets/creature_card.dart';
import '../widgets/jungle_logo_header.dart';

class HomeScreen extends StatelessWidget {
  final JungleState state;
  final VoidCallback onNavigateToSoundscape;
  final VoidCallback onNavigateToAltar;
  final VoidCallback onNavigateToBestiary;

  const HomeScreen({
    super.key,
    required this.state,
    required this.onNavigateToSoundscape,
    required this.onNavigateToAltar,
    required this.onNavigateToBestiary,
  });

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
      children: [
        // Brand Header with generated Logo
        JungleLogoHeader(state: state),
        const SizedBox(height: 18),

        // Hero Canopy Feature Banner
        _buildHeroBanner(context),
        const SizedBox(height: 18),

        // Atmosphere Selector Chips
        _buildAtmosphereSelector(context),
        const SizedBox(height: 18),

        // Sanctuary Ceiba Tree Progress
        CanopyTreeWidget(state: state),
        const SizedBox(height: 18),

        // Live Audio Soundscape Quick Bar
        _buildSoundscapeQuickBar(context),
        const SizedBox(height: 18),

        // Daily Jungle Expeditions / Quests
        _buildQuestsSection(context),
        const SizedBox(height: 18),

        // Featured Specimen from Bestiary
        _buildFeaturedSpecimen(context),
      ],
    );
  }

  Widget _buildHeroBanner(BuildContext context) {
    return Container(
      height: 160,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: JungleColors.foliageBorder,
          width: 1.2,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.4),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24),
        child: Stack(
          fit: StackFit.expand,
          children: [
            Image.asset(
              'assets/images/hero_canopy.jpg',
              fit: BoxFit.cover,
            ),
            // Gradient Overlay
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topRight,
                  end: Alignment.bottomLeft,
                  colors: [
                    Colors.transparent,
                    JungleColors.abyss.withOpacity(0.4),
                    JungleColors.abyss.withOpacity(0.9),
                  ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: JungleColors.emerald.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                        color: JungleColors.neonJade.withOpacity(0.4),
                      ),
                    ),
                    child: const Text(
                      'ANCIENT AMAZONIA BIOME',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 1.2,
                        color: JungleColors.neonJade,
                      ),
                    ),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Sacred Emerald Canopy',
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                      color: JungleColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 2),
                  const Text(
                    'Tap screen to summon glowing fireflies into the mist',
                    style: TextStyle(
                      fontSize: 12,
                      color: JungleColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAtmosphereSelector(BuildContext context) {
    final modes = [
      {'mode': AtmosphereMode.morningMist, 'name': 'Morning Mist', 'icon': '🌫️'},
      {'mode': AtmosphereMode.tropicalDownpour, 'name': 'Downpour', 'icon': '🌧️'},
      {'mode': AtmosphereMode.goldenHour, 'name': 'Golden Hour', 'icon': '🌅'},
      {'mode': AtmosphereMode.bioluminescentNight, 'name': 'Bio-Night', 'icon': '🌙'},
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: const [
            Icon(Icons.wb_sunny_outlined, size: 16, color: JungleColors.neonJade),
            SizedBox(width: 6),
            Text(
              'CANOPY ATMOSPHERE',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                letterSpacing: 1.2,
                color: JungleColors.textMuted,
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        SizedBox(
          height: 44,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: modes.length,
            separatorBuilder: (_, __) => const SizedBox(width: 8),
            itemBuilder: (context, index) {
              final item = modes[index];
              final mode = item['mode'] as AtmosphereMode;
              final isSelected = state.atmosphere == mode;

              return ChoiceChip(
                label: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(item['icon'] as String),
                    const SizedBox(width: 6),
                    Text(item['name'] as String),
                  ],
                ),
                selected: isSelected,
                onSelected: (_) => state.setAtmosphere(mode),
                selectedColor: JungleColors.emerald.withOpacity(0.3),
                backgroundColor: JungleColors.understory,
                labelStyle: TextStyle(
                  color: isSelected ? JungleColors.textPrimary : JungleColors.textSecondary,
                  fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                  fontSize: 13,
                ),
                side: BorderSide(
                  color: isSelected ? JungleColors.emerald : JungleColors.foliageBorder,
                  width: isSelected ? 1.5 : 1.0,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildSoundscapeQuickBar(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
      decoration: BoxDecoration(
        color: JungleColors.deepCanopy,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: JungleColors.foliageBorder),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: JungleColors.sunAmber.withOpacity(0.15),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.spatial_audio_off_rounded,
                  color: JungleColors.sunAmber,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      state.isPlayingSoundscape ? 'CANOPY AUDIO ACTIVE' : 'RAINFOREST SOUNDSCAPE',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 1.2,
                        color: state.isPlayingSoundscape ? JungleColors.neonJade : JungleColors.textSubtle,
                      ),
                    ),
                    const SizedBox(height: 2),
                    const Text(
                      'Monstera Rain • River • Breeze',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: JungleColors.textPrimary,
                      ),
                    ),
                  ],
                ),
              ),
              IconButton(
                onPressed: () => state.toggleSoundscape(),
                icon: Icon(
                  state.isPlayingSoundscape ? Icons.pause_circle_filled_rounded : Icons.play_circle_filled_rounded,
                  color: JungleColors.neonJade,
                  size: 38,
                ),
              ),
              IconButton(
                onPressed: onNavigateToSoundscape,
                icon: const Icon(
                  Icons.tune_rounded,
                  color: JungleColors.textSecondary,
                  size: 22,
                ),
              ),
            ],
          ),
          if (state.isPlayingSoundscape) ...[
            const SizedBox(height: 10),
            AudioVisualizer(isPlaying: true, height: 28),
          ],
        ],
      ),
    );
  }

  Widget _buildQuestsSection(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: const [
                Icon(Icons.explore_outlined, size: 16, color: JungleColors.neonJade),
                SizedBox(width: 6),
                Text(
                  'DAILY JUNGLE EXPEDITIONS',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 1.2,
                    color: JungleColors.textMuted,
                  ),
                ),
              ],
            ),
            Text(
              '${state.quests.where((q) => q.isCompleted).length} / ${state.quests.length} Done',
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: JungleColors.sunAmber,
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: state.quests.length,
          separatorBuilder: (_, __) => const SizedBox(height: 8),
          itemBuilder: (context, index) {
            final q = state.quests[index];
            return Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: JungleColors.deepCanopy,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(
                  color: q.isCompleted ? JungleColors.emerald.withOpacity(0.6) : JungleColors.foliageBorder,
                ),
              ),
              child: Row(
                children: [
                  Text(q.icon, style: const TextStyle(fontSize: 22)),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          q.title,
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: q.isCompleted ? JungleColors.textMuted : JungleColors.textPrimary,
                            decoration: q.isCompleted ? TextDecoration.lineThrough : null,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          q.subtitle,
                          style: const TextStyle(
                            fontSize: 12,
                            color: JungleColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: q.isCompleted ? JungleColors.emerald.withOpacity(0.2) : JungleColors.understory,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      q.isCompleted ? 'CLAIMED' : '+${q.vitalityReward} XP',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: q.isCompleted ? JungleColors.neonJade : JungleColors.sunAmber,
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildFeaturedSpecimen(BuildContext context) {
    final specimen = JungleBestiary.allSpecimens.first;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: const [
                Icon(Icons.pets_rounded, size: 16, color: JungleColors.neonJade),
                SizedBox(width: 6),
                Text(
                  'APEX FIELD SPECIMEN',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 1.2,
                    color: JungleColors.textMuted,
                  ),
                ),
              ],
            ),
            GestureDetector(
              onTap: onNavigateToBestiary,
              child: const Text(
                'View All Fauna →',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: JungleColors.neonJade,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        CreatureCard(
          creature: specimen,
          isDiscovered: state.discoveredCreatureIds.contains(specimen.id),
          onInspect: () => state.inspectCreature(specimen.id),
        ),
      ],
    );
  }
}
