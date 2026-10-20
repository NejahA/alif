import 'package:flutter/material.dart';
import '../../theme/colony_theme.dart';
import '../../state/colony_state.dart';
import '../../models/resource.dart';

class OrbitalTradeView extends StatelessWidget {
  final ColonyState state;

  const OrbitalTradeView({super.key, required this.state});

  @override
  Widget build(BuildContext context) {
    final bool isDocked = state.merchantFrigateDocked;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 8.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Frigate Docking Status Card
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isDocked ? ColonyTheme.cardBgLight : ColonyTheme.cardBg,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: isDocked ? ColonyTheme.creditColor : ColonyTheme.borderGlow,
                width: isDocked ? 1.4 : 1.0,
              ),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: (isDocked ? ColonyTheme.creditColor : ColonyTheme.textMuted).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(
                    isDocked ? Icons.rocket_launch : Icons.radar,
                    color: isDocked ? ColonyTheme.creditColor : ColonyTheme.textMuted,
                    size: 26,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        isDocked ? 'FREIGHTER "ORION HORIZON" DOCKED' : 'NO MERCHANT VESSELS IN ORBIT',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: isDocked ? ColonyTheme.creditColor : ColonyTheme.textMuted,
                          letterSpacing: 0.5,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        isDocked
                            ? 'Departing in ${state.frigateDepartureCountdown.toInt()}s. Orbital exchange rate nominal.'
                            : 'Next merchant vessel in orbit in ${state.frigateDepartureCountdown.toInt()}s.',
                        style: const TextStyle(fontSize: 10, color: ColonyTheme.textMuted),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: ColonyTheme.creditColor.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: ColonyTheme.creditColor.withValues(alpha: 0.5)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.toll, size: 12, color: ColonyTheme.creditColor),
                      const SizedBox(width: 4),
                      Text(
                        '${state.resources[ResourceType.credits]!.current.toInt()} ₡',
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: ColonyTheme.creditColor,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),

