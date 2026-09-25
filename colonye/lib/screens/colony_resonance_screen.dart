import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../widgets/glass_card.dart';

class ColonyResonanceScreen extends StatefulWidget {
  const ColonyResonanceScreen({super.key});

  @override
  State<ColonyResonanceScreen> createState() => _ColonyResonanceScreenState();
}

class _ColonyResonanceScreenState extends State<ColonyResonanceScreen> {
  final List<Map<String, dynamic>> _colonyMembers = [
    {
      'name': 'Aura Traveler',
      'status': 'Meditating • 432Hz Sanctuary',
      'streak': '18 Days',
      'color': AppTheme.quantumCyan,
      'isOnline': true,
      'pingsSent': 5,
    },
    {
      'name': 'Quantum Sage',
      'status': 'Deep Focus • 45m Portal',
      'streak': '24 Days',
      'color': AppTheme.nebulaViolet,
      'isOnline': true,
      'pingsSent': 12,
    },
    {
      'name': 'Solar Monk',
      'status': 'Sacred Breathwork Active',
      'streak': '12 Days',
      'color': AppTheme.astralGold,
      'isOnline': false,
      'pingsSent': 3,
    },
    {
      'name': 'Echo Sentinel',
      'status': 'Mindweaver Reflection Saved',
      'streak': '9 Days',
      'color': AppTheme.auroraRose,
      'isOnline': true,
      'pingsSent': 8,
    },
  ];

  void _sendLightPing(int index) {
    setState(() {
      _colonyMembers[index]['pingsSent']++;
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: AppTheme.nebulaViolet,
        content: Text(
          'Pulse of Light sent to ${_colonyMembers[index]['name']}! ✨',
          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 18.0, vertical: 12.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header
                Text(
                  'COLONYE TRIBE',
                  style: Theme.of(context).textTheme.displayLarge?.copyWith(fontSize: 26, letterSpacing: 2.0),
                ),
                Text(
                  'Synchronize energy & orbital focus with your tribe',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),

                const SizedBox(height: 20),

                // Group Energy Hero Card
                GlassCard(
                  borderRadius: 24,
                  borderColor: AppTheme.quantumCyan,
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.group_work_rounded, color: AppTheme.quantumCyan, size: 22),
                              const SizedBox(width: 8),
                              Text(
                                'TRIBE RESONANCE FIELD',
                                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                      color: AppTheme.quantumCyan,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 11,
                                      letterSpacing: 1.2,
                                    ),
                              ),
                            ],
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: AppTheme.emeraldZen.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Row(
                              children: [
                                CircleAvatar(radius: 3, backgroundColor: AppTheme.emeraldZen),
                                SizedBox(width: 4),
                                Text(
                                  '3 Online',
                                  style: TextStyle(color: AppTheme.emeraldZen, fontSize: 10, fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 18),

                      Text(
                        '96% Harmonized',
                        style: Theme.of(context).textTheme.displayMedium?.copyWith(
                              fontSize: 28,
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Combined Colony Streaks: 63 Days of Unbroken Focus',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontSize: 12),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                Text(
                  'Colony Members',
                  style: Theme.of(context).textTheme.headlineMedium,
                ),
                const SizedBox(height: 12),

                // Members List
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: _colonyMembers.length,
                  itemBuilder: (context, index) {
                    final member = _colonyMembers[index];
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12.0),
                      child: GlassCard(
                        borderRadius: 18,
                        borderColor: member['color'] as Color,
                        child: Row(
                          children: [
                            Stack(
                              children: [
                                CircleAvatar(
                                  radius: 22,
                                  backgroundColor: (member['color'] as Color).withOpacity(0.2),
                                  child: Icon(Icons.person_outline_rounded, color: member['color'] as Color),
                                ),
                                if (member['isOnline'] as bool)
                                  const Positioned(
                                    right: 0,
                                    bottom: 0,
                                    child: CircleAvatar(
                                      radius: 5,
                                      backgroundColor: AppTheme.emeraldZen,
                                    ),
                                  ),
                              ],
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    member['name'] as String,
                                    style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 15),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    member['status'] as String,
                                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontSize: 11),
                                  ),
                                ],
                              ),
                            ),
                            // Light Ping Button
                            IconButton(
                              onPressed: () => _sendLightPing(index),
                              icon: const Icon(Icons.wb_incandescent_rounded, color: AppTheme.astralGold, size: 24),
                              tooltip: 'Send Light Ping',
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
