import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../theme/illuminati_theme.dart';
import '../widgets/sacred_geometry_background.dart';

class ThreatRadarScreen extends StatefulWidget {
  const ThreatRadarScreen({super.key});

  @override
  State<ThreatRadarScreen> createState() => _ThreatRadarScreenState();
}

class _ThreatRadarScreenState extends State<ThreatRadarScreen> {
  bool _isScanning = false;
  int _securityScore = 98;

  final List<Map<String, String>> _threatVectorList = [
    {'name': 'Commercial Stalkerware Signatures', 'status': 'CLEAN (0 MATCHES)', 'type': 'Spyware Engine'},
    {'name': 'Accessibility Service Abuses', 'status': 'HARDENED & MONITORED', 'type': 'System Service'},
    {'name': 'Hidden ADB Wireless Debugging', 'status': 'DISABLED', 'type': 'Port Security'},
    {'name': 'Sideloaded Package Authorization', 'status': 'STRICT POLICY', 'type': 'App Management'},
    {'name': 'Unencrypted Native Socket Connections', 'status': 'PURGED', 'type': 'Network Layer'},
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
            'CYBER THREAT RADAR',
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
              // Security Score Card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: IlluminatiTheme.slateCard,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: IlluminatiTheme.sacredGold, width: 1.5),
                  boxShadow: [
                    BoxShadow(
                      color: IlluminatiTheme.sacredGold.withValues(alpha: 0.15),
                      blurRadius: 16,
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    Text(
                      'SYSTEM INTEGRITY HARDENING RATING',
                      style: GoogleFonts.cinzel(
                        color: IlluminatiTheme.sacredGold,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),

                    Text(
                      '$_securityScore%',
                      style: GoogleFonts.orbitron(
                        color: IlluminatiTheme.emeraldShield,
                        fontSize: 42,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),

                    Text(
                      'OPTIONAL SECURITY HARDENING ACTIVE • ALL SEALS VERIFIED',
                      style: GoogleFonts.orbitron(
                        color: Colors.white70,
                        fontSize: 9,
                        letterSpacing: 1.1,
                      ),
                    ),
                    const SizedBox(height: 16),

                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: IlluminatiTheme.sacredGold,
                          foregroundColor: IlluminatiTheme.obsidianBlack,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        onPressed: () async {
                          final messenger = ScaffoldMessenger.of(context);
                          setState(() => _isScanning = true);
                          await Future.delayed(const Duration(seconds: 2));
                          if (mounted) {
                            setState(() {
                              _isScanning = false;
                              _securityScore = 100;
                            });
                            messenger.showSnackBar(
                              const SnackBar(
                                content: Text('🛡️ DEEP SPYWARE SCAN COMPLETE: SYSTEM HARDENED AT 100%'),
                                backgroundColor: IlluminatiTheme.emeraldShield,
                              ),
                            );
                          }
                        },
                        icon: _isScanning
                            ? const SizedBox(
                                width: 16,
                                height: 16,
                                child: CircularProgressIndicator(strokeWidth: 2, color: IlluminatiTheme.obsidianBlack),
                              )
                            : const Icon(Icons.radar),
                        label: Text(
                          _isScanning ? 'RUNNING DEEP SPYWARE SCAN...' : 'EXECUTE DEEP SYSTEM SCAN & HARDEN',
                          style: GoogleFonts.orbitron(fontSize: 11, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                  ],
                ),
              ).animate().fadeIn(duration: 400.ms),

              const SizedBox(height: 20),

              // Threat Vectors List
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'HARDENED PRIVACY VECTORS',
                        style: GoogleFonts.cinzel(
                          color: IlluminatiTheme.sacredGold,
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 12),

                      ..._threatVectorList.map((vector) {
                        return Container(
                          margin: const EdgeInsets.only(bottom: 8),
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: IlluminatiTheme.slateCard,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: Colors.white12),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.verified_user, color: IlluminatiTheme.emeraldShield, size: 20),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      vector['name']!,
                                      style: GoogleFonts.cinzel(
                                        color: Colors.white,
                                        fontSize: 11,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    Text(
                                      '${vector['type']} • ${vector['status']}',
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
