import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:culinara/core/providers.dart';
import 'package:culinara/core/theme.dart';

class KitchenNotebookScreen extends ConsumerStatefulWidget {
  const KitchenNotebookScreen({super.key});

  @override
  ConsumerState<KitchenNotebookScreen> createState() => _KitchenNotebookScreenState();
}

class _KitchenNotebookScreenState extends ConsumerState<KitchenNotebookScreen> {
  final _searchController = TextEditingController();
  NoteCategory? _selectedCategory;
  String _searchQuery = '';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final notes = ref.watch(kitchenNotesProvider);
    final session = ref.watch(chefSessionProvider);

    final filteredNotes = notes.entries.where((entry) {
      final note = entry.value;
      final matchesCategory = _selectedCategory == null || note.category == _selectedCategory;
      final matchesSearch = _searchQuery.isEmpty ||
          note.text.toLowerCase().contains(_searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    }).toList();

    return Container(
      decoration: BoxDecoration(gradient: CuisineTheme.kitchenWarmth),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        "Kitchen Notebook",
                        style: GoogleFonts.playfairDisplay(
                          fontSize: 26,
                          fontWeight: FontWeight.w900,
                          color: CuisineTheme.cream,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        "Observations & refinement logs",
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          fontStyle: FontStyle.italic,
                          color: CuisineTheme.cream.withValues(alpha: 0.4),
                        ),
                      ),
                    ],
                  ),
                  Icon(LucideIcons.scrollText, size: 24, color: CuisineTheme.saffron.withValues(alpha: 0.5)),
                ],
              ),

              const SizedBox(height: 24),

              // Search Bar
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                decoration: BoxDecoration(
                  color: CuisineTheme.darkWalnut.withValues(alpha: 0.3),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: CuisineTheme.cream.withValues(alpha: 0.05)),
                ),
                child: TextField(
                  controller: _searchController,
                  onChanged: (val) => setState(() => _searchQuery = val),
                  style: GoogleFonts.inter(fontSize: 13, color: CuisineTheme.cream),
                  decoration: InputDecoration(
                    hintText: "Search your observations...",
                    hintStyle: GoogleFonts.inter(fontSize: 13, color: CuisineTheme.cream.withValues(alpha: 0.2)),
                    border: InputBorder.none,
                    icon: Icon(LucideIcons.search, size: 16, color: CuisineTheme.cream.withValues(alpha: 0.2)),
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Category filters
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _buildCategoryChip("ALL", _selectedCategory == null, () => setState(() => _selectedCategory = null)),
                    ...NoteCategory.values.map((cat) => _buildCategoryChip(
                          cat.name.toUpperCase(),
                          _selectedCategory == cat,
                          () => setState(() => _selectedCategory = cat),
                        )),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              Expanded(
                child: filteredNotes.isEmpty
                    ? _buildEmptyState()
                    : ListView.separated(
                        itemCount: filteredNotes.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 16),
                        padding: const EdgeInsets.only(bottom: 24),
                        itemBuilder: (context, index) {
                          final entry = filteredNotes[index];
                          final stepIndex = entry.key;
                          final note = entry.value;
                          final step = session.steps[stepIndex % session.steps.length];

                          return Container(
                            padding: const EdgeInsets.all(20),
                            decoration: BoxDecoration(
                              color: CuisineTheme.darkWalnut.withValues(alpha: 0.4),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: CuisineTheme.saffron.withValues(alpha: 0.1)),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.2),
                                  blurRadius: 10,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                      decoration: BoxDecoration(
                                        color: _getCategoryColor(note.category).withValues(alpha: 0.1),
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Text(
                                        note.category.name.toUpperCase(),
                                        style: GoogleFonts.inter(
                                          fontSize: 9,
                                          fontWeight: FontWeight.w800,
                                          color: _getCategoryColor(note.category),
                                        ),
                                      ),
                                    ),
                                    Text(
                                      "${step.label.replaceAll('_', ' ')} • Step ${stepIndex + 1}",
                                      style: GoogleFonts.inter(
                                        fontSize: 9,
                                        fontWeight: FontWeight.w500,
                                        color: CuisineTheme.cream.withValues(alpha: 0.3),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 12),
                                Text(
                                  note.text,
                                  style: GoogleFonts.inter(
                                    fontSize: 13,
                                    height: 1.6,
                                    color: CuisineTheme.cream,
                                  ),
                                ),
                                const SizedBox(height: 16),
                                Row(
                                  children: [
                                    const Icon(LucideIcons.clock, size: 10, color: CuisineTheme.saffron),
                                    const SizedBox(width: 6),
                                    Text(
                                      "${_formatTimestamp(note.timestamp)} • ${session.recipeName}",
                                      style: GoogleFonts.inter(
                                        fontSize: 10,
                                        fontWeight: FontWeight.w600,
                                        color: CuisineTheme.saffron.withValues(alpha: 0.6),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          );
                        },
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCategoryChip(String label, bool isSelected, VoidCallback onTap) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
          decoration: BoxDecoration(
            color: isSelected ? CuisineTheme.terracotta.withValues(alpha: 0.15) : CuisineTheme.darkWalnut.withValues(alpha: 0.4),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: isSelected ? CuisineTheme.terracotta.withValues(alpha: 0.4) : CuisineTheme.cream.withValues(alpha: 0.05)),
          ),
          child: Text(
            label,
            style: GoogleFonts.inter(
              fontSize: 9,
              fontWeight: FontWeight.w700,
              color: isSelected ? CuisineTheme.terracotta : CuisineTheme.cream.withValues(alpha: 0.4),
            ),
          ),
        ),
      ),
    );
  }

  Color _getCategoryColor(NoteCategory category) {
    switch (category) {
      case NoteCategory.technique: return CuisineTheme.saffron;
      case NoteCategory.flavor: return CuisineTheme.paprika;
      case NoteCategory.procedure: return CuisineTheme.olive;
      case NoteCategory.ingredient: return CuisineTheme.terracotta;
    }
  }

  String _formatTimestamp(DateTime dt) {
    return "${dt.day}/${dt.month} ${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}";
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(LucideIcons.penTool, size: 48, color: CuisineTheme.cream.withValues(alpha: 0.08)),
          const SizedBox(height: 16),
          Text(
            "Your notebook is clean",
            style: GoogleFonts.playfairDisplay(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: CuisineTheme.cream.withValues(alpha: 0.3),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            "Jot down notes during your service\nto refine your techniques.",
            textAlign: TextAlign.center,
            style: GoogleFonts.inter(
              fontSize: 12,
              height: 1.5,
              color: CuisineTheme.cream.withValues(alpha: 0.2),
            ),
          ),
        ],
      ),
    );
  }
}
