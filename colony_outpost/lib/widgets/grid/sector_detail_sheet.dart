import 'package:flutter/material.dart';
import '../../theme/colony_theme.dart';
import '../../state/colony_state.dart';
import '../../models/colony_sector.dart';
import '../../models/module_type.dart';
import '../../models/resource.dart';

class SectorDetailSheet extends StatelessWidget {
  final ColonyState state;
  final ColonySector sector;

  const SectorDetailSheet({
    super.key,
    required this.state,
    required this.sector,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: ColonyTheme.darkSlate,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        border: Border(
          top: BorderSide(color: ColonyTheme.neonCyan, width: 2),
        ),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Drag handle
          Center(
            child: Container(
              width: 36,
              height: 4,
              decoration: BoxDecoration(
                color: ColonyTheme.borderGlow,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 12),

          // Header
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: sector.terrainColor.withValues(alpha: 0.15),
                  shape: BoxShape.circle,
                  border: Border.all(color: sector.terrainColor.withValues(alpha: 0.5)),
                ),
                child: Icon(sector.terrainIcon, color: sector.terrainColor, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'SECTOR ${sector.id + 1} // [X:${sector.x}, Y:${sector.y}]',
                      style: const TextStyle(
                        fontSize: 11,
                        color: ColonyTheme.textMuted,
                        letterSpacing: 1.0,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      sector.isSurveyed ? sector.terrainName : 'Uncharted Sector',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                        color: ColonyTheme.textBright,
                      ),
                    ),
                  ],
                ),
              ),
              if (sector.isSurveyed)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: sector.terrainColor.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: sector.terrainColor.withValues(alpha: 0.4)),
                  ),
                  child: Text(
                    sector.terrainBonusDesc,
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: sector.terrainColor,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 16),
          const Divider(color: ColonyTheme.borderGlow, height: 1),
          const SizedBox(height: 14),

          // Body: Unsurveyed vs Installed vs Vacant
          if (!sector.isSurveyed)
            _buildUnsurveyedView(context)
          else if (sector.module != null)
            _buildInstalledModuleView(context, sector.module!)
          else
            _buildConstructModuleList(context),
        ],
      ),
    );
  }

  Widget _buildUnsurveyedView(BuildContext context) {
    const double cost = 30.0;
    final bool canAfford = state.resources[ResourceType.credits]!.current >= cost;

    return Column(
      children: [
        const Icon(Icons.radar, size: 48, color: ColonyTheme.neonCyan),
        const SizedBox(height: 8),
        const Text(
          'Deep planetary scanner sweep required to analyze subterranean deposits and geothermal fissures.',
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 12, color: ColonyTheme.textMuted),
        ),
        const SizedBox(height: 16),
        ElevatedButton.icon(
          onPressed: canAfford
              ? () {
                  state.surveySector(sector.id);
                  Navigator.pop(context);
                }
              : null,
          style: ElevatedButton.styleFrom(
            backgroundColor: ColonyTheme.neonCyan.withValues(alpha: 0.2),
            foregroundColor: ColonyTheme.neonCyan,
            side: const BorderSide(color: ColonyTheme.neonCyan),
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          ),
          icon: const Icon(Icons.sensors, size: 18),
          label: Text('SURVEY SECTOR (${cost.toInt()} ₡)'),
        ),
      ],
    );
  }

  Widget _buildInstalledModuleView(BuildContext context, InstalledModule module) {
    final bool canUpgrade = module.level < module.def.maxLevel;
    final upgradeCost = module.upgradeCost;
    final bool canAffordUpgrade = state.canAfford(upgradeCost);
    final bool needsRepair = module.health < 100.0;
    final bool canAffordRepair = state.resources[ResourceType.alloys]!.current >= 15.0;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Module Info Header
        Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: module.def.accentColor.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: module.def.accentColor),
              ),
              child: Icon(module.def.icon, color: module.def.accentColor, size: 28),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        module.def.name,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: ColonyTheme.textBright,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: ColonyTheme.neonCyan.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(4),
                          border: Border.all(color: ColonyTheme.neonCyan.withValues(alpha: 0.6)),
                        ),
                        child: Text(
                          'LVL ${module.level}',
                          style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: ColonyTheme.neonCyan,
                          ),
                        ),
                      ),
                    ],
                  ),
                  Text(
                    module.def.category,
                    style: const TextStyle(fontSize: 11, color: ColonyTheme.textMuted),
                  ),
                ],
              ),
            ),
            // Power switch
            IconButton(
              tooltip: module.isOnline ? 'Shut down power' : 'Engage power',
              onPressed: () => state.toggleModulePower(sector.id),
              icon: Icon(
                module.isOnline ? Icons.power : Icons.power_off,
                color: module.isOnline ? ColonyTheme.bioEmerald : ColonyTheme.alertCrimson,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),

        // Description
        Text(
          module.def.description,
          style: const TextStyle(fontSize: 11, color: ColonyTheme.textMuted),
        ),
        const SizedBox(height: 12),

        // Health bar
        Row(
          children: [
            const Text('INTEGRITY:', style: TextStyle(fontSize: 10, color: ColonyTheme.textMuted)),
            const SizedBox(width: 8),
            Expanded(
              child: ClipRRect(
                borderRadius: BorderRadius.circular(3),
                child: LinearProgressIndicator(
                  value: module.health / 100.0,
                  minHeight: 6,
                  backgroundColor: ColonyTheme.borderGlow,
                  valueColor: AlwaysStoppedAnimation<Color>(
                    module.health > 60
                        ? ColonyTheme.bioEmerald
                        : (module.health > 25 ? ColonyTheme.laserAmber : ColonyTheme.alertCrimson),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),
            Text(
              '${module.health.toInt()}%',
              style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
            ),
          ],
        ),
        const SizedBox(height: 14),

        // Current Net Production
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: ColonyTheme.cardBg,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: ColonyTheme.borderGlow),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'ACTIVE PRODUCTION / CONSUMPTION (PER SEC):',
                style: TextStyle(fontSize: 9, color: ColonyTheme.textMuted, letterSpacing: 0.5),
              ),
              const SizedBox(height: 6),
              Wrap(
                spacing: 12,
                runSpacing: 6,
                children: module.effectiveProduction.entries.map((entry) {
                  final isPos = entry.value >= 0;
                  final res = state.resources[entry.key]!;
                  return Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(res.icon, size: 12, color: res.color),
                      const SizedBox(width: 4),
                      Text(
                        '${isPos ? "+" : ""}${entry.value.toStringAsFixed(1)} ${res.unit}/s',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: isPos ? ColonyTheme.bioEmerald : ColonyTheme.alertCrimson,
                        ),
                      ),
                    ],
                  );
                }).toList(),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Actions: Upgrade, Repair, Demolish
        Row(
          children: [
            // Upgrade button
            if (canUpgrade)
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: canAffordUpgrade
                      ? () {
                          state.upgradeModule(sector.id);
                          Navigator.pop(context);
                        }
                      : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: ColonyTheme.plasmaPurple.withValues(alpha: 0.25),
                    foregroundColor: ColonyTheme.plasmaPurple,
                    side: const BorderSide(color: ColonyTheme.plasmaPurple),
                    padding: const EdgeInsets.symmetric(vertical: 10),
                  ),
                  icon: const Icon(Icons.arrow_upward, size: 16),
                  label: Text(
                    'UPGRADE (LVL ${module.level + 1})\n${upgradeCost[ResourceType.alloys]?.toInt() ?? 0} Alloys, ${upgradeCost[ResourceType.credits]?.toInt() ?? 0} ₡',
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            if (canUpgrade && needsRepair) const SizedBox(width: 8),

            // Repair button
            if (needsRepair)
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: canAffordRepair
                      ? () {
                          state.repairModule(sector.id);
                          Navigator.pop(context);
                        }
                      : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: ColonyTheme.laserAmber.withValues(alpha: 0.25),
                    foregroundColor: ColonyTheme.laserAmber,
                    side: const BorderSide(color: ColonyTheme.laserAmber),
                    padding: const EdgeInsets.symmetric(vertical: 10),
                  ),
                  icon: const Icon(Icons.build, size: 16),
                  label: const Text(
                    'REPAIR\n15 Nanite Alloys',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
                  ),
                ),
              ),

            const SizedBox(width: 8),
            // Demolish button (only for non-command hub)
            if (module.def.id != ModuleId.commandHub)
              IconButton(
                tooltip: 'Dismantle module for 40% alloy salvage',
                onPressed: () {
                  state.demolishModule(sector.id);
                  Navigator.pop(context);
                },
                icon: const Icon(Icons.delete_forever, color: ColonyTheme.alertCrimson),
              ),
          ],
        ),
      ],
    );
  }

  Widget _buildConstructModuleList(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'SELECT MODULE BLUEPRINT TO CONSTRUCT:',
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.bold,
            letterSpacing: 0.8,
            color: ColonyTheme.neonCyan,
          ),
        ),
        const SizedBox(height: 8),
        SizedBox(
          height: 280,
          child: ListView.separated(
            itemCount: ModuleDef.all.where((m) => m.id != ModuleId.commandHub).length,
            separatorBuilder: (context, index) => const SizedBox(height: 6),
            itemBuilder: (context, index) {
              final def = ModuleDef.all.where((m) => m.id != ModuleId.commandHub).toList()[index];
              final canAfford = state.canAfford(def.buildCost);

              return Container(
                decoration: BoxDecoration(
                  color: ColonyTheme.cardBg,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: canAfford ? def.accentColor.withValues(alpha: 0.4) : ColonyTheme.borderGlow,
                  ),
                ),
                padding: const EdgeInsets.all(10),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: def.accentColor.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(def.icon, color: def.accentColor, size: 22),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            def.name,
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                              color: ColonyTheme.textBright,
                            ),
                          ),
                          Text(
                            def.description,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(fontSize: 10, color: ColonyTheme.textMuted),
                          ),
                          const SizedBox(height: 4),
                          // Cost Badges
                          Row(
                            children: def.buildCost.entries.map((entry) {
                              final res = state.resources[entry.key]!;
                              final hasEnough = res.current >= entry.value;
                              return Padding(
                                padding: const EdgeInsets.only(right: 8),
                                child: Text(
                                  '${entry.value.toInt()} ${res.unit}',
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                    color: hasEnough ? res.color : ColonyTheme.alertCrimson,
                                  ),
                                ),
                              );
                            }).toList(),
                          ),
                        ],
                      ),
                    ),
                    ElevatedButton(
                      onPressed: canAfford
                          ? () {
                              state.constructModule(sector.id, def);
                              Navigator.pop(context);
                            }
                          : null,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: def.accentColor.withValues(alpha: 0.2),
                        foregroundColor: def.accentColor,
                        side: BorderSide(
                          color: canAfford ? def.accentColor : ColonyTheme.borderGlow,
                        ),
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      ),
                      child: const Text('BUILD', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}
