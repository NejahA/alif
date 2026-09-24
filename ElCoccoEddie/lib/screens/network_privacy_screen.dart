import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../theme/illuminati_theme.dart';
import '../widgets/sacred_geometry_background.dart';

class NetworkPrivacyScreen extends StatefulWidget {
  const NetworkPrivacyScreen({super.key});

  @override
  State<NetworkPrivacyScreen> createState() => _NetworkPrivacyScreenState();
}

class _NetworkPrivacyScreenState extends State<NetworkPrivacyScreen> {
  bool _webRtcProtection = true;
  bool _outboundKillswitch = false;
  String _selectedDns = 'Cloudflare 1.1.1.1 (Encrypted DoH)';

  final List<Map<String, String>> _activeConnections = [
    {'dest': '172.67.182.204:443', 'proto': 'TLS v1.3', 'status': 'ENCRYPTED (STUN MUTE)', 'risk': 'SAFE'},
    {'dest': '142.250.190.46:443', 'proto': 'HTTPS / QUIC', 'status': 'DNS SEAL ACTIVE', 'risk': 'SAFE'},
    {'dest': '104.21.80.12:8080', 'proto': 'STUN / WebRTC', 'status': 'INTERCEPTED & BLOCKED', 'risk': 'INTERCEPTED'},
    {'dest': '198.51.100.42:3478', 'proto': 'TURN Relay', 'status': 'IP MASKED', 'risk': 'MASKED'},
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
            'NETWORK & WEBRTC GUARD',
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
                      child: const Icon(Icons.security, color: IlluminatiTheme.emeraldShield, size: 28),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'WEBRTC & DNS LEAK SHIELD ACTIVE',
                            style: GoogleFonts.orbitron(
                              color: IlluminatiTheme.emeraldShield,
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1.1,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Real IP address masked from WebRTC STUN probes & local DNS sniffing.',
                            style: GoogleFonts.orbitron(color: Colors.white70, fontSize: 10),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ).animate().fadeIn(duration: 400.ms),

              const SizedBox(height: 20),

              // WebRTC & Firewall Controls Card
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'WEBRTC & FIREWALL SHIELD',
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
                          'WEBRTC REAL-IP LEAK SHIELD',
                          style: GoogleFonts.cinzel(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                        ),
                        subtitle: Text(
                          'Prevents browser WebRTC candidate collection from exposing true public/VPN IP.',
                          style: GoogleFonts.orbitron(color: Colors.white60, fontSize: 9),
                        ),
                        value: _webRtcProtection,
                        onChanged: (val) => setState(() => _webRtcProtection = val),
                      ),

                      const Divider(color: Colors.white12),

                      SwitchListTile(
                        contentPadding: EdgeInsets.zero,
                        activeColor: IlluminatiTheme.crimsonSeal,
                        title: Text(
                          'OUTBOUND PRIVACY KILLSWITCH',
                          style: GoogleFonts.cinzel(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                        ),
                        subtitle: Text(
                          'Instantly blocks all unencrypted outbound traffic if VPN or secure DNS drops.',
                          style: GoogleFonts.orbitron(color: Colors.white60, fontSize: 9),
                        ),
                        value: _outboundKillswitch,
                        onChanged: (val) => setState(() => _outboundKillswitch = val),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 20),

              // Encrypted DNS Selector Card
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'ENCRYPTED DNS-OVER-HTTPS (DoH)',
                        style: GoogleFonts.cinzel(
                          color: IlluminatiTheme.sacredGold,
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Bypass ISP DNS logging and prevent domain hijacking with encrypted resolver.',
                        style: GoogleFonts.orbitron(color: Colors.white70, fontSize: 10),
                      ),
                      const SizedBox(height: 14),

                      ...[
                        'Cloudflare 1.1.1.1 (Encrypted DoH)',
                        'Quad9 9.9.9.9 (Malware & Spyware Mute)',
                        'AdGuard Privacy (Tracker Blocker DoH)',
                        'System Default DNS',
                      ].map((dns) {
                        final isSelected = _selectedDns == dns;
                        return InkWell(
                          onTap: () => setState(() => _selectedDns = dns),
                          borderRadius: BorderRadius.circular(8),
                          child: Container(
                            margin: const EdgeInsets.only(bottom: 8),
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                            decoration: BoxDecoration(
                              color: isSelected
                                  ? IlluminatiTheme.sacredGold.withValues(alpha: 0.12)
                                  : IlluminatiTheme.slateCard,
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(
                                color: isSelected ? IlluminatiTheme.sacredGold : Colors.white12,
                              ),
                            ),
                            child: Row(
                              children: [
                                Icon(
                                  isSelected ? Icons.radio_button_checked : Icons.radio_button_unchecked,
                                  color: isSelected ? IlluminatiTheme.sacredGold : Colors.white38,
                                  size: 18,
                                ),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Text(
                                    dns,
                                    style: GoogleFonts.cinzel(
                                      color: isSelected ? IlluminatiTheme.sacredGold : Colors.white,
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      }),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 20),

              // Live Connection Inspector Card
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
                            'LIVE PACKET & CONNECTION INSPECTOR',
                            style: GoogleFonts.cinzel(
                              color: IlluminatiTheme.sacredGold,
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Icon(Icons.radar, color: IlluminatiTheme.sacredGold, size: 18),
                        ],
                      ),
                      const SizedBox(height: 12),

                      ..._activeConnections.map((conn) {
                        final isIntercepted = conn['risk'] == 'INTERCEPTED';

                        return Container(
                          margin: const EdgeInsets.only(bottom: 8),
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: IlluminatiTheme.slateCard,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color: isIntercepted ? IlluminatiTheme.crimsonSeal : Colors.white12,
                            ),
                          ),
                          child: Row(
                            children: [
                              Icon(
                                isIntercepted ? Icons.block : Icons.lock_outline,
                                color: isIntercepted ? IlluminatiTheme.crimsonSeal : IlluminatiTheme.emeraldShield,
                                size: 18,
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      conn['dest']!,
                                      style: GoogleFonts.orbitron(
                                        color: Colors.white,
                                        fontSize: 11,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    Text(
                                      '${conn['proto']} • ${conn['status']}',
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
