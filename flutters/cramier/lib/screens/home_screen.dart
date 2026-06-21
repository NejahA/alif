import 'dart:io';
import 'package:flutter/material.dart';
import 'package:share_plus/share_plus.dart';
import 'package:path_provider/path_provider.dart';
import '../models/flashcard.dart';
import '../models/deck.dart';
import '../services/database_helper.dart';
import '../services/shared_prefs_service.dart';

class HomeScreen extends StatefulWidget {
  final Function(bool)? onThemeChanged;

  const HomeScreen({super.key, this.onThemeChanged});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _dbHelper = DatabaseHelper();
  final _prefsService = SharedPrefsService();
  final _searchController = TextEditingController();

  List<Flashcard> _flashcards = [];
  List<Deck> _decks = [];
  String? _selectedDeckId;
  String _selectedCategory = 'All';
  List<String> _categories = ['All'];
  bool _isLoading = true;
  bool _isSearching = false;

  @override
  void initState() {
    super.initState();
    _loadData();
    _searchController.addListener(_onSearchChanged);
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    await Future.wait([
      _loadDecks(),
      _loadFlashcards(),
    ]);
    setState(() => _isLoading = false);
  }

  Future<void> _loadDecks() async {
    final decks = await _dbHelper.getDecks();
    setState(() => _decks = decks);
  }

  Future<void> _loadFlashcards() async {
    final cards = await _dbHelper.getFlashcards(deckId: _selectedDeckId);
    final categories = await _dbHelper.getCategories(deckId: _selectedDeckId);
    setState(() {
      _flashcards = cards;
      _categories = ['All', ...categories];
      if (!_categories.contains(_selectedCategory)) {
        _selectedCategory = 'All';
      }
    });
  }

  void _onSearchChanged() {
    final query = _searchController.text;
    if (query.isNotEmpty) {
      _performSearch(query);
    } else {
      _loadFlashcards();
    }
  }

  Future<void> _performSearch(String query) async {
    setState(() => _isSearching = true);
    final results =
        await _dbHelper.searchFlashcards(query, deckId: _selectedDeckId);
    setState(() {
      _flashcards = results;
      _isSearching = false;
    });
  }

  Future<void> _addFlashcard(Flashcard card) async {
    await _dbHelper.insertFlashcard(card);
    await _loadFlashcards();
  }

  Future<void> _editFlashcard(Flashcard card) async {
    final result = await Navigator.pushNamed(context, '/add',
        arguments: {'edit': card, 'decks': _decks, 'selectedDeckId': _selectedDeckId});
    if (result != null && result is Flashcard) {
      await _dbHelper.updateFlashcard(result);
      await _loadFlashcards();
    }
  }

  Future<void> _deleteFlashcard(String id) async {
    await _dbHelper.deleteFlashcard(id);
    await _loadFlashcards();
  }

