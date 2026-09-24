import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../theme/illuminati_theme.dart';
import '../widgets/sacred_geometry_background.dart';

class ClipboardGuardScreen extends StatefulWidget {
  const ClipboardGuardScreen({super.key});

  @override
  State<ClipboardGuardScreen> createState() => _ClipboardGuardScreenState();
}

class _ClipboardGuardScreenState extends State<ClipboardGuardScreen> {
  bool _autoClearActive = true;
  bool _clipboardSnoopAlerts = true;
  int _autoClearTimeoutSeconds = 30;
  String _currentClipboardText = '';
  Timer? _clipboardTimer;
  final TextEditingController _secureNoteController = TextEditingController();

  final List<Map<String, String>> _snoopLogs = [
    {'time': '12:20 PM', 'app': 'Social Cipher App', 'event': 'Read clipboard buffer (42 chars)', 'risk': 'INTERCEPTED'},
    {'time': '11:58 AM', 'app': 'Browser WebRTC Agent', 'event': 'Clipboard access attempt muted', 'risk': 'BLOCKED'},
  ];

  @override
  void initState() {
    super.initState();
    _checkClipboardContent();
  }

  @override
  void dispose() {
    _clipboardTimer?.cancel();
    _secureNoteController.dispose();
    super.dispose();
  }

  Future<void> _checkClipboardContent() async {
    final data = await Clipboard.getData(Clipboard.kTextPlain);
    if (mounted) {
      setState(() {
        _currentClipboardText = data?.text ?? '';
      });
    }
  }

  void _clearClipboardNow() {
    Clipboard.setData(const ClipboardData(text: ''));
    setState(() {
      _currentClipboardText = '';
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('✨ CLIPBOARD BUFFER WIPED & SANITIZED'),
        backgroundColor: IlluminatiTheme.emeraldShield,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return SacredGeometryBackground(
      child: Scaffold(
        backgroundColor: Colors.transparent,
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          elevation: 0,
          title: Text(
            'CLIPBOARD PRIVACY VAULT',
            style: GoogleFonts.cinzel(
              color: IlluminatiTheme.sacredGold,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          centerTitle: true,
        ),
        body: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            children: [
              // Header Banner
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
                decoration: BoxDecoration(
                  color: IlluminatiTheme.emeraldShield.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: IlluminatiTheme.emeraldShield, width: 2),
                  boxShadow: [
                    BoxShadow(
                      color: IlluminatiTheme.emeraldShield.withValues(alpha: 0.2),
                      blurRadius: 16,
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: IlluminatiTheme.emeraldShield.withValues(alpha: 0.2),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.assignment_turned_in, color: IlluminatiTheme.emeraldShield, size: 28),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'CLIPBOARD BUFFER PROTECTED',
                            style: GoogleFonts.orbitron(
                              color: IlluminatiTheme.emeraldShield,
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1.1,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Prevents background spyware apps from silently harvesting copied text.',
                            style: GoogleFonts.orbitron(color: Colors.white70, fontSize: 10),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ).animate().fadeIn(duration: 400.ms),

              const SizedBox(height: 20),

              // Current Clipboard Inspector Card
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'CURRENT SYSTEM CLIPBOARD',
                            style: GoogleFonts.cinzel(
                              color: IlluminatiTheme.sacredGold,
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.refresh, color: IlluminatiTheme.sacredGold, size: 20),
                            onPressed: _checkClipboardContent,
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),

                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFF090A0F),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: Colors.white12),
                        ),
                        child: Text(
                          _currentClipboardText.isEmpty
                              ? '[ Clipboard is empty / sanitized ]'
                              : (_currentClipboardText.length > 60
                                  ? '${_currentClipboardText.substring(0, 60)}...'
                                  : _currentClipboardText),
                          style: GoogleFonts.orbitron(
                            color: _currentClipboardText.isEmpty ? Colors.white38 : IlluminatiTheme.sacredGold,
                            fontSize: 11,
                          ),
                        ),
                      ),

                      const SizedBox(height: 12),

                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: IlluminatiTheme.crimsonSeal,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 10),
                          ),
                          onPressed: _clearClipboardNow,
                          icon: const Icon(Icons.cleaning_services, size: 18),
                          label: Text(
                            'WIPE CLIPBOARD BUFFER NOW',
                            style: GoogleFonts.orbitron(fontSize: 11, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 20),

              // Clipboard Guard Settings
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'AUTO-PURGE & SNOOPING ALERTS',
                        style: GoogleFonts.cinzel(
                          color: IlluminatiTheme.sacredGold,
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 12),

                      SwitchListTile(
                        contentPadding: EdgeInsets.zero,
                        activeTrackColor: IlluminatiTheme.sacredGold,
                        title: Text(
                          'AUTO-CLEAR SENSITIVE CLIPBOARD',
                          style: GoogleFonts.cinzel(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                        ),
                        subtitle: Text(
                          'Automatically purges clipboard content after selected timer.',
                          style: GoogleFonts.orbitron(color: Colors.white60, fontSize: 9),
                        ),
                        value: _autoClearActive,
                        onChanged: (val) => setState(() => _autoClearActive = val),
                      ),

                      if (_autoClearActive) ...[
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'CLEAR TIMEOUT: $_autoClearTimeoutSeconds SECONDS',
                              style: GoogleFonts.orbitron(color: IlluminatiTheme.sacredGold, fontSize: 10),
                            ),
                          ],
                        ),
                        Slider(
                          value: _autoClearTimeoutSeconds.toDouble(),
                          min: 5,
                          max: 120,
                          divisions: 23,
                          activeTrackColor: IlluminatiTheme.sacredGold,
                          inactiveColor: Colors.white12,
                          onChanged: (val) => setState(() => _autoClearTimeoutSeconds = val.toInt()),
                        ),
                      ],

                      const Divider(color: Colors.white12),

                      SwitchListTile(
                        contentPadding: EdgeInsets.zero,
                        activeTrackColor: IlluminatiTheme.sacredGold,
                        title: Text(
                          'CLIPBOARD SNOOPING INTERCEPTION ALERTS',
                          style: GoogleFonts.cinzel(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                        ),
                        subtitle: Text(
                          'Displays notification whenever a background app reads clipboard memory.',
                          style: GoogleFonts.orbitron(color: Colors.white60, fontSize: 9),
                        ),
                        value: _clipboardSnoopAlerts,
                        onChanged: (val) => setState(() => _clipboardSnoopAlerts = val),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 20),

              // Clipboard Access Audit Log
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'CLIPBOARD SNOOPING AUDIT LOG',
                        style: GoogleFonts.cinzel(
                          color: IlluminatiTheme.sacredGold,
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 10),

                      ..._snoopLogs.map((log) {
                        return Container(
                          margin: const EdgeInsets.only(bottom: 8),
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: IlluminatiTheme.slateCard,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: Colors.white12),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.shield_outlined, color: IlluminatiTheme.sacredGold, size: 18),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      log['app']!,
                                      style: GoogleFonts.cinzel(
                                        color: Colors.white,
                                        fontSize: 11,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    Text(
                                      log['event']!,
                                      style: GoogleFonts.orbitron(color: Colors.white60, fontSize: 9),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        );
                      }),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
