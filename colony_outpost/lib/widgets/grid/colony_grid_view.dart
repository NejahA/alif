import 'package:flutter/material.dart';
import '../../theme/colony_theme.dart';
import '../../state/colony_state.dart';
import '../../models/colony_sector.dart';
import 'sector_detail_sheet.dart';

class ColonyGridView extends StatelessWidget {
  final ColonyState state;

  const ColonyGridView({super.key, required this.state});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 8.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Grid Telemetry Subheader
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.grid_4x4, size: 14, color: ColonyTheme.neonCyan),
                  const SizedBox(width: 6),
                  const Text(
                    'TACTICAL SECTOR MATRIX',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1.1,
                      color: ColonyTheme.neonCyan,
                    ),
                  ),
                ],
              ),
              Text(
                '${state.sectors.where((s) => s.module != null).length}/16 MODULES DEPLOYED',
                style: const TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.5,
                  color: ColonyTheme.textMuted,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),

          // 4x4 Sector Grid
          Expanded(
            child: GridView.builder(
              physics: const BouncingScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 4,
                crossAxisSpacing: 8,
                mainAxisSpacing: 8,
                childAspectRatio: 0.88,
              ),
              itemCount: state.sectors.length,
              itemBuilder: (context, index) {
                final sector = state.sectors[index];
                return _SectorTile(
                  sector: sector,
                  onTap: () => _openSectorInspector(context, sector),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  void _openSectorInspector(BuildContext context, ColonySector sector) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => SectorDetailSheet(state: state, sector: sector),
    );
  }
}

class _SectorTile extends StatelessWidget {
  final ColonySector sector;
  final VoidCallback onTap;

  const _SectorTile({
    required this.sector,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final module = sector.module;
    final bool hasModule = module != null;
    final bool isOnline = hasModule && module.isOnline;

    Color borderColor = ColonyTheme.borderGlow;
    if (hasModule) {
      borderColor = isOnline ? module.def.accentColor.withValues(alpha: 0.7) : ColonyTheme.alertCrimson.withValues(alpha: 0.5);
    } else if (sector.isSurveyed && sector.terrain != SectorTerrain.barrenRegolith) {
      borderColor = sector.terrainColor.withValues(alpha: 0.4);
    }

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        decoration: BoxDecoration(
          color: hasModule
              ? (isOnline ? ColonyTheme.cardBgLight : const Color(0xFF1E1520))
              : ColonyTheme.cardBg.withValues(alpha: 0.7),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: borderColor, width: hasModule ? 1.4 : 1.0),
          boxShadow: hasModule && isOnline
              ? [
                  BoxShadow(
                    color: module.def.accentColor.withValues(alpha: 0.15),
                    blurRadius: 8,
                    spreadRadius: 1,
                  ),
                ]
              : null,
        ),
        padding: const EdgeInsets.all(6),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            // Top sector tag & power dot
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'S${sector.id + 1}',
                  style: const TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
                    color: ColonyTheme.textMuted,
                  ),
                ),
                if (hasModule)
                  Container(
                    width: 6,
                    height: 6,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: isOnline ? ColonyTheme.bioEmerald : ColonyTheme.alertCrimson,
                      boxShadow: [
                        BoxShadow(
                          color: (isOnline ? ColonyTheme.bioEmerald : ColonyTheme.alertCrimson).withValues(alpha: 0.8),
                          blurRadius: 4,
                        ),
                      ],
                    ),
                  )
                else if (sector.isSurveyed)
                  Icon(sector.terrainIcon, size: 10, color: sector.terrainColor)
                else
                  const Icon(Icons.help_outline, size: 9, color: ColonyTheme.textMuted),
              ],
            ),

            // Middle Content: Module or Empty Slot
            if (hasModule)
              Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: module.def.accentColor.withValues(alpha: 0.15),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(module.def.icon, size: 20, color: module.def.accentColor),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    module.def.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 9,
                      fontWeight: FontWeight.bold,
                      color: ColonyTheme.textBright,
                    ),
                  ),
                ],
              )
            else
              Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    sector.isSurveyed ? sector.terrainIcon : Icons.radar,
                    size: 18,
                    color: sector.isSurveyed ? sector.terrainColor.withValues(alpha: 0.6) : ColonyTheme.borderGlow,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    sector.isSurveyed ? sector.terrainName : 'UNSURVEYED',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 8,
                      fontWeight: FontWeight.bold,
                      color: sector.isSurveyed ? sector.terrainColor : ColonyTheme.textMuted,
                    ),
                  ),
                ],
              ),

            // Bottom Level tag / Integrity bar / Build prompt
            if (hasModule)
              Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'LV${module.level}',
                        style: const TextStyle(
                          fontSize: 8,
                          fontWeight: FontWeight.bold,
                          color: ColonyTheme.neonCyan,
                        ),
                      ),
                      Text(
                        '${module.health.toInt()}%',
                        style: TextStyle(
                          fontSize: 8,
                          color: module.health > 50 ? ColonyTheme.textMuted : ColonyTheme.alertCrimson,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(1.5),
                    child: LinearProgressIndicator(
                      value: module.health / 100.0,
                      minHeight: 2,
                      backgroundColor: ColonyTheme.borderGlow,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        module.health > 60
                            ? ColonyTheme.bioEmerald
                            : (module.health > 25 ? ColonyTheme.laserAmber : ColonyTheme.alertCrimson),
                      ),
                    ),
                  ),
                ],
              )
            else
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 2),
                decoration: BoxDecoration(
                  color: ColonyTheme.neonCyan.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(3),
                ),
                child: const Text(
                  '+ BUILD',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 8,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 0.8,
                    color: ColonyTheme.neonCyan,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
