import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../theme/illuminati_theme.dart';
import '../providers/privacy_shield_provider.dart';
import '../widgets/sacred_geometry_background.dart';

class AppAuditScreen extends StatelessWidget {
  const AppAuditScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SacredGeometryBackground(
      child: Scaffold(
        backgroundColor: Colors.transparent,
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          elevation: 0,
          title: Text(
            'THREAT MATRIX AUDIT',
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
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  // Scan Header Card
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        children: [
                          Row(
                            children: [
                              const Icon(
                                Icons.radar,
                                color: IlluminatiTheme.sacredGold,
                                size: 30,
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'SACRED PERMISSION AUDITOR',
                                      style: GoogleFonts.cinzel(
                                        color: IlluminatiTheme.sacredGold,
                                        fontSize: 14,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    Text(
                                      'Auditing hardware access vectors for stealth surveillance.',
                                      style: GoogleFonts.orbitron(
                                        color: Colors.white70,
                                        fontSize: 11,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton.icon(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: IlluminatiTheme.sacredGold,
                                foregroundColor: IlluminatiTheme.obsidianBlack,
                                padding: const EdgeInsets.symmetric(vertical: 14),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                              ),
                              onPressed: provider.isAuditing
                                  ? null
                                  : () async {
                                      await provider.scanThreats();
                                      if (context.mounted) {
                                        ScaffoldMessenger.of(context).showSnackBar(
                                          const SnackBar(
                                            content: Text('⚡ System Threat Matrix Scan Completed'),
                                          ),
                                        );
                                      }
                                    },
                              icon: provider.isAuditing
                                  ? const SizedBox(
                                      width: 20,
                                      height: 20,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                        color: IlluminatiTheme.obsidianBlack,
                                      ),
                                    )
                                  : const Icon(Icons.shield),
                              label: Text(
                                provider.isAuditing
                                    ? 'SCANNING THREAT VECTOR...'
                                    : 'INITIATE THREAT SCAN',
                                style: GoogleFonts.orbitron(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 13,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 16),

                  // App List Section Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'AUDITED PACKAGES (${provider.auditedApps.length})',
                        style: GoogleFonts.cinzel(
                          color: IlluminatiTheme.sacredGold,
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        'RISK LEVEL',
                        style: GoogleFonts.orbitron(
                          color: Colors.white38,
                          fontSize: 11,
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 10),

                  // List of Audited Apps
                  Expanded(
                    child: ListView.builder(
                      itemCount: provider.auditedApps.length,
                      itemBuilder: (context, index) {
                        final app = provider.auditedApps[index];
                        return _buildAppItemCard(app, index);
                      },
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildAppItemCard(AuditedApp app, int index) {
    Color riskColor;
    String riskText;

    switch (app.risk) {
      case ThreatLevel.critical:
        riskColor = IlluminatiTheme.crimsonSeal;
        riskText = 'CRITICAL';
        break;
      case ThreatLevel.high:
        riskColor = Colors.orangeAccent;
        riskText = 'HIGH';
        break;
      case ThreatLevel.medium:
        riskColor = IlluminatiTheme.amberGlow;
        riskText = 'MEDIUM';
        break;
      case ThreatLevel.low:
        riskColor = IlluminatiTheme.emeraldShield;
        riskText = 'LOW';
        break;
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: riskColor.withValues(alpha: 0.15),
            shape: BoxShape.circle,
            border: Border.all(color: riskColor.withValues(alpha: 0.5)),
          ),
          child: Icon(
            app.hasCamera && app.hasMic
                ? Icons.videocam
                : app.hasCamera
                    ? Icons.camera_alt
                    : Icons.mic,
            color: riskColor,
            size: 22,
          ),
        ),
        title: Text(
          app.name,
          style: GoogleFonts.cinzel(
            color: Colors.white,
            fontSize: 14,
            fontWeight: FontWeight.bold,
          ),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 2),
            Text(
              app.packageName,
              style: GoogleFonts.orbitron(
                color: Colors.white38,
                fontSize: 11,
              ),
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                if (app.hasCamera) _buildPermissionBadge('CAM', IlluminatiTheme.sacredGold),
                if (app.hasMic) _buildPermissionBadge('MIC', IlluminatiTheme.cyberCyan),
                const SizedBox(width: 8),
                Text(
                  'Access: ${app.lastAccessed}',
                  style: GoogleFonts.orbitron(color: Colors.white54, fontSize: 10),
                ),
              ],
            ),
          ],
        ),
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
          decoration: BoxDecoration(
            color: riskColor.withValues(alpha: 0.2),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: riskColor),
          ),
          child: Text(
            riskText,
            style: GoogleFonts.orbitron(
              color: riskColor,
              fontSize: 10,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ),
    ).animate().fadeIn(delay: (100 * index).ms).slideX(begin: 0.1, end: 0);
  }

  Widget _buildPermissionBadge(String label, Color color) {
    return Container(
      margin: const EdgeInsets.only(right: 6),
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: color.withValues(alpha: 0.6), width: 0.8),
      ),
      child: Text(
        label,
        style: GoogleFonts.orbitron(
          color: color,
          fontSize: 9,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}
