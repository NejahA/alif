import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/illuminati_theme.dart';
import '../providers/privacy_shield_provider.dart';
import '../widgets/illuminati_eye_painter.dart';
import '../widgets/sacred_geometry_background.dart';
import '../services/native_blocker_service.dart';
import 'camera_filter_screen.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/camera/camera_bloc.dart';
import '../bloc/camera/camera_state.dart';
import 'app_audit_screen.dart';
import 'acoustic_jammer_screen.dart';
import 'stealth_settings_screen.dart';

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
            return SingleChildScrollView(
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
                        child: BlocConsumer<CameraBloc, CameraState>(
                          listener: (context, cameraState) {},
                          builder: (context, cameraState) {
                            return _buildShieldToggleCard(
                              context: context,
                              title: 'CAM FILTER',
                              subtitle: provider.cameraFilter == CameraFilter.fullScreen
                                  ? 'FULL SCREEN'
                                  : provider.cameraFilter.name.toUpperCase(),
                              icon: Icons.camera_alt,
                              isActive: provider.cameraFilter != CameraFilter.none,
                              activeColor: IlluminatiTheme.emeraldShield,
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
                      const SizedBox(width: 10),
                      Expanded(
                        child: _buildShieldToggleCard(
                          context: context,
                          title: 'MIC SEAL',
                          subtitle: provider.micBlocked ? 'BLOCKED' : 'EXPOSED',
                          icon: Icons.mic_off,
                          isActive: provider.micBlocked,
                          activeColor: IlluminatiTheme.cyberCyan,
                          onTap: provider.toggleMicShield,
                        ),
                      ),
                      const SizedBox(width: 10),
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

                  // Quick Action Buttons
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
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
                        label: 'Acoustic Jammer',
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const AcousticJammerScreen()),
                          );
                        },
                      ),
                      _buildQuickActionButton(
                        context: context,
                        icon: Icons.lock_clock,
                        label: 'Stealth Vault',
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (_) => const StealthSettingsScreen()),
                          );
                        },
                      ),
                    ],
                  ).animate().fadeIn(delay: 400.ms),
                ],
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
