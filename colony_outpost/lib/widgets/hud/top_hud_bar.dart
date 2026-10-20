import 'package:flutter/material.dart';
import '../../theme/colony_theme.dart';
import '../../state/colony_state.dart';
import '../../models/resource.dart';

class TopHudBar extends StatelessWidget {
  final ColonyState state;

  const TopHudBar({super.key, required this.state});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: ColonyTheme.spaceVoid.withValues(alpha: 0.88),
        border: const Border(
          bottom: BorderSide(color: ColonyTheme.borderGlow, width: 1.5),
        ),
      ),
      child: SafeArea(
        bottom: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Top Telemetry Header
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 8.0),
              child: Row(
                children: [
                  // Colony Identity
                  Expanded(
                    child: Row(
                      children: [
                        Container(
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: state.gameSpeed > 0 ? ColonyTheme.bioEmerald : ColonyTheme.alertCrimson,
                            boxShadow: [
                              BoxShadow(
                                color: (state.gameSpeed > 0 ? ColonyTheme.bioEmerald : ColonyTheme.alertCrimson)
                                    .withValues(alpha: 0.6),
                                blurRadius: 6,
                              )
                            ],
                          ),
                        ),
                        const SizedBox(width: 8),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'AETHELGARD OUTPOST',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w900,
                                letterSpacing: 1.2,
                                color: ColonyTheme.neonCyan,
                              ),
                            ),
                            Row(
                              children: [
                                Icon(
                                  state.isNight ? Icons.nights_stay : Icons.wb_sunny,
                                  size: 11,
                                  color: state.isNight ? ColonyTheme.oxygenColor : ColonyTheme.laserAmber,
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  'SOL ${state.sol} • ${state.isNight ? "NIGHT" : "DAY"} (${(state.solProgress * 100).toInt()}%)',
                                  style: TextStyle(
                                    fontSize: 10,
                                    color: ColonyTheme.textMuted,
                                    fontWeight: FontWeight.w600,
                                    letterSpacing: 0.8,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  // Population & Morale Badges
                  _buildStatusPill(
                    icon: Icons.group,
                    label: '${state.population}/${state.maxHousing}',
                    color: state.population >= state.maxHousing ? ColonyTheme.laserAmber : ColonyTheme.bioEmerald,
                    tooltip: 'Colonists (Housing Limit)',
                  ),
                  const SizedBox(width: 6),
                  _buildStatusPill(
                    icon: Icons.favorite,
                    label: '${state.morale.toInt()}%',
                    color: state.morale < 40
                        ? ColonyTheme.alertCrimson
                        : (state.morale < 70 ? ColonyTheme.laserAmber : ColonyTheme.moraleColor),
                    tooltip: 'Colony Morale',
                  ),
                  const SizedBox(width: 8),

                  // Speed Multipliers
                  Container(
                    decoration: BoxDecoration(
                      color: ColonyTheme.cardBg,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: ColonyTheme.borderGlow),
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        _buildSpeedBtn(0.0, Icons.pause, 'Pause'),
                        _buildSpeedBtn(1.0, null, '1x'),
                        _buildSpeedBtn(2.0, null, '2x'),
                        _buildSpeedBtn(5.0, null, '5x'),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Horizontal Resource Telemetry Stream
            SizedBox(
              height: 52,
              child: ListView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                physics: const BouncingScrollPhysics(),
                children: [
                  _buildResourceCard(state.resources[ResourceType.energy]!),
                  _buildResourceCard(state.resources[ResourceType.oxygen]!),
                  _buildResourceCard(state.resources[ResourceType.water]!),
                  _buildResourceCard(state.resources[ResourceType.food]!),
                  _buildResourceCard(state.resources[ResourceType.alloys]!),
                  _buildResourceCard(state.resources[ResourceType.science]!),
                  _buildResourceCard(state.resources[ResourceType.credits]!),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusPill({
    required IconData icon,
    required String label,
    required Color color,
    required String tooltip,
  }) {
    return Tooltip(
      message: tooltip,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 4),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.12),
          borderRadius: BorderRadius.circular(6),
          border: Border.all(color: color.withValues(alpha: 0.5)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 12, color: color),
            const SizedBox(width: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSpeedBtn(double speed, IconData? icon, String text) {
    final bool isSelected = state.gameSpeed == speed;
    return InkWell(
      onTap: () => state.setGameSpeed(speed),
      borderRadius: BorderRadius.circular(4),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
        decoration: BoxDecoration(
          color: isSelected ? ColonyTheme.neonCyan.withValues(alpha: 0.25) : Colors.transparent,
          borderRadius: BorderRadius.circular(4),
        ),
        child: icon != null
            ? Icon(
                icon,
                size: 13,
                color: isSelected ? ColonyTheme.neonCyan : ColonyTheme.textMuted,
              )
            : Text(
                text,
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: isSelected ? ColonyTheme.neonCyan : ColonyTheme.textMuted,
                ),
              ),
      ),
    );
  }

  Widget _buildResourceCard(ColonyResource res) {
    final bool isCritical = res.current <= 0 && res.type != ResourceType.credits;
    final bool isPositive = res.ratePerSec >= 0;

    return Container(
      width: 124,
      margin: const EdgeInsets.only(right: 8),
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: ColonyTheme.cardBg,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: isCritical
              ? ColonyTheme.alertCrimson
              : res.color.withValues(alpha: 0.35),
          width: isCritical ? 1.5 : 1.0,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Icon(res.icon, size: 13, color: res.color),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  res.name.toUpperCase(),
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 0.5,
                    color: ColonyTheme.textMuted,
                  ),
                ),
              ),
              Text(
                '${isPositive ? "+" : ""}${res.ratePerSec.toStringAsFixed(1)}',
                style: TextStyle(
                  fontSize: 9,
                  fontWeight: FontWeight.bold,
                  color: isPositive ? ColonyTheme.bioEmerald : ColonyTheme.alertCrimson,
                ),
              ),
            ],
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '${res.current.toInt()} ${res.unit}',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: isCritical ? ColonyTheme.alertCrimson : ColonyTheme.textBright,
                ),
              ),
              Text(
                '/${res.maxCapacity.toInt()}',
                style: const TextStyle(
                  fontSize: 9,
                  color: ColonyTheme.textMuted,
                ),
              ),
            ],
          ),
          // Fill Ratio Indicator
          ClipRRect(
            borderRadius: BorderRadius.circular(2),
            child: LinearProgressIndicator(
              value: res.ratio,
              minHeight: 2.5,
              backgroundColor: ColonyTheme.borderGlow,
              valueColor: AlwaysStoppedAnimation<Color>(
                isCritical ? ColonyTheme.alertCrimson : res.color,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
