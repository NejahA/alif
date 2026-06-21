import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';
import '../models/flashcard.dart';
import '../models/deck.dart';

class AddCardScreen extends StatefulWidget {
  const AddCardScreen({super.key});

  @override
  State<AddCardScreen> createState() => _AddCardScreenState();
}

class _AddCardScreenState extends State<AddCardScreen> {
  final _formKey = GlobalKey<FormState>();
  final _questionController = TextEditingController();
  final _answerController = TextEditingController();
  final _categoryController = TextEditingController();
  final _uuid = const Uuid();

  Flashcard? _editCard;
  List<Deck> _decks = [];
  String? _selectedDeckId;
  bool _isLoaded = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_isLoaded) {
      final args = ModalRoute.of(context)?.settings.arguments;
      if (args != null && args is Map) {
        _decks = (args['decks'] as List<Deck>?) ?? [];

        if (args.containsKey('edit') && args['edit'] != null) {
          _editCard = args['edit'] as Flashcard;
          _questionController.text = _editCard!.question;
          _answerController.text = _editCard!.answer;
          _categoryController.text = _editCard!.category;
          _selectedDeckId = _editCard!.deckId;
        } else {
          _selectedDeckId = args['selectedDeckId'] as String?;
        }

        // If no deck selected and we have decks, auto-select first
        if (_selectedDeckId == null && _decks.isNotEmpty) {
          _selectedDeckId = _decks.first.id;
        }
      }
      _isLoaded = true;
    }
  }

  @override
  void dispose() {
    _questionController.dispose();
    _answerController.dispose();
    _categoryController.dispose();
    super.dispose();
  }

  void _saveCard() {
    if (_formKey.currentState!.validate()) {
      if (_selectedDeckId == null && _decks.isNotEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please select a deck')),
        );
        return;
      }

      // If no decks exist, we need to handle this gracefully
      // For now, just use a default
      final deckId = _selectedDeckId ?? _decks.firstOrNull?.id ?? 'default';

      final card = Flashcard(
        id: _editCard?.id ?? _uuid.v4(),
        question: _questionController.text.trim(),
        answer: _answerController.text.trim(),
        category: _categoryController.text.trim().isEmpty
            ? 'General'
            : _categoryController.text.trim(),
        deckId: deckId,
        createdAt: _editCard?.createdAt ?? DateTime.now(),
        lastReviewed: _editCard?.lastReviewed,
        repetitions: _editCard?.repetitions ?? 0,
        easeFactor: _editCard?.easeFactor ?? 2.5,
        interval: _editCard?.interval ?? 0,
        nextReview: _editCard?.nextReview,
      );
      Navigator.pop(context, card);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isEditing = _editCard != null;

    return Scaffold(
      appBar: AppBar(
        title: Text(isEditing ? 'Edit Flashcard' : 'Add Flashcard'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        actions: [
          TextButton(
            onPressed: _saveCard,
            child: const Text(
              'Save',
              style: TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 16,
              ),
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Deck selector
              if (_decks.isNotEmpty) ...[
                Text(
                  'Deck',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: Colors.grey[700],
                  ),
                ),
                const SizedBox(height: 8),
                DropdownButtonFormField<String>(
                  initialValue: _selectedDeckId,
                  decoration: InputDecoration(
                    prefixIcon: const Icon(Icons.folder),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    filled: true,
                    fillColor: Colors.grey[50],
                  ),
                  items: _decks.map((deck) => DropdownMenuItem(
                        value: deck.id,
                        child: Text(deck.name),
                      )).toList(),
                  onChanged: (value) {
                    setState(() => _selectedDeckId = value);
                  },
                  validator: (value) {
                    if (value == null && _decks.isNotEmpty) {
                      return 'Please select a deck';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 24),
              ],

              // Category field
              Text(
                'Category',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: Colors.grey[700],
                ),
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _categoryController,
                decoration: InputDecoration(
                  hintText: 'e.g., Math, History, Spanish...',
                  prefixIcon: const Icon(Icons.label_outline),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  filled: true,
                  fillColor: Colors.grey[50],
                ),
              ),
              const SizedBox(height: 24),

              // Question field
              Text(
                'Question',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: Colors.grey[700],
                ),
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _questionController,
                maxLines: 3,
                decoration: InputDecoration(
                  hintText: 'Enter your question...',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  filled: true,
                  fillColor: Colors.grey[50],
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Please enter a question';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 24),

              // Answer field
              Text(
                'Answer',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: Colors.grey[700],
                ),
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _answerController,
                maxLines: 5,
                decoration: InputDecoration(
                  hintText: 'Enter the answer...',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  filled: true,
                  fillColor: Colors.grey[50],
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Please enter an answer';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 32),

              // Save button
              FilledButton.icon(
                onPressed: _saveCard,
                icon: Icon(isEditing ? Icons.save : Icons.add),
                label: Text(isEditing ? 'Save Changes' : 'Save Card'),
                style: FilledButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
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