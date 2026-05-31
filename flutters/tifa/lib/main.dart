import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:async';
import 'dart:math';

void main() {
  runApp(const IstinafApp());
}

class IstinafApp extends StatelessWidget {
  const IstinafApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Istinaf - FF7 Pomodoro',
      theme: ThemeData(
        brightness: Brightness.dark,
        fontFamily: 'Courier',
      ),
      debugShowCheckedModeBanner: false,
      home: const PomodoroScreen(),
    );
  }
}

class PomodoroScreen extends StatefulWidget {
  const PomodoroScreen({super.key});

  @override
  State<PomodoroScreen> createState() => _PomodoroScreenState();
}

class _PomodoroScreenState extends State<PomodoroScreen> with TickerProviderStateMixin {
  static const int workDuration = 25 * 60;
  static const int breakDuration = 5 * 60;
  static const int longBreakDuration = 15 * 60;

  int timeRemaining = workDuration;
  bool isRunning = false;
  bool isWorkMode = true;
  int pomodoros = 0;
  Timer? timer;
  String message = 'Ready to focus?';
  
  late AnimationController _floatController;
  late AnimationController _pulseController;
  late AnimationController _scanlineController;

  final List<String> workMessages = [
    'Focus your energy!',
    'Limit Break charging...',
    'Materia power rising!',
    'Stay determined!',
    'Victory awaits!'
  ];

  final List<String> breakMessages = [
    'Rest and recover!',
    'HP/MP restored!',
    'Take a breather!',
    'Prepare for battle!',
    'Save your progress!'
  ];

  final List<String> completeMessages = [
    'Mission Complete!',
    'Level Up!',
    'Victory Fanfare!',
    'EXP Gained!',
    'Well done, soldier!'
  ];

  @override
  void initState() {
    super.initState();
    _floatController = AnimationController(
      duration: const Duration(seconds: 3),
      vsync: this,
    )..repeat(reverse: true);

    _pulseController = AnimationController(
      duration: const Duration(seconds: 1),
      vsync: this,
    )..repeat(reverse: true);

    _scanlineController = AnimationController(
      duration: const Duration(seconds: 8),
      vsync: this,
    )..repeat();

    _loadStats();
  }

  @override
  void dispose() {
    timer?.cancel();
    _floatController.dispose();
    _pulseController.dispose();
    _scanlineController.dispose();
    super.dispose();
  }

