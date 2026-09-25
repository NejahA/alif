import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/colonye_provider.dart';
import '../theme/app_theme.dart';
import '../widgets/glass_card.dart';

enum BreathPhase { inhale, holdIn, exhale, holdOut }

class SacredBreathworkScreen extends StatefulWidget {
  const SacredBreathworkScreen({super.key});

  @override
  State<SacredBreathworkScreen> createState() => _SacredBreathworkScreenState();
}

class _SacredBreathworkScreenState extends State<SacredBreathworkScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _orbController;
  Timer? _phaseTimer;

  bool _isActive = false;
  BreathPhase _currentPhase = BreathPhase.inhale;
  int _phaseSecondsRemaining = 4;
  int _completedCycles = 0;

  @override
  void initState() {
    super.initState();
    _orbController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    );
  }

  @override
  void dispose() {
    _phaseTimer?.cancel();
    _orbController.dispose();
    super.dispose();
  }

  void _startBreathSession() {
    setState(() {
      _isActive = true;
      _currentPhase = BreathPhase.inhale;
      _phaseSecondsRemaining = 4;
    });

    _orbController.forward(from: 0.0);

    _phaseTimer?.cancel();
    _phaseTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!_isActive) return;

      setState(() {
        if (_phaseSecondsRemaining > 1) {
          _phaseSecondsRemaining--;
        } else {
          // Switch Phase
          switch (_currentPhase) {
            case BreathPhase.inhale:
              _currentPhase = BreathPhase.holdIn;
              _phaseSecondsRemaining = 4;
              _orbController.stop();
              break;
            case BreathPhase.holdIn:
              _currentPhase = BreathPhase.exhale;
              _phaseSecondsRemaining = 4;
              _orbController.reverse(from: 1.0);
              break;
            case BreathPhase.exhale:
              _currentPhase = BreathPhase.holdOut;
              _phaseSecondsRemaining = 4;
              _orbController.stop();
              break;
            case BreathPhase.holdOut:
              _currentPhase = BreathPhase.inhale;
              _phaseSecondsRemaining = 4;
              _completedCycles++;
              _orbController.forward(from: 0.0);
              break;
          }
        }
      });
    });
  }

  void _pauseBreathSession() {
    _phaseTimer?.cancel();
    _orbController.stop();
    setState(() {
      _isActive = false;
    });
    Provider.of<ColonyeProvider>(context, listen: false).recordCompletedBreathSession();
  }

  String get _phaseLabel {
    switch (_currentPhase) {
      case BreathPhase.inhale:
        return "INHALE DEEPLY";
      case BreathPhase.holdIn:
        return "HOLD BREATH";
      case BreathPhase.exhale:
        return "EXHALE SLOWLY";
      case BreathPhase.holdOut:
        return "REST STILL";
    }
  }

  Color get _phaseColor {
    switch (_currentPhase) {
      case BreathPhase.inhale:
        return AppTheme.quantumCyan;
      case BreathPhase.holdIn:
        return AppTheme.astralGold;
      case BreathPhase.exhale:
        return AppTheme.nebulaViolet;
      case BreathPhase.holdOut:
        return AppTheme.emeraldZen;
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<ColonyeProvider>(context);

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
                  'Sacred Breathwork',
                  style: Theme.of(context).textTheme.displayLarge?.copyWith(fontSize: 26),
                ),
                Text(
                  'Harmonize your nervous system with visual rhythm',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),

                const SizedBox(height: 24),

                // Interactive Expanding Orb Container
                GlassCard(
                  borderRadius: 28,
                  borderColor: _phaseColor.withOpacity(0.6),
                  padding: const EdgeInsets.all(24),
                  child: SizedBox(
                    height: 320,
                    width: double.infinity,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        // Orb Graphic
                        AnimatedBuilder(
                          animation: _orbController,
                          builder: (context, child) {
                            final scale = 1.0 + (_orbController.value * 0.45);
                            return Transform.scale(
                              scale: scale,
                              child: Container(
                                width: 130,
                                height: 130,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  gradient: RadialGradient(
                                    colors: [
                                      _phaseColor,
                                      _phaseColor.withOpacity(0.6),
                                      AppTheme.voidBlack,
                                    ],
                                  ),
                                  boxShadow: [
                                    BoxShadow(
                                      color: _phaseColor.withOpacity(0.5),
                                      blurRadius: 30 * scale,
                                      spreadRadius: 5 * scale,
                                    ),
                                  ],
                                ),
                                child: Center(
                                  child: Text(
                                    '$_phaseSecondsRemaining',
                                    style: Theme.of(context).textTheme.displayLarge?.copyWith(
                                          fontSize: 38,
                                          color: Colors.white,
                                          fontWeight: FontWeight.bold,
                                        ),
                                  ),
                                ),
                              ),
                            );
                          },
                        ),

                        const SizedBox(height: 40),

                        // Phase Title
                        Text(
                          _isActive ? _phaseLabel : "READY TO BEGIN",
                          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                                color: _phaseColor,
                                letterSpacing: 2.0,
                                fontWeight: FontWeight.bold,
                                fontSize: 18,
                              ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '$_completedCycles Cycles Completed Today',
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 24),

                // Controls
                Row(
                  children: [
                    Expanded(
                      child: SizedBox(
                        height: 52,
                        child: ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: _isActive ? AppTheme.auroraRose : AppTheme.quantumCyan,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          ),
                          onPressed: _isActive ? _pauseBreathSession : _startBreathSession,
                          icon: Icon(_isActive ? Icons.pause_rounded : Icons.play_arrow_rounded, color: Colors.black),
                          label: Text(
                            _isActive ? 'PAUSE SESSION' : 'START RITUAL',
                            style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold, letterSpacing: 1.1),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 24),

                Text(
                  'Breathing Technique',
                  style: Theme.of(context).textTheme.headlineMedium,
                ),
                const SizedBox(height: 12),

                // Technique Selector Cards
                GlassCard(
                  borderRadius: 16,
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    children: [
                      _buildTechniqueTile(
                        context,
                        title: "Box Breathing (4-4-4-4)",
                        subtitle: "Equalized rhythm for anxiety reduction & mental reset",
                        isSelected: provider.selectedBreathTechnique == "Box Breathing (4-4-4-4)",
                        onTap: () => provider.setBreathTechnique("Box Breathing (4-4-4-4)"),
                      ),
                      const Divider(color: Colors.white12, height: 16),
                      _buildTechniqueTile(
                        context,
                        title: "Zen Relaxation (4-7-8)",
                        subtitle: "Extended exhale pattern for deep sleep preparation",
                        isSelected: provider.selectedBreathTechnique == "Zen Relaxation (4-7-8)",
                        onTap: () => provider.setBreathTechnique("Zen Relaxation (4-7-8)"),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTechniqueTile(
    BuildContext context, {
    required String title,
    required String subtitle,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      child: Row(
        children: [
          Icon(
            isSelected ? Icons.radio_button_checked_rounded : Icons.radio_button_off_rounded,
            color: isSelected ? AppTheme.quantumCyan : Colors.white38,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 14),
                ),
                Text(
                  subtitle,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontSize: 11),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
