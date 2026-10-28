import 'package:flutter/material.dart';
import '../models/creature.dart';
import '../services/jungle_state.dart';
import '../theme/jungle_theme.dart';
import '../widgets/creature_card.dart';

class BestiaryScreen extends StatefulWidget {
  final JungleState state;

  const BestiaryScreen({
    super.key,
    required this.state,
  });

  @override
  State<BestiaryScreen> createState() => _BestiaryScreenState();
}

class _BestiaryScreenState extends State<BestiaryScreen> {
  BiomeLayer? _selectedLayer;

  @override
  Widget build(BuildContext context) {
    final allSpecimens = JungleBestiary.allSpecimens;
    final filtered = _selectedLayer == null
        ? allSpecimens
        : allSpecimens.where((c) => c.layer == _selectedLayer).toList();

    final catalogedCount = widget.state.discoveredCreatureIds.length;

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
      children: [
        // Title Bar
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: JungleColors.deepCanopy,
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: JungleColors.foliageBorder),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: JungleColors.emerald.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Icon(
                  Icons.menu_book_rounded,
                  color: JungleColors.neonJade,
                  size: 28,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'JUNGLE BESTIARY',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 1.0,
                        color: JungleColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Rainforest Flora & Fauna Field Guide',
                      style: TextStyle(
                        fontSize: 12,
                        color: JungleColors.textSecondary.withOpacity(0.85),
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: JungleColors.foliageSurface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: JungleColors.foliageBorder),
                ),
                child: Text(
                  '$catalogedCount / ${allSpecimens.length}',
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                    color: JungleColors.neonJade,
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Layer Filter Chips
        SizedBox(
          height: 42,
          child: ListView(
            scrollDirection: Axis.horizontal,
            children: [
              _buildFilterChip('All Biomes', null),
              const SizedBox(width: 8),
              _buildFilterChip('Forest Floor', BiomeLayer.forestFloor),
              const SizedBox(width: 8),
              _buildFilterChip('Understory', BiomeLayer.understory),
              const SizedBox(width: 8),
              _buildFilterChip('Upper Canopy', BiomeLayer.canopy),
              const SizedBox(width: 8),
              _buildFilterChip('Emergent', BiomeLayer.emergent),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // List of specimens
        ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: filtered.length,
          separatorBuilder: (_, __) => const SizedBox(height: 12),
          itemBuilder: (context, index) {
            final creature = filtered[index];
            final isDiscovered = widget.state.discoveredCreatureIds.contains(creature.id);

            return CreatureCard(
              creature: creature,
              isDiscovered: isDiscovered,
              onInspect: () => widget.state.inspectCreature(creature.id),
            );
          },
        ),
      ],
    );
  }

  Widget _buildFilterChip(String label, BiomeLayer? layer) {
    final isSelected = _selectedLayer == layer;
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (_) {
        setState(() {
          _selectedLayer = layer;
        });
      },
      selectedColor: JungleColors.emerald.withOpacity(0.3),
      backgroundColor: JungleColors.understory,
      labelStyle: TextStyle(
        fontSize: 12,
        color: isSelected ? JungleColors.textPrimary : JungleColors.textSecondary,
        fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
      ),
      side: BorderSide(
        color: isSelected ? JungleColors.emerald : JungleColors.foliageBorder,
      ),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    );
  }
}
