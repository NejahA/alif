import 'dart:async';

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/illuminati_theme.dart';
import '../widgets/sacred_geometry_background.dart';
import 'home_screen.dart';

class AppLockGate extends StatefulWidget {
  const AppLockGate({super.key});

  @override
  State<AppLockGate> createState() => _AppLockGateState();
}

class _AppLockGateState extends State<AppLockGate>
    with WidgetsBindingObserver {
  bool _unlocked = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.paused ||
        state == AppLifecycleState.inactive) {
      if (mounted && _unlocked) {
        setState(() => _unlocked = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_unlocked) return const HomeScreen();
    return AppLockScreen(
      onUnlocked: () => setState(() => _unlocked = true),
    );
  }
}

class AppLockScreen extends StatefulWidget {
  final VoidCallback onUnlocked;

  const AppLockScreen({required this.onUnlocked, super.key});

  @override
  State<AppLockScreen> createState() => _AppLockScreenState();
}

class _AppLockScreenState extends State<AppLockScreen> {
  static const _lockNumber = '999';
  static const _maxAttempts = 5;
  static const _lockoutDuration = 30;
  final _pinController = TextEditingController();
  String? _errorMessage;
  Timer? _lockoutTimer;
  int _failedAttempts = 0;
  int _lockoutSecondsRemaining = 0;

  bool get _isLockedOut => _lockoutSecondsRemaining > 0;

  @override
  void dispose() {
    _lockoutTimer?.cancel();
    _pinController.dispose();
    super.dispose();
  }

  void _unlock() {
    if (_isLockedOut) return;

    if (_pinController.text == _lockNumber) {
      FocusManager.instance.primaryFocus?.unfocus();
      widget.onUnlocked();
      return;
    }

    _failedAttempts++;
    setState(() {
      if (_failedAttempts >= _maxAttempts) {
        _startLockout();
      } else {
        final remaining = _maxAttempts - _failedAttempts;
        _errorMessage = 'INVALID LOCK NUMBER • $remaining ATTEMPTS REMAINING';
      }
      _pinController.clear();
    });
  }

  void _startLockout() {
    _lockoutTimer?.cancel();
    _lockoutSecondsRemaining = _lockoutDuration;
    _errorMessage = 'TOO MANY ATTEMPTS • TRY AGAIN IN 30 SECONDS';
    _lockoutTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }
      setState(() {
        _lockoutSecondsRemaining--;
        if (_lockoutSecondsRemaining == 0) {
          timer.cancel();
          _failedAttempts = 0;
          _errorMessage = null;
        } else {
          _errorMessage =
              'TOO MANY ATTEMPTS • TRY AGAIN IN $_lockoutSecondsRemaining SECONDS';
        }
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return SacredGeometryBackground(
      child: Scaffold(
        backgroundColor: Colors.transparent,
        body: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(28),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.lock, color: IlluminatiTheme.sacredGold, size: 68),
                const SizedBox(height: 22),
                Text(
                  'EL COCCO SEALED',
                  style: GoogleFonts.cinzelDecorative(
                    color: IlluminatiTheme.sacredGold,
                    fontSize: 23,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 2,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 10),
                Text(
                  'ENTER LOCK NUMBER TO CONTINUE',
                  style: GoogleFonts.orbitron(color: Colors.white70, fontSize: 11),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 28),
                TextField(
                  controller: _pinController,
                  autofocus: !_isLockedOut,
                  enabled: !_isLockedOut,
                  obscureText: true,
                  keyboardType: TextInputType.number,
                  textAlign: TextAlign.center,
                  maxLength: 3,
                  onSubmitted: (_) => _unlock(),
                  style: GoogleFonts.orbitron(color: Colors.white, fontSize: 24, letterSpacing: 8),
                  decoration: InputDecoration(
                    counterText: '',
                    hintText: '•••',
                    hintStyle: const TextStyle(color: Colors.white30),
                    filled: true,
                    fillColor: IlluminatiTheme.slateCard,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: _isLockedOut ? null : _unlock,
                    icon: Icon(_isLockedOut ? Icons.timer : Icons.lock_open),
                    label: Text(
                      _isLockedOut
                          ? 'LOCKED $_lockoutSecondsRemaining S'
                          : 'UNLOCK EL COCCO',
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: IlluminatiTheme.sacredGold,
                      foregroundColor: IlluminatiTheme.obsidianBlack,
                      padding: const EdgeInsets.symmetric(vertical: 15),
                    ),
                  ),
                ),
                if (_errorMessage != null) ...[
                  const SizedBox(height: 14),
                  Text(
                    _errorMessage!,
                    style: GoogleFonts.orbitron(color: IlluminatiTheme.crimsonSeal, fontSize: 10),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}