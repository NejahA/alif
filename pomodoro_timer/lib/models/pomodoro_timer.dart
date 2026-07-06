import 'dart:async';
import 'package:flutter/material.dart';
import 'package:audioplayers/audioplayers.dart';

enum TimerState { idle, running, paused }

class PomodoroTimerModel extends ChangeNotifier {
  // Timer durations in seconds
  static const int workDuration = 25 * 60; // 25 minutes
  static const int shortBreakDuration = 5 * 60; // 5 minutes
  static const int longBreakDuration = 15 * 60; // 15 minutes
  static const int sessionsBeforeLongBreak = 4;

  int _timeRemaining = workDuration;
  int _totalTime = workDuration;
  TimerState _state = TimerState.idle;
  int _sessionCount = 0;
  bool _isWorkSession = true;
  Timer? _timer;
  final AudioPlayer _player = AudioPlayer();

  // Getters
  int get timeRemaining => _timeRemaining;
  int get totalTime => _totalTime;
  TimerState get state => _state;
  int get sessionCount => _sessionCount;
  bool get isWorkSession => _isWorkSession;
  double get progress => _totalTime > 0 ? 1 - (_timeRemaining / _totalTime) : 0;

  String get formattedTime {
    final minutes = (_timeRemaining ~/ 60).toString().padLeft(2, '0');
    final seconds = (_timeRemaining % 60).toString().padLeft(2, '0');
    return '$minutes:$seconds';
  }

  String get sessionLabel {
    if (_isWorkSession) return 'Focus Time';
    return 'Break Time';
  }

  String get sessionInfo {
    if (_isWorkSession) {
      return 'Session ${_sessionCount + 1}';
    }
    return 'Break';
  }

  void start() {
    if (_state == TimerState.idle) {
      _state = TimerState.running;
      _startTimer();
    } else if (_state == TimerState.paused) {
      _state = TimerState.running;
      _startTimer();
    }
    notifyListeners();
  }

  void pause() {
    if (_state == TimerState.running) {
      _state = TimerState.paused;
      _timer?.cancel();
      notifyListeners();
    }
  }

  void reset() {
    _timer?.cancel();
    _state = TimerState.idle;
    _setSessionDuration();
    notifyListeners();
  }

  void skip() {
    _timer?.cancel();
    _timeRemaining = 0;
    _handleSessionComplete();
    notifyListeners();
  }

  void _startTimer() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (_timeRemaining > 0) {
        _timeRemaining--;
        notifyListeners();
      } else {
        _timer?.cancel();
        _handleSessionComplete();
        notifyListeners();
      }
    });
  }

  Future<void> _handleSessionComplete() async {
    await _playNotificationSound();

    if (_isWorkSession) {
      _sessionCount++;
      _isWorkSession = false;
      if (_sessionCount % sessionsBeforeLongBreak == 0) {
        _totalTime = longBreakDuration;
      } else {
        _totalTime = shortBreakDuration;
      }
    } else {
      _isWorkSession = true;
      _totalTime = workDuration;
    }
    _timeRemaining = _totalTime;
    _state = TimerState.idle;
  }

  Future<void> _playNotificationSound() async {
    try {
      await _player.play(AssetSource('sounds/notification.mp3'));
    } catch (e) {
      // Sound file not available, silently continue
    }
  }

  void _setSessionDuration() {
    if (_isWorkSession) {
      _totalTime = workDuration;
    } else {
      if (_sessionCount > 0 && _sessionCount % sessionsBeforeLongBreak == 0) {
        _totalTime = longBreakDuration;
      } else {
        _totalTime = shortBreakDuration;
      }
    }
    _timeRemaining = _totalTime;
  }

  @override
  void dispose() {
    _timer?.cancel();
    _player.dispose();
    super.dispose();
  }
}