  Future<void> _loadStats() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      pomodoros = prefs.getInt('pomodoros') ?? 0;
    });
  }

  Future<void> _saveStats() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt('pomodoros', pomodoros);
  }

  void toggle() {
    if (isRunning) {
      pause();
    } else {
      start();
    }
  }

  void start() {
    setState(() {
      isRunning = true;
      message = _getRandomMessage(isWorkMode ? workMessages : breakMessages);
    });

    timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() {
        timeRemaining--;
        if (timeRemaining <= 0) {
          complete();
        }
      });
    });
  }

  void pause() {
    timer?.cancel();
    setState(() {
      isRunning = false;
      message = 'Paused...';
    });
  }

  void reset() {
    pause();
    setState(() {
      timeRemaining = isWorkMode ? workDuration : breakDuration;
      message = 'Timer reset!';
    });
  }

  void complete() {
    pause();
    setState(() {
      message = _getRandomMessage(completeMessages);

      if (isWorkMode) {
        pomodoros++;
        _saveStats();

        if (pomodoros % 4 == 0) {
          timeRemaining = longBreakDuration;
        } else {
          timeRemaining = breakDuration;
        }
        isWorkMode = false;
      } else {
        timeRemaining = workDuration;
        isWorkMode = true;
      }
    });

    Future.delayed(const Duration(seconds: 3), () {
      if (!isRunning) {
        setState(() {
          message = _getRandomMessage(isWorkMode ? workMessages : breakMessages);
        });
      }
    });
  }

  String _getRandomMessage(List<String> messages) {
    return messages[Random().nextInt(messages.length)];
  }

  String get formattedTime {
    final minutes = timeRemaining ~/ 60;
    final seconds = timeRemaining % 60;
    return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }

  String get modeText {
    if (isWorkMode) return 'WORK MODE';
    if (pomodoros % 4 == 0 && !isWorkMode) return 'LONG BREAK';
    return 'SHORT BREAK';
  }

  int get level => (pomodoros ~/ 4) + 1;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFF0a0e27),
              Color(0xFF1a1f3a),
              Color(0xFF0a0e27),
            ],
          ),
        ),
        child: Stack(
          children: [
            _buildScanlines(),
            Center(
              child: Container(
                constraints: BoxConstraints(maxWidth: 600),
                margin: EdgeInsets.all(20),
                child: _buildWindow(),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildScanlines() {
    return AnimatedBuilder(
      animation: _scanlineController,
      builder: (context, child) {
        return Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: List.generate(
                100,
                (index) => index % 2 == 0
                    ? Colors.cyan.withOpacity(0.03)
                    : Colors.transparent,
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildWindow() {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF1a1f3a), Color(0xFF2a2f4a)],
        ),
        border: Border.all(color: Color(0xFF4a9eff), width: 4),
        boxShadow: [
          BoxShadow(
            color: Color(0xFF4a9eff).withOpacity(0.5),
            blurRadius: 20,
            spreadRadius: 0,
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildTitleBar(),
          _buildContent(),
        ],
      ),
    );
  }

  Widget _buildTitleBar() {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(15),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Color(0xFF4a9eff), Color(0xFF2a5eff)],
        ),
        border: Border(
          bottom: BorderSide(color: Color(0xFF6ab9ff), width: 2),
        ),
      ),
      child: Column(
        children: [
          Text(
            'ISTINAF',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              letterSpacing: 4,
              shadows: [
                Shadow(offset: Offset(2, 2), color: Colors.black),
              ],
            ),
          ),
          SizedBox(height: 5),
          Text(
            'Pomodoro System v7.0',
            style: TextStyle(
              fontSize: 8,
              color: Colors.white.withOpacity(0.8),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContent() {
    return Padding(
      padding: EdgeInsets.all(30),
      child: Column(
        children: [
          _buildTimerDisplay(),
          SizedBox(height: 20),
          _buildMateriaOrb(),
          SizedBox(height: 30),
          _buildStats(),
          SizedBox(height: 20),
          _buildControls(),
          SizedBox(height: 20),
          _buildMessage(),
        ],
      ),
    );
  }

  Widget _buildTimerDisplay() {
    return Column(
      children: [
        Text(
          formattedTime,
          style: TextStyle(
            fontSize: 48,
            fontWeight: FontWeight.bold,
            color: Color(0xFF4affff),
            shadows: [
              Shadow(color: Color(0xFF4affff), blurRadius: 10),
              Shadow(color: Color(0xFF4affff), blurRadius: 20),
              Shadow(offset: Offset(2, 2), color: Colors.black),
            ],
          ),
        ),
        SizedBox(height: 10),
        Text(
          modeText,
          style: TextStyle(
            fontSize: 10,
            color: Color(0xFFffaa44),
            shadows: [
              Shadow(offset: Offset(1, 1), color: Colors.black),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildMateriaOrb() {
    return AnimatedBuilder(
      animation: Listenable.merge([_floatController, _pulseController]),
      builder: (context, child) {
        final float = _floatController.value * 10;
        final pulse = isRunning ? _pulseController.value * 20 : 0;
        
        return Transform.translate(
          offset: Offset(0, -float),
          child: Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: RadialGradient(
                center: Alignment(-0.4, -0.4),
                colors: [
                  Color(0xFF4affff),
                  Color(0xFF2a5eff),
                  Color(0xFF1a1f3a),
                ],
              ),
              boxShadow: [
                BoxShadow(
                  color: Color(0xFF4affff),
                  blurRadius: 20.0 + pulse,
                  spreadRadius: 0,
                ),
              ],
            ),
            child: Stack(
              children: [
                Positioned(
                  top: 8,
                  left: 16,
                  child: Container(
                    width: 24,
                    height: 24,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.white.withOpacity(0.8),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.white.withOpacity(0.5),
                          blurRadius: 5,
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildStats() {
    return Container(
      padding: EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(0.3),
        border: Border.all(color: Color(0xFF4a9eff), width: 2),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildStatItem('Pomodoros', pomodoros.toString()),
          _buildStatItem('Level', level.toString()),
        ],
      ),
    );
  }

  Widget _buildStatItem(String label, String value) {
    return Column(
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 8,
            color: Color(0xFFffaa44),
          ),
        ),
        SizedBox(height: 5),
        Text(
          value,
          style: TextStyle(
            fontSize: 20,
            color: Color(0xFF4affff),
            shadows: [
              Shadow(color: Color(0xFF4affff), blurRadius: 10),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildControls() {
    return Row(
      children: [
        Expanded(
          child: _buildButton(
            text: isRunning ? 'PAUSE' : 'START',
            color: Color(0xFF44ff44),
            onPressed: toggle,
          ),
        ),
        SizedBox(width: 15),
        Expanded(
          child: _buildButton(
            text: 'RESET',
            color: Color(0xFFff4444),
            onPressed: reset,
          ),
        ),
      ],
    );
  }

  Widget _buildButton({
    required String text,
    required Color color,
    required VoidCallback onPressed,
  }) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onPressed,
        child: Container(
          padding: EdgeInsets.all(15),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [color, color.withOpacity(0.6)],
            ),
            border: Border.all(color: color.withOpacity(0.8), width: 3),
          ),
          child: Center(
            child: Text(
              text,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: Colors.white,
                shadows: [
                  Shadow(offset: Offset(1, 1), color: Colors.black),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildMessage() {
    return Container(
      height: 30,
      alignment: Alignment.center,
      child: Text(
        message,
        style: TextStyle(
          fontSize: 10,
          color: Color(0xFFffaa44),
          shadows: [
            Shadow(offset: Offset(1, 1), color: Colors.black),
          ],
        ),
        textAlign: TextAlign.center,
      ),
    );
  }
}
