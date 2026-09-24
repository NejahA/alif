import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/illuminati_theme.dart';
import '../providers/privacy_shield_provider.dart';
import '../widgets/illuminati_eye_painter.dart';
import '../widgets/sacred_geometry_background.dart';
import '../services/native_blocker_service.dart';
import 'camera_shield_dashboard_screen.dart';
import 'camera_filter_screen.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/camera/camera_bloc.dart';
import '../bloc/camera/camera_state.dart';
import 'app_audit_screen.dart';
import 'acoustic_jammer_screen.dart';
import 'stealth_settings_screen.dart';
import 'microphone_shield_screen.dart';
import 'network_privacy_screen.dart';
import 'sensor_privacy_screen.dart';
import 'clipboard_guard_screen.dart';
import 'screen_shield_screen.dart';
import 'threat_radar_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SacredGeometryBackground(
      child: Scaffold(
        backgroundColor: Colors.transparent,
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          elevation: 0,
          centerTitle: true,
          title: Text(
            'EL COCCO',
            style: GoogleFonts.cinzelDecorative(
              color: IlluminatiTheme.sacredGold,
              fontSize: 22,
              fontWeight: FontWeight.bold,
              letterSpacing: 2.5,
            ),
          ),
          actions: [
            IconButton(
              tooltip: 'Emergency Panic Lockdown',
              icon: const Icon(Icons.warning_amber_rounded, color: IlluminatiTheme.crimsonSeal),
              onPressed: () async {
                final provider = context.read<PrivacyShieldProvider>();
                await provider.toggleEmergencyLockdown();
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('🚨 EMERGENCY PANIC LOCKDOWN ACTIVATED! ALL SHIELDS SEALED!'),
                      backgroundColor: IlluminatiTheme.crimsonSeal,
                    ),
                  );
                }
              },
            ),
            IconButton(
              icon: const Icon(Icons.security, color: IlluminatiTheme.sacredGold),
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const StealthSettingsScreen()),
                );
              },
            ),
          ],
        ),
        body: Consumer<PrivacyShieldProvider>(
          builder: (context, provider, child) {
            return RefreshIndicator(
              color: IlluminatiTheme.sacredGold,
              backgroundColor: IlluminatiTheme.slateCard,
              onRefresh: provider.checkStatus,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                child: Column(
                children: [
                  // Status Banner
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
                    decoration: BoxDecoration(
                      color: provider.masterLockActive
                          ? IlluminatiTheme.emeraldShield.withValues(alpha: 0.12)
                          : IlluminatiTheme.crimsonSeal.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: provider.masterLockActive
                            ? IlluminatiTheme.emeraldShield
                            : IlluminatiTheme.crimsonSeal,
                        width: 1.5,
                      ),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          provider.masterLockActive
                              ? Icons.visibility_off
                              : Icons.visibility,
                          color: provider.masterLockActive
                              ? IlluminatiTheme.emeraldShield
                              : IlluminatiTheme.crimsonSeal,
                          size: 22,
                        ),
                        const SizedBox(width: 10),
                        Text(
                          provider.masterLockActive
                              ? 'PRIVACY SHIELD ACTIVE'
                              : 'PRIVACY SHIELD READY',
                          style: GoogleFonts.orbitron(
                            color: provider.masterLockActive
                                ? IlluminatiTheme.emeraldShield
                                : IlluminatiTheme.crimsonSeal,
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.2,
                          ),
                        ),
                      ],
                    ),
                  ).animate().fadeIn(duration: 500.ms).slideY(begin: -0.2, end: 0),
                  // Device Admin Prompt Banner if not active
                  if (!provider.isDeviceAdminActive)
                    Container(
                      margin: const EdgeInsets.only(bottom: 16),
                      width: double.infinity,
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: IlluminatiTheme.amberGlow.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: IlluminatiTheme.sacredGold, width: 1.5),
                      ),
                      child: Column(
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.admin_panel_settings, color: IlluminatiTheme.sacredGold, size: 28),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Text(
                                  'GRANT DEVICE ADMIN TO SEAL CAMERA HARDWARE',
                                  style: GoogleFonts.cinzel(
                                    color: IlluminatiTheme.sacredGold,
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 10),
                          Row(
                            children: [
                              Expanded(
                                child: ElevatedButton(
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: IlluminatiTheme.sacredGold,
                                    foregroundColor: IlluminatiTheme.obsidianBlack,
                                    padding: const EdgeInsets.symmetric(vertical: 10),
                                  ),
                                  onPressed: () async {
                                    await provider.requestDeviceAdmin();
                                  },
                                  child: Text(
                                    'ACTIVATE DEVICE ADMIN',
                                    style: GoogleFonts.orbitron(fontSize: 10, fontWeight: FontWeight.bold),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: OutlinedButton(
                                  style: OutlinedButton.styleFrom(
                                    foregroundColor: IlluminatiTheme.sacredGold,
                                    side: const BorderSide(color: IlluminatiTheme.sacredGold),
                                    padding: const EdgeInsets.symmetric(vertical: 10),
                                  ),
                                  onPressed: () async {
                                    await NativeBlockerService.openPrivacySettings();
                                  },
                                  child: Text(
                                    'OS PRIVACY SETTINGS',
                                    style: GoogleFonts.orbitron(fontSize: 10, fontWeight: FontWeight.bold),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ).animate().fadeIn(duration: 400.ms),

                  // Display Over Other Apps Prompt Banner if not granted
                  if (!provider.canDrawOverlays)
                    Container(
                      margin: const EdgeInsets.only(bottom: 16),
                      width: double.infinity,
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: IlluminatiTheme.cyberCyan.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: IlluminatiTheme.cyberCyan, width: 1.5),
                      ),
                      child: Column(
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.layers, color: IlluminatiTheme.cyberCyan, size: 28),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Text(
                                  'ALLOW DISPLAY OVER OTHER APPS FOR FLOATING SHIELD',
                                  style: GoogleFonts.cinzel(
                                    color: IlluminatiTheme.cyberCyan,
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 10),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: IlluminatiTheme.cyberCyan,
                                foregroundColor: IlluminatiTheme.obsidianBlack,
                                padding: const EdgeInsets.symmetric(vertical: 10),
                              ),
                              onPressed: () async {
                                await provider.requestOverlayPermission();
                              },
                              child: Text(
                                'GRANT DISPLAY OVER OTHER APPS',
                                style: GoogleFonts.orbitron(fontSize: 11, fontWeight: FontWeight.bold),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ).animate().fadeIn(duration: 400.ms),

                  const SizedBox(height: 24),

                  // Central Illuminati Eye Node
                  IlluminatiEyeWidget(
                    isShielded: provider.masterLockActive,
                    onTap: () {
                      provider.toggleMasterLock();
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(
                            provider.masterLockActive
                                ? '✨ Illuminati Privacy Lock Activated'
                                : '⚠️ Privacy Shields Unsealed',
                          ),
                          duration: const Duration(seconds: 2),
                        ),
                      );
                    },
                  ),

                  const SizedBox(height: 12),

                  Text(
                    'TAP TRIANGLE TO TOGGLE MASTER SEAL',
                    style: GoogleFonts.cinzel(
                      color: IlluminatiTheme.sacredGold.withValues(alpha: 0.8),
                      fontSize: 11,
                      letterSpacing: 1.5,
                    ),
                  ),

                  const SizedBox(height: 28),

                  // Individual Camera, Microphone & Volume Button Seal Toggles
                  Row(
                    children: [
                      Expanded(
                        child: _buildShieldToggleCard(
                          context: context,
                          title: 'CAM BLOCK',
                          subtitle: provider.cameraBlocked ? 'SEALED' : 'EXPOSED',
                          icon: provider.cameraBlocked ? Icons.no_photography : Icons.camera_alt,
                          isActive: provider.cameraBlocked,
                          activeColor: IlluminatiTheme.emeraldShield,
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (_) => const CameraShieldDashboardScreen()),
                            );
                          },
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: BlocConsumer<CameraBloc, CameraState>(
                          listener: (context, cameraState) {},
                          builder: (context, cameraState) {
                            return _buildShieldToggleCard(
                              context: context,
                              title: 'CAM FILTER',
                              subtitle: provider.cameraFilter == CameraFilter.fullScreen
                                  ? 'FULL SCREEN'
                                  : provider.cameraFilter.name.toUpperCase(),
                              icon: Icons.filter_b_and_w,
                              isActive: provider.cameraFilter != CameraFilter.none,
                              activeColor: IlluminatiTheme.sacredGold,
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(builder: (_) => const CameraFilterScreen()),
                                );
                              },
                            );
                          },
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: _buildShieldToggleCard(
                          context: context,
                          title: 'MIC SEAL',
                          subtitle: provider.micBlocked ? 'BLOCKED' : 'EXPOSED',
                          icon: Icons.mic_off,
                          isActive: provider.micBlocked,
                          activeColor: IlluminatiTheme.cyberCyan,
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (_) => const MicrophoneShieldScreen()),
                            );
                          },
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: _buildShieldToggleCard(
                          context: context,
                          title: 'VOL TRAP',
                          subtitle: provider.volumeButtonsBlocked ? 'TRAPPED' : 'ACTIVE',
                          icon: Icons.volume_off,
                          isActive: provider.volumeButtonsBlocked,
                          activeColor: IlluminatiTheme.amberGlow,
                          onTap: provider.toggleVolumeButtonsShield,
                        ),
                      ),
                    ],
                  ).animate().fadeIn(delay: 200.ms),

                  const SizedBox(height: 20),

                  // Threat Stats Card
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: IlluminatiTheme.amberGlow.withValues(alpha: 0.15),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.shield_outlined,
                              color: IlluminatiTheme.sacredGold,
                              size: 28,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'INTERCEPTED ATTEMPTS',
                                  style: GoogleFonts.cinzel(
                                    color: IlluminatiTheme.sacredGold,
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  '${provider.blockedAttemptsCount} Spyware Probe Attacks Neutralized',
                                  style: GoogleFonts.orbitron(
                                    color: Colors.white70,
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ).animate().fadeIn(delay: 300.ms),

                  const SizedBox(height: 24),

                    _buildPrivacyPostureCard(context, provider)
                      .animate()
                      .fadeIn(delay: 350.ms)
                      .slideY(begin: 0.08, end: 0),

                    const SizedBox(height: 24),

                  // Quick Action Buttons - Grid Row 1
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      _buildQuickActionButton(
                        context: context,
                        icon: Icons.no_photography,
                        label: 'Cam Blocker',
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const CameraShieldDashboardScreen()),
                          );
                        },
                      ),
                      _buildQuickActionButton(
                        context: context,
                        icon: Icons.mic_off,
                        label: 'Mic Guard',
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const MicrophoneShieldScreen()),
                          );
                        },
                      ),
                      _buildQuickActionButton(
                        context: context,
                        icon: Icons.wifi_tethering,
                        label: 'Net Shield',
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const NetworkPrivacyScreen()),
                          );
                        },
                      ),
                    ],
                  ).animate().fadeIn(delay: 400.ms),

                  const SizedBox(height: 12),

                  // Quick Action Buttons - Grid Row 2
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      _buildQuickActionButton(
                        context: context,
                        icon: Icons.sensors_off,
                        label: 'Sensor Matrix',
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const SensorPrivacyScreen()),
                          );
                        },
                      ),
                      _buildQuickActionButton(
                        context: context,
                        icon: Icons.assignment_turned_in,
                        label: 'Clipboard Vault',
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const ClipboardGuardScreen()),
                          );
                        },
                      ),
                      _buildQuickActionButton(
                        context: context,
                        icon: Icons.screenshot_monitor,
                        label: 'Screen Shield',
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const ScreenShieldScreen()),
                          );
                        },
                      ),
                    ],
                  ).animate().fadeIn(delay: 450.ms),

                  const SizedBox(height: 12),

                  // Quick Action Buttons - Grid Row 3
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      _buildQuickActionButton(
                        context: context,
                        icon: Icons.verified_user,
                        label: 'Threat Radar',
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const ThreatRadarScreen()),
                          );
                        },
                      ),
                      _buildQuickActionButton(
                        context: context,
                        icon: Icons.radar,
                        label: 'Threat Audit',
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const AppAuditScreen()),
                          );
                        },
                      ),
                      _buildQuickActionButton(
                        context: context,
                        icon: Icons.graphic_eq,
                        label: 'Acoustic Jam',
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const AcousticJammerScreen()),
                          );
                        },
                      ),
                    ],
                  ).animate().fadeIn(delay: 500.ms),
                ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildShieldToggleCard({
    required BuildContext context,
    required String title,
    required String subtitle,
    required IconData icon,
    required bool isActive,
    required Color activeColor,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
        decoration: BoxDecoration(
          color: isActive
              ? activeColor.withValues(alpha: 0.1)
              : IlluminatiTheme.slateCard,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isActive ? activeColor : IlluminatiTheme.sacredGold.withValues(alpha: 0.2),
            width: 1.8,
          ),
          boxShadow: isActive
              ? [
                  BoxShadow(
                    color: activeColor.withValues(alpha: 0.2),
                    blurRadius: 12,
                    spreadRadius: 1,
                  ),
                ]
              : [],
        ),
        child: Column(
          children: [
            Icon(
              icon,
              size: 32,
              color: isActive ? activeColor : Colors.white38,
            ),
            const SizedBox(height: 12),
            Text(
              title,
              style: GoogleFonts.cinzel(
                color: IlluminatiTheme.sacredGold,
                fontSize: 13,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              subtitle,
              style: GoogleFonts.orbitron(
                color: isActive ? activeColor : IlluminatiTheme.crimsonSeal,
                fontSize: 11,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPrivacyPostureCard(BuildContext context, PrivacyShieldProvider provider) {
    var score = 0;
    if (provider.cameraBlocked) score += 25;
    if (provider.micBlocked) score += 25;
    if (provider.volumeButtonsBlocked) score += 15;
    if (provider.isDeviceAdminActive) score += 20;
    if (provider.canDrawOverlays) score += 15;

    final scoreColor = score >= 80
        ? IlluminatiTheme.emeraldShield
        : score >= 50
            ? IlluminatiTheme.amberGlow
            : IlluminatiTheme.crimsonSeal;
    final status = score >= 80
        ? 'FORTIFIED'
        : score >= 50
            ? 'PARTIALLY SEALED'
            : 'EXPOSED';
    final String? recommendation;
    final VoidCallback? recommendationAction;
    if (!provider.isDeviceAdminActive) {
      recommendation = 'Activate device admin to strengthen hardware control';
      recommendationAction = provider.requestDeviceAdmin;
    } else if (!provider.cameraBlocked) {
      recommendation = 'Seal the camera hardware';
      recommendationAction = provider.toggleCameraShield;
    } else if (!provider.micBlocked) {
      recommendation = 'Seal microphone access';
      recommendationAction = provider.toggleMicShield;
    } else if (!provider.volumeButtonsBlocked) {
      recommendation = 'Enable the volume button trap';
      recommendationAction = provider.toggleVolumeButtonsShield;
    } else if (!provider.canDrawOverlays) {
      recommendation = 'Allow overlay access for the floating shield';
      recommendationAction = provider.requestOverlayPermission;
    } else {
      recommendation = null;
      recommendationAction = null;
    }
    final criticalThreatCount = provider.auditedApps
        .where((app) => app.risk == ThreatLevel.critical)
        .length;
    final outstandingThreatCount = provider.auditedApps.where((app) => !app.acknowledged).length;
    final acknowledgedThreatCount = provider.auditedApps.length - outstandingThreatCount;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'PRIVACY POSTURE',
                        style: GoogleFonts.cinzel(
                          color: IlluminatiTheme.sacredGold,
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        status,
                        style: GoogleFonts.orbitron(
                          color: scoreColor,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
                Text(
                  '$score%',
                  style: GoogleFonts.orbitron(
                    color: scoreColor,
                    fontSize: 26,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            ClipRRect(
              borderRadius: BorderRadius.circular(6),
              child: LinearProgressIndicator(
                value: score / 100,
                minHeight: 8,
                backgroundColor: Colors.white12,
                valueColor: AlwaysStoppedAnimation<Color>(scoreColor),
              ),
            ),
            const SizedBox(height: 14),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                _buildPostureIndicator('CAMERA', provider.cameraBlocked, scoreColor),
                _buildPostureIndicator('MIC', provider.micBlocked, scoreColor),
                _buildPostureIndicator('VOLUME', provider.volumeButtonsBlocked, scoreColor),
                _buildPostureIndicator('ADMIN', provider.isDeviceAdminActive, scoreColor),
                _buildPostureIndicator('OVERLAY', provider.canDrawOverlays, scoreColor),
              ],
            ),
            const SizedBox(height: 12),
            InkWell(
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const AppAuditScreen()),
                );
              },
              borderRadius: BorderRadius.circular(8),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 9),
                decoration: BoxDecoration(
                  color: outstandingThreatCount == 0
                      ? IlluminatiTheme.emeraldShield.withValues(alpha: 0.10)
                      : IlluminatiTheme.amberGlow.withValues(alpha: 0.10),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: outstandingThreatCount == 0
                        ? IlluminatiTheme.emeraldShield.withValues(alpha: 0.55)
                        : IlluminatiTheme.amberGlow.withValues(alpha: 0.55),
                  ),
                ),
                child: Row(
                  children: [
                    Icon(
                      outstandingThreatCount == 0 ? Icons.verified : Icons.pending_actions,
                      color: outstandingThreatCount == 0
                          ? IlluminatiTheme.emeraldShield
                          : IlluminatiTheme.amberGlow,
                      size: 18,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'AUDIT REVIEW  $acknowledgedThreatCount/${provider.auditedApps.length} COMPLETE',
                        style: GoogleFonts.orbitron(
                          color: outstandingThreatCount == 0
                              ? IlluminatiTheme.emeraldShield
                              : IlluminatiTheme.amberGlow,
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    const Icon(Icons.arrow_forward, size: 15, color: Colors.white54),
                  ],
                ),
              ),
            ),
            if (recommendation != null && recommendationAction != null) ...[
              const SizedBox(height: 12),
              Align(
                alignment: Alignment.centerLeft,
                child: TextButton.icon(
                  onPressed: recommendationAction,
                  icon: const Icon(Icons.arrow_forward, size: 16),
                  label: Text(
                    recommendation,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.orbitron(fontSize: 10),
                  ),
                  style: TextButton.styleFrom(
                    foregroundColor: IlluminatiTheme.sacredGold,
                    padding: EdgeInsets.zero,
                  ),
                ),
              ),
            ],
            if (criticalThreatCount > 0) ...[
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                decoration: BoxDecoration(
                  color: IlluminatiTheme.crimsonSeal.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: IlluminatiTheme.crimsonSeal.withValues(alpha: 0.6)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.warning_amber_rounded, color: IlluminatiTheme.crimsonSeal, size: 18),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        '$criticalThreatCount CRITICAL VECTOR${criticalThreatCount == 1 ? '' : 'S'} DETECTED',
                        style: GoogleFonts.orbitron(
                          color: IlluminatiTheme.crimsonSeal,
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    TextButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const AppAuditScreen()),
                        );
                      },
                      style: TextButton.styleFrom(
                        foregroundColor: IlluminatiTheme.crimsonSeal,
                        padding: EdgeInsets.zero,
                        minimumSize: Size.zero,
                      ),
                      child: const Text('REVIEW'),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildPostureIndicator(String label, bool active, Color activeColor) {
    final color = active ? activeColor : Colors.white38;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
      decoration: BoxDecoration(
        color: color.withValues(alpha: active ? 0.14 : 0.06),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: color.withValues(alpha: 0.55)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(active ? Icons.check : Icons.remove, color: color, size: 13),
          const SizedBox(width: 4),
          Text(
            label,
            style: GoogleFonts.orbitron(color: color, fontSize: 9, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActionButton({
    required BuildContext context,
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: IlluminatiTheme.slateCard,
              shape: BoxShape.circle,
              border: Border.all(color: IlluminatiTheme.sacredGold.withValues(alpha: 0.4)),
            ),
            child: Icon(icon, color: IlluminatiTheme.sacredGold, size: 24),
          ),
          const SizedBox(height: 8),
          Text(
            label,
            style: GoogleFonts.orbitron(
              color: Colors.white70,
              fontSize: 11,
            ),
          ),
        ],
      ),
    );
  }
}
