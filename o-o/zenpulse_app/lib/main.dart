import 'package:flutter/material.dart';
import 'dart:async';
import 'dart:math' as math;

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ZenPulse',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF1A1C1E),
          brightness: Brightness.dark,
          primary: const Color(0xFFD1E4FF),
          secondary: const Color(0xFFBBC7DB),
          tertiary: const Color(0xFFD7BDE2),
        ),
        scaffoldBackgroundColor: const Color(0xFF1A1C1E),
        textTheme: const TextTheme(
          displayLarge: TextStyle(
            fontSize: 32,
            fontWeight: FontWeight.bold,
            color: Color(0xFFD1E4FF),
            letterSpacing: -1.5,
          ),
          bodyLarge: TextStyle(
            fontSize: 18,
            color: Color(0xFFE2E2E6),
          ),
          bodySmall: TextStyle(
            fontSize: 12,
            color: Color(0xFF909196),
            letterSpacing: 1.2,
          ),
        ),
      ),
      home: const ZenHomePage(),
    );
  }
}

class ZenHomePage extends StatefulWidget {
  const ZenHomePage({super.key});

  @override
  State<ZenHomePage> createState() => _ZenHomePageState();
}

class _ZenHomePageState extends State<ZenHomePage> with TickerProviderStateMixin {
  late AnimationController _pulseController;
  late AnimationController _breathController;
  bool _isZen = false;
  int _secondsRemaining = 0;
  Timer? _timer;
  String _breathStatus = "Inhale";
  
  final List<String> _quotes = [
    "The soul always knows what to do to heal itself.",
    "Silence is a source of great strength.",
    "Breathe. Let go. And remind yourself that this very moment is the only one you know you have.",
    "Peace comes from within. Do not seek it without.",
    "The mind is everything. What you think you become."
  ];
  late String _currentQuote;

  @override
  void initState() {
    super.initState();
    _currentQuote = _quotes[math.Random().nextInt(_quotes.length)];
    
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    )..repeat(reverse: true);

    _breathController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    );

    _breathController.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        setState(() => _breathStatus = "Exhale");
        _breathController.reverse();
      } else if (status == AnimationStatus.dismissed) {
        setState(() => _breathStatus = "Inhale");
        _breathController.forward();
      }
    });
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _breathController.dispose();
    _timer?.cancel();
    super.dispose();
  }

  void _toggleZen() {
    setState(() {
      _isZen = !_isZen;
      if (_isZen) {
        _secondsRemaining = 300; // 5 minutes
        _startTimer();
        _breathController.forward();
      } else {
        _timer?.cancel();
        _breathController.stop();
        _breathController.reset();
        _currentQuote = _quotes[math.Random().nextInt(_quotes.length)];
      }
    });
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() {
        if (_secondsRemaining > 0) {
          _secondsRemaining--;
        } else {
          _toggleZen();
        }
      });
    });
  }

  String _formatTime(int seconds) {
    int minutes = seconds ~/ 60;
    int remainingSeconds = seconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${remainingSeconds.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Background Gradient
          Container(
            decoration: BoxDecoration(
              gradient: RadialGradient(
                colors: [
                  Theme.of(context).colorScheme.primary.withOpacity(0.03),
                  Colors.transparent,
                ],
                center: Alignment.center,
                radius: 1.5,
              ),
            ),
          ),
          
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0),
              child: Column(
                children: [
                  const SizedBox(height: 40),
                  // Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('ZENPULSE', style: Theme.of(context).textTheme.bodySmall),
                          const SizedBox(height: 4),
                          Text(_isZen ? 'Meditation' : 'Welcome', 
                            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                        ],
                      ),
                      IconButton(
                        onPressed: () {},
                        icon: const Icon(Icons.settings_outlined, color: Colors.white54),
                      ),
                    ],
                  ),
                  
                  const Spacer(),

                  // Main Interactive Element
                  Center(
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        // Pulse rings
                        ...List.generate(3, (index) {
                          return AnimatedBuilder(
                            animation: _pulseController,
                            builder: (context, child) {
                              return Container(
                                width: (180 + (index * 40)) * (1 + (_pulseController.value * 0.1)),
                                height: (180 + (index * 40)) * (1 + (_pulseController.value * 0.1)),
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                    color: Theme.of(context).colorScheme.primary.withOpacity(0.1 - (index * 0.03)),
                                    width: 1,
                                  ),
                                ),
                              );
                            },
                          );
                        }),
                        
                        // Breathing Circle
                        AnimatedBuilder(
                          animation: _breathController,
                          builder: (context, child) {
                            return Container(
                              width: 160 + (60 * _breathController.value),
                              height: 160 + (60 * _breathController.value),
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: Theme.of(context).colorScheme.primary.withOpacity(0.05),
                                border: Border.all(
                                  color: Theme.of(context).colorScheme.primary.withOpacity(0.3),
                                  width: 2,
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: Theme.of(context).colorScheme.primary.withOpacity(0.1 * _breathController.value),
                                    blurRadius: 40,
                                    spreadRadius: 5,
                                  ),
                                ],
                              ),
                              child: Center(
                                child: Column(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(
                                      _isZen ? Icons.air : Icons.spa_rounded,
                                      size: 48,
                                      color: Theme.of(context).colorScheme.primary,
                                    ),
                                    if (_isZen) ...[
                                      const SizedBox(height: 8),
                                      Text(_breathStatus, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 2)),
                                    ]
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                      ],
                    ),
                  ),

                  const Spacer(),

                  // Timer or Quote
                  if (_isZen)
                    Text(
                      _formatTime(_secondsRemaining),
                      style: const TextStyle(fontSize: 48, fontWeight: FontWeight.w200, letterSpacing: 4),
                    )
                  else
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      child: Text(
                        '"$_currentQuote"',
                        textAlign: TextAlign.center,
                        style: const TextStyle(fontSize: 16, fontStyle: FontStyle.italic, color: Colors.white70),
                      ),
                    ),

                  const SizedBox(height: 60),

                  // Sound Selection (Mockup)
                  if (!_isZen)
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        _SoundButton(icon: Icons.water_drop_outlined, label: 'Rain'),
                        _SoundButton(icon: Icons.forest_outlined, label: 'Forest'),
                        _SoundButton(icon: Icons.waves_outlined, label: 'Ocean'),
                      ],
                    ),

                  const SizedBox(height: 40),

                  // Primary Action
                  GestureDetector(
                    onTap: _toggleZen,
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 600),
                      padding: const EdgeInsets.symmetric(horizontal: 50, vertical: 20),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(40),
                        gradient: _isZen 
                          ? null 
                          : LinearGradient(
                              colors: [
                                Theme.of(context).colorScheme.primary.withOpacity(0.2),
                                Theme.of(context).colorScheme.tertiary.withOpacity(0.1),
                              ]
                            ),
                        border: Border.all(
                          color: Theme.of(context).colorScheme.primary.withOpacity(_isZen ? 1 : 0.3),
                          width: 1.5,
                        ),
                        color: _isZen ? Colors.transparent : null,
                      ),
                      child: Text(
                        _isZen ? 'STOP' : 'BEGIN SESSION',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 3,
                          color: _isZen ? Theme.of(context).colorScheme.primary : Colors.white,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _SoundButton extends StatelessWidget {
  final IconData icon;
  final String label;

  const _SoundButton({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white10),
            ),
            child: Icon(icon, size: 20, color: Colors.white38),
          ),
          const SizedBox(height: 8),
          Text(label, style: const TextStyle(fontSize: 10, color: Colors.white30)),
        ],
      ),
    );
  }
}
