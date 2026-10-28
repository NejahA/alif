import 'package:flutter/material.dart';

import '../models/synapse_model.dart';
import '../services/garden_service.dart';
import '../theme/hiro_theme.dart';
import '../widgets/garden_stats_dialog.dart';
import '../widgets/hiro_logo.dart';
import '../widgets/kanban_view.dart';
import '../widgets/neural_canvas.dart';
import '../widgets/oracle_dialog.dart';
import '../widgets/pomodoro_dialog.dart';
import '../widgets/rpg_codex_dialog.dart';
import '../widgets/soundscape_dialog.dart';
import '../widgets/synapse_editor_sheet.dart';

class GardenScreen extends StatefulWidget {
  final GardenService service;

  const GardenScreen({super.key, required this.service});

  @override
  State<GardenScreen> createState() => _GardenScreenState();
}

class _GardenScreenState extends State<GardenScreen> {
  bool _isKanbanView = false;
  bool _showSearchBar = false;
  final TextEditingController _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _showRpgDialog() {
    showDialog(
      context: context,
      builder: (_) => RpgCodexDialog(service: widget.service),
    );
  }

  void _showPomodoroDialog() {
    showDialog(
      context: context,
      builder: (_) => PomodoroDialog(service: widget.service),
    );
  }

  void _showSoundscapeDialog() {
    showDialog(
      context: context,
      builder: (_) => SoundscapeDialog(service: widget.service),
    );
  }

  void _showOracleDialog() {
    showDialog(
      context: context,
      builder: (_) => OracleDialog(service: widget.service),
    );
  }

  void _showStatsDialog() {
    showDialog(
      context: context,
      builder: (_) => GardenStatsDialog(service: widget.service),
    );
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: widget.service,
      builder: (context, _) {
        final service = widget.service;
        final rpg = service.rpg;

        return Scaffold(
          backgroundColor: HiroColors.abyss,
          appBar: _buildTopBar(service, rpg),
          body: Stack(
            children: [
              // 1. Viewport: Canvas or Kanban
              Positioned.fill(
                child: _isKanbanView
                    ? KanbanView(
                        service: service,
                        onSelectSynapse: (syn) {
                          setState(() {});
                        },
                      )
                    : NeuralCanvas(
                        service: service,
                        onSelectSynapse: (syn) {
                          setState(() {});
                        },
                        onOpenTemplateSelector: () {},
                      ),
              ),

              // 2. Connect Mode Floating Indicator Banner
              if (service.isConnectMode)
                Positioned(
                  top: 12,
                  left: 0,
                  right: 0,
                  child: Center(
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        color: HiroColors.solarAmber.withOpacity(0.9),
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: const [
                          BoxShadow(color: Colors.black45, blurRadius: 10)
                        ],
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.bolt_rounded, size: 16, color: HiroColors.abyss),
                          const SizedBox(width: 8),
                          Text(
                            service.connectingFromId == null
                                ? '⚡ Connect Mode: Select First Synapse'
                                : '⚡ Connect Mode: Select Second Synapse to Link',
                            style: const TextStyle(
                              color: HiroColors.abyss,
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                          ),
                          const SizedBox(width: 8),
                          GestureDetector(
                            onTap: () => service.toggleConnectMode(),
                            child: const Icon(Icons.close_rounded, size: 16, color: HiroColors.abyss),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),

              // 3. Search & Filter Bar (if active)
              if (_showSearchBar)
                Positioned(
                  top: 8,
                  left: 16,
                  right: 16,
                  child: _buildSearchBar(service),
                ),

              // 4. Bottom Quick-Sprout Palette
              if (!_isKanbanView && service.selectedSynapse == null)
                Positioned(
                  bottom: 16,
                  left: 16,
                  right: 16,
                  child: _buildQuickSproutBar(service),
                ),

              // 5. Synapse Inspector Bottom Drawer
              if (service.selectedSynapse != null)
                Positioned(
                  left: 0,
                  right: 0,
                  bottom: 0,
                  child: SynapseEditorSheet(
                    synapse: service.selectedSynapse!,
                    service: service,
                    onClose: () => service.selectSynapse(null),
                  ),
                ),
            ],
          ),
        );
      },
    );
  }

  PreferredSizeWidget _buildTopBar(GardenService service, dynamic rpg) {
    return AppBar(
      backgroundColor: HiroColors.surfaceElevated,
      elevation: 4,
      titleSpacing: 16,
      title: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          HiroLogo(
            size: HiroLogoSize.compact,
            showText: true,
            showTagline: false,
            onTap: () => _showStatsDialog(),
          ),
          const SizedBox(width: 10),
          _buildCloudPill(service),
        ],
      ),
      actions: [
        // Connect mode toggle
        IconButton(
          onPressed: () => service.toggleConnectMode(),
          icon: Icon(
            Icons.bolt_rounded,
            color: service.isConnectMode ? HiroColors.solarAmber : HiroColors.textSecondary,
          ),
          tooltip: 'Link Mode (⚡)',
        ),

        // Search toggle
        IconButton(
          onPressed: () {
            setState(() {
              _showSearchBar = !_showSearchBar;
            });
          },
          icon: Icon(
            _showSearchBar ? Icons.search_off_rounded : Icons.search_rounded,
            color: _showSearchBar ? HiroColors.neonCyan : HiroColors.textSecondary,
          ),
          tooltip: 'Search & Filter',
        ),

        // Kanban / Canvas toggle
        IconButton(
          onPressed: () {
            setState(() {
              _isKanbanView = !_isKanbanView;
            });
          },
          icon: Icon(
            _isKanbanView ? Icons.grain_rounded : Icons.view_kanban_rounded,
            color: _isKanbanView ? HiroColors.neonCyan : HiroColors.textSecondary,
          ),
          tooltip: _isKanbanView ? 'Canvas View' : 'Kanban Board',
        ),

        // RPG Soul Codex Badge Button
        InkWell(
          onTap: _showRpgDialog,
          borderRadius: BorderRadius.circular(10),
          child: Container(
            margin: const EdgeInsets.symmetric(horizontal: 4, vertical: 10),
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: HiroColors.solarAmber.withOpacity(0.18),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: HiroColors.solarAmber.withOpacity(0.4)),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Lvl ${rpg.level}',
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: HiroColors.solarAmber,
                  ),
                ),
                const SizedBox(width: 4),
                Text(
                  '✨${rpg.spiritualEnergy}',
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
          ),
        ),

