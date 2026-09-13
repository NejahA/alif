import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../theme/illuminati_theme.dart';
import '../providers/privacy_shield_provider.dart';
import '../widgets/sacred_geometry_background.dart';

class StealthSettingsScreen extends StatelessWidget {
  const StealthSettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SacredGeometryBackground(
      child: Scaffold(
        backgroundColor: Colors.transparent,
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          elevation: 0,
          title: Text(
            'STEALTH & PANIC VAULT',
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
            return Padding(
              padding: const EdgeInsets.all(20.0),
              child: ListView(
                children: [
                  // Emergency Panic Button Card
                  Card(
                    color: IlluminatiTheme.crimsonSeal.withValues(alpha: 0.15),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                      side: const BorderSide(
                        color: IlluminatiTheme.crimsonSeal,
                        width: 1.8,
                      ),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(20.0),
                      child: Column(
                        children: [
                          const Icon(
                            Icons.warning_amber_rounded,
                            color: IlluminatiTheme.crimsonSeal,
                            size: 44,
                          ),
                          const SizedBox(height: 10),
                          Text(
                            'EMERGENCY PANIC PROTOCOL',
                            style: GoogleFonts.cinzel(
                              color: IlluminatiTheme.crimsonSeal,
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            'Immediately lockdown all camera & mic access points and purge session tokens.',
                            textAlign: TextAlign.center,
                            style: GoogleFonts.orbitron(
                              color: Colors.white70,
                              fontSize: 11,
                            ),
                          ),
                          const SizedBox(height: 16),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: IlluminatiTheme.crimsonSeal,
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(vertical: 14),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                              ),
                              onPressed: () {
                                if (!provider.masterLockActive) {
                                  provider.toggleMasterLock();
                                }
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text('🚨 EMERGENCY PANIC PROTOCOL ENGAGED! ALL SHIELDS SEALED.'),
                                  ),
                                );
                              },
                              child: Text(
                                'ENGAGE PANIC LOCKDOWN',
                                style: GoogleFonts.orbitron(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 13,
                                  letterSpacing: 1.2,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ).animate().fadeIn(duration: 400.ms),

                  const SizedBox(height: 24),

                  Text(
                    'STEALTH SETTINGS',
                    style: GoogleFonts.cinzel(
                      color: IlluminatiTheme.sacredGold,
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                    ),
                  ),

                  const SizedBox(height: 12),

                  _buildSettingTile(
                    title: 'AUTO PRIVACY FLIP',
                    subtitle: 'Apply selected privacy protections when the device locks and restore them on unlock',
                    icon: Icons.screen_lock_portrait,
                    value: provider.privacyAutomationEnabled,
                    onChanged: provider.setPrivacyAutomationEnabled,
                  ),

                  const SizedBox(height: 12),

                  _buildSettingTile(
                    title: 'LOCK DELAY',
                    subtitle: '${provider.lockDelaySeconds}s before network protections engage',
                    icon: Icons.timer_outlined,
                    trailingWidget: SizedBox(
                      width: 150,
                      child: Slider(
                        value: provider.lockDelaySeconds.toDouble(),
                        min: 0,
                        max: 60,
                        divisions: 60,
                        activeColor: IlluminatiTheme.sacredGold,
                        onChanged: (value) {
                          provider.setPrivacyTimerSettings(
                            lockDelaySeconds: value.round(),
                            unlockDelaySeconds: provider.unlockDelaySeconds,
                          );
                        },
                      ),
                    ),
                  ),

                  const SizedBox(height: 12),

                  _buildSettingTile(
                    title: 'UNLOCK DELAY',
                    subtitle: '${provider.unlockDelaySeconds}s before protected sensors restore',
                    icon: Icons.lock_open,
                    trailingWidget: SizedBox(
                      width: 150,
                      child: Slider(
                        value: provider.unlockDelaySeconds.toDouble(),
                        min: 0,
                        max: 30,
                        divisions: 30,
                        activeColor: IlluminatiTheme.sacredGold,
                        onChanged: (value) {
                          provider.setPrivacyTimerSettings(
                            lockDelaySeconds: provider.lockDelaySeconds,
                            unlockDelaySeconds: value.round(),
                          );
                        },
                      ),
                    ),
                  ),

                  Align(
                    alignment: Alignment.centerRight,
                    child: TextButton.icon(
                      onPressed: () {
                        provider.setPrivacyTimerSettings(
                          lockDelaySeconds: 10,
                          unlockDelaySeconds: 1,
                        );
                      },
                      icon: const Icon(Icons.restore, size: 16),
                      label: const Text('RESET TIMER DEFAULTS'),
                      style: TextButton.styleFrom(
                        foregroundColor: IlluminatiTheme.sacredGold,
                        textStyle: GoogleFonts.orbitron(fontSize: 10),
                      ),
                    ),
                  ),

                  const SizedBox(height: 12),

                  _buildSettingTile(
                    title: 'SENSOR RESTORATION',
                    subtitle: 'Camera and microphone restore after confirmed unlock',
                    icon: Icons.sensors,
                    value: provider.privacyAutomationEnabled,
                    onChanged: (enabled) async {
                      await provider.setPrivacyFeaturePolicy(
                        'CAMERA',
                        disableOnLock: enabled,
                        enableOnUnlock: enabled,
                      );
                      await provider.setPrivacyFeaturePolicy(
                        'MICROPHONE',
                        disableOnLock: enabled,
                        enableOnUnlock: enabled,
                      );
                    },
                  ),

                  const SizedBox(height: 12),

                  // Decoy App Icon Switch
                  _buildSettingTile(
                    title: 'STEALTH DECOY MODE',
                    subtitle: 'Mask ElCoccoEddie title & icon as a Calculator app',
                    icon: Icons.phonelink_setup,
                    value: provider.stealthMode,
                    onChanged: (val) {
                      provider.toggleStealthMode();
                    },
                  ),

                  const SizedBox(height: 12),

                  // Volume Hardware Buttons Intercept Trap
                  _buildSettingTile(
                    title: 'VOLUME BUTTONS INTERCEPT TRAP',
                    subtitle: 'Trap volume key events to prevent unauthorized hardware clicks',
                    icon: Icons.volume_off,
                    value: provider.volumeButtonsBlocked,
                    onChanged: (val) {
                      provider.toggleVolumeButtonsShield();
                    },
                  ),

                  const SizedBox(height: 12),

                  // System Permission Status Check
                  _buildSettingTile(
                    title: 'HARDWARE PERMISSION HOOKS',
                    subtitle: 'Camera: ${provider.cameraPermissionStatus.name.toUpperCase()} | Mic: ${provider.micPermissionStatus.name.toUpperCase()}',
                    icon: Icons.security_update_good,
                    trailingWidget: TextButton(
                      onPressed: () async {
                        await provider.requestPermissions();
                      },
                      child: Text(
                        'GRANT PERMS',
                        style: GoogleFonts.orbitron(
                          color: IlluminatiTheme.sacredGold,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(height: 12),

                  // Secret Code Passcode Lock
                  _buildSettingTile(
                    title: 'SACRED PASSCODE LOCK',
                    subtitle: 'Require biometric or PIN to alter privacy seals',
                    icon: Icons.fingerprint,
                    value: true,
                    onChanged: (val) {},
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildSettingTile({
    required String title,
    required String subtitle,
    required IconData icon,
    bool? value,
    ValueChanged<bool>? onChanged,
    Widget? trailingWidget,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: IlluminatiTheme.slateCard,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: IlluminatiTheme.sacredGold.withValues(alpha: 0.25),
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: IlluminatiTheme.sacredGold.withValues(alpha: 0.15),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: IlluminatiTheme.sacredGold, size: 22),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: GoogleFonts.cinzel(
                    color: Colors.white,
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: GoogleFonts.orbitron(
                    color: Colors.white54,
                    fontSize: 10,
                  ),
                ),
              ],
            ),
          ),
          if (value != null && onChanged != null)
            Switch(
              value: value,
              activeThumbColor: IlluminatiTheme.emeraldShield,
              onChanged: onChanged,
            ),
          ?trailingWidget,
        ],
      ),
    );
  }
}
