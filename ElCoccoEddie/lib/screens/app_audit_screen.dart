import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../theme/illuminati_theme.dart';
import '../providers/privacy_shield_provider.dart';
import '../widgets/sacred_geometry_background.dart';

enum AuditFilter { all, critical, high, medium, low, camera, microphone, outstanding, acknowledged }
enum AuditSort { risk, recent, name, review }

class AppAuditScreen extends StatefulWidget {
  const AppAuditScreen({super.key});

  @override
  State<AppAuditScreen> createState() => _AppAuditScreenState();
}

class _AppAuditScreenState extends State<AppAuditScreen> {
  final TextEditingController _searchController = TextEditingController();
  AuditFilter _activeFilter = AuditFilter.all;
  AuditSort _activeSort = AuditSort.risk;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  List<AuditedApp> _filteredApps(List<AuditedApp> apps) {
    final query = _searchController.text.trim().toLowerCase();
    final filtered = apps.where((app) {
      final matchesSearch = query.isEmpty ||
          app.name.toLowerCase().contains(query) ||
          app.packageName.toLowerCase().contains(query);
      final matchesFilter = switch (_activeFilter) {
        AuditFilter.all => true,
        AuditFilter.critical => app.risk == ThreatLevel.critical,
        AuditFilter.high => app.risk == ThreatLevel.high,
        AuditFilter.medium => app.risk == ThreatLevel.medium,
        AuditFilter.low => app.risk == ThreatLevel.low,
        AuditFilter.camera => app.hasCamera,
        AuditFilter.microphone => app.hasMic,
        AuditFilter.outstanding => !app.acknowledged,
        AuditFilter.acknowledged => app.acknowledged,
      };
      return matchesSearch && matchesFilter;
    }).toList();

    filtered.sort((left, right) {
      switch (_activeSort) {
        case AuditSort.risk:
          return _riskRank(right.risk).compareTo(_riskRank(left.risk));
        case AuditSort.recent:
          return _accessRank(left.lastAccessed).compareTo(_accessRank(right.lastAccessed));
        case AuditSort.name:
          return left.name.toLowerCase().compareTo(right.name.toLowerCase());
        case AuditSort.review:
          return (left.acknowledged ? 1 : 0).compareTo(right.acknowledged ? 1 : 0);
      }
    });
    return filtered;
  }

  int _riskRank(ThreatLevel risk) => switch (risk) {
        ThreatLevel.critical => 4,
        ThreatLevel.high => 3,
        ThreatLevel.medium => 2,
        ThreatLevel.low => 1,
      };

  int _accessRank(String access) {
    final value = access.toLowerCase();
    if (value.contains('just now')) return 0;
    if (value.contains('min')) return 1;
    if (value.contains('hour')) return 2;
    return 3;
  }

