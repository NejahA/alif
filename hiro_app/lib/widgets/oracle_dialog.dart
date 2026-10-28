import 'package:flutter/material.dart';

import '../services/garden_service.dart';
import '../theme/hiro_theme.dart';

class OracleDialog extends StatefulWidget {
  final GardenService service;

  const OracleDialog({super.key, required this.service});

  @override
  State<OracleDialog> createState() => _OracleDialogState();
}

class _OracleDialogState extends State<OracleDialog> {
  final TextEditingController _topicController = TextEditingController();

  final List<String> _presets = [
    'Quantum Computing',
    'Deep Space Colonization',
    'Deep Focus & Flow State',
    'Bio-Neural Architectures',
    'Game Engine Mechanics',
    'Philosophy of Consciousness',
  ];

  @override
  void dispose() {
    _topicController.dispose();
    super.dispose();
  }

  void _generate(String topic) {
    if (topic.trim().isEmpty) return;
    widget.service.generateOracleMindMap(topic.trim());
    Navigator.of(context).pop();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('🔮 Mind-Map Tree Sprouted for "$topic"!'),
        backgroundColor: HiroColors.surfaceElevated,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: HiroColors.surfaceElevated,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(24),
        side: const BorderSide(color: HiroColors.astralViolet, width: 1.2),
      ),
      child: Container(
        constraints: const BoxConstraints(maxWidth: 440),
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Title
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: HiroColors.astralViolet.withOpacity(0.18),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Text('🔮', style: TextStyle(fontSize: 20)),
                ),
                const SizedBox(width: 12),
                const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'AI MIND-MAP ORACLE',
                      style: TextStyle(
                        color: HiroColors.astralViolet,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.2,
                      ),
                    ),
                    Text(
                      'Auto-Sprout Topic Trees',
                      style: TextStyle(
                        color: HiroColors.textPrimary,
                        fontSize: 17,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const Spacer(),
                IconButton(
                  onPressed: () => Navigator.of(context).pop(),
                  icon: const Icon(Icons.close_rounded, color: HiroColors.textMuted),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Input
            TextField(
              controller: _topicController,
              style: const TextStyle(color: HiroColors.textPrimary, fontSize: 14),
              decoration: InputDecoration(
                hintText: 'Enter topic (e.g. Cognitive Biases, Space...)...',
                hintStyle: const TextStyle(color: HiroColors.textMuted),
                filled: true,
                fillColor: HiroColors.surface,
                prefixIcon: const Icon(Icons.auto_awesome_rounded, color: HiroColors.astralViolet),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: HiroColors.borderSubtle),
                ),
              ),
              onSubmitted: _generate,
            ),
            const SizedBox(height: 16),

            // Presets
            const Text(
              'QUICK ORACLE SEEDS',
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
              runSpacing: 8,
              children: _presets.map((preset) {
                return ActionChip(
                  label: Text(preset),
                  labelStyle: const TextStyle(fontSize: 12, color: HiroColors.textSecondary),
                  backgroundColor: HiroColors.surface,
                  side: const BorderSide(color: HiroColors.borderSubtle),
                  onPressed: () {
                    _topicController.text = preset;
                    _generate(preset);
                  },
                );
              }).toList(),
            ),
            const SizedBox(height: 24),

            // Sprout button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () => _generate(_topicController.text),
                icon: const Icon(Icons.psychology_rounded, size: 20),
                label: const Text('Sprout Neural Mind-Map (+50 XP)'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: HiroColors.astralViolet.withOpacity(0.25),
                  foregroundColor: HiroColors.astralViolet,
                  side: const BorderSide(color: HiroColors.astralViolet),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
