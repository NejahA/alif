import 'package:flutter/material.dart';
import '../models/creature.dart';
import '../services/jungle_state.dart';
import '../theme/jungle_theme.dart';

class CreatureCard extends StatelessWidget {
  final Creature creature;
  final bool isDiscovered;
  final VoidCallback onInspect;
  final JungleState? state;

  const CreatureCard({
    super.key,
    required this.creature,
    required this.isDiscovered,
    required this.onInspect,
    this.state,
  });

  Color _getRarityColor(Rarity rarity) {
    switch (rarity) {
      case Rarity.common:
        return JungleColors.textSecondary;
      case Rarity.uncommon:
        return JungleColors.neonJade;
      case Rarity.rare:
        return JungleColors.azureLagoon;
      case Rarity.mythic:
        return JungleColors.sunAmber;
    }
  }

  void _showDetailSheet(BuildContext context) {
    onInspect();
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (context) {
        return Container(
          height: MediaQuery.of(context).size.height * 0.85,
          decoration: BoxDecoration(
            color: JungleColors.deepCanopy,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
            border: Border.all(
              color: JungleColors.foliageBorder,
              width: 1.5,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.6),
                blurRadius: 30,
                offset: const Offset(0, -10),
              ),
            ],
          ),
          child: Column(
            children: [
              // Handle
              Container(
                margin: const EdgeInsets.only(top: 12, bottom: 8),
                width: 44,
                height: 5,
                decoration: BoxDecoration(
                  color: JungleColors.foliageBorder,
                  borderRadius: BorderRadius.circular(4),
                ),
              ),

              Expanded(
                child: ListView(
                  padding: const EdgeInsets.all(24),
                  children: [
                    // Hero Image
                    ClipRRect(
                      borderRadius: BorderRadius.circular(24),
                      child: Stack(
                        children: [
                          AspectRatio(
                            aspectRatio: 16 / 10,
                            child: Image.asset(
                              creature.imagePath,
                              fit: BoxFit.cover,
                            ),
                          ),
                          Positioned(
                            top: 14,
                            right: 14,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: JungleColors.abyss.withOpacity(0.85),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(
                                  color: _getRarityColor(creature.rarity),
                                  width: 1.2,
                                ),
                              ),
                              child: Text(
                                creature.rarityName.toUpperCase(),
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w800,
                                  color: _getRarityColor(creature.rarity),
                                  letterSpacing: 1.0,
                                ),
                              ),
                            ),
                          ),
                          Positioned(
                            bottom: 14,
                            left: 14,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: JungleColors.abyss.withOpacity(0.85),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(Icons.layers_rounded,
                                      color: JungleColors.neonJade, size: 14),
                                  const SizedBox(width: 6),
                                  Text(
                                    creature.layerName,
                                    style: const TextStyle(
                                      fontSize: 12,
                                      color: JungleColors.textPrimary,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Title & Scientific Name
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                creature.name,
                                style: Theme.of(context).textTheme.displayMedium,
                              ),
                              const SizedBox(height: 4),
                              Text(
                                creature.scientificName,
                                style: const TextStyle(
                                  fontStyle: FontStyle.italic,
                                  color: JungleColors.neonJade,
                                  fontSize: 15,
                                  letterSpacing: 0.5,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                creature.title,
                                style: const TextStyle(
                                  color: JungleColors.sunAmber,
                                  fontSize: 13,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                        ),
                        // Bio-Frequency Resonance Pill
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          decoration: BoxDecoration(
                            color: JungleColors.foliageSurface,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: JungleColors.foliageBorder),
                          ),
                          child: Column(
                            children: [
                              const Icon(Icons.graphic_eq_rounded,
                                  color: JungleColors.neonJade, size: 20),
                              const SizedBox(height: 2),
                              Text(
                                '${creature.bioFrequency.toInt()} Hz',
                                style: const TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w700,
                                  color: JungleColors.textPrimary,
                                ),
                              ),
                              const Text(
                                'Resonance',
                                style: TextStyle(
                                  fontSize: 9,
                                  color: JungleColors.textSubtle,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // Conservation Status
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: JungleColors.foliageSurface.withOpacity(0.5),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: JungleColors.foliageBorder),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.shield_outlined,
                              color: JungleColors.neonJade, size: 20),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              creature.status,
                              style: const TextStyle(
                                fontSize: 13,
                                color: JungleColors.textSecondary,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Lore Description
                    Text(
                      'FIELD JOURNAL LOG',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 1.5,
                        color: JungleColors.textMuted.withOpacity(0.8),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      creature.description,
                      style: const TextStyle(
                        fontSize: 15,
                        height: 1.6,
                        color: JungleColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Trait Chips
                    Text(
                      'BIO-ADAPTATIONS & TRAITS',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 1.5,
                        color: JungleColors.textMuted.withOpacity(0.8),
                      ),
                    ),
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: creature.traits.map((trait) {
                        return Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                          decoration: BoxDecoration(
                            color: JungleColors.understory,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: JungleColors.foliageBorder),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.spa_rounded,
                                  color: JungleColors.neonJade, size: 14),
                              const SizedBox(width: 6),
                              Text(
                                trait,
                                style: const TextStyle(
                                  fontSize: 13,
                                  color: JungleColors.textPrimary,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 28),

                    // Inspect & Resonate Button
                    ElevatedButton(
                      onPressed: () {
                        state?.triggerBirdChirp();
                        Navigator.pop(context);
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: JungleColors.emerald,
                        foregroundColor: JungleColors.abyss,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                        elevation: 0,
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: const [
                          Icon(Icons.auto_awesome_rounded, size: 20),
                          SizedBox(width: 8),
                          Text(
                            'Harmonize Bio-Resonance',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: JungleColors.deepCanopy,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(
          color: JungleColors.foliageBorder,
          width: 1.2,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.3),
            blurRadius: 15,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(22),
          onTap: () => _showDetailSheet(context),
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Row(
              children: [
                // Creature Avatar
                ClipRRect(
                  borderRadius: BorderRadius.circular(16),
                  child: SizedBox(
                    width: 76,
                    height: 76,
                    child: Image.asset(
                      creature.imagePath,
                      fit: BoxFit.cover,
                    ),
                  ),
                ),
                const SizedBox(width: 14),

                // Details
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              creature.name,
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                                color: JungleColors.textPrimary,
                              ),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: _getRarityColor(creature.rarity).withOpacity(0.15),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(
                                color: _getRarityColor(creature.rarity).withOpacity(0.4),
                                width: 0.8,
                              ),
                            ),
                            child: Text(
                              creature.rarityName,
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                color: _getRarityColor(creature.rarity),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 3),
                      Text(
                        creature.scientificName,
                        style: const TextStyle(
                          fontStyle: FontStyle.italic,
                          fontSize: 12,
                          color: JungleColors.neonJade,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          Icon(
                            isDiscovered ? Icons.check_circle_rounded : Icons.radio_button_unchecked_rounded,
                            size: 14,
                            color: isDiscovered ? JungleColors.emerald : JungleColors.textSubtle,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            isDiscovered ? 'Cataloged' : 'Undiscovered',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: isDiscovered ? JungleColors.textMuted : JungleColors.textSubtle,
                            ),
                          ),
                          const Spacer(),
                          Text(
                            '+${creature.vitalityReward} XP',
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: JungleColors.sunAmber,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