  Future<void> _showAuditHistory(List<AuditSnapshot> history) async {
    await showDialog<void>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('AUDIT HISTORY'),
        content: SizedBox(
          width: double.maxFinite,
          child: history.isEmpty
              ? const Text('No scan history yet.')
              : ListView.builder(
                  shrinkWrap: true,
                  itemCount: history.length,
                  itemBuilder: (context, index) {
                    final snapshot = history[history.length - index - 1];
                    return ListTile(
                      dense: true,
                      leading: const Icon(Icons.radar, color: IlluminatiTheme.sacredGold),
                      title: Text(_formatScanTime(snapshot.scannedAt)),
                      subtitle: Text(
                        '${snapshot.outstandingCount} outstanding  •  ${snapshot.criticalCount} critical',
                      ),
                    );
                  },
                ),
        ),
        actions: [
          if (history.isNotEmpty)
            TextButton(
              onPressed: () async {
                final report = StringBuffer('EL COCCO AUDIT HISTORY\n');
                for (final snapshot in history) {
                  report.writeln(
                    '${snapshot.scannedAt.toIso8601String()} | '
                    'Outstanding: ${snapshot.outstandingCount} | '
                    'Critical: ${snapshot.criticalCount}',
                  );
                }
                await Clipboard.setData(ClipboardData(text: report.toString().trim()));
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('AUDIT HISTORY COPIED')),
                  );
                }
              },
              child: const Text('COPY'),
            ),
          if (history.isNotEmpty)
            TextButton(
              onPressed: () async {
                final confirmed = await showDialog<bool>(
                  context: context,
                  builder: (context) => AlertDialog(
                    title: const Text('CLEAR AUDIT HISTORY?'),
                    content: const Text('Remove all in-session scan records?'),
                    actions: [
                      TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('CANCEL')),
                      FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('CLEAR')),
                    ],
                  ),
                );
                if (confirmed == true && context.mounted) {
                  context.read<PrivacyShieldProvider>().clearScanHistory();
                  Navigator.pop(context);
                }
              },
              child: const Text('CLEAR'),
            ),
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('CLOSE')),
        ],
      ),
    );
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
            final filteredApps = _filteredApps(provider.auditedApps);
            final history = provider.scanHistory;
            final auditTrend = history.length > 1
                ? history.last.outstandingCount - history[history.length - 2].outstandingCount
                : 0;
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
                          const SizedBox(height: 10),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.history, color: Colors.white38, size: 14),
                              const SizedBox(width: 6),
                              Text(
                                provider.lastScanAt == null
                                    ? 'NO SCAN RUN THIS SESSION'
                                  : 'LAST SCAN ${_formatScanTime(provider.lastScanAt!)}  •  SESSION SCANS: ${provider.scanCount}',
                                style: GoogleFonts.orbitron(color: Colors.white54, fontSize: 9),
                              ),
                              IconButton(
                                tooltip: 'View audit history',
                                onPressed: () => _showAuditHistory(provider.scanHistory),
                                icon: const Icon(Icons.history, color: IlluminatiTheme.sacredGold, size: 18),
                              ),
                            ],
                          ),
                          if (history.length > 1) ...[
                            const SizedBox(height: 6),
                            Text(
                              auditTrend == 0
                                  ? 'NO CHANGE FROM PREVIOUS SCAN'
                                  : '${auditTrend > 0 ? '+' : ''}$auditTrend OUTSTANDING VECTORS VS PREVIOUS SCAN',
                              style: GoogleFonts.orbitron(
                                color: auditTrend > 0 ? IlluminatiTheme.crimsonSeal : IlluminatiTheme.emeraldShield,
                                fontSize: 8,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 16),

                  TextField(
                    controller: _searchController,
                    onChanged: (_) => setState(() {}),
                    style: GoogleFonts.orbitron(color: Colors.white, fontSize: 12),
                    decoration: InputDecoration(
                      hintText: 'SEARCH PACKAGE OR APP NAME',
                      hintStyle: GoogleFonts.orbitron(color: Colors.white38, fontSize: 10),
                      prefixIcon: const Icon(Icons.search, color: IlluminatiTheme.sacredGold),
                      suffixIcon: _searchController.text.isEmpty
                          ? null
                          : IconButton(
                              tooltip: 'Clear search',
                              icon: const Icon(Icons.clear, color: Colors.white54),
                              onPressed: () {
                                _searchController.clear();
                                setState(() {});
                              },
                            ),
                      filled: true,
                      fillColor: IlluminatiTheme.slateCard,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: IlluminatiTheme.sacredGold.withValues(alpha: 0.25)),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: IlluminatiTheme.sacredGold.withValues(alpha: 0.25)),
                      ),
                    ),
                  ),

                  const SizedBox(height: 10),

                  SizedBox(
                    height: 34,
                    child: ListView(
                      scrollDirection: Axis.horizontal,
                      children: [
                        _buildFilterChip('ALL', AuditFilter.all),
                        _buildFilterChip('CRITICAL', AuditFilter.critical),
                        _buildFilterChip('HIGH', AuditFilter.high),
                        _buildFilterChip('MEDIUM', AuditFilter.medium),
                        _buildFilterChip('LOW', AuditFilter.low),
                        _buildFilterChip('CAMERA', AuditFilter.camera),
                        _buildFilterChip('MICROPHONE', AuditFilter.microphone),
                        _buildFilterChip('OUTSTANDING', AuditFilter.outstanding),
                        _buildFilterChip('ACKNOWLEDGED', AuditFilter.acknowledged),
                      ],
                    ),
                  ),

                  const SizedBox(height: 14),

                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          'RISK PROFILE',
                          style: GoogleFonts.cinzel(
                            color: IlluminatiTheme.sacredGold,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      DropdownButtonHideUnderline(
                        child: DropdownButton<AuditSort>(
                          value: _activeSort,
                          dropdownColor: IlluminatiTheme.slateCard,
                          icon: const Icon(Icons.unfold_more, color: IlluminatiTheme.sacredGold, size: 18),
                          style: GoogleFonts.orbitron(color: Colors.white70, fontSize: 10),
                          onChanged: (sort) {
                            if (sort != null) setState(() => _activeSort = sort);
                          },
                          items: const [
                            DropdownMenuItem(value: AuditSort.risk, child: Text('SORT: RISK')),
                            DropdownMenuItem(value: AuditSort.recent, child: Text('SORT: RECENT')),
                            DropdownMenuItem(value: AuditSort.name, child: Text('SORT: NAME')),
                            DropdownMenuItem(value: AuditSort.review, child: Text('SORT: REVIEW STATUS')),
                          ],
                        ),
                      ),
                    ],
                  ),

                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      _buildRiskSummary('CRITICAL', ThreatLevel.critical, provider.auditedApps),
                      _buildRiskSummary('HIGH', ThreatLevel.high, provider.auditedApps),
                      _buildRiskSummary('MEDIUM', ThreatLevel.medium, provider.auditedApps),
                      _buildRiskSummary('LOW', ThreatLevel.low, provider.auditedApps),
                    ],
                  ),

                  const SizedBox(height: 12),

                  // App List Section Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'MATCHING PACKAGES (${filteredApps.length})',
                        style: GoogleFonts.cinzel(
                          color: IlluminatiTheme.sacredGold,
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      TextButton.icon(
                        onPressed: () => _copyAuditReport(filteredApps),
                        icon: const Icon(Icons.copy_all, size: 15),
                        label: const Text('COPY REPORT'),
                        style: TextButton.styleFrom(
                          foregroundColor: IlluminatiTheme.sacredGold,
                          padding: EdgeInsets.zero,
                          textStyle: GoogleFonts.orbitron(fontSize: 9, fontWeight: FontWeight.bold),
                        ),
                      ),
                      TextButton.icon(
                        onPressed: filteredApps.every((app) => app.acknowledged)
                            ? null
                            : () {
                                context.read<PrivacyShieldProvider>().acknowledgeApps(filteredApps);
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('Visible threat vectors acknowledged.')),
                                );
                              },
                        icon: const Icon(Icons.done_all, size: 15),
                        label: const Text('ACK ALL'),
                        style: TextButton.styleFrom(
                          foregroundColor: IlluminatiTheme.sacredGold,
                          disabledForegroundColor: Colors.white30,
                          padding: EdgeInsets.zero,
                          textStyle: GoogleFonts.orbitron(fontSize: 9, fontWeight: FontWeight.bold),
                        ),
                      ),
                      IconButton(
                        tooltip: 'Reset visible reviews',
                        onPressed: filteredApps.any((app) => app.acknowledged)
                            ? () {
                                context.read<PrivacyShieldProvider>().resetAcknowledgements(filteredApps);
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('Visible reviews reset.')),
                                );
                              }
                            : null,
                        icon: const Icon(Icons.restart_alt, size: 18),
                        color: IlluminatiTheme.sacredGold,
                        disabledColor: Colors.white30,
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(minWidth: 28),
                      ),
                    ],
                  ),

                  const SizedBox(height: 10),

                  _buildReviewProgress(filteredApps),

                  const SizedBox(height: 10),

                  // List of Audited Apps
                  Expanded(
                    child: filteredApps.isEmpty
                        ? _buildEmptyState()
                        : ListView.builder(
                            itemCount: filteredApps.length,
                            itemBuilder: (context, index) {
                              final app = filteredApps[index];
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

  String _formatScanTime(DateTime time) {
    final hour = time.hour % 12 == 0 ? 12 : time.hour % 12;
    final minute = time.minute.toString().padLeft(2, '0');
    final period = time.hour >= 12 ? 'PM' : 'AM';
    return '$hour:$minute $period';
  }

  Future<void> _copyAuditReport(List<AuditedApp> apps) async {
    final report = StringBuffer('EL COCCO THREAT MATRIX\n');
    report.writeln('Generated: ${DateTime.now().toIso8601String()}');
    report.writeln('Packages: ${apps.length}');
    report.writeln('Outstanding: ${apps.where((app) => !app.acknowledged).length}');
    report.writeln('Acknowledged: ${apps.where((app) => app.acknowledged).length}');
    report.writeln();
    for (final app in apps) {
      report.writeln('${app.name} | ${app.risk.name.toUpperCase()}');
      report.writeln('Package: ${app.packageName}');
      report.writeln('Camera: ${app.hasCamera ? 'YES' : 'NO'} | Microphone: ${app.hasMic ? 'YES' : 'NO'}');
      report.writeln('Last access: ${app.lastAccessed}');
      report.writeln('Review: ${app.acknowledged ? 'ACKNOWLEDGED' : 'OUTSTANDING'}');
      report.writeln();
    }
    await Clipboard.setData(ClipboardData(text: report.toString().trim()));
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('${apps.length} audit result${apps.length == 1 ? '' : 's'} copied.')),
    );
  }

  Widget _buildRiskSummary(String label, ThreatLevel risk, List<AuditedApp> apps) {
    final count = apps.where((app) => app.risk == risk).length;
    final color = _riskColor(risk);
    return GestureDetector(
      onTap: () => setState(() => _activeFilter = switch (risk) {
        ThreatLevel.critical => AuditFilter.critical,
        ThreatLevel.high => AuditFilter.high,
        ThreatLevel.medium => AuditFilter.medium,
        ThreatLevel.low => AuditFilter.low,
      }),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.12),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: color.withValues(alpha: 0.55)),
        ),
        child: Text(
          '$label  $count',
          style: GoogleFonts.orbitron(color: color, fontSize: 9, fontWeight: FontWeight.bold),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.radar, color: Colors.white30, size: 46),
          const SizedBox(height: 12),
          Text(
            'NO MATCHING THREATS',
            style: GoogleFonts.cinzel(color: IlluminatiTheme.sacredGold, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 6),
          Text(
            'Adjust the search or filter to view another vector.',
            textAlign: TextAlign.center,
            style: GoogleFonts.orbitron(color: Colors.white54, fontSize: 10),
          ),
          const SizedBox(height: 14),
          OutlinedButton.icon(
            onPressed: () {
              _searchController.clear();
              setState(() => _activeFilter = AuditFilter.all);
            },
            icon: const Icon(Icons.restart_alt, size: 16),
            label: const Text('RESET FILTERS'),
            style: OutlinedButton.styleFrom(
              foregroundColor: IlluminatiTheme.sacredGold,
              side: const BorderSide(color: IlluminatiTheme.sacredGold),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildReviewProgress(List<AuditedApp> apps) {
    final acknowledgedCount = apps.where((app) => app.acknowledged).length;
    final progress = apps.isEmpty ? 0.0 : acknowledgedCount / apps.length;
    return Row(
      children: [
        Expanded(
          child: ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: progress,
              minHeight: 6,
              backgroundColor: Colors.white12,
              valueColor: const AlwaysStoppedAnimation<Color>(IlluminatiTheme.emeraldShield),
            ),
          ),
        ),
        const SizedBox(width: 10),
        Text(
          'REVIEWED $acknowledgedCount/${apps.length}',
          style: GoogleFonts.orbitron(
            color: acknowledgedCount == apps.length
                ? IlluminatiTheme.emeraldShield
                : Colors.white54,
            fontSize: 9,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  Color _riskColor(ThreatLevel risk) => switch (risk) {
        ThreatLevel.critical => IlluminatiTheme.crimsonSeal,
        ThreatLevel.high => Colors.orangeAccent,
        ThreatLevel.medium => IlluminatiTheme.amberGlow,
        ThreatLevel.low => IlluminatiTheme.emeraldShield,
      };

  Widget _buildFilterChip(String label, AuditFilter filter) {
    final isSelected = _activeFilter == filter;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ChoiceChip(
        label: Text(label),
        selected: isSelected,
        onSelected: (_) => setState(() => _activeFilter = filter),
        labelStyle: GoogleFonts.orbitron(
          color: isSelected ? IlluminatiTheme.obsidianBlack : Colors.white70,
          fontSize: 9,
          fontWeight: FontWeight.bold,
        ),
        selectedColor: IlluminatiTheme.sacredGold,
        backgroundColor: IlluminatiTheme.slateCard,
        side: BorderSide(color: IlluminatiTheme.sacredGold.withValues(alpha: 0.3)),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        padding: const EdgeInsets.symmetric(horizontal: 4),
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
        onTap: () => _showAppDetails(app),
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
        isThreeLine: true,
      ),
    ).animate().fadeIn(delay: (100 * index).ms).slideX(begin: 0.1, end: 0);
  }

  void _showAppDetails(AuditedApp app) {
    final riskColor = _riskColor(app.risk);
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: IlluminatiTheme.obsidianBlack,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 42,
                    height: 4,
                    decoration: BoxDecoration(
                      color: Colors.white24,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        app.name,
                        style: GoogleFonts.cinzel(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    _buildRiskBadge(app.risk, riskColor),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        app.packageName,
                        style: GoogleFonts.orbitron(color: Colors.white54, fontSize: 11),
                      ),
                    ),
                    IconButton(
                      tooltip: 'Copy package identifier',
                      onPressed: () async {
                        await Clipboard.setData(ClipboardData(text: app.packageName));
                        if (!context.mounted) return;
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Package identifier copied.')),
                        );
                      },
                      icon: const Icon(Icons.copy, color: IlluminatiTheme.sacredGold, size: 18),
                      visualDensity: VisualDensity.compact,
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                _buildDetailRow(Icons.access_time, 'LAST ACCESS', app.lastAccessed),
                _buildDetailRow(
                  Icons.camera_alt_outlined,
                  'CAMERA ACCESS',
                  app.hasCamera ? 'DETECTED' : 'NOT DETECTED',
                ),
                _buildDetailRow(
                  Icons.mic_none,
                  'MICROPHONE ACCESS',
                  app.hasMic ? 'DETECTED' : 'NOT DETECTED',
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: () {
                      context.read<PrivacyShieldProvider>().toggleAppAcknowledgement(app);
                      Navigator.pop(context);
                    },
                    icon: Icon(app.acknowledged ? Icons.verified : Icons.check_circle_outline),
                    label: Text(app.acknowledged ? 'MARK AS OUTSTANDING' : 'ACKNOWLEDGE VECTOR'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: IlluminatiTheme.sacredGold,
                      side: const BorderSide(color: IlluminatiTheme.sacredGold),
                      padding: const EdgeInsets.symmetric(vertical: 13),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildRiskBadge(ThreatLevel risk, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.16),
        borderRadius: BorderRadius.circular(7),
        border: Border.all(color: color),
      ),
      child: Text(
        risk.name.toUpperCase(),
        style: GoogleFonts.orbitron(color: color, fontSize: 9, fontWeight: FontWeight.bold),
      ),
    );
  }

  Widget _buildDetailRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Icon(icon, color: IlluminatiTheme.sacredGold, size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              label,
              style: GoogleFonts.orbitron(color: Colors.white60, fontSize: 10),
            ),
          ),
          Text(
            value,
            style: GoogleFonts.orbitron(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
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
