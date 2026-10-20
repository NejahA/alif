import 'package:flutter/material.dart';
import '../../theme/colony_theme.dart';
import '../../state/colony_state.dart';
import '../../models/tech_node.dart';

class TechTreeView extends StatelessWidget {
  final ColonyState state;

  const TechTreeView({super.key, required this.state});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 8.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Subheader
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.account_tree_outlined, size: 16, color: ColonyTheme.scienceColor),
                  const SizedBox(width: 8),
                  const Text(
                    'QUANTUM RESEARCH MATRIX',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1.1,
                      color: ColonyTheme.scienceColor,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: ColonyTheme.scienceColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: ColonyTheme.scienceColor.withValues(alpha: 0.4)),
                ),
                child: Text(
                  '${state.techTree.where((t) => t.isCompleted).length}/${state.techTree.length} UNLOCKED',
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: ColonyTheme.scienceColor,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Tech Nodes List
          Expanded(
            child: ListView.separated(
              physics: const BouncingScrollPhysics(),
              itemCount: state.techTree.length,
              separatorBuilder: (context, index) => const SizedBox(height: 10),
              itemBuilder: (context, index) {
                final tech = state.techTree[index];
                final bool isActive = state.activeResearchId == tech.id;
                final bool prereqsMet = tech.prerequisites.every((p) => state.isTechUnlocked(p));

                return _buildTechCard(tech, isActive, prereqsMet);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTechCard(TechNode tech, bool isActive, bool prereqsMet) {
    Color cardColor = ColonyTheme.cardBg;
    Color borderColor = ColonyTheme.borderGlow;
    if (tech.isCompleted) {
      borderColor = ColonyTheme.bioEmerald;
    } else if (isActive) {
      borderColor = ColonyTheme.neonCyan;
      cardColor = ColonyTheme.cardBgLight;
    }

    return Container(
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: borderColor, width: isActive ? 1.6 : 1.0),
        boxShadow: isActive
            ? [
                BoxShadow(
                  color: ColonyTheme.neonCyan.withValues(alpha: 0.15),
                  blurRadius: 10,
                )
              ]
            : null,
      ),
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: (tech.isCompleted
                          ? ColonyTheme.bioEmerald
                          : (isActive ? ColonyTheme.neonCyan : ColonyTheme.scienceColor))
                      .withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  tech.icon,
                  size: 22,
                  color: tech.isCompleted
                      ? ColonyTheme.bioEmerald
                      : (isActive ? ColonyTheme.neonCyan : ColonyTheme.scienceColor),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          tech.title,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            color: ColonyTheme.textBright,
                          ),
                        ),
                        const SizedBox(width: 6),
                        if (tech.isCompleted)
                          const Icon(Icons.check_circle, size: 14, color: ColonyTheme.bioEmerald)
                        else if (isActive)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                            decoration: BoxDecoration(
                              color: ColonyTheme.neonCyan.withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: const Text(
                              'ACTIVE',
                              style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: ColonyTheme.neonCyan),
                            ),
                          ),
                      ],
                    ),
                    Text(
                      '${tech.category} • Cost: ${tech.researchCost.toInt()} RP',
                      style: const TextStyle(fontSize: 10, color: ColonyTheme.textMuted),
                    ),
                  ],
                ),
              ),
              if (!tech.isCompleted)
                ElevatedButton(
                  onPressed: prereqsMet && !isActive ? () => state.selectResearch(tech.id) : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: isActive
                        ? ColonyTheme.neonCyan.withValues(alpha: 0.3)
                        : ColonyTheme.scienceColor.withValues(alpha: 0.2),
                    foregroundColor: isActive ? ColonyTheme.neonCyan : ColonyTheme.scienceColor,
                    side: BorderSide(
                      color: isActive ? ColonyTheme.neonCyan : ColonyTheme.scienceColor,
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  ),
                  child: Text(
                    isActive ? 'RESEARCHING' : (prereqsMet ? 'SELECT' : 'LOCKED'),
                    style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            tech.description,
            style: const TextStyle(fontSize: 11, color: ColonyTheme.textMuted),
          ),
          if (!tech.isCompleted) ...[
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'PROGRESS: ${tech.currentResearchProgress.toInt()} / ${tech.researchCost.toInt()} RP',
                  style: const TextStyle(fontSize: 9, color: ColonyTheme.textMuted),
                ),
                Text(
                  '${(tech.progressRatio * 100).toInt()}%',
                  style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: ColonyTheme.neonCyan),
                ),
              ],
            ),
            const SizedBox(height: 4),
            ClipRRect(
              borderRadius: BorderRadius.circular(2),
              child: LinearProgressIndicator(
                value: tech.progressRatio,
                minHeight: 4,
                backgroundColor: ColonyTheme.borderGlow,
                valueColor: AlwaysStoppedAnimation<Color>(
                  isActive ? ColonyTheme.neonCyan : ColonyTheme.scienceColor,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
