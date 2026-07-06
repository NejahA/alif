import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/pomodoro_timer.dart';
import '../widgets/timer_circle.dart';
import '../widgets/control_buttons.dart';
import '../widgets/session_info.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Color(0xFF1A1A2E),
              Color(0xFF16213E),
              Color(0xFF0F3460),
            ],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              const SizedBox(height: 40),
              // Header
              Consumer<PomodoroTimerModel>(
                builder: (context, timer, _) {
                  return Text(
                    timer.sessionLabel,
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          color: Colors.white70,
                          fontWeight: FontWeight.w300,
                          letterSpacing: 2,
                        ),
                  );
                },
              ),
              const SizedBox(height: 8),
              const SessionInfo(),
              const Spacer(),
              // Timer Circle
              const TimerCircle(),
              const Spacer(),
              // Control Buttons
              const ControlButtons(),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }
}