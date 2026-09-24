import 'dart:math';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../theme/illuminati_theme.dart';
import '../providers/privacy_shield_provider.dart';
import '../widgets/sacred_geometry_background.dart';

class MicrophoneShieldScreen extends StatefulWidget {
  const MicrophoneShieldScreen({super.key});

  @override
  State<MicrophoneShieldScreen> createState() => _MicrophoneShieldScreenState();
}

class _MicrophoneShieldScreenState extends State<MicrophoneShieldScreen> with SingleTickerProviderStateMixin {
  late AnimationController _animController;
  final Random _random = Random();
  final List<double> _waveformBars = List.generate(24, (index) => 0.2);

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 150),
    )..addListener(() {
        if (mounted) {
          setState(() {
            final provider = context.read<PrivacyShieldProvider>();
            final isJamming = provider.acousticJammerActive;
            final isBlocked = provider.micBlocked;

            for (int i = 0; i < _waveformBars.length; i++) {
              if (isBlocked) {
                _waveformBars[i] = 0.05;
              } else if (isJamming) {
                _waveformBars[i] = 0.4 + _random.nextDouble() * 0.55;
              } else {
                _waveformBars[i] = 0.15 + _random.nextDouble() * 0.35;
              }
            }
          });
        }
      });
    _animController.repeat();
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
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
            'MICROPHONE PRIVACY GUARD',
            style: GoogleFonts.cinzel(
              color: IlluminatiTheme.sacredGold,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          centerTitle: true,
        ),
        body: Consumer<PrivacyShieldProvider>(
          builder: (context, provider, child) {
            final isBlocked = provider.micBlocked;

            return SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  // Status Banner
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
                    decoration: BoxDecoration(
                      color: isBlocked
                          ? IlluminatiTheme.emeraldShield.withValues(alpha: 0.15)
                          : IlluminatiTheme.crimsonSeal.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: isBlocked ? IlluminatiTheme.emeraldShield : IlluminatiTheme.crimsonSeal,
                        width: 2,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: (isBlocked ? IlluminatiTheme.emeraldShield : IlluminatiTheme.crimsonSeal)
                              .withValues(alpha: 0.2),
                          blurRadius: 16,
                          spreadRadius: 1,
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: (isBlocked ? IlluminatiTheme.emeraldShield : IlluminatiTheme.crimsonSeal)
                                .withValues(alpha: 0.2),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            isBlocked ? Icons.mic_off : Icons.mic,
                            color: isBlocked ? IlluminatiTheme.emeraldShield : IlluminatiTheme.crimsonSeal,
                            size: 28,
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                isBlocked ? 'MICROPHONE SENSOR SEALED' : 'MICROPHONE HARDWARE EXPOSED',
                                style: GoogleFonts.orbitron(
                                  color: isBlocked ? IlluminatiTheme.emeraldShield : IlluminatiTheme.crimsonSeal,
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 1.1,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                isBlocked
                                    ? 'Hardware audio stream muted & locked in communication mode.'
                                    : 'Warning: Background apps & voice assistants can access audio input.',
                                style: GoogleFonts.orbitron(
                                  color: Colors.white70,
                                  fontSize: 10,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ).animate().fadeIn(duration: 400.ms),

                  const SizedBox(height: 20),

                  // Real-time Audio Spectrum & Frequency Analyzer
                  _buildSpectrumCard(context, provider),

                  const SizedBox(height: 20),

                  // Microphone Controls & Ultrasonic Cipher
                  _buildMicControlsCard(context, provider),

                  const SizedBox(height: 20),

                  // Eavesdropping Threat Detector Log
                  _buildEavesdroppingLogCard(context),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildSpectrumCard(BuildContext context, PrivacyShieldProvider provider) {
    final isBlocked = provider.micBlocked;
    final isJamming = provider.acousticJammerActive;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.graphic_eq, color: IlluminatiTheme.sacredGold, size: 22),
                    const SizedBox(width: 8),
                    Text(
                      'AUDIO FREQUENCY SPECTRUM',
                      style: GoogleFonts.cinzel(
                        color: IlluminatiTheme.sacredGold,
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                Text(
                  isBlocked ? 'SEALED (MUTED)' : (isJamming ? 'CIPHER ACTIVE' : 'MONITORING'),
                  style: GoogleFonts.orbitron(
                    color: isBlocked
                        ? IlluminatiTheme.emeraldShield
                        : (isJamming ? IlluminatiTheme.sacredGold : Colors.white70),
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Waveform Box
            Container(
              height: 120,
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: const Color(0xFF090A0F),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: isBlocked ? IlluminatiTheme.emeraldShield : IlluminatiTheme.sacredGold,
                  width: 1.5,
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: List.generate(_waveformBars.length, (index) {
                  final val = _waveformBars[index];
                  final color = isBlocked
                      ? IlluminatiTheme.emeraldShield
                      : (isJamming ? IlluminatiTheme.sacredGold : Colors.cyanAccent);
                  return AnimatedContainer(
                    duration: const Duration(milliseconds: 100),
                    width: 6,
                    height: 90 * val,
                    decoration: BoxDecoration(
                      color: color,
                      borderRadius: BorderRadius.circular(3),
                      boxShadow: [
                        BoxShadow(
                          color: color.withValues(alpha: 0.5),
                          blurRadius: 4,
                        ),
                      ],
                    ),
                  );
                }),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMicControlsCard(BuildContext context, PrivacyShieldProvider provider) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'MICROPHONE HARDWARE SEAL',
              style: GoogleFonts.cinzel(
                color: IlluminatiTheme.sacredGold,
                fontSize: 13,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Mute system microphone hardware and block background recording threads.',
              style: GoogleFonts.orbitron(color: Colors.white70, fontSize: 10),
            ),
            const SizedBox(height: 16),

            // Master Mic Toggle Button
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: provider.micBlocked
                      ? IlluminatiTheme.emeraldShield
                      : IlluminatiTheme.crimsonSeal,
                  foregroundColor: IlluminatiTheme.obsidianBlack,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                onPressed: () => provider.toggleMicShield(),
                icon: Icon(
                  provider.micBlocked ? Icons.mic_off : Icons.mic,
                  size: 22,
                ),
                label: Text(
                  provider.micBlocked ? 'DISENGAGE MICROPHONE SEAL' : 'SEAL MICROPHONE NOW',
                  style: GoogleFonts.orbitron(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.1,
                  ),
                ),
              ),
            ),

            const SizedBox(height: 20),
            const Divider(color: Colors.white12),
            const SizedBox(height: 12),

            // Acoustic Jammer Switch
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              activeTrackColor: IlluminatiTheme.sacredGold,
              title: Text(
                'ULTRASONIC ACOUSTIC CIPHER',
                style: GoogleFonts.cinzel(
                  color: IlluminatiTheme.sacredGold,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
              subtitle: Text(
                'Emits high-frequency ultrasonic noise to confuse physical spy microphones.',
                style: GoogleFonts.orbitron(color: Colors.white60, fontSize: 9),
              ),
              value: provider.acousticJammerActive,
              onChanged: (val) => provider.toggleAcousticJammer(),
            ),

            if (provider.acousticJammerActive) ...[
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'CIPHER FREQUENCY: ${(provider.jammerFrequency / 1000).toStringAsFixed(1)} kHz',
                    style: GoogleFonts.orbitron(
                      color: IlluminatiTheme.sacredGold,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    'ULTRASONIC RANGE',
                    style: GoogleFonts.orbitron(color: Colors.white38, fontSize: 9),
                  ),
                ],
              ),
              Slider(
                value: provider.jammerFrequency,
                min: 18000.0,
                max: 22000.0,
                divisions: 40,
                activeColor: IlluminatiTheme.sacredGold,
                inactiveColor: Colors.white12,
                onChanged: (val) => provider.setJammerFrequency(val),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildEavesdroppingLogCard(BuildContext context) {
    final auditLogs = [
      {'time': '12:14 PM', 'app': 'Voice Assistant', 'event': 'Microphone focus trap active', 'risk': 'SAFE'},
      {'time': '12:02 PM', 'app': 'Social Cipher App', 'event': 'Background mic handle blocked', 'risk': 'BLOCKED'},
      {'time': '11:45 AM', 'app': 'System Audio Service', 'event': 'Audio record initialisation captured', 'risk': 'PREVENTED'},
    ];

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'MIC ACCESS INTERCEPTION AUDIT',
              style: GoogleFonts.cinzel(
                color: IlluminatiTheme.sacredGold,
                fontSize: 13,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 10),

            ...auditLogs.map((log) {
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
                    const Icon(Icons.shield_outlined, color: IlluminatiTheme.sacredGold, size: 16),
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
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                      decoration: BoxDecoration(
                        color: IlluminatiTheme.emeraldShield.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(4),
                        border: Border.all(color: IlluminatiTheme.emeraldShield),
                      ),
                      child: Text(
                        log['risk']!,
                        style: GoogleFonts.orbitron(
                          color: IlluminatiTheme.emeraldShield,
                          fontSize: 8,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
              );
            }),
          ],
        ),
      ),
    );
  }
}
