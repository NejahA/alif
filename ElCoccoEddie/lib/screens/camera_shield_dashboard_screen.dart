import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:camera/camera.dart';
import '../theme/illuminati_theme.dart';
import '../providers/privacy_shield_provider.dart';
import '../widgets/sacred_geometry_background.dart';
import '../bloc/camera/camera_bloc.dart';
import '../bloc/camera/camera_event.dart';
import '../bloc/camera/camera_state.dart';
import 'camera_filter_screen.dart';
import 'media_library_screen.dart';

class CameraShieldDashboardScreen extends StatefulWidget {
  const CameraShieldDashboardScreen({super.key});

  @override
  State<CameraShieldDashboardScreen> createState() => _CameraShieldDashboardScreenState();
}

class _CameraShieldDashboardScreenState extends State<CameraShieldDashboardScreen> {
  bool _isTestingProbe = false;

  @override
  void initState() {
    super.initState();
    final provider = context.read<PrivacyShieldProvider>();
    if (!provider.cameraBlocked) {
      context.read<CameraBloc>().add(InitializeCameraEvent());
    }
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
            'CAMERA SHIELD & GUARD',
            style: GoogleFonts.cinzel(
              color: IlluminatiTheme.sacredGold,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          centerTitle: true,
          actions: [
            IconButton(
              tooltip: 'Media Vault',
              icon: const Icon(Icons.video_library, color: IlluminatiTheme.sacredGold),
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const MediaLibraryScreen()),
                );
              },
            ),
            IconButton(
              tooltip: 'Camera Filters',
              icon: const Icon(Icons.filter_b_and_w, color: IlluminatiTheme.sacredGold),
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const CameraFilterScreen()),
                );
              },
            ),
          ],
        ),
        body: Consumer<PrivacyShieldProvider>(
          builder: (context, provider, child) {
            final isBlocked = provider.cameraBlocked;

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
                            isBlocked ? Icons.no_photography : Icons.camera_alt,
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
                                isBlocked ? 'CAMERA HARDWARE SEALED' : 'CAMERA HARDWARE EXPOSED',
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
                                    ? 'Native HAL & policy locks preventing sensor recording across all apps.'
                                    : 'Warning: Camera hardware can be accessed by authorized system apps.',
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

                  // Live Camera Test & Hardware Sensor Sandbox Card
                  _buildCameraSandboxCard(context, provider),

                  const SizedBox(height: 20),

                  // Camera Seal Controls & Mode Selector
                  _buildCameraControlsCard(context, provider),

                  const SizedBox(height: 20),

                  // Emergency Panic Button
                  _buildEmergencyPanicCard(context, provider),

                  const SizedBox(height: 20),

                  // Real-time Camera Interception & Audit Log
                  _buildCameraAuditLogCard(context, provider),

                  const SizedBox(height: 20),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildCameraSandboxCard(BuildContext context, PrivacyShieldProvider provider) {
    final isBlocked = provider.cameraBlocked;

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
                    const Icon(Icons.sensors, color: IlluminatiTheme.sacredGold, size: 22),
                    const SizedBox(width: 8),
                    Text(
                      'HARDWARE SENSOR PROBE',
                      style: GoogleFonts.cinzel(
                        color: IlluminatiTheme.sacredGold,
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: isBlocked
                        ? IlluminatiTheme.emeraldShield.withValues(alpha: 0.15)
                        : IlluminatiTheme.crimsonSeal.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(
                      color: isBlocked ? IlluminatiTheme.emeraldShield : IlluminatiTheme.crimsonSeal,
                    ),
                  ),
                  child: Text(
                    isBlocked ? 'SEALED (BUSY)' : 'ACTIVE PROBE',
                    style: GoogleFonts.orbitron(
                      color: isBlocked ? IlluminatiTheme.emeraldShield : IlluminatiTheme.crimsonSeal,
                      fontSize: 9,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Sandbox Video Viewport
            Container(
              height: 220,
              width: double.infinity,
              decoration: BoxDecoration(
                color: Colors.black,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: isBlocked ? IlluminatiTheme.emeraldShield : IlluminatiTheme.sacredGold,
                  width: 1.5,
                ),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(13),
                child: isBlocked
                    ? Stack(
                        alignment: Alignment.center,
                        children: [
                          Positioned.fill(
                            child: Container(
                              color: const Color(0xFF090A0F),
                              child: CustomPaint(
                                painter: _GridBackgroundPainter(),
                              ),
                            ),
                          ),
                          Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Container(
                                padding: const EdgeInsets.all(18),
                                decoration: BoxDecoration(
                                  color: IlluminatiTheme.emeraldShield.withValues(alpha: 0.15),
                                  shape: BoxShape.circle,
                                  border: Border.all(color: IlluminatiTheme.emeraldShield, width: 2),
                                ),
                                child: const Icon(
                                  Icons.shield,
                                  color: IlluminatiTheme.emeraldShield,
                                  size: 48,
                                ),
                              ).animate(onPlay: (controller) => controller.repeat(reverse: true)).scale(
                                    begin: const Offset(0.95, 0.95),
                                    end: const Offset(1.05, 1.05),
                                    duration: 1500.ms,
                                  ),
                              const SizedBox(height: 14),
                              Text(
                                'CAMERA HARDWARE PHYSICAL LOCK ACTIVE',
                                style: GoogleFonts.cinzel(
                                  color: IlluminatiTheme.emeraldShield,
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Camera HAL stream is occupied & sealed by ElCocco',
                                style: GoogleFonts.orbitron(
                                  color: Colors.white60,
                                  fontSize: 10,
                                ),
                              ),
                            ],
                          ),
                        ],
                      )
                    : BlocBuilder<CameraBloc, CameraState>(
                        builder: (context, state) {
                          if (state is CameraReadyState) {
                            return Stack(
                              children: [
                                Positioned.fill(
                                  child: CameraPreview(state.controller),
                                ),
                                Positioned(
                                  top: 10,
                                  left: 10,
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: Colors.black87,
                                      borderRadius: BorderRadius.circular(4),
                                      border: Border.all(color: IlluminatiTheme.sacredGold),
                                    ),
                                    child: Text(
                                      'LIVE SENSOR FEED • UNSEALED',
                                      style: GoogleFonts.orbitron(
                                        color: IlluminatiTheme.sacredGold,
                                        fontSize: 9,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ),
                                Positioned(
                                  bottom: 10,
                                  right: 10,
                                  child: ElevatedButton.icon(
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: IlluminatiTheme.sacredGold,
                                      foregroundColor: IlluminatiTheme.obsidianBlack,
                                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                      minimumSize: Size.zero,
                                    ),
                                    onPressed: () {
                                      Navigator.push(
                                        context,
                                        MaterialPageRoute(builder: (_) => const CameraFilterScreen()),
                                      );
                                    },
                                    icon: const Icon(Icons.filter, size: 14),
                                    label: Text(
                                      'FULL CAMERA FILTERS',
                                      style: GoogleFonts.orbitron(fontSize: 9, fontWeight: FontWeight.bold),
                                    ),
                                  ),
                                ),
                              ],
                            );
                          }
                          return const Center(
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                CircularProgressIndicator(color: IlluminatiTheme.sacredGold),
                                SizedBox(height: 10),
                                Text(
                                  'Initializing Hardware Camera...',
                                  style: TextStyle(color: Colors.white70, fontSize: 11),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
              ),
            ),

            const SizedBox(height: 12),

            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      foregroundColor: IlluminatiTheme.sacredGold,
                      side: const BorderSide(color: IlluminatiTheme.sacredGold),
                      padding: const EdgeInsets.symmetric(vertical: 10),
                    ),
                    onPressed: () async {
                      final messenger = ScaffoldMessenger.of(context);
                      setState(() => _isTestingProbe = true);
                      await provider.checkStatus();
                      await Future.delayed(const Duration(milliseconds: 600));
                      if (mounted) {
                        setState(() => _isTestingProbe = false);
                        messenger.showSnackBar(
                          SnackBar(
                            content: Text(
                              provider.cameraBlocked
                                  ? '✅ CAMERA HARDWARE PROBE: SENSOR CONFIRMED SEALED'
                                  : '⚠️ CAMERA HARDWARE PROBE: SENSOR ACCESSIBLE',
                            ),
                          ),
                        );
                      }
                    },
                    icon: _isTestingProbe
                        ? const SizedBox(
                            width: 14,
                            height: 14,
                            child: CircularProgressIndicator(strokeWidth: 2, color: IlluminatiTheme.sacredGold),
                          )
                        : const Icon(Icons.radar, size: 16),
                    label: Text(
                      _isTestingProbe ? 'PROBING SENSOR...' : 'RUN HARDWARE PROBE TEST',
                      style: GoogleFonts.orbitron(fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCameraControlsCard(BuildContext context, PrivacyShieldProvider provider) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'CAMERA HARDWARE SEAL ENGINE',
              style: GoogleFonts.cinzel(
                color: IlluminatiTheme.sacredGold,
                fontSize: 13,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Select physical seal policies & toggle master camera hardware lock.',
              style: GoogleFonts.orbitron(color: Colors.white70, fontSize: 10),
            ),
            const SizedBox(height: 16),

            // Big Toggle Button
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: provider.cameraBlocked
                      ? IlluminatiTheme.emeraldShield
                      : IlluminatiTheme.crimsonSeal,
                  foregroundColor: IlluminatiTheme.obsidianBlack,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                onPressed: () async {
                  final cameraBloc = context.read<CameraBloc>();
                  await provider.toggleCameraShield();
                  if (!provider.cameraBlocked) {
                    cameraBloc.add(InitializeCameraEvent());
                  } else {
                    cameraBloc.add(LockCameraEvent());
                  }
                },
                icon: Icon(
                  provider.cameraBlocked ? Icons.lock : Icons.lock_open,
                  size: 24,
                ),
                label: Text(
                  provider.cameraBlocked ? 'DISENGAGE CAMERA SEAL' : 'SEAL HARDWARE CAMERA NOW',
                  style: GoogleFonts.orbitron(
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.1,
                  ),
                ),
              ),
            ),

            const SizedBox(height: 16),

            Text(
              'LOCK ENGINE SELECTION',
              style: GoogleFonts.cinzel(
                color: IlluminatiTheme.sacredGold,
                fontSize: 11,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),

            ...CameraLockMode.values.map((mode) {
              final isSelected = provider.cameraLockMode == mode;
              final (label, desc) = switch (mode) {
                CameraLockMode.deviceAdminHAL => (
                    'Device Admin System Policy',
                    'Disables camera systemwide via Android DevicePolicyManager API.'
                  ),
                CameraLockMode.exclusiveHAL => (
                    'Exclusive Hardware HAL Pipeline Lock',
                    'Foreground lock service holds camera hardware pipeline exclusively.'
                  ),
                CameraLockMode.privacyBlindCurtain => (
                    'Software Lens Blind Curtain',
                    'Fills preview buffers with opaque black curtain layer.'
                  ),
                CameraLockMode.fortressCombined => (
                    'Cyber-Fortress Master Mode (Recommended)',
                    'Combines System Policy, Exclusive HAL Lock, and Lens Curtain.'
                  ),
              };

              return InkWell(
                onTap: () => provider.setCameraLockMode(mode),
                borderRadius: BorderRadius.circular(10),
                child: Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? IlluminatiTheme.sacredGold.withValues(alpha: 0.12)
                        : IlluminatiTheme.slateCard,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: isSelected ? IlluminatiTheme.sacredGold : Colors.white12,
                    ),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        isSelected ? Icons.radio_button_checked : Icons.radio_button_unchecked,
                        color: isSelected ? IlluminatiTheme.sacredGold : Colors.white38,
                        size: 20,
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              label,
                              style: GoogleFonts.cinzel(
                                color: isSelected ? IlluminatiTheme.sacredGold : Colors.white,
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              desc,
                              style: GoogleFonts.orbitron(color: Colors.white60, fontSize: 9),
                            ),
                          ],
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
    );
  }

  Widget _buildEmergencyPanicCard(BuildContext context, PrivacyShieldProvider provider) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: IlluminatiTheme.crimsonSeal.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: IlluminatiTheme.crimsonSeal, width: 1.5),
      ),
      child: Column(
        children: [
          Row(
            children: [
              const Icon(Icons.warning_amber_rounded, color: IlluminatiTheme.crimsonSeal, size: 28),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  'EMERGENCY PRIVACY LOCKDOWN',
                  style: GoogleFonts.cinzel(
                    color: IlluminatiTheme.crimsonSeal,
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            'Immediately lock down Camera, Microphone, Volume Buttons, and activate Ultrasonic Acoustic Cipher simultaneously.',
            style: GoogleFonts.orbitron(color: Colors.white70, fontSize: 10),
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: IlluminatiTheme.crimsonSeal,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              onPressed: () async {
                await provider.toggleEmergencyLockdown();
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('🚨 EMERGENCY LOCKDOWN TRIGGERED! ALL SHIELDS ENGAGED!'),
                      backgroundColor: IlluminatiTheme.crimsonSeal,
                    ),
                  );
                }
              },
              icon: const Icon(Icons.error_outline),
              label: Text(
                'TRIGGER EMERGENCY PANIC LOCKDOWN',
                style: GoogleFonts.orbitron(fontSize: 11, fontWeight: FontWeight.bold),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCameraAuditLogCard(BuildContext context, PrivacyShieldProvider provider) {
    final logs = provider.cameraLogs;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'CAMERA INTERCEPTION LOG (${logs.length})',
                  style: GoogleFonts.cinzel(
                    color: IlluminatiTheme.sacredGold,
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                if (logs.isNotEmpty)
                  TextButton(
                    onPressed: provider.clearCameraLogs,
                    style: TextButton.styleFrom(
                      foregroundColor: IlluminatiTheme.sacredGold,
                      padding: EdgeInsets.zero,
                    ),
                    child: Text(
                      'CLEAR LOGS',
                      style: GoogleFonts.orbitron(fontSize: 9, fontWeight: FontWeight.bold),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 8),

            logs.isEmpty
                ? Padding(
                    padding: const EdgeInsets.symmetric(vertical: 20),
                    child: Center(
                      child: Text(
                        'No camera block activity logged in this session.',
                        style: GoogleFonts.orbitron(color: Colors.white38, fontSize: 10),
                      ),
                    ),
                  )
                : ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: logs.length > 8 ? 8 : logs.length,
                    itemBuilder: (context, index) {
                      final entry = logs[index];
                      final isLock = entry.status.contains('LOCK') || entry.status.contains('SEALED');

                      return Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: IlluminatiTheme.slateCard,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: isLock
                                ? IlluminatiTheme.emeraldShield.withValues(alpha: 0.4)
                                : IlluminatiTheme.sacredGold.withValues(alpha: 0.3),
                          ),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              isLock ? Icons.shield : Icons.lock_open,
                              color: isLock ? IlluminatiTheme.emeraldShield : IlluminatiTheme.sacredGold,
                              size: 18,
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    entry.title,
                                    style: GoogleFonts.cinzel(
                                      color: Colors.white,
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  if (entry.detail.isNotEmpty)
                                    Text(
                                      entry.detail,
                                      style: GoogleFonts.orbitron(color: Colors.white60, fontSize: 9),
                                    ),
                                ],
                              ),
                            ),
                            Text(
                              _formatTime(entry.timestamp),
                              style: GoogleFonts.orbitron(color: Colors.white38, fontSize: 9),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
          ],
        ),
      ),
    );
  }

  String _formatTime(DateTime time) {
    final hour = time.hour % 12 == 0 ? 12 : time.hour % 12;
    final minute = time.minute.toString().padLeft(2, '0');
    final period = time.hour >= 12 ? 'PM' : 'AM';
    return '$hour:$minute $period';
  }
}

class _GridBackgroundPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = IlluminatiTheme.emeraldShield.withValues(alpha: 0.1)
      ..strokeWidth = 1;

    const step = 20.0;
    for (double x = 0; x < size.width; x += step) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }
    for (double y = 0; y < size.height; y += step) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
