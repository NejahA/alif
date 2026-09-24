import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import 'glass_card.dart';

class MoonPhaseWidget extends StatelessWidget {
  const MoonPhaseWidget({super.key});

  // Calculate approximate moon phase based on reference new moon
  Map<String, dynamic> get _moonPhaseData {
    final now = DateTime.now();
    // Known new moon reference date: Jan 11, 2024
    final refNewMoon = DateTime(2024, 1, 11);
    final diffDays = now.difference(refNewMoon).inDays;
    final cycleDays = 29.53058770576;
    final phaseRatio = (diffDays % cycleDays) / cycleDays;

    if (phaseRatio < 0.03 || phaseRatio > 0.97) {
      return {
        'phase': 'New Moon',
        'desc': 'Time for seed planting & setting inner intentions',
        'icon': Icons.circle_outlined,
        'illumination': '0%'
      };
    } else if (phaseRatio < 0.22) {
      return {
        'phase': 'Waxing Crescent',
        'desc': 'Building momentum & gentle alignment',
        'icon': Icons.brightness_3_rounded,
        'illumination': '25%'
      };
    } else if (phaseRatio < 0.28) {
      return {
        'phase': 'First Quarter',
        'desc': 'Action & determination in motion',
        'icon': Icons.brightness_4_rounded,
        'illumination': '50%'
      };
    } else if (phaseRatio < 0.47) {
      return {
        'phase': 'Waxing Gibbous',
        'desc': 'Refining details & creative expansion',
        'icon': Icons.brightness_5_rounded,
        'illumination': '75%'
      };
    } else if (phaseRatio < 0.53) {
      return {
        'phase': 'Full Moon',
        'desc': 'Peak energy, gratitude & release of tension',
        'icon': Icons.brightness_7_rounded,
        'illumination': '100%'
      };
    } else if (phaseRatio < 0.72) {
      return {
        'phase': 'Waning Gibbous',
        'desc': 'Sharing wisdom & inward contemplation',
        'icon': Icons.brightness_6_rounded,
        'illumination': '75%'
      };
    } else {
      return {
        'phase': 'Waning Crescent',
        'desc': 'Surrender, deep rest & spiritual reset',
        'icon': Icons.brightness_2_rounded,
        'illumination': '20%'
      };
    }
  }

  @override
  Widget build(BuildContext context) {
    final data = _moonPhaseData;

    return GlassCard(
      borderRadius: 20,
      borderColor: AppTheme.astralGold,
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppTheme.astralGold.withOpacity(0.18),
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: AppTheme.astralGold.withOpacity(0.3),
                  blurRadius: 16,
                  spreadRadius: 2,
                ),
              ],
            ),
            child: Icon(data['icon'] as IconData, color: AppTheme.astralGold, size: 28),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      data['phase'] as String,
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontSize: 15,
                            color: AppTheme.astralGold,
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    Text(
                      data['illumination'] as String,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: AppTheme.astralGold,
                            fontSize: 11,
                          ),
                    ),
                  ],
                ),
                const SizedBox(height: 3),
                Text(
                  data['desc'] as String,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        fontSize: 11,
                        color: Colors.white70,
                      ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
