import 'dart:math';
import 'package:flutter/material.dart';
import '../models/cosmic_card.dart';
import '../theme/app_theme.dart';
import '../widgets/glass_card.dart';

class CosmicOracleScreen extends StatefulWidget {
  const CosmicOracleScreen({super.key});

  @override
  State<CosmicOracleScreen> createState() => _CosmicOracleScreenState();
}

class _CosmicOracleScreenState extends State<CosmicOracleScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _orbController;
  CosmicCard? _currentDrawnCard;

  final List<CosmicCard> _oracleDeck = [
    CosmicCard(
      id: 'c1',
      title: 'The Quantum Observer',
      quote: 'Where your attention flows, cosmic energy solidifies.',
      wisdom: 'You hold the power to shape your reality by consciously directing your focus. Do not react to chaotic noise; observe it and choose stillness.',
      category: 'Awareness',
      primaryColor: AppTheme.quantumCyan,
      secondaryColor: AppTheme.nebulaViolet,
      icon: Icons.visibility_rounded,
    ),
    CosmicCard(
      id: 'c2',
      title: 'Celestial Serenity',
      quote: 'In the center of the storm, the galaxy moves in absolute silence.',
      wisdom: 'Your inner sanctuary remains untouched by external demands. Take 3 deep breaths and anchor yourself in infinite space.',
      category: 'Peace',
      primaryColor: AppTheme.emeraldZen,
      secondaryColor: AppTheme.quantumCyan,
      icon: Icons.spa_rounded,
    ),
    CosmicCard(
      id: 'c3',
      title: 'Solar Creation',
      quote: 'You are an engine of light designed to manifest beauty.',
      wisdom: 'Unleash your creative impulse without fear of judgment. The universe expands through your unique artistic expression.',
      category: 'Creation',
      primaryColor: AppTheme.astralGold,
      secondaryColor: AppTheme.auroraRose,
      icon: Icons.wb_sunny_rounded,
    ),
    CosmicCard(
      id: 'c4',
      title: 'Astral Surrender',
      quote: 'To float, you must stop trying to push against the stream.',
      wisdom: 'Release control over outcomes today. What is meant for your highest evolution will effortlessly align with your path.',
      category: 'Release',
      primaryColor: AppTheme.auroraRose,
      secondaryColor: AppTheme.nebulaViolet,
      icon: Icons.air_rounded,
    ),
  ];

  @override
  void initState() {
    super.initState();
    _orbController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _orbController.dispose();
    super.dispose();
  }

  void _drawCard() {
    final random = Random();
    final card = _oracleDeck[random.nextInt(_oracleDeck.length)];
    setState(() {
      _currentDrawnCard = card;
    });
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
                  'Cosmic Oracle',
                  style: Theme.of(context).textTheme.displayLarge?.copyWith(fontSize: 26),
                ),
                Text(
                  'Tap the resonance orb to draw your daily wisdom card',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),

                const SizedBox(height: 24),

                // Interactive Glowing Orb Container
                Center(
                  child: GestureDetector(
                    onTap: _drawCard,
                    child: AnimatedBuilder(
                      animation: _orbController,
                      builder: (context, child) {
                        final glowScale = 1.0 + (_orbController.value * 0.15);
                        return Container(
                          width: 140,
                          height: 140,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            gradient: const RadialGradient(
                              colors: [
                                AppTheme.astralGold,
                                AppTheme.nebulaViolet,
                                AppTheme.voidBlack,
                              ],
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: AppTheme.nebulaViolet.withOpacity(0.6 * glowScale),
                                blurRadius: 35 * glowScale,
                                spreadRadius: 6 * glowScale,
                              ),
                            ],
                          ),
                          child: const Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.auto_awesome_rounded, color: Colors.white, size: 36),
                                SizedBox(height: 4),
                                Text(
                                  'TAP ORB',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                    letterSpacing: 1.5,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ),

                const SizedBox(height: 28),

                // Drawn Card Reveal Section
                if (_currentDrawnCard != null) ...[
                  AnimatedContainer(
                    duration: const Duration(milliseconds: 600),
                    curve: Curves.easeOutBack,
                    child: GlassCard(
                      borderRadius: 24,
                      borderColor: _currentDrawnCard!.primaryColor,
                      padding: const EdgeInsets.all(22),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: _currentDrawnCard!.primaryColor.withOpacity(0.2),
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(color: _currentDrawnCard!.primaryColor.withOpacity(0.5)),
                                ),
                                child: Text(
                                  _currentDrawnCard!.category.toUpperCase(),
                                  style: TextStyle(
                                    color: _currentDrawnCard!.primaryColor,
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                    letterSpacing: 1.2,
                                  ),
                                ),
                              ),
                              Icon(_currentDrawnCard!.icon, color: _currentDrawnCard!.primaryColor, size: 24),
                            ],
                          ),

                          const SizedBox(height: 16),

                          Text(
                            _currentDrawnCard!.title,
                            style: Theme.of(context).textTheme.displayMedium?.copyWith(
                                  fontSize: 22,
                                  color: Colors.white,
                                ),
                          ),

                          const SizedBox(height: 10),

                          Text(
                            '"${_currentDrawnCard!.quote}"',
                            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                                  fontStyle: FontStyle.italic,
                                  color: AppTheme.quantumCyan,
                                  fontSize: 15,
                                ),
                          ),

                          const SizedBox(height: 14),

                          Text(
                            _currentDrawnCard!.wisdom,
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  fontSize: 13,
                                  height: 1.5,
                                  color: Colors.white70,
                                ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ] else ...[
                  Center(
                    child: Padding(
                      padding: const EdgeInsets.all(32.0),
                      child: Text(
                        'Touch the celestial orb above to receive your daily message.',
                        textAlign: TextAlign.center,
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                    ),
                  ),
                ],

                const SizedBox(height: 24),

                Text(
                  'Oracle Deck Deck',
                  style: Theme.of(context).textTheme.headlineMedium,
                ),
                const SizedBox(height: 12),

                // Deck Preview Cards
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: _oracleDeck.length,
                  itemBuilder: (context, index) {
                    final card = _oracleDeck[index];
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 10.0),
                      child: GlassCard(
                        borderRadius: 16,
                        borderColor: card.primaryColor.withOpacity(0.4),
                        child: Row(
                          children: [
                            Icon(card.icon, color: card.primaryColor, size: 22),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Text(
                                card.title,
                                style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 14),
                              ),
                            ),
                            Text(
                              card.category,
                              style: const TextStyle(color: AppTheme.textSecondary, fontSize: 11),
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
