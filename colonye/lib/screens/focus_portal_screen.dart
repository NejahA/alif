import 'dart:async';
import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../widgets/glass_card.dart';

class FocusPortalScreen extends StatefulWidget {
  const FocusPortalScreen({super.key});

  @override
  State<FocusPortalScreen> createState() => _FocusPortalScreenState();
}

class _FocusPortalScreenState extends State<FocusPortalScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _portalPulseController;
  Timer? _timer;

  int _sessionMinutes = 25;
  int _secondsRemaining = 25 * 60;
  bool _isRunning = false;
  int _completedSessions = 3;

  @override
  void initState() {
    super.initState();
    _portalPulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _timer?.cancel();
    _portalPulseController.dispose();
    super.dispose();
  }

  void _startTimer() {
    setState(() => _isRunning = true);
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_secondsRemaining > 0) {
        setState(() => _secondsRemaining--);
      } else {
        _timer?.cancel();
        setState(() {
          _isRunning = false;
          _completedSessions++;
          _secondsRemaining = _sessionMinutes * 60;
        });
      }
    });
  }

  void _pauseTimer() {
    _timer?.cancel();
    setState(() => _isRunning = false);
  }

  void _resetTimer(int minutes) {
    _timer?.cancel();
    setState(() {
      _sessionMinutes = minutes;
      _secondsRemaining = minutes * 60;
      _isRunning = false;
    });
  }

  String get _formattedTime {
    final mins = (_secondsRemaining ~/ 60).toString().padLeft(2, '0');
    final secs = (_secondsRemaining % 60).toString().padLeft(2, '0');
    return '$mins:$secs';
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
                  'Focus Portal',
                  style: Theme.of(context).textTheme.displayLarge?.copyWith(fontSize: 26),
                ),
                Text(
                  'Deep work sanctuary with ambient sound coupling',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),

                const SizedBox(height: 24),

                // Main Focus Ring Container
                GlassCard(
                  borderRadius: 28,
                  borderColor: _isRunning ? AppTheme.quantumCyan : AppTheme.glassBorder,
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    children: [
                      // Ring Visualizer
                      AnimatedBuilder(
                        animation: _portalPulseController,
                        builder: (context, child) {
                          final scale = _isRunning ? (1.0 + (_portalPulseController.value * 0.08)) : 1.0;
                          return Transform.scale(
                            scale: scale,
                            child: Container(
                              width: 200,
                              height: 200,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: _isRunning ? AppTheme.quantumCyan : AppTheme.glassBorder,
                                  width: 4,
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: (_isRunning ? AppTheme.quantumCyan : AppTheme.nebulaViolet).withOpacity(0.4),
                                    blurRadius: _isRunning ? 30 : 10,
                                    spreadRadius: _isRunning ? 4 : 0,
                                  ),
                                ],
                              ),
                              child: Center(
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Text(
                                      _formattedTime,
                                      style: Theme.of(context).textTheme.displayLarge?.copyWith(
                                            fontSize: 44,
                                            fontWeight: FontWeight.bold,
                                            color: Colors.white,
                                          ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      _isRunning ? 'DEEP FOCUS ACTIVE' : 'PORTAL READY',
                                      style: TextStyle(
                                        color: _isRunning ? AppTheme.quantumCyan : AppTheme.textSecondary,
                                        fontSize: 10,
                                        fontWeight: FontWeight.bold,
                                        letterSpacing: 1.2,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          );
                        },
                      ),

                      const SizedBox(height: 30),

                      // Session Selector Chips
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [15, 25, 45, 60].map((mins) {
                          final isSelected = _sessionMinutes == mins;
                          return Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 4.0),
                            child: ChoiceChip(
                              label: Text('${mins}m'),
                              selected: isSelected,
                              selectedColor: AppTheme.quantumCyan.withOpacity(0.3),
                              backgroundColor: AppTheme.glassSurface,
                              labelStyle: TextStyle(
                                color: isSelected ? AppTheme.quantumCyan : AppTheme.textSecondary,
                                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                              ),
                              side: BorderSide(
                                color: isSelected ? AppTheme.quantumCyan : AppTheme.glassBorder,
                              ),
                              onSelected: (_) => _resetTimer(mins),
                            ),
                          );
                        }).toList(),
                      ),

                      const SizedBox(height: 20),

                      // Start / Pause Controls
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          IconButton.filled(
                            style: IconButton.styleFrom(
                              backgroundColor: _isRunning ? AppTheme.auroraRose : AppTheme.quantumCyan,
                              padding: const EdgeInsets.all(16),
                            ),
                            onPressed: _isRunning ? _pauseTimer : _startTimer,
                            icon: Icon(_isRunning ? Icons.pause_rounded : Icons.play_arrow_rounded, color: Colors.black, size: 30),
                          ),
                          const SizedBox(width: 16),
                          IconButton(
                            onPressed: () => _resetTimer(_sessionMinutes),
                            icon: const Icon(Icons.refresh_rounded, color: Colors.white54, size: 26),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                // Stats Header
                Text(
                  'Portal Analytics',
                  style: Theme.of(context).textTheme.headlineMedium,
                ),
                const SizedBox(height: 12),

                GlassCard(
                  borderRadius: 18,
                  borderColor: AppTheme.nebulaViolet,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      Column(
                        children: [
                          const Icon(Icons.timer_outlined, color: AppTheme.quantumCyan, size: 24),
                          const SizedBox(height: 4),
                          Text(
                            '${_completedSessions * _sessionMinutes}m',
                            style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                          ),
                          Text('Focus Time', style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontSize: 11)),
                        ],
                      ),
                      Container(width: 1, height: 40, color: Colors.white12),
                      Column(
                        children: [
                          const Icon(Icons.check_circle_outline_rounded, color: AppTheme.emeraldZen, size: 24),
                          const SizedBox(height: 4),
                          Text(
                            '$_completedSessions',
                            style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                          ),
                          Text('Sessions Done', style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontSize: 11)),
                        ],
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
}
