import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';

enum StarPhase { idle, birth, growth, supernova, rest }

class StarState {
  final StarPhase phase;
  final Duration timeLeft;
  final Duration totalDuration;
  final int stardust;

  StarState({
    required this.phase,
    required this.timeLeft,
    required this.totalDuration,
    required this.stardust,
  });

  StarState copyWith({
    StarPhase? phase,
    Duration? timeLeft,
    Duration? totalDuration,
    int? stardust,
  }) {
    return StarState(
      phase: phase ?? this.phase,
      timeLeft: timeLeft ?? this.timeLeft,
      totalDuration: totalDuration ?? this.totalDuration,
      stardust: stardust ?? this.stardust,
    );
  }

  double get progress => totalDuration.inSeconds > 0 
      ? 1.0 - (timeLeft.inSeconds / totalDuration.inSeconds) 
      : 0.0;
}

class StarNotifier extends StateNotifier<StarState> {
  Timer? _timer;

  StarNotifier() : super(StarState(
    phase: StarPhase.idle,
    timeLeft: Duration.zero,
    totalDuration: Duration.zero,
    stardust: 0,
  ));

  void startFocus(Duration duration) {
    state = state.copyWith(
      phase: StarPhase.birth,
      totalDuration: duration,
      timeLeft: duration,
    );

    // Initial delay for "Star Birth" animation
    Future.delayed(const Duration(seconds: 2), () {
      if (state.phase == StarPhase.birth) {
        state = state.copyWith(phase: StarPhase.growth);
        _startTimer();
      }
    });
  }

  void _startTimer() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (state.timeLeft.inSeconds > 0) {
        state = state.copyWith(timeLeft: state.timeLeft - const Duration(seconds: 1));
      } else {
        _completeFocus();
      }
    });
  }

  void _completeFocus() {
    _timer?.cancel();
    state = state.copyWith(
      phase: StarPhase.supernova,
      stardust: state.stardust + (state.totalDuration.inMinutes * 10),
    );

    // Supernova delay before returning to idle/rest
    Future.delayed(const Duration(seconds: 5), () {
      state = state.copyWith(phase: StarPhase.rest);
    });
  }

  void reset() {
    _timer?.cancel();
    state = state.copyWith(phase: StarPhase.idle, timeLeft: Duration.zero);
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }
}

final starProvider = StateNotifierProvider<StarNotifier, StarState>((ref) {
  return StarNotifier();
});
