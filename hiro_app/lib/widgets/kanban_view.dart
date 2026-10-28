import 'package:flutter/material.dart';

import '../models/synapse_model.dart';
import '../services/garden_service.dart';
import '../theme/hiro_theme.dart';

class KanbanView extends StatelessWidget {
  final GardenService service;
  final Function(SynapseModel) onSelectSynapse;

  const KanbanView({
    super.key,
    required this.service,
    required this.onSelectSynapse,
  });

  @override
  Widget build(BuildContext context) {
    final all = service.visibleSynapses;

    final inception = all.where((s) => s.type == 'idea' || s.type == 'question').toList();
    final active = all.where((s) => s.type == 'task' && !s.isCompleted).toList();
    final blooming = all.where((s) => s.charge >= 0.85 && s.type != 'task').toList();
    final completed = all.where((s) => s.isCompleted).toList();

    return Container(
      color: HiroColors.abyss,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.all(16),
        children: [
          _buildColumn(
            context,
            '💡 INCEPTION',
            inception,
            HiroColors.solarAmber,
          ),
          _buildColumn(
            context,
            '⚡ ACTIVE TASKS',
            active,
            HiroColors.neonCyan,
          ),
          _buildColumn(
            context,
            '🌸 BLOOMING NODES',
            blooming,
            HiroColors.astralViolet,
          ),
          _buildColumn(
            context,
            '✅ MANIFESTED',
            completed,
            HiroColors.neuralEmerald,
          ),
        ],
      ),
    );
  }

  Widget _buildColumn(
    BuildContext context,
    String title,
    List<SynapseModel> items,
    Color accentColor,
  ) {
    return Container(
      width: 280,
      margin: const EdgeInsets.only(right: 16),
      decoration: BoxDecoration(
        color: HiroColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: HiroColors.borderSubtle),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Column Header
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              border: Border(
                bottom: BorderSide(color: HiroColors.borderSubtle),
                left: BorderSide(color: accentColor, width: 3),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    color: accentColor,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.0,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: accentColor.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    '${items.length}',
                    style: TextStyle(
                      color: accentColor,
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Cards list
          Expanded(
            child: items.isEmpty
                ? Center(
                    child: Text(
                      'No synapses in this phase',
                      style: TextStyle(color: HiroColors.textMuted, fontSize: 12),
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(12),
                    itemCount: items.length,
                    itemBuilder: (context, index) {
                      final item = items[index];
                      return _buildCard(context, item, accentColor);
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildCard(BuildContext context, SynapseModel syn, Color accentColor) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      color: HiroColors.surfaceElevated,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(
          color: syn.starred ? HiroColors.solarAmber.withOpacity(0.5) : HiroColors.borderSubtle,
        ),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () {
          service.selectSynapse(syn);
          onSelectSynapse(syn);
        },
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text(
                    HiroColors.templateEmoji(syn.type),
                    style: const TextStyle(fontSize: 14),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      syn.title,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                        color: HiroColors.textPrimary,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  if (syn.starred)
                    const Text('⭐', style: TextStyle(fontSize: 12)),
                ],
              ),
              if (syn.notes.isNotEmpty) ...[
                const SizedBox(height: 6),
                Text(
                  syn.notes,
                  style: const TextStyle(
                    fontSize: 12,
                    color: HiroColors.textSecondary,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
              const SizedBox(height: 10),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  if (syn.tag.isNotEmpty)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: HiroColors.surface,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        '#${syn.tag}',
                        style: const TextStyle(fontSize: 10, color: HiroColors.neonCyan),
                      ),
                    )
                  else
                    const SizedBox.shrink(),
                  InkWell(
                    onTap: () => service.fireSynapse(syn.id),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: HiroColors.neonCyan.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.bolt_rounded, size: 12, color: HiroColors.neonCyan),
                          SizedBox(width: 2),
                          Text(
                            'Pulse',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: HiroColors.neonCyan,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
