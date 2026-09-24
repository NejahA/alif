import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../theme/illuminati_theme.dart';
import '../widgets/sacred_geometry_background.dart';

class SensorPrivacyScreen extends StatefulWidget {
  const SensorPrivacyScreen({super.key});

  @override
  State<SensorPrivacyScreen> createState() => _SensorPrivacyScreenState();
}

class _SensorPrivacyScreenState extends State<SensorPrivacyScreen> {
  bool _gpsSealActive = true;
  bool _motionGuardActive = true;
  bool _bluetoothRadarActive = true;
  bool _telemetryMuteActive = true;
  bool _isScanningRadar = false;

  final List<Map<String, String>> _detectedTrackers = [
    {'name': 'Unknown BLE Beacon (MAC: 4A:89:C2:10)', 'type': 'BLE Proximity Tracker', 'rssi': '-64 dBm', 'status': 'MONITORED'},
    {'name': 'SmartTag Companion Probe', 'type': 'Nearby Tag Sensor', 'rssi': '-82 dBm', 'status': 'BLOCKED'},
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
            'SENSOR PRIVACY MATRIX',
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
              // Matrix Header Banner
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
                      child: const Icon(Icons.sensors_off, color: IlluminatiTheme.emeraldShield, size: 28),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'HARDWARE SENSOR MATRIX SEALED',
                            style: GoogleFonts.orbitron(
                              color: IlluminatiTheme.emeraldShield,
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1.1,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'GPS, Gyroscope motion telemetry & Bluetooth tracker scans shielded.',
                            style: GoogleFonts.orbitron(color: Colors.white70, fontSize: 10),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ).animate().fadeIn(duration: 400.ms),

              const SizedBox(height: 20),

              // Hardware Sensor Controls Card
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'HARDWARE SENSOR PRIVACY TOGGLES',
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
                          'LOCATION & GPS HARDWARE SEAL',
                          style: GoogleFonts.cinzel(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                        ),
                        subtitle: Text(
                          'Mutes precise GPS location hardware requests from high-risk apps.',
                          style: GoogleFonts.orbitron(color: Colors.white60, fontSize: 9),
                        ),
                        value: _gpsSealActive,
                        onChanged: (val) => setState(() => _gpsSealActive = val),
                      ),

                      const Divider(color: Colors.white12),

                      SwitchListTile(
                        contentPadding: EdgeInsets.zero,
                        activeTrackColor: IlluminatiTheme.sacredGold,
                        title: Text(
                          'MOTION SENSOR EAVESDROPPING GUARD',
                          style: GoogleFonts.cinzel(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                        ),
                        subtitle: Text(
                          'Prevents gyroscope/accelerometer vibration analysis & keystroke logging.',
                          style: GoogleFonts.orbitron(color: Colors.white60, fontSize: 9),
                        ),
                        value: _motionGuardActive,
                        onChanged: (val) => setState(() => _motionGuardActive = val),
                      ),

                      const Divider(color: Colors.white12),

                      SwitchListTile(
                        contentPadding: EdgeInsets.zero,
                        activeTrackColor: IlluminatiTheme.sacredGold,
                        title: Text(
                          'AD-ID TELEMETRY MUTE',
                          style: GoogleFonts.cinzel(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                        ),
                        subtitle: Text(
                          'Zeroes out Google Advertising ID and system analytics tracking beacons.',
                          style: GoogleFonts.orbitron(color: Colors.white60, fontSize: 9),
                        ),
                        value: _telemetryMuteActive,
                        onChanged: (val) => setState(() => _telemetryMuteActive = val),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 20),

              // Bluetooth & AirTag Radar Scanner Card
              Card(
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
                              const Icon(Icons.bluetooth_searching, color: IlluminatiTheme.sacredGold, size: 20),
                              const SizedBox(width: 8),
                              Text(
                                'BLUETOOTH & AIRTAG RADAR',
                                style: GoogleFonts.cinzel(
                                  color: IlluminatiTheme.sacredGold,
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                          Switch(
                            activeTrackColor: IlluminatiTheme.sacredGold,
                            value: _bluetoothRadarActive,
                            onChanged: (val) => setState(() => _bluetoothRadarActive = val),
                          ),
                        ],
                      ),
                      Text(
                        'Scans for unauthorized BLE beacons, AirTags, and hidden tracking devices.',
                        style: GoogleFonts.orbitron(color: Colors.white70, fontSize: 10),
                      ),
                      const SizedBox(height: 14),

                      SizedBox(
                        width: double.infinity,
                        child: OutlinedButton.icon(
                          style: OutlinedButton.styleFrom(
                            foregroundColor: IlluminatiTheme.sacredGold,
                            side: const BorderSide(color: IlluminatiTheme.sacredGold),
                            padding: const EdgeInsets.symmetric(vertical: 10),
                          ),
                          onPressed: () async {
                            final messenger = ScaffoldMessenger.of(context);
                            setState(() => _isScanningRadar = true);
                            await Future.delayed(const Duration(seconds: 2));
                            if (mounted) {
                              setState(() => _isScanningRadar = false);
                              messenger.showSnackBar(
                                const SnackBar(
                                  content: Text('✅ RADAR SCAN COMPLETE: NO NEW SUSPICIOUS BEACONS'),
                                ),
                              );
                            }
                          },
                          icon: _isScanningRadar
                              ? const SizedBox(
                                  width: 14,
                                  height: 14,
                                  child: CircularProgressIndicator(strokeWidth: 2, color: IlluminatiTheme.sacredGold),
                                )
                              : const Icon(Icons.radar, size: 16),
                          label: Text(
                            _isScanningRadar ? 'SCANNING NEARBY BEACONS...' : 'RUN LIVE RADAR SCAN',
                            style: GoogleFonts.orbitron(fontSize: 10, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ),

                      const SizedBox(height: 14),

                      ..._detectedTrackers.map((device) {
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
                              const Icon(Icons.track_changes, color: IlluminatiTheme.sacredGold, size: 18),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      device['name']!,
                                      style: GoogleFonts.cinzel(
                                        color: Colors.white,
                                        fontSize: 11,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    Text(
                                      '${device['type']} • Signal: ${device['rssi']}',
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
