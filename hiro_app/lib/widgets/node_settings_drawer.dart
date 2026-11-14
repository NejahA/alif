import 'dart:convert';
import 'package:flutter/material.dart';
import '../models/synapse_model.dart';
import '../services/garden_service.dart';
import '../theme/hiro_theme.dart';

class NodeSettingsDrawer extends StatefulWidget {
  final SynapseModel node;
  final GardenService service;
  const NodeSettingsDrawer({Key? key, required this.node, required this.service}) : super(key: key);

  @override
  State<NodeSettingsDrawer> createState() => _NodeSettingsDrawerState();
}

class _NodeSettingsDrawerState extends State<NodeSettingsDrawer> {
  late bool isFixed;
  late double driftSpeed;
  late double repulsionStrength;
  late double hue;
  late TextEditingController metadataCtrl;

  @override
  void initState() {
    super.initState();
    isFixed = widget.node.isFixed;
    driftSpeed = widget.node.driftSpeed;
    repulsionStrength = widget.node.repulsionStrength;
    hue = widget.node.hue;
    metadataCtrl = TextEditingController(text: jsonEncode(widget.node.metadata));
  }

  void _applyChanges() {
    Map<String, dynamic> meta = {};
    try {
      meta = jsonDecode(metadataCtrl.text) as Map<String, dynamic>;
    } catch (_) {}
    final updated = widget.node.copyWith(
      isFixed: isFixed,
      driftSpeed: driftSpeed,
      repulsionStrength: repulsionStrength,
      hue: hue,
      metadata: meta,
    );
    widget.service.updateNode(updated);
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    return Drawer(
      backgroundColor: HiroColors.surface,
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Node Settings', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              const SizedBox(height: 20),
              SwitchListTile(
                title: const Text('Fixed (no drift/repulsion)'),
                value: isFixed,
                onChanged: (v) => setState(() => isFixed = v),
              ),
              const SizedBox(height: 12),
              Text('Drift Speed: ${driftSpeed.toStringAsFixed(2)}'),
              Slider(
                min: 0.0,
                max: 5.0,
                divisions: 50,
                value: driftSpeed,
                onChanged: (v) => setState(() => driftSpeed = v),
              ),
              const SizedBox(height: 12),
              Text('Repulsion Strength: ${repulsionStrength.toStringAsFixed(2)}'),
              Slider(
                min: 0.0,
                max: 5.0,
                divisions: 50,
                value: repulsionStrength,
                onChanged: (v) => setState(() => repulsionStrength = v),
              ),
              const SizedBox(height: 12),
              Text('Hue: ${hue.toStringAsFixed(0)}°'),
              Slider(
                min: 0.0,
                max: 360.0,
                divisions: 360,
                value: hue,
                onChanged: (v) => setState(() => hue = v),
              ),
              const SizedBox(height: 12),
              const Text('Metadata (JSON)'),
              Expanded(
                child: TextField(
                  controller: metadataCtrl,
                  maxLines: null,
                  expands: true,
                  decoration: const InputDecoration(
                    border: OutlineInputBorder(),
                    hintText: '{"key":"value"}',
                  ),
                ),
              ),
              const SizedBox(height: 12),
              ElevatedButton.icon(
                onPressed: _applyChanges,
                icon: const Icon(Icons.save),
                label: const Text('Save'),
                style: ElevatedButton.styleFrom(backgroundColor: HiroColors.solarAmber),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
