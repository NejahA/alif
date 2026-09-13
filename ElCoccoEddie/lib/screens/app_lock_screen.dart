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
  final _pinController = TextEditingController();
  String? _errorMessage;

  @override
  void dispose() {
    _pinController.dispose();
    super.dispose();
  }

  void _unlock() {
    if (_pinController.text == _lockNumber) {
      FocusManager.instance.primaryFocus?.unfocus();
      widget.onUnlocked();
      return;
    }
    setState(() {
      _errorMessage = 'INVALID LOCK NUMBER';
      _pinController.clear();
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
                  autofocus: true,
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
                    onPressed: _unlock,
                    icon: const Icon(Icons.lock_open),
                    label: const Text('UNLOCK EL COCCO'),
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