import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/colonye_provider.dart';
import '../models/journal_entry.dart';
import '../theme/app_theme.dart';
import '../widgets/glass_card.dart';

class MindweaverJournalScreen extends StatefulWidget {
  const MindweaverJournalScreen({super.key});

  @override
  State<MindweaverJournalScreen> createState() => _MindweaverJournalScreenState();
}

class _MindweaverJournalScreenState extends State<MindweaverJournalScreen> {
  final List<String> _prompts = [
    "What subtle detail filled your space with quiet awe today?",
    "What emotion or weight are you ready to release into the cosmos?",
    "What spark of insight illuminated your creative thinking?",
    "Who or what nourished your spirit in an unexpected way?",
  ];
  int _currentPromptIndex = 0;

  void _showNewEntryModal(BuildContext context) {
    final titleController = TextEditingController();
    final contentController = TextEditingController();
    final tagsController = TextEditingController();
    MoodSpectrum selectedMood = MoodSpectrum.serene;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
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
                        'weave new reflection',
                        style: Theme.of(context).textTheme.displayMedium?.copyWith(fontSize: 22),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        _prompts[_currentPromptIndex],
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: AppTheme.quantumCyan,
                              fontStyle: FontStyle.italic,
                            ),
                      ),
                      const SizedBox(height: 16),

                      // Mood Spectrum Picker
                      Text('Mood Spectrum', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 14)),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 8,
                        children: MoodSpectrum.values.map((mood) {
                          final isSel = selectedMood == mood;
                          final dummyEntry = JournalEntry(
                            id: '',
                            title: '',
                            content: '',
                            timestamp: DateTime.now(),
                            mood: mood,
                            tags: [],
                            prompt: '',
                          );
                          return ChoiceChip(
                            label: Text(dummyEntry.moodLabel),
                            selected: isSel,
                            selectedColor: dummyEntry.moodColor.withOpacity(0.3),
                            backgroundColor: AppTheme.glassSurface,
                            labelStyle: TextStyle(
                              color: isSel ? dummyEntry.moodColor : AppTheme.textSecondary,
                              fontWeight: isSel ? FontWeight.bold : FontWeight.normal,
                              fontSize: 12,
                            ),
                            side: BorderSide(
                              color: isSel ? dummyEntry.moodColor : AppTheme.glassBorder,
                            ),
                            onSelected: (selected) {
                              if (selected) {
                                setModalState(() => selectedMood = mood);
                              }
                            },
                          );
                        }).toList(),
                      ),

                      const SizedBox(height: 16),

                      // Title Field
                      TextField(
                        controller: titleController,
                        style: const TextStyle(color: Colors.white),
                        decoration: InputDecoration(
                          hintText: 'Entry Title...',
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

                      // Content Field
                      TextField(
                        controller: contentController,
                        maxLines: 4,
                        style: const TextStyle(color: Colors.white),
                        decoration: InputDecoration(
                          hintText: 'Pour your thoughts here...',
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

                      // Tags Field
                      TextField(
                        controller: tagsController,
                        style: const TextStyle(color: Colors.white),
                        decoration: InputDecoration(
                          hintText: 'Tags (comma separated: Clarity, Morning)',
                          hintStyle: const TextStyle(color: Colors.white38),
                          filled: true,
                          fillColor: AppTheme.glassSurface,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(14),
                            borderSide: const BorderSide(color: AppTheme.glassBorder),
                          ),
                        ),
                      ),

                      const SizedBox(height: 20),

                      // Submit Button
                      SizedBox(
                        width: double.infinity,
                        height: 50,
                        child: ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.nebulaViolet,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          ),
                          onPressed: () {
                            if (titleController.text.isNotEmpty && contentController.text.isNotEmpty) {
                              final tagList = tagsController.text
                                  .split(',')
                                  .map((e) => e.trim())
                                  .where((e) => e.isNotEmpty)
                                  .toList();
                              
                              Provider.of<ColonyeProvider>(context, listen: false).addJournalEntry(
                                title: titleController.text,
                                content: contentController.text,
                                mood: selectedMood,
                                tags: tagList.isEmpty ? ['Reflection'] : tagList,
                                prompt: _prompts[_currentPromptIndex],
                              );
                              Navigator.pop(context);
                            }
                          },
                          child: const Text(
                            'Save to Chronicles',
                            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<ColonyeProvider>(context);

    return Scaffold(
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppTheme.nebulaViolet,
        onPressed: () => _showNewEntryModal(context),
        icon: const Icon(Icons.edit_note_rounded, color: Colors.white),
        label: const Text('Weave Entry', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 18.0, vertical: 12.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header
                Text(
                  'Mindweaver Journal',
                  style: Theme.of(context).textTheme.displayLarge?.copyWith(fontSize: 26),
                ),
                Text(
                  'Capture emotional resonance & reflective insights',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),

                const SizedBox(height: 20),

                // Prompt Recommendation Card
                GlassCard(
                  borderRadius: 20,
                  borderColor: AppTheme.quantumCyan,
                  padding: const EdgeInsets.all(18),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              const Icon(Icons.psychology_rounded, color: AppTheme.quantumCyan, size: 20),
                              const SizedBox(width: 8),
                              Text(
                                'DAILY PROMPT RITUAL',
                                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                      color: AppTheme.quantumCyan,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 11,
                                      letterSpacing: 1.1,
                                    ),
                              ),
                            ],
                          ),
                          IconButton(
                            onPressed: () {
                              setState(() {
                                _currentPromptIndex = (_currentPromptIndex + 1) % _prompts.length;
                              });
                            },
                            icon: const Icon(Icons.refresh_rounded, color: Colors.white54, size: 20),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        _prompts[_currentPromptIndex],
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              fontSize: 16,
                              fontWeight: FontWeight.w500,
                              height: 1.4,
                            ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                Text(
                  'Chronicle Entries',
                  style: Theme.of(context).textTheme.headlineMedium,
                ),
                const SizedBox(height: 12),

                // Entries List
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: provider.journalEntries.length,
                  itemBuilder: (context, index) {
                    final entry = provider.journalEntries[index];
                    final formattedDate = DateFormat('MMM d, yyyy • h:mm a').format(entry.timestamp);

                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12.0),
                      child: GlassCard(
                        borderRadius: 18,
                        borderColor: entry.moodColor.withOpacity(0.5),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                // Mood Chip Tag
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: entry.moodColor.withOpacity(0.15),
                                    borderRadius: BorderRadius.circular(10),
                                    border: Border.all(color: entry.moodColor.withOpacity(0.4)),
                                  ),
                                  child: Row(
                                    children: [
                                      Container(
                                        width: 8,
                                        height: 8,
                                        decoration: BoxDecoration(
                                          color: entry.moodColor,
                                          shape: BoxShape.circle,
                                        ),
                                      ),
                                      const SizedBox(width: 6),
                                      Text(
                                        entry.moodLabel,
                                        style: TextStyle(
                                          color: entry.moodColor,
                                          fontSize: 11,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                Text(
                                  formattedDate,
                                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontSize: 11),
                                ),
                              ],
                            ),

                            const SizedBox(height: 12),

                            Text(
                              entry.title,
                              style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 16),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              entry.content,
                              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                                    fontSize: 14,
                                    height: 1.5,
                                    color: AppTheme.textPrimary.withOpacity(0.9),
                                  ),
                            ),

                            const SizedBox(height: 12),

                            // Tags Wrap
                            Wrap(
                              spacing: 6,
                              children: entry.tags.map((tag) {
                                return Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: Colors.white.withOpacity(0.06),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    '#$tag',
                                    style: const TextStyle(color: AppTheme.textSecondary, fontSize: 11),
                                  ),
                                );
                              }).toList(),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),

                const SizedBox(height: 80), // Padding for FAB
              ],
            ),
          ),
        ),
      ),
    );
  }
}