          // Scrollable Trade Content
          Expanded(
            child: ListView(
              physics: const BouncingScrollPhysics(),
              children: [
                // SECTION: RESOURCE COMMODITIES
                const Text(
                  'COMMODITY EXCHANGE',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 1.0,
                    color: ColonyTheme.neonCyan,
                  ),
                ),
                const SizedBox(height: 8),

                _buildTradeRow(
                  type: ResourceType.alloys,
                  amount: 20,
                  buyCost: 40,
                  sellPrice: 28,
                  enabled: isDocked,
                ),
                const SizedBox(height: 8),
                _buildTradeRow(
                  type: ResourceType.food,
                  amount: 25,
                  buyCost: 30,
                  sellPrice: 20,
                  enabled: isDocked,
                ),
                const SizedBox(height: 8),
                _buildTradeRow(
                  type: ResourceType.water,
                  amount: 25,
                  buyCost: 35,
                  sellPrice: 22,
                  enabled: isDocked,
                ),
                const SizedBox(height: 8),
                _buildTradeRow(
                  type: ResourceType.oxygen,
                  amount: 25,
                  buyCost: 35,
                  sellPrice: 24,
                  enabled: isDocked,
                ),
                const SizedBox(height: 8),
                _buildTradeRow(
                  type: ResourceType.energy,
                  amount: 50,
                  buyCost: 55,
                  sellPrice: 35,
                  enabled: isDocked,
                ),

                const SizedBox(height: 16),
                // SECTION: SPECIALIST RECRUITMENT
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'SPECIALIST RECRUITMENT',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 1.0,
                        color: ColonyTheme.neonCyan,
                      ),
                    ),
                    Text(
                      'HOUSING: ${state.population}/${state.maxHousing}',
                      style: TextStyle(
                        fontSize: 10,
                        color: state.population >= state.maxHousing ? ColonyTheme.alertCrimson : ColonyTheme.bioEmerald,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),

                _buildRecruitCard(
                  role: 'Engineer',
                  description: 'Boosts alloy smelter production and repairs colony infrastructure.',
                  cost: 150,
                  icon: Icons.engineering,
                  currentCount: state.engineers,
                  enabled: isDocked && state.population < state.maxHousing,
                ),
                const SizedBox(height: 8),
                _buildRecruitCard(
                  role: 'Scientist',
                  description: 'Accelerates research point generation in Xenobiology labs.',
                  cost: 180,
                  icon: Icons.science,
                  currentCount: state.scientists,
                  enabled: isDocked && state.population < state.maxHousing,
                ),
                const SizedBox(height: 8),
                _buildRecruitCard(
                  role: 'Botanist',
                  description: 'Enhances Hydroponics Biodome yields and manages life support crops.',
                  cost: 130,
                  icon: Icons.spa,
                  currentCount: state.botanists,
                  enabled: isDocked && state.population < state.maxHousing,
                ),
                const SizedBox(height: 8),
                _buildRecruitCard(
                  role: 'Medic',
                  description: 'Maintains colonist psychological health and prevents disease outbreaks.',
                  cost: 160,
                  icon: Icons.medical_services,
                  currentCount: state.medics,
                  enabled: isDocked && state.population < state.maxHousing,
                ),
                const SizedBox(height: 16),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTradeRow({
    required ResourceType type,
    required double amount,
    required double buyCost,
    required double sellPrice,
    required bool enabled,
  }) {
    final res = state.resources[type]!;
    final bool canBuy = enabled && state.resources[ResourceType.credits]!.current >= buyCost && (res.current + amount <= res.maxCapacity);
    final bool canSell = enabled && res.current >= amount;

    return Container(
      decoration: BoxDecoration(
        color: ColonyTheme.cardBg,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: ColonyTheme.borderGlow),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      child: Row(
        children: [
          Icon(res.icon, size: 20, color: res.color),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  res.name,
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: ColonyTheme.textBright),
                ),
                Text(
                  'Holding: ${res.current.toInt()} / ${res.maxCapacity.toInt()} ${res.unit}',
                  style: const TextStyle(fontSize: 10, color: ColonyTheme.textMuted),
                ),
              ],
            ),
          ),
          // Sell button
          ElevatedButton(
            onPressed: canSell ? () => state.tradeSell(type, amount, sellPrice) : null,
            style: ElevatedButton.styleFrom(
              backgroundColor: ColonyTheme.laserAmber.withValues(alpha: 0.15),
              foregroundColor: ColonyTheme.laserAmber,
              side: BorderSide(color: canSell ? ColonyTheme.laserAmber : ColonyTheme.borderGlow),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            ),
            child: Text(
              'SELL ${amount.toInt()}\n+${sellPrice.toInt()} ₡',
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold),
            ),
          ),
          const SizedBox(width: 8),
          // Buy button
          ElevatedButton(
            onPressed: canBuy ? () => state.tradeBuy(type, amount, buyCost) : null,
            style: ElevatedButton.styleFrom(
              backgroundColor: ColonyTheme.neonCyan.withValues(alpha: 0.15),
              foregroundColor: ColonyTheme.neonCyan,
              side: BorderSide(color: canBuy ? ColonyTheme.neonCyan : ColonyTheme.borderGlow),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            ),
            child: Text(
              'BUY ${amount.toInt()}\n-${buyCost.toInt()} ₡',
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRecruitCard({
    required String role,
    required String description,
    required double cost,
    required IconData icon,
    required int currentCount,
    required bool enabled,
  }) {
    final bool canAfford = enabled && state.resources[ResourceType.credits]!.current >= cost;

    return Container(
      decoration: BoxDecoration(
        color: ColonyTheme.cardBg,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: ColonyTheme.borderGlow),
      ),
      padding: const EdgeInsets.all(10),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: ColonyTheme.bioEmerald.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: ColonyTheme.bioEmerald, size: 22),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      role,
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: ColonyTheme.textBright),
                    ),
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                      decoration: BoxDecoration(
                        color: ColonyTheme.bioEmerald.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        'x$currentCount',
                        style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: ColonyTheme.bioEmerald),
                      ),
                    ),
                  ],
                ),
                Text(
                  description,
                  style: const TextStyle(fontSize: 10, color: ColonyTheme.textMuted),
                ),
              ],
            ),
          ),
          ElevatedButton(
            onPressed: canAfford ? () => state.recruitSpecialist(role, cost) : null,
            style: ElevatedButton.styleFrom(
              backgroundColor: ColonyTheme.bioEmerald.withValues(alpha: 0.2),
              foregroundColor: ColonyTheme.bioEmerald,
              side: BorderSide(color: canAfford ? ColonyTheme.bioEmerald : ColonyTheme.borderGlow),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            ),
            child: Text(
              'HIRE\n${cost.toInt()} ₡',
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }
}
