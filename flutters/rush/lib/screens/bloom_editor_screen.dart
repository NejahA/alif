import 'package:flutter/material.dart';
import '../models/bloom.dart';
import '../services/hive_controller.dart';

/// Create or edit a bloom (flower) and manage its flight paths.
class BloomEditorScreen extends StatefulWidget {
  final HiveController controller;
  final Bloom? initial;

  const BloomEditorScreen({super.key, required this.controller, this.initial});

  @override
  State<BloomEditorScreen> createState() => _BloomEditorScreenState();
}

class _BloomEditorScreenState extends State<BloomEditorScreen> {
  late final TextEditingController _title;
  late final TextEditingController _body;
  late final TextEditingController _tags;
  late int _nectar;
  late List<String> _tagList;
  final _tagFocus = FocusNode();

  bool get _isNew => widget.initial == null;

  @override
  void initState() {
    super.initState();
    final b = widget.initial;
    _title = TextEditingController(text: b?.title ?? '');
    _body = TextEditingController(text: b?.body ?? '');
    _tagList = List.of(b?.tags ?? []);
    _tags = TextEditingController(text: _tagList.join(', '));
    _nectar = b?.nectar ?? 3;
  }

  @override
  void dispose() {
    _title.dispose();
    _body.dispose();
    _tags.dispose();
    _tagFocus.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFDF6E3),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        foregroundColor: const Color(0xFF5D4037),
        title: Text(
          _isNew ? 'New Bloom' : 'Edit Bloom',
          style: const TextStyle(color: Color(0xFF5D4037)),
        ),
        actions: [
          if (!_isNew)
            IconButton(
              icon: const Icon(Icons.delete_outline, color: Colors.white70),
              onPressed: _delete,
            ),
          TextButton(
            onPressed: _save,
            child: const Text('Save', style: TextStyle(color: Color(0xFF5D4037))),
          ),
        ],
      ),
      body: AnimatedBuilder(
        animation: widget.controller,
        builder: (context, _) {
          return ListView(
            padding: const EdgeInsets.all(20),
            children: [
              TextField(
                controller: _title,
                style: const TextStyle(color: Color(0xFF3E2723), fontSize: 20),
                decoration: _dec('Title', Icons.local_florist),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _body,
                maxLines: 6,
                style: const TextStyle(color: Color(0xFF3E2723)),
                decoration: _dec('What is this memory?', Icons.notes),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _tags,
                style: const TextStyle(color: Color(0xFF3E2723)),
                decoration: _dec('Tags (comma separated)', Icons.tag),
                onSubmitted: (_) => _parseTags(),
              ),
              const SizedBox(height: 24),
              _buildNectarSelector(),
              if (!_isNew && widget.controller.blooms.length > 1) ...[
                const SizedBox(height: 24),
                _buildPathSection(),
              ],
              const SizedBox(height: 32),
            ],
          );
        },
      ),
    );
  }

  InputDecoration _dec(String label, IconData icon) => InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: Color(0xFF8D6E63)),
        prefixIcon: Icon(icon, color: const Color(0xFF8D6E63)),
        filled: true,
        fillColor: Colors.white.withValues(alpha: 0.7),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: Color(0x558D6E63)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: Color(0x558D6E63)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: Color(0xFFFFB300), width: 2),
        ),
      );

  Widget _buildNectarSelector() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Nectar level',
          style: TextStyle(color: Color(0xFF5D4037), fontSize: 16),
        ),
        const SizedBox(height: 8),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: List.generate(5, (i) {
            final value = i + 1;
            final selected = value == _nectar;
            return GestureDetector(
              onTap: () => setState(() => _nectar = value),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: RadialGradient(
                    colors: [
                      _nectarColor(value),
                      _nectarColor(value).withValues(alpha: 0.4),
                    ],
                  ),
                  border: Border.all(
                    color: selected
                        ? const Color(0xFF5D4037)
                        : const Color(0x338D6E63),
                    width: selected ? 2.5 : 1,
                  ),
                  boxShadow: selected
                      ? [
                          BoxShadow(
                            color: _nectarColor(value).withValues(alpha: 0.6),
                            blurRadius: 12,
                          ),
                        ]
                      : null,
                ),
                child: Icon(
                  value <= 2
                      ? Icons.water_drop_outlined
                      : value == 3
                          ? Icons.local_florist_outlined
                          : Icons.opacity,
                  color: Colors.white.withValues(alpha: 0.9),
                ),
              ),
            );
          }),
        ),
      ],
    );
  }

  Color _nectarColor(int nectar) {
    const colors = [
      Color(0xFFB0BEC5),
      Color(0xFFAED581),
      Color(0xFFFFD54F),
      Color(0xFFFFB300),
      Color(0xFFFF7043),
    ];
    return colors[nectar - 1];
  }

  Widget _buildPathSection() {
    final bloom = widget.initial!;
    final paths = widget.controller.pathsFor(bloom.id);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Flight paths',
          style: TextStyle(color: Color(0xFF5D4037), fontSize: 16),
        ),
        const SizedBox(height: 8),
        Container(
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.7),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0x558D6E63)),
          ),
          padding: const EdgeInsets.all(12),
          child: paths.isEmpty
              ? const Text(
                  'No flight paths yet. Link blooms from the meadow view by '
                  'long-pressing one then tapping another.',
                  style: TextStyle(color: Color(0xFF8D6E63), fontSize: 13),
                )
              : Column(
                  children: paths.map((path) {
                    final otherId = path.fromId == bloom.id
                        ? path.toId
                        : path.fromId;
                    final other = widget.controller.bloomById(otherId);
                    return ListTile(
                      contentPadding: EdgeInsets.zero,
                      dense: true,
                      leading: const Icon(
                        Icons.flight_takeoff,
                        color: Color(0xFFFFB300),
                      ),
                      title: Text(
                        other?.title ?? 'Unknown',
                        style: const TextStyle(color: Color(0xFF3E2723)),
                      ),
                      subtitle: Text(
                        '${path.label} · ${(path.strength * 100).round()}%',
                        style: const TextStyle(color: Color(0xFF8D6E63)),
                      ),
                      trailing: IconButton(
                        icon: const Icon(Icons.close,
                            color: Color(0x558D6E63), size: 18),
                        onPressed: () =>
                            widget.controller.deletePath(path.id),
                      ),
                    );
                  }).toList(),
                ),
        ),
      ],
    );
  }

  void _parseTags() {
    setState(() {
      _tagList = _tags.text
          .split(',')
          .map((s) => s.trim())
          .where((s) => s.isNotEmpty)
          .toList();
      _tags.text = _tagList.join(', ');
    });
  }

  Future<void> _save() async {
    _parseTags();
    final title = _title.text.trim();
    if (title.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Give this bloom a title.')),
      );
      return;
    }

    if (_isNew) {
      final b = widget.controller.addBloom(
        title: title,
        body: _body.text.trim(),
        tags: _tagList,
        nectar: _nectar,
      );
      if (mounted) Navigator.pop(context, b.id);
    } else {
      await widget.controller.updateBloom(
        widget.initial!.copyWith(
          title: title,
          body: _body.text.trim(),
          tags: _tagList,
          nectar: _nectar,
        ),
      );
      if (mounted) Navigator.pop(context);
    }
  }

  Future<void> _delete() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFFFDF6E3),
        title: const Text('Delete this bloom?',
            style: TextStyle(color: Color(0xFF3E2723))),
        content: const Text(
          'The bloom and all its flight paths will vanish from your meadow.',
          style: TextStyle(color: Color(0xFF5D4037)),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Delete', style: TextStyle(color: Colors.redAccent)),
          ),
        ],
      ),
    );
    if (confirmed == true && mounted) {
      await widget.controller.deleteBloom(widget.initial!.id);
      if (mounted) Navigator.pop(context);
    }
  }
}