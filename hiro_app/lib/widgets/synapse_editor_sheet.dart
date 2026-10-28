import 'package:flutter/material.dart';

import '../models/synapse_model.dart';
import '../services/garden_service.dart';
import '../theme/hiro_theme.dart';

class SynapseEditorSheet extends StatefulWidget {
  final SynapseModel synapse;
  final GardenService service;
  final VoidCallback onClose;

  const SynapseEditorSheet({
    super.key,
    required this.synapse,
    required this.service,
    required this.onClose,
  });

  @override
  State<SynapseEditorSheet> createState() => _SynapseEditorSheetState();
}

class _SynapseEditorSheetState extends State<SynapseEditorSheet> {
  late TextEditingController _titleController;
  late TextEditingController _notesController;
  late TextEditingController _tagController;
  late String _currentType;
  late double _currentHue;
  late bool _starred;
  late bool _isCompleted;

  @override
  void initState() {
    super.initState();
    _titleController = TextEditingController(text: widget.synapse.title);
    _notesController = TextEditingController(text: widget.synapse.notes);
    _tagController = TextEditingController(text: widget.synapse.tag);
    _currentType = widget.synapse.type;
    _currentHue = widget.synapse.hue;
    _starred = widget.synapse.starred;
    _isCompleted = widget.synapse.isCompleted;
  }

  @override
  void didUpdateWidget(covariant SynapseEditorSheet oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.synapse.id != widget.synapse.id) {
      _titleController.text = widget.synapse.title;
      _notesController.text = widget.synapse.notes;
      _tagController.text = widget.synapse.tag;
      _currentType = widget.synapse.type;
      _currentHue = widget.synapse.hue;
      _starred = widget.synapse.starred;
      _isCompleted = widget.synapse.isCompleted;
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _notesController.dispose();
    _tagController.dispose();
    super.dispose();
  }

  void _saveChanges() {
    widget.service.updateSynapse(
      widget.synapse.id,
      title: _titleController.text.trim(),
      notes: _notesController.text.trim(),
      tag: _tagController.text.trim(),
      type: _currentType,
      hue: _currentHue,
      starred: _starred,
      isCompleted: _isCompleted,
    );
  }

  @override
  Widget build(BuildContext context) {
    final templateColor = HiroColors.templateColor(_currentType);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      decoration: const BoxDecoration(
        color: HiroColors.surfaceElevated,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        border: Border(
          top: BorderSide(color: HiroColors.borderGlow, width: 1.5),
        ),
      ),
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            // Handle bar
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: HiroColors.borderSubtle,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 14),

