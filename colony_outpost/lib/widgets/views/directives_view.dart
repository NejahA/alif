import 'package:flutter/material.dart';
import '../../theme/colony_theme.dart';
import '../../state/colony_state.dart';

class DirectivesView extends StatelessWidget {
  final ColonyState state;

  const DirectivesView({super.key, required this.state});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 8.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            children: [
              const Icon(Icons.tune, size: 16, color: ColonyTheme.laserAmber),
              const SizedBox(width: 8),
              const Text(
                'COLONY DIRECTIVES & POLICIES',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 1.1,
                  color: ColonyTheme.laserAmber,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          Expanded(
            child: ListView(
              physics: const BouncingScrollPhysics(),
              children: [
                // Vitals & Specialists Overview Card
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: ColonyTheme.cardBg,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: ColonyTheme.borderGlow),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'DEMOGRAPHICS & WORKFORCE ALLOCATION',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: ColonyTheme.textMuted,
                          letterSpacing: 0.8,
                        ),
                      ),
                      const SizedBox(height: 10),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        children: [
                          _buildRoleBadge('Engineers', state.engineers, Icons.engineering, ColonyTheme.alloyColor),
                          _buildRoleBadge('Scientists', state.scientists, Icons.science, ColonyTheme.scienceColor),
                          _buildRoleBadge('Botanists', state.botanists, Icons.spa, ColonyTheme.foodColor),
                          _buildRoleBadge('Medics', state.medics, Icons.medical_services, ColonyTheme.bioEmerald),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 14),

                const Text(
                  'ACTIVE EXECUTIVE DIRECTIVES',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.8,
                    color: ColonyTheme.neonCyan,
                  ),
                ),
                const SizedBox(height: 8),

                // Directive 1: Power Overdrive
                _buildDirectiveCard(
                  title: 'GRID OVERDRIVE PROTOCOL',
                  subtitle: '+30% Power generation from all arrays and reactors.',
                  drawback: 'Increases structural wear and component overheating risk.',
                  icon: Icons.flash_on,
                  color: ColonyTheme.energyColor,
                  isActive: state.powerOverdrive,
                  onChanged: (_) => state.toggleDirective('power'),
                ),
                const SizedBox(height: 8),

                // Directive 2: Food Rationing
                _buildDirectiveCard(
                  title: 'STRICT NUTRIENT RATIONING',
                  subtitle: '-40% Food consumption per colonist.',
                  drawback: 'Causes sustained psychological stress and -10% Morale.',
                  icon: Icons.no_food,
                  color: ColonyTheme.foodColor,
                  isActive: state.foodRationing,
                  onChanged: (_) => state.toggleDirective('food'),
                ),
                const SizedBox(height: 8),

                // Directive 3: High Priority Research
                _buildDirectiveCard(
                  title: 'QUANTUM RESEARCH OVERCLOCK',
                  subtitle: '+50% Research point generation in Xenobiology labs.',
                  drawback: 'Requires constant +8 MW auxiliary power diversion.',
                  icon: Icons.biotech,
                  color: ColonyTheme.scienceColor,
                  isActive: state.researchFocus,
                  onChanged: (_) => state.toggleDirective('research'),
                ),
                const SizedBox(height: 8),

                // Directive 4: Defense Alert
                _buildDirectiveCard(
                  title: 'ION SHIELD CANOPY PROTOCOL',
                  subtitle: '+50% Deflector shielding against planetary storms.',
                  drawback: 'Continuous power grid drain of -12 MW.',
                  icon: Icons.shield,
                  color: ColonyTheme.neonCyan,
                  isActive: state.defenseProtocol,
                  onChanged: (_) => state.toggleDirective('defense'),
                ),
                const SizedBox(height: 16),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRoleBadge(String label, int count, IconData icon, Color color) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.15),
            shape: BoxShape.circle,
            border: Border.all(color: color.withValues(alpha: 0.5)),
          ),
          child: Icon(icon, size: 18, color: color),
        ),
        const SizedBox(height: 4),
        Text(
          '$count',
          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: ColonyTheme.textBright),
        ),
        Text(
          label,
          style: const TextStyle(fontSize: 9, color: ColonyTheme.textMuted),
        ),
      ],
    );
  }

  Widget _buildDirectiveCard({
    required String title,
    required String subtitle,
    required String drawback,
    required IconData icon,
    required Color color,
    required bool isActive,
    required ValueChanged<bool> onChanged,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: isActive ? color.withValues(alpha: 0.08) : ColonyTheme.cardBg,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: isActive ? color.withValues(alpha: 0.6) : ColonyTheme.borderGlow,
          width: isActive ? 1.4 : 1.0,
        ),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: color, size: 22),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: isActive ? color : ColonyTheme.textBright,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: const TextStyle(fontSize: 10, color: ColonyTheme.textMuted),
                ),
                Text(
                  '⚠ Drawback: $drawback',
                  style: TextStyle(
                    fontSize: 9,
                    color: ColonyTheme.alertCrimson.withValues(alpha: 0.8),
                    fontStyle: FontStyle.italic,
                  ),
                ),
              ],
            ),
          ),
          Switch(
            value: isActive,
            activeThumbColor: color,
            activeTrackColor: color.withValues(alpha: 0.3),
            inactiveThumbColor: ColonyTheme.textMuted,
            inactiveTrackColor: ColonyTheme.cardBg,
            onChanged: onChanged,
          ),
        ],
      ),
    );
  }
}
