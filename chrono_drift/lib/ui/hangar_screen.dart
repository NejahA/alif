import 'package:flutter/material.dart';
import '../models/ship_chassis.dart';
import '../game/game_state.dart';

class HangarScreen extends StatefulWidget {
  final GameState gameState;
  final VoidCallback onBack;

  const HangarScreen({
    super.key,
    required this.gameState,
    required this.onBack,
  });

  @override
  State<HangarScreen> createState() => _HangarScreenState();
}

class _HangarScreenState extends State<HangarScreen> {
  late ShipChassis _selected;

  @override
  void initState() {
    super.initState();
    _selected = widget.gameState.selectedChassis;
  }

  @override
  Widget build(BuildContext context) {
    final isUnlocked = widget.gameState.isShipUnlocked(_selected.id);
    final canAfford = widget.gameState.lifetimeCores >= _selected.coreUnlockCost;

    return Scaffold(
      backgroundColor: const Color(0xFF030712),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  IconButton(
                    icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white70),
                    onPressed: widget.onBack,
                  ),
                  Row(
                    children: [
                      const Icon(Icons.rocket_launch_rounded, color: Color(0xFF00E5FF)),
                      const SizedBox(width: 8),
                      const Text(
                        'VESSEL HANGAR',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 20,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 2.0,
                        ),
                      ),
                    ],
                  ),
                  // Lifetime Core balance
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F172A),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFF00E5FF).withValues(alpha: 0.4)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.diamond_rounded, color: Color(0xFF00E5FF), size: 16),
                        const SizedBox(width: 6),
                        Text(
                          '${widget.gameState.lifetimeCores}',
                          style: const TextStyle(
                            color: Color(0xFF00E5FF),
                            fontWeight: FontWeight.bold,
                            fontFamily: 'monospace',
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 20),

              // Ship Selection Carousel Cards
              SizedBox(
                height: 120,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: ShipChassis.allChassis.length,
                  separatorBuilder: (_, index) => const SizedBox(width: 14),
                  itemBuilder: (context, i) {
                    final chassis = ShipChassis.allChassis[i];
                    final isSelected = chassis.id == _selected.id;
                    final unlocked = widget.gameState.isShipUnlocked(chassis.id);

                    return GestureDetector(
                      onTap: () {
                        setState(() {
                          _selected = chassis;
                        });
                      },
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        width: 190,
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: isSelected ? const Color(0xFF131D31) : const Color(0xFF0F172A),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: isSelected ? chassis.primaryColor : Colors.white12,
                            width: isSelected ? 2.5 : 1.0,
                          ),
                          boxShadow: isSelected
                              ? [
                                  BoxShadow(
                                    color: chassis.primaryColor.withValues(alpha: 0.3),
                                    blurRadius: 14,
                                  ),
                                ]
                              : [],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Icon(chassis.icon, color: chassis.primaryColor, size: 28),
                                if (!unlocked)
                                  const Icon(Icons.lock_rounded, color: Colors.white38, size: 18)
                                else if (isSelected)
                                  Icon(Icons.check_circle_rounded, color: chassis.primaryColor, size: 18),
                              ],
                            ),
                            const Spacer(),
                            Text(
                              chassis.name,
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 15,
                              ),
                            ),
                            Text(
                              chassis.subtitle,
                              style: TextStyle(
                                color: chassis.primaryColor.withValues(alpha: 0.85),
                                fontSize: 11,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),

              const SizedBox(height: 24),

              // Selected Ship Details Box
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0B0F19),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: _selected.primaryColor.withValues(alpha: 0.4)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            width: 64,
                            height: 64,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: _selected.primaryColor.withValues(alpha: 0.15),
                              border: Border.all(color: _selected.primaryColor, width: 2),
                            ),
                            child: Icon(_selected.icon, color: _selected.primaryColor, size: 36),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  _selected.name,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 22,
                                    fontWeight: FontWeight.w900,
                                  ),
                                ),
                                Text(
                                  _selected.subtitle,
                                  style: TextStyle(
                                    color: _selected.primaryColor,
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  _selected.description,
                                  style: const TextStyle(
                                    color: Colors.white70,
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 24),

                      // Stat Bars
                      _buildStatBar('Hull Armor', _selected.baseHealth / 160.0, '${_selected.baseHealth.round()} HP', const Color(0xFFFF1744)),
                      const SizedBox(height: 12),
                      _buildStatBar('Drift Velocity', _selected.speed / 360.0, '${_selected.speed.round()} km/s', const Color(0xFF00E5FF)),
                      const SizedBox(height: 12),
                      _buildStatBar('Blaster Cadence', _selected.fireRate / 6.5, '${_selected.fireRate} rps', const Color(0xFFFFD600)),
                      const SizedBox(height: 12),
                      _buildStatBar('Chrono Re-Sync', (8.0 - _selected.rewindCooldown) / 4.0, '${_selected.rewindCooldown}s cd', const Color(0xFFD500F9)),

                      const Spacer(),

                      // Action Button (Equip or Unlock)
                      if (!isUnlocked)
                        ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: canAfford ? const Color(0xFF00E5FF) : Colors.white12,
                            foregroundColor: Colors.black,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          ),
                          onPressed: canAfford
                              ? () {
                                  widget.gameState.unlockShip(_selected);
                                  setState(() {});
                                }
                              : null,
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.lock_open_rounded, size: 20),
                              const SizedBox(width: 8),
                              Text(
                                canAfford
                                    ? 'FABRICATE VESSEL (${_selected.coreUnlockCost} CORES)'
                                    : 'LOCKED (${_selected.coreUnlockCost} CORES NEEDED)',
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                              ),
                            ],
                          ),
                        )
                      else
                        ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: _selected.primaryColor,
                            foregroundColor: Colors.black,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          ),
                          onPressed: () {
                            widget.gameState.selectedChassis = _selected;
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text('${_selected.name} equipped for deployment!'),
                                duration: const Duration(seconds: 1),
                                backgroundColor: const Color(0xFF0F172A),
                              ),
                            );
                          },
                          child: Text(
                            widget.gameState.selectedChassis.id == _selected.id ? 'EQUIPPED IN BAY' : 'EQUIP FOR FLIGHT',
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, letterSpacing: 1.2),
                          ),
                        ),
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

  Widget _buildStatBar(String title, double fraction, String valueText, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(title, style: const TextStyle(color: Colors.white70, fontSize: 12)),
            Text(valueText, style: TextStyle(color: color, fontSize: 12, fontFamily: 'monospace', fontWeight: FontWeight.bold)),
          ],
        ),
        const SizedBox(height: 4),
        Stack(
          children: [
            Container(
              height: 6,
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(3),
              ),
            ),
            FractionallySizedBox(
              widthFactor: fraction.clamp(0.05, 1.0),
              child: Container(
                height: 6,
                decoration: BoxDecoration(
                  color: color,
                  borderRadius: BorderRadius.circular(3),
                  boxShadow: [
                    BoxShadow(color: color.withValues(alpha: 0.5), blurRadius: 6),
                  ],
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }
}