  Future<void> _exportDeck(String deckId) async {
    try {
      final jsonData = await _dbHelper.exportDeck(deckId);
      final dir = await getApplicationDocumentsDirectory();
      final deck = _decks.firstWhere((d) => d.id == deckId);
      final fileName =
          '${deck.name.replaceAll(' ', '_').toLowerCase()}_backup.json';
      final file = File('${dir.path}/$fileName');
      await file.writeAsString(jsonData);
      await SharePlus.instance.share(
        ShareParams(
          files: [XFile(file.path)],
          text: '${deck.name} - Cramier Deck Export',
        ),
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Deck "${deck.name}" exported!')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Export failed: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Cramier'),
        centerTitle: true,
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        actions: [
          IconButton(
            icon: const Icon(Icons.bar_chart),
            tooltip: 'Statistics',
            onPressed: () {
              Navigator.pushNamed(context, '/statistics',
                  arguments: _selectedDeckId);
            },
          ),
          IconButton(
            icon: const Icon(Icons.settings),
            tooltip: 'Settings',
            onPressed: () async {
              await Navigator.pushNamed(context, '/settings');
              // Reload dark mode state
              final isDark = await _prefsService.getDarkMode();
              widget.onThemeChanged?.call(isDark);
              await _loadData();
            },
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                // Deck selector
                _buildDeckSelector(),
                // Search bar
                _buildSearchBar(),
                // Category filter
                _buildCategoryFilter(),
                // Flashcard list
                Expanded(
                  child: _isSearching
                      ? const Center(child: CircularProgressIndicator())
                      : _flashcards.isEmpty
                          ? _buildEmptyState()
                          : _buildFlashcardList(),
                ),
              ],
            ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () async {
          final result = await Navigator.pushNamed(context, '/add', arguments: {
            'decks': _decks,
            'selectedDeckId': _selectedDeckId,
          });
          if (result != null && result is Flashcard) {
            await _addFlashcard(result);
          }
        },
        icon: const Icon(Icons.add),
        label: const Text('Add Card'),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: 0,
        onDestinationSelected: (index) {
          if (index == 1) {
            Navigator.pushNamed(context, '/decks');
          } else if (index == 2) {
            Navigator.pushNamed(context, '/statistics');
          } else if (index == 3) {
            Navigator.pushNamed(context, '/settings').then((_) async {
              final isDark = await _prefsService.getDarkMode();
              widget.onThemeChanged?.call(isDark);
              await _loadData();
            });
          }
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.folder_outlined),
            selectedIcon: Icon(Icons.folder),
            label: 'Decks',
          ),
          NavigationDestination(
            icon: Icon(Icons.bar_chart_outlined),
            selectedIcon: Icon(Icons.bar_chart),
            label: 'Stats',
          ),
          NavigationDestination(
            icon: Icon(Icons.settings_outlined),
            selectedIcon: Icon(Icons.settings),
            label: 'Settings',
          ),
        ],
      ),
    );
  }

  Widget _buildDeckSelector() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
      child: Row(
        children: [
          Expanded(
            child: DropdownButtonFormField<String?>(
              initialValue: _selectedDeckId,
              decoration: InputDecoration(
                labelText: 'Deck',
                prefixIcon: const Icon(Icons.folder),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                contentPadding: const EdgeInsets.symmetric(horizontal: 12),
                filled: true,
                fillColor: Theme.of(context).colorScheme.surfaceContainerHighest.withValues(alpha: 0.3),
              ),
              items: [
                const DropdownMenuItem(
                  value: null,
                  child: Text('All Decks'),
                ),
                ..._decks.map((deck) => DropdownMenuItem(
                      value: deck.id,
                      child: Text(deck.name),
                    )),
              ],
              onChanged: (value) async {
                setState(() => _selectedDeckId = value);
                await _loadFlashcards();
              },
            ),
          ),
          if (_selectedDeckId != null) ...[
            const SizedBox(width: 8),
            IconButton(
              icon: const Icon(Icons.file_upload_outlined),
              tooltip: 'Export Deck',
              onPressed: () => _exportDeck(_selectedDeckId!),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
      child: TextField(
        controller: _searchController,
        decoration: InputDecoration(
          hintText: 'Search flashcards...',
          prefixIcon: const Icon(Icons.search),
          suffixIcon: _searchController.text.isNotEmpty
              ? IconButton(
                  icon: const Icon(Icons.clear),
                  onPressed: () {
                    _searchController.clear();
                  },
                )
              : null,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          filled: true,
          fillColor: Theme.of(context).colorScheme.surfaceContainerHighest.withValues(alpha: 0.3),
          contentPadding: const EdgeInsets.symmetric(horizontal: 16),
        ),
      ),
    );
  }

  Widget _buildCategoryFilter() {
    if (_categories.length <= 1) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
      child: SizedBox(
        height: 40,
        child: ListView(
          scrollDirection: Axis.horizontal,
          children: _categories.map((category) {
            final isSelected = category == _selectedCategory;
            return Padding(
              padding: const EdgeInsets.only(right: 8),
              child: FilterChip(
                label: Text(category),
                selected: isSelected,
                onSelected: (selected) async {
                  setState(() => _selectedCategory = category);
                  final cards = await _dbHelper.getFlashcards(
                    deckId: _selectedDeckId,
                    category: category == 'All' ? null : category,
                  );
                  setState(() => _flashcards = cards);
                },
              ),
            );
          }).toList(),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.auto_stories,
            size: 80,
            color: Colors.grey[400],
          ),
          const SizedBox(height: 16),
          Text(
            _searchController.text.isNotEmpty
                ? 'No flashcards found'
                : 'No flashcards yet',
            style: const TextStyle(
              fontSize: 20,
              color: Colors.grey,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            _searchController.text.isNotEmpty
                ? 'Try a different search term'
                : 'Tap + to add your first card',
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey[500],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFlashcardList() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _flashcards.length,
      itemBuilder: (context, index) {
        final card = _flashcards[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          elevation: 2,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          child: InkWell(
            borderRadius: BorderRadius.circular(12),
            onTap: () => _editFlashcard(card),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          card.question,
                          style: const TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 16,
                          ),
                        ),
                      ),
                      PopupMenuButton<String>(
                        onSelected: (value) {
                          if (value == 'edit') {
                            _editFlashcard(card);
                          } else if (value == 'delete') {
                            _deleteFlashcard(card.id);
                          }
                        },
                        itemBuilder: (context) => [
                          const PopupMenuItem(
                            value: 'edit',
                            child: Row(
                              children: [
                                Icon(Icons.edit, size: 20),
                                SizedBox(width: 8),
                                Text('Edit'),
                              ],
                            ),
                          ),
                          const PopupMenuItem(
                            value: 'delete',
                            child: Row(
                              children: [
                                Icon(Icons.delete, size: 20, color: Colors.red),
                                SizedBox(width: 8),
                                Text('Delete',
                                    style: TextStyle(color: Colors.red)),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    card.answer,
                    style: TextStyle(
                      color: Colors.grey[600],
                      fontSize: 14,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      _buildTag(card.category, Colors.blue),
                      const Spacer(),
                      if (card.nextReview != null &&
                          card.nextReview!.isAfter(DateTime.now()))
                        Text(
                          'Next review: ${_formatDate(card.nextReview!)}',
                          style: TextStyle(
                            fontSize: 11,
                            color: Colors.grey[500],
                          ),
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildTag(String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 11,
          color: color,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }
}