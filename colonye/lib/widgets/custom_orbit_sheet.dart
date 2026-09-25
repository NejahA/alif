import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/colonye_provider.dart';
import '../theme/app_theme.dart';

class CustomOrbitSheet extends StatefulWidget {
  const CustomOrbitSheet({super.key});

  @override
  State<CustomOrbitSheet> createState() => _CustomOrbitSheetState();
}

class _CustomOrbitSheetState extends State<CustomOrbitSheet> {
  final _titleController = TextEditingController();
  final _categoryController = TextEditingController();

  Color _selectedColor = AppTheme.quantumCyan;
  IconData _selectedIcon = Icons.auto_awesome_rounded;

  final List<Color> _colors = const [
    AppTheme.quantumCyan,
    AppTheme.nebulaViolet,
    AppTheme.astralGold,
    AppTheme.auroraRose,
    AppTheme.emeraldZen,
  ];

  final List<IconData> _icons = const [
    Icons.auto_awesome_rounded,
    Icons.self_improvement_rounded,
    Icons.bolt_rounded,
    Icons.favorite_rounded,
    Icons.menu_book_rounded,
    Icons.fitness_center_rounded,
    Icons.code_rounded,
    Icons.music_note_rounded,
  ];

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: Container(
        decoration: const BoxDecoration(
          color: AppTheme.deepSpace,
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
          border: Border(top: BorderSide(color: AppTheme.glassBorder, width: 1.5)),
        ),
        padding: const EdgeInsets.all(22),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.white24,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Text(
                'Create Custom Orbit Node',
                style: Theme.of(context).textTheme.displayMedium?.copyWith(fontSize: 20),
              ),
              const SizedBox(height: 16),

              // Title Field
              TextField(
                controller: _titleController,
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  hintText: 'Orbit Node Title (e.g. Daily Coding, Stargazing)',
                  hintStyle: const TextStyle(color: Colors.white38),
                  filled: true,
                  fillColor: AppTheme.glassSurface,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: const BorderSide(color: AppTheme.glassBorder),
                  ),
                ),
              ),
              const SizedBox(height: 12),

              // Category Field
              TextField(
                controller: _categoryController,
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  hintText: 'Category (e.g. Focus, Creation, Mind)',
                  hintStyle: const TextStyle(color: Colors.white38),
                  filled: true,
                  fillColor: AppTheme.glassSurface,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: const BorderSide(color: AppTheme.glassBorder),
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Color Selector
              Text('Resonance Color', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 14)),
              const SizedBox(height: 8),
              Row(
                children: _colors.map((c) {
                  final isSel = _selectedColor == c;
                  return GestureDetector(
                    onTap: () => setState(() => _selectedColor = c),
                    child: Container(
                      margin: const EdgeInsets.only(right: 12),
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        color: c,
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: isSel ? Colors.white : Colors.transparent,
                          width: 2.5,
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),

              const SizedBox(height: 16),

              // Icon Selector
              Text('Node Icon', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 14)),
              const SizedBox(height: 8),
              Wrap(
                spacing: 10,
                children: _icons.map((ic) {
                  final isSel = _selectedIcon == ic;
                  return GestureDetector(
                    onTap: () => setState(() => _selectedIcon = ic),
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: isSel ? _selectedColor.withOpacity(0.2) : AppTheme.glassSurface,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: isSel ? _selectedColor : AppTheme.glassBorder),
                      ),
                      child: Icon(ic, color: isSel ? _selectedColor : Colors.white54, size: 22),
                    ),
                  );
                }).toList(),
              ),

              const SizedBox(height: 22),

              // Submit Button
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _selectedColor,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  onPressed: () {
                    if (_titleController.text.isNotEmpty) {
                      Provider.of<ColonyeProvider>(context, listen: false).addCustomNode(
                        title: _titleController.text,
                        category: _categoryController.text.isEmpty ? 'Personal' : _categoryController.text,
                        color: _selectedColor,
                        icon: _selectedIcon,
                      );
                      Navigator.pop(context);
                    }
                  },
                  child: const Text(
                    'Launch Orbit Node',
                    style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
