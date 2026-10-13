import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../theme/illuminati_theme.dart';
import '../providers/privacy_shield_provider.dart';
import '../widgets/sacred_geometry_background.dart';

class PrivacyFlipScreen extends StatefulWidget {
  const PrivacyFlipScreen({super.key});

  @override
  State<PrivacyFlipScreen> createState() => _PrivacyFlipScreenState();
}

class _PrivacyFlipScreenState extends State<PrivacyFlipScreen> with SingleTickerProviderStateMixin {
  late TabController _categoryTabController;

  @override
  void initState() {
    super.initState();
    _categoryTabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _categoryTabController.dispose();
    super.dispose();
  }

  String _formatSeconds(int seconds) {
    if (seconds == 0) return '0s (Instant)';
    if (seconds < 60) return '${seconds}s';
    if (seconds == 60) return '1 min';
    if (seconds == 120) return '2 mins';
    if (seconds == 300) return '5 mins';
    return '${seconds ~/ 60}m ${seconds % 60}s';
  }

  int _sliderValueToSeconds(double val) {
    final pos = val.round();
    if (pos <= 60) return pos;
    if (pos <= 80) return 120; // 2 minutes
    return 300; // 5 minutes
  }

  double _secondsToSliderValue(int seconds) {
    if (seconds <= 60) return seconds.toDouble();
    if (seconds <= 120) return 80.0;
    return 100.0;
  }

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
            'PRIVACY FLIP ENGINE',
            style: GoogleFonts.cinzelDecorative(
              color: IlluminatiTheme.sacredGold,
              fontSize: 20,
              fontWeight: FontWeight.bold,
              letterSpacing: 2.0,
            ),
          ),
          actions: [
            IconButton(
              tooltip: 'Simulate Lock Event',
              icon: const Icon(Icons.lock_clock, color: IlluminatiTheme.cyberCyan),
              onPressed: () {
                final provider = context.read<PrivacyShieldProvider>();
                provider.simulateLockEvent();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('🔒 Simulated Device Lock Event Triggered! Features flipping...'),
                    backgroundColor: IlluminatiTheme.slateCard,
                  ),
                );
              },
            ),
            IconButton(
              tooltip: 'Simulate Unlock Event',
              icon: const Icon(Icons.lock_open, color: IlluminatiTheme.emeraldShield),
              onPressed: () {
                final provider = context.read<PrivacyShieldProvider>();
                provider.simulateUnlockEvent();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('🔓 Simulated Device Unlock Event Triggered! Features restoring...'),
                    backgroundColor: IlluminatiTheme.slateCard,
                  ),
                );
              },
            ),
          ],
        ),
        body: Consumer<PrivacyShieldProvider>(
          builder: (context, provider, child) {
            return SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Master Automation Banner Card
                  _buildMasterAutomationCard(context, provider)
                      .animate()
                      .fadeIn(duration: 400.ms)
                      .slideY(begin: -0.1, end: 0),

                  const SizedBox(height: 16),

                  // Privilege Status Card
                  _buildPrivilegeCard(context, provider)
                      .animate()
                      .fadeIn(delay: 150.ms),

                  const SizedBox(height: 20),

                  // Smart Delays Section
                  _buildTimingDelaysCard(context, provider)
                      .animate()
                      .fadeIn(delay: 250.ms),

                  const SizedBox(height: 24),

                  // Feature Policies Header & Tabs
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'FEATURE FLIP POLICIES',
                        style: GoogleFonts.cinzel(
                          color: IlluminatiTheme.sacredGold,
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.2,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: IlluminatiTheme.sacredGold.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: IlluminatiTheme.sacredGold.withValues(alpha: 0.4)),
                        ),
                        child: Text(
                          '${provider.flipPolicies.where((p) => p.disableOnLock).length} AUTO LOCK',
                          style: GoogleFonts.orbitron(
                            color: IlluminatiTheme.sacredGold,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 12),

                  TabBar(
                    controller: _categoryTabController,
                    indicatorColor: IlluminatiTheme.sacredGold,
                    labelColor: IlluminatiTheme.sacredGold,
                    unselectedLabelColor: Colors.white54,
                    labelStyle: GoogleFonts.cinzel(fontSize: 11, fontWeight: FontWeight.bold),
                    tabs: const [
                      Tab(text: 'CONNECTIVITY'),
                      Tab(text: 'SENSORS'),
                      Tab(text: 'SYSTEM MODES'),
                    ],
                  ),

                  const SizedBox(height: 12),

                  SizedBox(
                    height: 480,
                    child: TabBarView(
                      controller: _categoryTabController,
                      children: [
                        _buildFeatureCategoryList(context, provider, 'Connectivity'),
                        _buildFeatureCategoryList(context, provider, 'Sensors'),
                        _buildFeatureCategoryList(context, provider, 'System Modes'),
                      ],
                    ),
                  ),

                  const SizedBox(height: 20),

                  // Smart Disable Rules Card
                  _buildSmartRulesCard(context, provider)
                      .animate()
                      .fadeIn(delay: 350.ms),

                  const SizedBox(height: 20),

                  // App Exemptions Vault
                  _buildAppExemptionsCard(context, provider)
                      .animate()
                      .fadeIn(delay: 400.ms),

                  const SizedBox(height: 20),

                  // Specialized Hardening Toggles
                  _buildSpecializedTogglesCard(context, provider)
                      .animate()
                      .fadeIn(delay: 450.ms),

                  const SizedBox(height: 20),

                  // Live Privacy Flip Event Console Log
                  _buildFlipConsoleLogCard(context, provider)
                      .animate()
                      .fadeIn(delay: 500.ms),

                  const SizedBox(height: 24),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildMasterAutomationCard(BuildContext context, PrivacyShieldProvider provider) {
    final isActive = provider.privacyAutomationEnabled;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: isActive
            ? IlluminatiTheme.emeraldShield.withValues(alpha: 0.12)
            : IlluminatiTheme.crimsonSeal.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isActive ? IlluminatiTheme.emeraldShield : IlluminatiTheme.crimsonSeal,
          width: 1.8,
        ),
        boxShadow: [
          BoxShadow(
            color: (isActive ? IlluminatiTheme.emeraldShield : IlluminatiTheme.crimsonSeal).withValues(alpha: 0.15),
            blurRadius: 16,
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: (isActive ? IlluminatiTheme.emeraldShield : IlluminatiTheme.crimsonSeal).withValues(alpha: 0.2),
              shape: BoxShape.circle,
            ),
            child: Icon(
              isActive ? Icons.screen_lock_portrait : Icons.screen_lock_portrait_outlined,
              color: isActive ? IlluminatiTheme.emeraldShield : IlluminatiTheme.crimsonSeal,
              size: 32,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isActive ? 'PRIVACY FLIP ACTIVE' : 'PRIVACY FLIP PAUSED',
                  style: GoogleFonts.orbitron(
                    color: isActive ? IlluminatiTheme.emeraldShield : IlluminatiTheme.crimsonSeal,
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.2,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  isActive
                      ? 'Automated lock/unlock privacy control running seamlessly'
                      : 'Screen state triggers suspended. Protections remain manual.',
                  style: GoogleFonts.orbitron(color: Colors.white70, fontSize: 10),
                ),
              ],
            ),
          ),
          Switch(
            value: isActive,
            activeThumbColor: IlluminatiTheme.emeraldShield,
            onChanged: (val) async {
              await provider.setPrivacyAutomationEnabled(val);
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(val ? '✨ Privacy Flip Automation Engaged!' : '⏸️ Privacy Flip Automation Paused'),
                    duration: const Duration(seconds: 2),
                  ),
                );
              }
            },
          ),
        ],
      ),
    );
  }

  Widget _buildPrivilegeCard(BuildContext context, PrivacyShieldProvider provider) {
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
                    const Icon(Icons.admin_panel_settings_outlined, color: IlluminatiTheme.sacredGold, size: 20),
                    const SizedBox(width: 8),
                    Text(
                      'PRIVILEGE MODE & ENGINE',
                      style: GoogleFonts.cinzel(
                        color: IlluminatiTheme.sacredGold,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: IlluminatiTheme.emeraldShield.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: IlluminatiTheme.emeraldShield, width: 1),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 6,
                        height: 6,
                        decoration: const BoxDecoration(
                          color: IlluminatiTheme.emeraldShield,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        'SHIZUKU / ROOT DETECTED',
                        style: GoogleFonts.orbitron(
                          color: IlluminatiTheme.emeraldShield,
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              'Active backend: ${provider.privilegeMethod}',
              style: GoogleFonts.orbitron(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 4),
            Text(
              'Privileges priority: 1. Sui (Magisk) → 2. Root (UID 0) → 3. Dhizuku (Device Owner) → 4. Shizuku (ADB)',
              style: GoogleFonts.orbitron(color: Colors.white54, fontSize: 9),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTimingDelaysCard(BuildContext context, PrivacyShieldProvider provider) {
    final lockPos = _secondsToSliderValue(provider.lockDelaySeconds);
    final unlockPos = _secondsToSliderValue(provider.unlockDelaySeconds);

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
                  'SMART TIMING & DELAYS',
                  style: GoogleFonts.cinzel(
                    color: IlluminatiTheme.sacredGold,
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                TextButton.icon(
                  onPressed: () {
                    provider.setPrivacyTimerSettings(
                      lockDelaySeconds: 10,
                      unlockDelaySeconds: 1,
                    );
                  },
                  icon: const Icon(Icons.restore, size: 14, color: IlluminatiTheme.sacredGold),
                  label: Text(
                    'RESET DEFAULTS',
                    style: GoogleFonts.orbitron(color: IlluminatiTheme.sacredGold, fontSize: 10),
                  ),
                  style: TextButton.styleFrom(padding: EdgeInsets.zero),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Lock Delay Slider
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'LOCK ACTION DELAY',
                  style: GoogleFonts.cinzel(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                ),
                Text(
                  _formatSeconds(provider.lockDelaySeconds),
                  style: GoogleFonts.orbitron(
                    color: IlluminatiTheme.sacredGold,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            Text(
              'Wait before disabling Wi-Fi, Bluetooth, Data & Location when screen locks.',
              style: GoogleFonts.orbitron(color: Colors.white54, fontSize: 9),
            ),
            Slider(
              value: lockPos,
              min: 0,
              max: 100,
              divisions: 100,
              activeColor: IlluminatiTheme.sacredGold,
              inactiveColor: Colors.white12,
              onChanged: (val) {
                final seconds = _sliderValueToSeconds(val);
                provider.setPrivacyTimerSettings(
                  lockDelaySeconds: seconds,
                  unlockDelaySeconds: provider.unlockDelaySeconds,
                );
              },
            ),

            const SizedBox(height: 10),

            // Unlock Delay Slider
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'UNLOCK RESTORATION DELAY',
                  style: GoogleFonts.cinzel(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                ),
                Text(
                  _formatSeconds(provider.unlockDelaySeconds),
                  style: GoogleFonts.orbitron(
                    color: IlluminatiTheme.cyberCyan,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            Text(
              'Wait after authenticated screen unlock before restoring features back on.',
              style: GoogleFonts.orbitron(color: Colors.white54, fontSize: 9),
            ),
            Slider(
              value: unlockPos,
              min: 0,
              max: 100,
              divisions: 100,
              activeColor: IlluminatiTheme.cyberCyan,
              inactiveColor: Colors.white12,
              onChanged: (val) {
                final seconds = _sliderValueToSeconds(val);
                provider.setPrivacyTimerSettings(
                  lockDelaySeconds: provider.lockDelaySeconds,
                  unlockDelaySeconds: seconds,
                );
              },
            ),

            const Divider(color: Colors.white12, height: 20),

            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              activeThumbColor: IlluminatiTheme.emeraldShield,
              title: Text(
                'SHOW COUNTDOWN NOTIFICATION',
                style: GoogleFonts.cinzel(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
              ),
              subtitle: Text(
                'Display active countdown alert in notification bar before features flip',
                style: GoogleFonts.orbitron(color: Colors.white54, fontSize: 9),
              ),
              value: provider.showCountdown,
              onChanged: (val) => provider.setShowCountdown(val),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFeatureCategoryList(BuildContext context, PrivacyShieldProvider provider, String category) {
    final policies = provider.flipPolicies.where((p) => p.category == category).toList();

    return ListView.builder(
      physics: const BouncingScrollPhysics(),
      itemCount: policies.length,
      itemBuilder: (context, index) {
        final policy = policies[index];

        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: IlluminatiTheme.slateCard,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: policy.currentlyActive
                  ? IlluminatiTheme.emeraldShield.withValues(alpha: 0.4)
                  : IlluminatiTheme.sacredGold.withValues(alpha: 0.2),
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: policy.currentlyActive
                          ? IlluminatiTheme.emeraldShield.withValues(alpha: 0.15)
                          : IlluminatiTheme.sacredGold.withValues(alpha: 0.15),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      policy.icon,
                      color: policy.currentlyActive ? IlluminatiTheme.emeraldShield : IlluminatiTheme.sacredGold,
                      size: 22,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          policy.displayName,
                          style: GoogleFonts.cinzel(
                            color: Colors.white,
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          policy.description,
                          style: GoogleFonts.orbitron(color: Colors.white54, fontSize: 9),
                        ),
                      ],
                    ),
                  ),
                  InkWell(
                    onTap: () => provider.toggleFeatureStateNow(policy.key),
                    borderRadius: BorderRadius.circular(8),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: policy.currentlyActive
                            ? IlluminatiTheme.emeraldShield.withValues(alpha: 0.2)
                            : IlluminatiTheme.crimsonSeal.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: policy.currentlyActive ? IlluminatiTheme.emeraldShield : IlluminatiTheme.crimsonSeal,
                        ),
                      ),
                      child: Text(
                        policy.currentlyActive ? 'ACTIVE' : 'OFF',
                        style: GoogleFonts.orbitron(
                          color: policy.currentlyActive ? IlluminatiTheme.emeraldShield : IlluminatiTheme.crimsonSeal,
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 12),
              const Divider(color: Colors.white12, height: 1),
              const SizedBox(height: 8),

              Row(
                children: [
                  Expanded(
                    child: Row(
                      children: [
                        Icon(
                          policy.disableOnLock ? Icons.lock : Icons.lock_open,
                          size: 14,
                          color: policy.disableOnLock ? IlluminatiTheme.sacredGold : Colors.white38,
                        ),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            'Disable on Lock',
                            style: GoogleFonts.orbitron(color: Colors.white70, fontSize: 10),
                          ),
                        ),
                        Switch(
                          value: policy.disableOnLock,
                          activeThumbColor: IlluminatiTheme.sacredGold,
                          onChanged: (val) => provider.toggleFeatureDisableOnLock(policy.key),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Row(
                      children: [
                        Icon(
                          policy.enableOnUnlock ? Icons.refresh : Icons.block,
                          size: 14,
                          color: policy.enableOnUnlock ? IlluminatiTheme.cyberCyan : Colors.white38,
                        ),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            'Restore on Unlock',
                            style: GoogleFonts.orbitron(color: Colors.white70, fontSize: 10),
                          ),
                        ),
                        Switch(
                          value: policy.enableOnUnlock,
                          activeThumbColor: IlluminatiTheme.cyberCyan,
                          onChanged: (val) => provider.toggleFeatureEnableOnUnlock(policy.key),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildSmartRulesCard(BuildContext context, PrivacyShieldProvider provider) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'SMART DISABLE & RESTORE RULES',
              style: GoogleFonts.cinzel(
                color: IlluminatiTheme.sacredGold,
                fontSize: 13,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Intelligent guardrails preventing accidental disconnects & connection resets.',
              style: GoogleFonts.orbitron(color: Colors.white54, fontSize: 9),
            ),
            const SizedBox(height: 12),

            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              activeThumbColor: IlluminatiTheme.sacredGold,
              title: Text(
                'ONLY IF UNUSED / NOT CONNECTED',
                style: GoogleFonts.cinzel(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
              ),
              subtitle: Text(
                'Don\'t disable Wi-Fi/Bluetooth if active file download or Bluetooth headphones connected',
                style: GoogleFonts.orbitron(color: Colors.white54, fontSize: 9),
              ),
              value: provider.onlyIfUnused,
              onChanged: (val) => provider.setOnlyIfUnused(val),
            ),

            const Divider(color: Colors.white12),

            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              activeThumbColor: IlluminatiTheme.sacredGold,
              title: Text(
                'ONLY IF NOT ALREADY ENABLED',
                style: GoogleFonts.cinzel(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
              ),
              subtitle: Text(
                'Prevent unnecessary connection resets by skipping re-enabling features that are already active',
                style: GoogleFonts.orbitron(color: Colors.white54, fontSize: 9),
              ),
              value: provider.onlyIfNotAlreadyEnabled,
              onChanged: (val) => provider.setOnlyIfNotAlreadyEnabled(val),
            ),

            const Divider(color: Colors.white12),

            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              activeThumbColor: IlluminatiTheme.sacredGold,
              title: Text(
                'ONLY IF NOT MANUALLY SET',
                style: GoogleFonts.cinzel(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
              ),
              subtitle: Text(
                'Respect manually configured state on unlock and do not override user decisions',
                style: GoogleFonts.orbitron(color: Colors.white54, fontSize: 9),
              ),
              value: provider.onlyIfNotManuallySet,
              onChanged: (val) => provider.setOnlyIfNotManuallySet(val),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAppExemptionsCard(BuildContext context, PrivacyShieldProvider provider) {
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
                  'APP EXEMPTIONS VAULT',
                  style: GoogleFonts.cinzel(
                    color: IlluminatiTheme.sacredGold,
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: IlluminatiTheme.sacredGold.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    '${provider.exemptApps.where((a) => a.isExempt).length} EXEMPTED',
                    style: GoogleFonts.orbitron(color: IlluminatiTheme.sacredGold, fontSize: 9, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              'Exclude specific apps from privacy actions when running in foreground during lock.',
              style: GoogleFonts.orbitron(color: Colors.white54, fontSize: 9),
            ),
            const SizedBox(height: 12),

            ...provider.exemptApps.map((app) {
              return Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: IlluminatiTheme.slateCard,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: app.isExempt ? IlluminatiTheme.sacredGold : Colors.white12,
                  ),
                ),
                child: Row(
                  children: [
                    Icon(app.icon, color: app.isExempt ? IlluminatiTheme.sacredGold : Colors.white38, size: 20),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            app.name,
                            style: GoogleFonts.cinzel(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                          ),
                          Text(
                            app.packageName,
                            style: GoogleFonts.orbitron(color: Colors.white54, fontSize: 8),
                          ),
                        ],
                      ),
                    ),
                    Switch(
                      value: app.isExempt,
                      activeThumbColor: IlluminatiTheme.sacredGold,
                      onChanged: (_) => provider.toggleAppExemption(app),
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

  Widget _buildSpecializedTogglesCard(BuildContext context, PrivacyShieldProvider provider) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'SPECIALIZED HARDENING & TWEAKS',
              style: GoogleFonts.cinzel(
                color: IlluminatiTheme.sacredGold,
                fontSize: 13,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),

            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              activeThumbColor: IlluminatiTheme.sacredGold,
              title: Text(
                'SAMSUNG NFC AUTO-RETRY',
                style: GoogleFonts.cinzel(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
              ),
              subtitle: Text(
                'Combat Samsung payment framework NFC state override (Galaxy S/Note/Z series)',
                style: GoogleFonts.orbitron(color: Colors.white54, fontSize: 9),
              ),
              value: provider.samsungNfcAutoRetry,
              onChanged: (val) => provider.setSamsungNfcAutoRetry(val),
            ),

            const Divider(color: Colors.white12),

            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              activeThumbColor: IlluminatiTheme.sacredGold,
              title: Text(
                'ACCESSIBILITY INSTANT-LOCK SERVICE',
                style: GoogleFonts.cinzel(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
              ),
              subtitle: Text(
                'Enable power/side button instant hardware lock binding via accessibility hook',
                style: GoogleFonts.orbitron(color: Colors.white54, fontSize: 9),
              ),
              value: provider.accessibilityInstantLock,
              onChanged: (val) => provider.setAccessibilityInstantLock(val),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFlipConsoleLogCard(BuildContext context, PrivacyShieldProvider provider) {
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
                    const Icon(Icons.terminal, color: IlluminatiTheme.cyberCyan, size: 18),
                    const SizedBox(width: 8),
                    Text(
                      'LIVE PRIVACY FLIP CONSOLE LOG',
                      style: GoogleFonts.cinzel(
                        color: IlluminatiTheme.sacredGold,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                TextButton(
                  onPressed: provider.clearFlipLogs,
                  child: Text(
                    'CLEAR',
                    style: GoogleFonts.orbitron(color: IlluminatiTheme.crimsonSeal, fontSize: 10),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),

            if (provider.flipLogs.isEmpty)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 16.0),
                child: Center(
                  child: Text(
                    'No flip events recorded yet.',
                    style: GoogleFonts.orbitron(color: Colors.white38, fontSize: 11),
                  ),
                ),
              )
            else
              Column(
                children: provider.flipLogs.map((log) {
                  final isLock = log.eventType == 'SCREEN_LOCK';
                  final isUnlock = log.eventType == 'SCREEN_UNLOCK';
                  final color = isLock
                      ? IlluminatiTheme.sacredGold
                      : isUnlock
                          ? IlluminatiTheme.emeraldShield
                          : IlluminatiTheme.cyberCyan;

                  return Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: IlluminatiTheme.voidDark,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: color.withValues(alpha: 0.3)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              '${log.eventType} • ${log.action}',
                              style: GoogleFonts.orbitron(
                                color: color,
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            Text(
                              '${log.timestamp.hour.toString().padLeft(2, '0')}:${log.timestamp.minute.toString().padLeft(2, '0')}:${log.timestamp.second.toString().padLeft(2, '0')}',
                              style: GoogleFonts.orbitron(color: Colors.white38, fontSize: 9),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          log.details,
                          style: GoogleFonts.orbitron(color: Colors.white70, fontSize: 9),
                        ),
                      ],
                    ),
                  );
                }).toList(),
              ),
          ],
        ),
      ),
    );
  }
}