        // More Tools Menu (Oracle, Pomodoro, Soundscape, Layout, Grid, Stats)
        PopupMenuButton<String>(
          icon: const Icon(Icons.more_vert_rounded, color: HiroColors.textSecondary),
          color: HiroColors.surfaceElevated,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: const BorderSide(color: HiroColors.borderSubtle),
          ),
          onSelected: (val) {
            switch (val) {
              case 'oracle':
                _showOracleDialog();
                break;
              case 'pomodoro':
                _showPomodoroDialog();
                break;
              case 'soundscape':
                _showSoundscapeDialog();
                break;
              case 'stats':
                _showStatsDialog();
                break;
              case 'layout':
                service.autoLayout();
                break;
              case 'autoconnect':
                service.toggleAutoConnect();
                break;
              case 'grid':
                service.toggleGridSnap();
                break;
              case 'clear':
                service.clearAll();
                break;
            }
          },
          itemBuilder: (context) => [
            const PopupMenuItem(
              value: 'oracle',
              child: Row(
                children: [
                  Text('🔮 ', style: TextStyle(fontSize: 14)),
                  Text('AI Mind-Map Oracle'),
                ],
              ),
            ),
            const PopupMenuItem(
              value: 'pomodoro',
              child: Row(
                children: [
                  Text('⏱ ', style: TextStyle(fontSize: 14)),
                  Text('Focus Pomodoro Timer'),
                ],
              ),
            ),
            const PopupMenuItem(
              value: 'soundscape',
              child: Row(
                children: [
                  Text('🎵 ', style: TextStyle(fontSize: 14)),
                  Text('Soundscape Lab & Synth'),
                ],
              ),
            ),
            const PopupMenuDivider(),
            PopupMenuItem(
              value: 'layout',
              child: const Row(
                children: [
                  Icon(Icons.bubble_chart_outlined, size: 18, color: HiroColors.neonCyan),
                  SizedBox(width: 8),
                  Text('Auto-Layout Graph (⟳)'),
                ],
              ),
            ),
            PopupMenuItem(
              value: 'autoconnect',
              child: Row(
                children: [
                  Icon(
                    Icons.link_rounded,
                    size: 18,
                    color: service.autoConnect ? HiroColors.neonCyan : HiroColors.textMuted,
                  ),
                  const SizedBox(width: 8),
                  Text('Auto-Connect: ${service.autoConnect ? 'ON' : 'OFF'}'),
                ],
              ),
            ),
            PopupMenuItem(
              value: 'grid',
              child: Row(
                children: [
                  Icon(
                    Icons.grid_4x4_rounded,
                    size: 18,
                    color: service.gridSnap ? HiroColors.neonCyan : HiroColors.textMuted,
                  ),
                  const SizedBox(width: 8),
                  Text('Snap to Grid: ${service.gridSnap ? 'ON' : 'OFF'}'),
                ],
              ),
            ),
            const PopupMenuDivider(),
            const PopupMenuItem(
              value: 'stats',
              child: Row(
                children: [
                  Text('📊 ', style: TextStyle(fontSize: 14)),
                  Text('Garden Metrics'),
                ],
              ),
            ),
            const PopupMenuItem(
              value: 'clear',
              child: Row(
                children: [
                  Icon(Icons.delete_sweep_rounded, size: 18, color: HiroColors.crimsonFlare),
                  SizedBox(width: 8),
                  Text('Clear All Nodes', style: TextStyle(color: HiroColors.crimsonFlare)),
                ],
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildCloudPill(GardenService service) {
    final connected = service.isCloudConnected;
    final syncing = service.isSyncing;

    final color = syncing
        ? HiroColors.solarAmber
        : (connected ? HiroColors.neuralEmerald : HiroColors.textMuted);
    final text = syncing
        ? 'Syncing...'
        : (connected ? 'Atlas Cloud' : 'Local Storage');

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 6,
            height: 6,
            decoration: BoxDecoration(color: color, shape: BoxShape.circle),
          ),
          const SizedBox(width: 5),
          Text(
            text,
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w600,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBar(GardenService service) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: HiroColors.surfaceElevated,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: HiroColors.neonCyan.withOpacity(0.5)),
        boxShadow: const [BoxShadow(color: Colors.black54, blurRadius: 10)],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              const Icon(Icons.search_rounded, size: 18, color: HiroColors.neonCyan),
              const SizedBox(width: 8),
              Expanded(
                child: TextField(
                  controller: _searchController,
                  style: const TextStyle(fontSize: 13, color: HiroColors.textPrimary),
                  decoration: const InputDecoration(
                    hintText: 'Search synapses by title, note, or tag...',
                    hintStyle: TextStyle(color: HiroColors.textMuted),
                    isDense: true,
                    border: InputBorder.none,
                  ),
                  onChanged: (val) => service.setSearchQuery(val),
                ),
              ),
              IconButton(
                onPressed: () => service.toggleStarFilter(),
                icon: Icon(
                  service.filterStarred ? Icons.star_rounded : Icons.star_border_rounded,
                  color: service.filterStarred ? HiroColors.solarAmber : HiroColors.textMuted,
                  size: 20,
                ),
                tooltip: 'Filter Starred Only',
              ),
              IconButton(
                onPressed: () {
                  setState(() {
                    _showSearchBar = false;
                    _searchController.clear();
                    service.setSearchQuery('');
                  });
                },
                icon: const Icon(Icons.close_rounded, size: 18, color: HiroColors.textMuted),
              ),
            ],
          ),
          if (service.allTags.isNotEmpty) ...[
            const SizedBox(height: 6),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  ChoiceChip(
                    label: const Text('All Tags'),
                    selected: service.filterTag.isEmpty,
                    onSelected: (_) => service.setFilterTag(''),
                    selectedColor: HiroColors.neonCyan.withOpacity(0.2),
                    backgroundColor: HiroColors.surface,
                    labelStyle: TextStyle(
                      fontSize: 11,
                      color: service.filterTag.isEmpty
                          ? HiroColors.neonCyan
                          : HiroColors.textSecondary,
                    ),
                  ),
                  const SizedBox(width: 6),
                  ...service.allTags.map((tag) {
                    final isSelected = service.filterTag.toLowerCase() == tag.toLowerCase();
                    return Padding(
                      padding: const EdgeInsets.only(right: 6),
                      child: ChoiceChip(
                        label: Text('#$tag'),
                        selected: isSelected,
                        onSelected: (_) => service.setFilterTag(isSelected ? '' : tag),
                        selectedColor: HiroColors.neonCyan.withOpacity(0.25),
                        backgroundColor: HiroColors.surface,
                        labelStyle: TextStyle(
                          fontSize: 11,
                          color: isSelected ? HiroColors.neonCyan : HiroColors.textSecondary,
                        ),
                      ),
                    );
                  }),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildQuickSproutBar(GardenService service) {
    return Center(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: HiroColors.surfaceElevated.withOpacity(0.92),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: HiroColors.borderGlow),
          boxShadow: const [
            BoxShadow(
              color: Colors.black45,
              blurRadius: 16,
              offset: Offset(0, 4),
            ),
          ],
        ),
        child: SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                'SPROUT:',
                style: TextStyle(
                  color: HiroColors.textMuted,
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.0,
                ),
              ),
              const SizedBox(width: 10),
              _buildSproutBtn(service, 'idea', '💡 Idea'),
              const SizedBox(width: 6),
              _buildSproutBtn(service, 'task', '✅ Task'),
              const SizedBox(width: 6),
              _buildSproutBtn(service, 'question', '❓ Question'),
              const SizedBox(width: 6),
              _buildSproutBtn(service, 'resource', '🔗 Resource'),
              const SizedBox(width: 6),
              _buildSproutBtn(service, 'warning', '⚠️ Warning'),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSproutBtn(GardenService service, String type, String label) {
    final color = HiroColors.templateColor(type);

    return InkWell(
      onTap: () {
        // Sprout near viewport center
        service.sproutSynapse(400, 300, type: type);
      },
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: color.withOpacity(0.12),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: color.withOpacity(0.3)),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: color,
            fontSize: 12,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }
}
