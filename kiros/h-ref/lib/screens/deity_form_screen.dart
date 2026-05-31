import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../models/deity.dart';
import '../providers/deity_provider.dart';
import '../theme.dart';

class DeityFormScreen extends StatefulWidget {
  final Deity? deity; // null = create, non-null = edit

  const DeityFormScreen({super.key, this.deity});

  @override
  State<DeityFormScreen> createState() => _DeityFormScreenState();
}

class _DeityFormScreenState extends State<DeityFormScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameCtrl;
  late TextEditingController _originCtrl;
  late TextEditingController _domainCtrl;
  late TextEditingController _descCtrl;
  late TextEditingController _symbolCtrl;
  late TextEditingController _aliasesCtrl;
  late DeityCategory _selectedCategory;
  bool _isSaving = false;

  bool get isEditing => widget.deity != null;

  @override
  void initState() {
    super.initState();
    final d = widget.deity;
    _nameCtrl = TextEditingController(text: d?.name ?? '');
    _originCtrl = TextEditingController(text: d?.origin ?? '');
    _domainCtrl = TextEditingController(text: d?.domain ?? '');
    _descCtrl = TextEditingController(text: d?.description ?? '');
    _symbolCtrl = TextEditingController(text: d?.symbol ?? '');
    _aliasesCtrl =
        TextEditingController(text: d?.aliases.join(', ') ?? '');
    _selectedCategory = d?.category ?? DeityCategory.ancient;
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _originCtrl.dispose();
    _domainCtrl.dispose();
    _descCtrl.dispose();
    _symbolCtrl.dispose();
    _aliasesCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSaving = true);

    final aliases = _aliasesCtrl.text
        .split(',')
        .map((s) => s.trim())
        .where((s) => s.isNotEmpty)
        .toList();

    final provider = context.read<DeityProvider>();

    if (isEditing) {
      await provider.updateDeity(
        id: widget.deity!.id,
        name: _nameCtrl.text.trim(),
        origin: _originCtrl.text.trim(),
        domain: _domainCtrl.text.trim(),
        description: _descCtrl.text.trim(),
        symbol: _symbolCtrl.text.trim(),
        category: _selectedCategory,
        aliases: aliases,
      );
    } else {
      await provider.addDeity(
        name: _nameCtrl.text.trim(),
        origin: _originCtrl.text.trim(),
        domain: _domainCtrl.text.trim(),
        description: _descCtrl.text.trim(),
        symbol: _symbolCtrl.text.trim(),
        category: _selectedCategory,
        aliases: aliases,
      );
    }

    if (mounted) Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bgDark,
      appBar: AppBar(
        title: Text(isEditing ? 'Edit Deity' : 'New Deity'),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          if (_isSaving)
            const Center(
              child: Padding(
                padding: EdgeInsets.only(right: 16),
                child: SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: AppTheme.accent,
                  ),
                ),
              ),
            )
          else
            TextButton(
              onPressed: _save,
              child: Text(
                isEditing ? 'SAVE' : 'CREATE',
                style: GoogleFonts.cinzel(
                  color: AppTheme.accent,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 1.5,
                ),
              ),
            ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            _SectionHeader(title: 'Identity'),
            const SizedBox(height: 12),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: _FieldBox(
                    label: 'Name *',
                    controller: _nameCtrl,
                    hint: 'e.g. Zeus',
                    validator: (v) =>
                        v == null || v.trim().isEmpty ? 'Required' : null,
                  ),
                ),
                const SizedBox(width: 12),
                SizedBox(
                  width: 72,
                  child: _FieldBox(
                    label: 'Symbol *',
                    controller: _symbolCtrl,
                    hint: '⚡',
                    validator: (v) =>
                        v == null || v.trim().isEmpty ? 'Required' : null,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            _FieldBox(
              label: 'Origin / Mythology *',
              controller: _originCtrl,
              hint: 'e.g. Ancient Greece',
              validator: (v) =>
                  v == null || v.trim().isEmpty ? 'Required' : null,
            ),
            const SizedBox(height: 14),
            _FieldBox(
              label: 'Domain / Title *',
              controller: _domainCtrl,
              hint: 'e.g. God of Thunder & Sky',
              validator: (v) =>
                  v == null || v.trim().isEmpty ? 'Required' : null,
            ),
            const SizedBox(height: 24),
            _SectionHeader(title: 'Category'),
            const SizedBox(height: 12),
            _CategorySelector(
              selected: _selectedCategory,
              onChanged: (c) => setState(() => _selectedCategory = c),
            ),
            const SizedBox(height: 24),
            _SectionHeader(title: 'Details'),
            const SizedBox(height: 12),
            _FieldBox(
              label: 'Description *',
              controller: _descCtrl,
              hint: 'Describe this deity\'s mythology, powers, and significance...',
              maxLines: 5,
              validator: (v) =>
                  v == null || v.trim().isEmpty ? 'Required' : null,
            ),
            const SizedBox(height: 14),
            _FieldBox(
              label: 'Aliases (comma-separated)',
              controller: _aliasesCtrl,
              hint: 'e.g. Jupiter, Dias, Jove',
              maxLines: 2,
            ),
            const SizedBox(height: 40),
            ElevatedButton(
              onPressed: _isSaving ? null : _save,
              child: Text(isEditing ? 'UPDATE DEITY' : 'ADD TO REGISTRY'),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  const _SectionHeader({required this.title});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Text(
          title.toUpperCase(),
          style: GoogleFonts.cinzel(
            color: AppTheme.accent,
            fontSize: 11,
            fontWeight: FontWeight.w700,
            letterSpacing: 2.5,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Container(height: 1, color: AppTheme.accent.withOpacity(0.2)),
        ),
      ],
    );
  }
}

class _FieldBox extends StatelessWidget {
  final String label;
  final TextEditingController controller;
  final String? hint;
  final int maxLines;
  final String? Function(String?)? validator;

  const _FieldBox({
    required this.label,
    required this.controller,
    this.hint,
    this.maxLines = 1,
    this.validator,
  });

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      maxLines: maxLines,
      style: GoogleFonts.lato(color: AppTheme.textPrimary, fontSize: 14),
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
      ),
      validator: validator,
    );
  }
}

class _CategorySelector extends StatelessWidget {
  final DeityCategory selected;
  final ValueChanged<DeityCategory> onChanged;

  const _CategorySelector({
    required this.selected,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: DeityCategory.values.map((cat) {
        final isSelected = cat == selected;
        final color = AppTheme.categoryColors[cat.name] ?? AppTheme.accentSoft;
        return GestureDetector(
          onTap: () => onChanged(cat),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: isSelected ? color.withOpacity(0.25) : AppTheme.bgCardLight,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: isSelected ? color : const Color(0xFF2A2A4A),
                width: isSelected ? 1.5 : 1,
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(cat.emoji, style: const TextStyle(fontSize: 14)),
                const SizedBox(width: 6),
                Text(
                  cat.displayName,
                  style: GoogleFonts.cinzel(
                    color: isSelected ? color : AppTheme.textSecondary,
                    fontSize: 10.5,
                    fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                    letterSpacing: 0.5,
                  ),
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }
}