            // Header row with Synapse ID badge and actions
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: templateColor.withOpacity(0.18),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: templateColor.withOpacity(0.4)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        HiroColors.templateEmoji(_currentType),
                        style: const TextStyle(fontSize: 14),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        widget.synapse.id.length > 8
                            ? '#${widget.synapse.id.substring(widget.synapse.id.length - 6)}'
                            : widget.synapse.id,
                        style: TextStyle(
                          color: templateColor,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
                const Spacer(),

                // Star toggle
                IconButton(
                  onPressed: () {
                    setState(() {
                      _starred = !_starred;
                    });
                    _saveChanges();
                  },
                  icon: Icon(
                    _starred ? Icons.star_rounded : Icons.star_outline_rounded,
                    color: _starred ? HiroColors.karmaGold : HiroColors.textMuted,
                  ),
                  tooltip: 'Favorite / Star',
                ),

                // Close button
                IconButton(
                  onPressed: widget.onClose,
                  icon: const Icon(Icons.close_rounded, color: HiroColors.textSecondary),
                  tooltip: 'Close Panel',
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Title input
            TextField(
              controller: _titleController,
              onChanged: (_) => _saveChanges(),
              style: const TextStyle(
                color: HiroColors.textPrimary,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
              decoration: const InputDecoration(
                hintText: 'Synapse concept title...',
                hintStyle: TextStyle(color: HiroColors.textMuted),
                border: InputBorder.none,
                contentPadding: EdgeInsets.zero,
              ),
            ),
            const SizedBox(height: 8),

            // Notes input
            TextField(
              controller: _notesController,
              onChanged: (_) => _saveChanges(),
              maxLines: 3,
              style: const TextStyle(
                color: HiroColors.textSecondary,
                fontSize: 13,
              ),
              decoration: InputDecoration(
                hintText: 'Add reflective notes, equations, or thoughts...',
                hintStyle: const TextStyle(color: HiroColors.textMuted),
                filled: true,
                fillColor: HiroColors.surface,
                contentPadding: const EdgeInsets.all(12),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: HiroColors.borderSubtle),
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Template selector
            const Text(
              'THOUGHT TEMPLATE',
              style: TextStyle(
                color: HiroColors.textMuted,
                fontSize: 11,
                fontWeight: FontWeight.bold,
                letterSpacing: 0.8,
              ),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              children: [
                _buildTemplateChip('idea', '💡 Idea'),
                _buildTemplateChip('task', '✅ Task'),
                _buildTemplateChip('question', '❓ Question'),
                _buildTemplateChip('resource', '🔗 Resource'),
                _buildTemplateChip('warning', '⚠️ Warning'),
              ],
            ),
            const SizedBox(height: 16),

            // Task completion checkbox if type is task
            if (_currentType == 'task') ...[
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: _isCompleted
                      ? HiroColors.neuralEmerald.withOpacity(0.15)
                      : HiroColors.surface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: _isCompleted
                        ? HiroColors.neuralEmerald
                        : HiroColors.borderSubtle,
                  ),
                ),
                child: Row(
                  children: [
                    Checkbox(
                      value: _isCompleted,
                      activeColor: HiroColors.neuralEmerald,
                      onChanged: (val) {
                        setState(() {
                          _isCompleted = val ?? false;
                        });
                        _saveChanges();
                      },
                    ),
                    Text(
                      _isCompleted ? 'Task Completed (+25 XP)' : 'Mark as Completed',
                      style: TextStyle(
                        color: _isCompleted
                            ? HiroColors.neuralEmerald
                            : HiroColors.textPrimary,
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
            ],

            // Tag input
            Row(
              children: [
                const Icon(Icons.tag_rounded, size: 18, color: HiroColors.neonCyan),
                const SizedBox(width: 8),
                Expanded(
                  child: TextField(
                    controller: _tagController,
                    onChanged: (_) => _saveChanges(),
                    style: const TextStyle(fontSize: 13, color: HiroColors.textPrimary),
                    decoration: const InputDecoration(
                      hintText: 'tag (e.g. quantum, logic, vision)',
                      hintStyle: TextStyle(color: HiroColors.textMuted),
                      isDense: true,
                      border: InputBorder.none,
                    ),
                  ),
                ),
              ],
            ),
            const Divider(color: HiroColors.borderSubtle, height: 24),

            // Action buttons row
            Row(
              children: [
                // Fire pulse button
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () {
                      widget.service.fireSynapse(widget.synapse.id);
                    },
                    icon: const Icon(Icons.bolt_rounded, size: 18),
                    label: const Text('Fire Pulse'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: HiroColors.neonCyan.withOpacity(0.2),
                      foregroundColor: HiroColors.neonCyan,
                      side: const BorderSide(color: HiroColors.neonCyan),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),

                // Focus Pomodoro button
                IconButton.filledTonal(
                  onPressed: () {
                    widget.service.bindPomodoroSynapse(widget.synapse.id);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Bound Pomodoro to "${widget.synapse.title}"'),
                        backgroundColor: HiroColors.surfaceElevated,
                        duration: const Duration(seconds: 2),
                      ),
                    );
                  },
                  icon: const Icon(Icons.timer_outlined, color: HiroColors.solarAmber),
                  tooltip: 'Bind Pomodoro Focus',
                ),
                const SizedBox(width: 4),

                // Delete button
                IconButton.filledTonal(
                  onPressed: () {
                    widget.service.deleteSynapse(widget.synapse.id);
                    widget.onClose();
                  },
                  icon: const Icon(Icons.delete_outline_rounded, color: HiroColors.crimsonFlare),
                  tooltip: 'Delete Synapse',
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTemplateChip(String type, String label) {
    final isSelected = _currentType == type;
    final color = HiroColors.templateColor(type);

    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (val) {
        if (val) {
          setState(() {
            _currentType = type;
          });
          _saveChanges();
        }
      },
      selectedColor: color.withOpacity(0.25),
      backgroundColor: HiroColors.surface,
      labelStyle: TextStyle(
        color: isSelected ? color : HiroColors.textSecondary,
        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
        fontSize: 12,
      ),
      side: BorderSide(
        color: isSelected ? color : HiroColors.borderSubtle,
      ),
    );
  }
}
