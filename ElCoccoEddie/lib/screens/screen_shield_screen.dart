import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../theme/illuminati_theme.dart';
import '../widgets/sacred_geometry_background.dart';

class ScreenShieldScreen extends StatefulWidget {
  const ScreenShieldScreen({super.key});

  @override
  State<ScreenShieldScreen> createState() => _ScreenShieldScreenState();
}

class _ScreenShieldScreenState extends State<ScreenShieldScreen> {
  bool _flagSecureActive = true;
  bool _watermarkOverlayActive = true;
  bool _screenMirrorDetect = true;

  final List<Map<String, String>> _screenLogs = [
    {'time': '12:18 PM', 'event': 'Screen Capture FLAG_SECURE Enforced', 'detail': 'Screenshot blocked on system window', 'status': 'BLOCKED'},
    {'time': '11:30 AM', 'event': 'Screen Mirroring Stream Monitored', 'detail': 'HDMI / Cast stream verified clean', 'status': 'SAFE'},
  ];

  @override
  Widget build(BuildContext context) {
    return SacredGeometryBackground(
      child: Scaffold(
        backgroundColor: Colors.transparent,
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          elevation: 0,
          title: Text(
            'SCREEN CAPTURE SHIELD',
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
                      child: const Icon(Icons.screenshot_monitor, color: IlluminatiTheme.emeraldShield, size: 28),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'ANTI-SCREEN RECORDING ACTIVE',
                            style: GoogleFonts.orbitron(
                              color: IlluminatiTheme.emeraldShield,
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1.1,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'FLAG_SECURE window flag engaged to prevent secret screenshots & screen casting.',
                            style: GoogleFonts.orbitron(color: Colors.white70, fontSize: 10),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ).animate().fadeIn(duration: 400.ms),

              const SizedBox(height: 20),

              // Controls Card
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'SCREEN SECURITY & ANTI-SPY CASTING',
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
                          'SYSTEM FLAG_SECURE ENFORCER',
                          style: GoogleFonts.cinzel(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                        ),
                        subtitle: Text(
                          'Blocks system screenshots and background screen recording across all windows.',
                          style: GoogleFonts.orbitron(color: Colors.white60, fontSize: 9),
                        ),
                        value: _flagSecureActive,
                        onChanged: (val) => setState(() => _flagSecureActive = val),
                      ),

                      const Divider(color: Colors.white12),

                      SwitchListTile(
                        contentPadding: EdgeInsets.zero,
                        activeTrackColor: IlluminatiTheme.sacredGold,
                        title: Text(
                          'ANTI-SPY WATERMARK OBFUSCATION',
                          style: GoogleFonts.cinzel(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                        ),
                        subtitle: Text(
                          'Draws subtle micro-pattern watermark over screen to disrupt camera snapshots.',
                          style: GoogleFonts.orbitron(color: Colors.white60, fontSize: 9),
                        ),
                        value: _watermarkOverlayActive,
                        onChanged: (val) => setState(() => _watermarkOverlayActive = val),
                      ),

                      const Divider(color: Colors.white12),

                      SwitchListTile(
                        contentPadding: EdgeInsets.zero,
                        activeTrackColor: IlluminatiTheme.sacredGold,
                        title: Text(
                          'SCREEN CAST & MIRRORING DETECTOR',
                          style: GoogleFonts.cinzel(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                        ),
                        subtitle: Text(
                          'Mutes display output if external wireless display or HDMI grabber is attached.',
                          style: GoogleFonts.orbitron(color: Colors.white60, fontSize: 9),
                        ),
                        value: _screenMirrorDetect,
                        onChanged: (val) => setState(() => _screenMirrorDetect = val),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 20),

              // Screen Logs
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'SCREEN CAPTURE INTERCEPTION LOG',
                        style: GoogleFonts.cinzel(
                          color: IlluminatiTheme.sacredGold,
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 10),

                      ..._screenLogs.map((log) {
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
                              const Icon(Icons.security, color: IlluminatiTheme.sacredGold, size: 18),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      log['event']!,
                                      style: GoogleFonts.cinzel(
                                        color: Colors.white,
                                        fontSize: 11,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    Text(
                                      log['detail']!,
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
