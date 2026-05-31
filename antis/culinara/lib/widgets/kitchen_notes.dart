import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:culinara/core/providers.dart';
import 'package:culinara/core/theme.dart';

class KitchenNotes extends ConsumerStatefulWidget {
  const KitchenNotes({super.key});

  @override
  ConsumerState<KitchenNotes> createState() => _KitchenNotesState();
}

class _KitchenNotesState extends ConsumerState<KitchenNotes>
    with SingleTickerProviderStateMixin {
  late AnimationController _expandController;
  late Animation<double> _expandAnim;
  bool _isExpanded = false;
  final _controller = TextEditingController();
  final _focusNode = FocusNode();

  @override
  void initState() {
    super.initState();
    _expandController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _expandAnim = CurvedAnimation(
      parent: _expandController,
      curve: Curves.easeOutCubic,
    );
  }

  @override
  void dispose() {
    _expandController.dispose();
    _controller.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _toggle() {
    setState(() {
      _isExpanded = !_isExpanded;
      if (_isExpanded) {
        _expandController.forward();
        final session = ref.read(chefSessionProvider);
        final note = ref.read(kitchenNotesProvider)[session.currentStepIndex];
        _controller.text = note?.text ?? '';
      } else {
        _expandController.reverse();
        _focusNode.unfocus();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final session = ref.watch(chefSessionProvider);
    final notes = ref.watch(kitchenNotesProvider);
    final currentNote = notes[session.currentStepIndex];
    final hasNote = currentNote != null && currentNote.text.isNotEmpty;

    return Column(
      children: [
        // Toggle bar
        GestureDetector(
          onTap: _toggle,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            decoration: BoxDecoration(
              color: hasNote
                  ? CuisineTheme.saffron.withValues(alpha: 0.08)
                  : CuisineTheme.darkWalnut.withValues(alpha: 0.3),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: hasNote
                    ? CuisineTheme.saffron.withValues(alpha: 0.2)
                    : CuisineTheme.cream.withValues(alpha: 0.04),
              ),
            ),
            child: Row(
              children: [
                Icon(
                  LucideIcons.stickyNote,
                  size: 14,
                  color: hasNote
                      ? CuisineTheme.saffron
                      : CuisineTheme.cream.withValues(alpha: 0.3),
                ),
                const SizedBox(width: 10),
                Text(
                  "Kitchen Notes",
                  style: GoogleFonts.inter(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: hasNote
                        ? CuisineTheme.saffron
                        : CuisineTheme.cream.withValues(alpha: 0.3),
                  ),
                ),
                const Spacer(),
                AnimatedRotation(
                  turns: _isExpanded ? 0.5 : 0,
                  duration: const Duration(milliseconds: 300),
                  child: Icon(
                    LucideIcons.chevronDown,
                    size: 14,
                    color: CuisineTheme.cream.withValues(alpha: 0.3),
                  ),
                ),
              ],
            ),
          ),
        ),

        // Expandable area
        SizeTransition(
          sizeFactor: _expandAnim,
          axisAlignment: -1.0,
          child: Padding(
            padding: const EdgeInsets.only(top: 8),
            child: Column(
              children: [
                TextField(
                  controller: _controller,
                  focusNode: _focusNode,
                  maxLines: 4,
                  scrollPadding: const EdgeInsets.only(bottom: 100), // Ensures keyboard doesn't cover text
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    color: CuisineTheme.cream.withValues(alpha: 0.8),
                    height: 1.5,
                  ),
                  decoration: InputDecoration(
                    hintText: "Jot your observations for this step...",
                    hintStyle: GoogleFonts.inter(
                      fontSize: 12,
                      color: CuisineTheme.cream.withValues(alpha: 0.2),
                      fontStyle: FontStyle.italic,
                    ),
                    border: InputBorder.none,
                    contentPadding: const EdgeInsets.all(16),
                  ),
                  onChanged: (text) {
                    ref
                        .read(kitchenNotesProvider.notifier)
                        .updateNote(session.currentStepIndex, text);
                  },
                ),
                Padding(
                  padding: const EdgeInsets.only(left: 16, right: 16, bottom: 16),
                  child: Row(
                    children: [
                      Text(
                        "TAG AS:",
                        style: GoogleFonts.inter(
                          fontSize: 8,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 1,
                          color: CuisineTheme.cream.withValues(alpha: 0.2),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: SingleChildScrollView(
                          scrollDirection: Axis.horizontal,
                          child: Row(
                            children: NoteCategory.values.map((cat) {
                              final isSelected = (currentNote?.category ?? NoteCategory.procedure) == cat;
                              return GestureDetector(
                                onTap: () => ref.read(kitchenNotesProvider.notifier).updateCategory(session.currentStepIndex, cat),
                                child: AnimatedContainer(
                                  duration: const Duration(milliseconds: 200),
                                  margin: const EdgeInsets.only(right: 8),
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                                  decoration: BoxDecoration(
                                    color: isSelected ? CuisineTheme.saffron.withValues(alpha: 0.1) : CuisineTheme.darkWalnut.withValues(alpha: 0.2),
                                    borderRadius: BorderRadius.circular(10),
                                    border: Border.all(color: isSelected ? CuisineTheme.saffron.withValues(alpha: 0.4) : CuisineTheme.cream.withValues(alpha: 0.05)),
                                  ),
                                  child: Text(
                                    cat.name.toUpperCase(),
                                    style: GoogleFonts.inter(
                                      fontSize: 8,
                                      fontWeight: FontWeight.w800,
                                      color: isSelected ? CuisineTheme.saffron : CuisineTheme.cream.withValues(alpha: 0.3),
                                    ),
                                  ),
                                ),
                              );
                            }).toList(),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
