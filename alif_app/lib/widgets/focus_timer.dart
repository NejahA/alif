import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// A deep-work countdown that rewards the player for finishing a focus block.
///
/// [onSessionComplete] fires exactly once per finished session, with its
/// length in minutes.
class FocusTimerScreen extends StatefulWidget {
  final void Function(int minutes) onSessionComplete;

  const FocusTimerScreen({super.key, required this.onSessionComplete});

  @override
  State<FocusTimerScreen> createState() => _FocusTimerScreenState();
}

class _FocusTimerScreenState extends State<FocusTimerScreen> {
  static const List<int> _durations = [15, 25, 45];

  int _selectedMinutes = 25;
  int _remainingSeconds = 25 * 60;
  bool _isRunning = false;
  bool _isPaused = false;
  bool _isFinished = false;
  Timer? _ticker;

  int get _totalSeconds => _selectedMinutes * 60;

  double get _progress {
    if (_totalSeconds == 0) return 1;
    return (1 - (_remainingSeconds / _totalSeconds)).clamp(0.0, 1.0);
  }

  String get _clock {
    final minutes = (_remainingSeconds ~/ 60).toString().padLeft(2, '0');
    final seconds = (_remainingSeconds % 60).toString().padLeft(2, '0');
    return '$minutes:$seconds';
  }

  @override
  void dispose() {
    _ticker?.cancel();
    super.dispose();
  }

  void _selectDuration(int minutes) {
    if (_isRunning || _isPaused) return;
    setState(() {
      _selectedMinutes = minutes;
      _remainingSeconds = minutes * 60;
      _isFinished = false;
    });
  }

  void _start() {
    if (_isRunning || _isFinished) return;
    _ticker?.cancel();
    setState(() {
      _isRunning = true;
      _isPaused = false;
    });
    _ticker = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) return;
      if (_remainingSeconds > 1) {
        setState(() => _remainingSeconds -= 1);
        return;
      }
      timer.cancel();
      setState(() {
        _remainingSeconds = 0;
        _isRunning = false;
        _isFinished = true;
      });
      unawaited(HapticFeedback.mediumImpact());
      widget.onSessionComplete(_selectedMinutes);
      _showFinishedDialog();
    });
  }

  void _togglePause() {
    if (!_isRunning && !_isPaused) return;
    if (_isPaused) {
      setState(() => _isPaused = false);
      _start();
      return;
    }
    _ticker?.cancel();
    setState(() {
      _isRunning = false;
      _isPaused = true;
    });
  }

  void _abandon() {
    _ticker?.cancel();
    setState(() {
      _isRunning = false;
      _isPaused = false;
      _isFinished = false;
      _remainingSeconds = _totalSeconds;
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Session ended early — no reward this time.', style: TextStyle(fontWeight: FontWeight.bold)),
        duration: Duration(seconds: 2),
      ),
    );
  }

  void _showFinishedDialog() {
    showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (dialogContext) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        title: Row(
          children: const [
            Icon(Icons.emoji_events, color: Color(0xFFFBBF24)),
            SizedBox(width: 8),
            Flexible(
              child: Text('Focus Complete!', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
        content: Text(
          '$_selectedMinutes minutes of real focus banked. Rewards added to your point.o balance.',
          style: const TextStyle(color: Colors.white70),
        ),
        actions: [
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: const Color(0xFF8B5CF6)),
            onPressed: () {
              Navigator.pop(dialogContext);
              Navigator.pop(context);
            },
            child: const Text('BACK TO LIFE'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isBusy = _isRunning || _isPaused;

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        elevation: 0,
        title: const Text('Focus Session', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF8B5CF6).withValues(alpha: 0.15),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.bolt, color: Color(0xFFF472B6), size: 30),
                ),
                const SizedBox(height: 16),
                const Text(
                  'DEEP WORK BLOCK',
                  style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900, letterSpacing: 2),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Pick a length, start the countdown, and stay away from your phone until the ring closes.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.white60, fontSize: 13),
                ),
                const SizedBox(height: 28),
                SizedBox(
                  width: 220,
                  height: 220,
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      SizedBox(
                        width: 220,
                        height: 220,
                        child: CircularProgressIndicator(
                          value: _progress,
                          strokeWidth: 14,
                          backgroundColor: Colors.white10,
                          valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF8B5CF6)),
                        ),
                      ),
                      Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            _clock,
                            style: const TextStyle(color: Colors.white, fontSize: 46, fontWeight: FontWeight.w900),
                          ),
                          Text(
                            '$_selectedMinutes min block',
                            style: const TextStyle(color: Colors.white54, fontSize: 12, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 28),
                Wrap(
                  alignment: WrapAlignment.center,
                  spacing: 10,
                  runSpacing: 8,
                  children: _durations.map((minutes) {
                    final isSelected = _selectedMinutes == minutes;
                    return ChoiceChip(
                      label: Text('$minutes min'),
                      selected: isSelected,
                      onSelected: isBusy ? null : (_) => _selectDuration(minutes),
                      selectedColor: const Color(0xFF8B5CF6),
                      backgroundColor: const Color(0xFF1E293B),
                      labelStyle: TextStyle(
                        color: isSelected ? Colors.white : Colors.white70,
                        fontWeight: FontWeight.bold,
                      ),
                      side: const BorderSide(color: Colors.white12),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 28),
                if (!isBusy)
                  SizedBox(
                    width: double.infinity,
                    child: FilledButton.icon(
                      style: FilledButton.styleFrom(
                        backgroundColor: const Color(0xFF8B5CF6),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                      onPressed: _isFinished ? null : _start,
                      icon: const Icon(Icons.play_arrow_rounded),
                      label: Text(
                        _isFinished ? 'SESSION DONE' : 'START FOCUS',
                        style: const TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1),
                      ),
                    ),
                  )
                else
                  Row(
                    children: [
                      Expanded(
                        child: FilledButton.icon(
                          style: FilledButton.styleFrom(
                            backgroundColor: _isPaused ? const Color(0xFF10B981) : const Color(0xFF6366F1),
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          ),
                          onPressed: _togglePause,
                          icon: Icon(_isPaused ? Icons.play_arrow_rounded : Icons.pause_rounded),
                          label: Text(_isPaused ? 'RESUME' : 'PAUSE', style: const TextStyle(fontWeight: FontWeight.bold)),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: OutlinedButton.icon(
                          style: OutlinedButton.styleFrom(
                            foregroundColor: Colors.white70,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            side: const BorderSide(color: Colors.white24),
                          ),
                          onPressed: _abandon,
                          icon: const Icon(Icons.close_rounded),
                          label: const Text('END', style: TextStyle(fontWeight: FontWeight.bold)),
                        ),
                      ),
                    ],
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
