import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';
import '../models/flashcard.dart';
import '../models/study_session.dart';
import '../services/database_helper.dart';
import '../services/shared_prefs_service.dart';

class StudyScreen extends StatefulWidget {
  const StudyScreen({super.key});

  @override
  State<StudyScreen> createState() => _StudyScreenState();
}

class _StudyScreenState extends State<StudyScreen> {
  final _dbHelper = DatabaseHelper();
  final _prefsService = SharedPrefsService();
  final _uuid = const Uuid();

  List<Flashcard> _flashcards = [];
  int _currentIndex = 0;
  bool _isFlipped = false;
  bool _isLoading = true;
  bool _shuffleEnabled = true;
  bool _sessionActive = false;
  String? _sessionId;
  DateTime? _sessionStart;
  int _cardsStudied = 0;
  int _cardsCorrect = 0;
  int _cardsIncorrect = 0;
  String? _selectedDeckId;

  @override
  void initState() {
    super.initState();
    _initialize();
  }

  Future<void> _initialize() async {
    final shuffle = await _prefsService.getShuffleEnabled();
    setState(() => _shuffleEnabled = shuffle);

    final args = ModalRoute.of(context)?.settings.arguments;
    if (args != null) {
      if (args is List<Flashcard>) {
        _flashcards = List.from(args);
        if (_shuffleEnabled) _flashcards.shuffle();
        setState(() => _isLoading = false);
      } else if (args is Map) {
        _selectedDeckId = args['deckId'] as String?;
        final cards = args['flashcards'] as List<Flashcard>?;
        if (cards != null) {
          _flashcards = List.from(cards);
          if (_shuffleEnabled) _flashcards.shuffle();
        } else if (_selectedDeckId != null) {
          _flashcards = await _dbHelper.getDueCards(_selectedDeckId!);
          if (_shuffleEnabled) _flashcards.shuffle();
        }
        setState(() => _isLoading = false);
      }
    } else {
      setState(() => _isLoading = false);
    }
  }

  void _startSession() {
    _sessionId = _uuid.v4();
    _sessionStart = DateTime.now();
    _cardsStudied = 0;
    _cardsCorrect = 0;
    _cardsIncorrect = 0;
    _sessionActive = true;
  }

  Future<void> _endSession() async {
    if (!_sessionActive || _sessionId == null) return;

    final session = StudySession(
      id: _sessionId!,
      deckId: _selectedDeckId ?? 'all',
      startTime: _sessionStart ?? DateTime.now(),
      endTime: DateTime.now(),
      cardsStudied: _cardsStudied,
      cardsCorrect: _cardsCorrect,
      cardsIncorrect: _cardsIncorrect,
    );

    await _dbHelper.insertStudySession(session);
    setState(() => _sessionActive = false);
  }

  void _flipCard() {
    setState(() {
      _isFlipped = !_isFlipped;
    });
  }

  Future<void> _rateCard(int quality) async {
    if (_currentIndex >= _flashcards.length) return;

    if (!_sessionActive) _startSession();

    final card = _flashcards[_currentIndex];
    final now = DateTime.now();

    // Spaced Repetition Algorithm (SM-2 inspired)
    double newEaseFactor = card.easeFactor;
    int newInterval = card.interval;
    int newRepetitions = card.repetitions;

    if (quality >= 3) {
      // Correct response
      _cardsCorrect++;
      if (newRepetitions == 0) {
        newInterval = 1;
      } else if (newRepetitions == 1) {
        newInterval = 6;
      } else {
        newInterval = (card.interval * card.easeFactor).round();
      }
      newRepetitions++;
    } else {
      // Incorrect response
      _cardsIncorrect++;
      newRepetitions = 0;
      newInterval = 1;
    }

    // Update ease factor
    newEaseFactor = card.easeFactor +
        (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (newEaseFactor < 1.3) newEaseFactor = 1.3;

    final nextReview = now.add(Duration(days: newInterval));

    final updatedCard = card.copyWith(
      lastReviewed: now,
      repetitions: newRepetitions,
      easeFactor: newEaseFactor,
      interval: newInterval,
      nextReview: nextReview,
    );

    await _dbHelper.updateFlashcard(updatedCard);
    _cardsStudied++;

    // Move to next card
    if (_currentIndex < _flashcards.length - 1) {
      setState(() {
        _currentIndex++;
        _isFlipped = false;
      });
    } else {
      // End of deck
      await _endSession();
      if (mounted) {
        _showSessionSummary();
      }
    }
  }

  void _showSessionSummary() {
    final accuracy = _cardsStudied > 0
        ? (_cardsCorrect / _cardsStudied * 100).toStringAsFixed(0)
        : '0';
    final duration = _sessionStart != null
        ? DateTime.now().difference(_sessionStart!)
        : Duration.zero;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: const Text('Session Complete!'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.celebration, size: 64, color: Colors.amber),
            const SizedBox(height: 16),
            Text(
              '$accuracy% Accuracy',
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            _buildSummaryRow('Cards Studied', _cardsStudied.toString()),
            _buildSummaryRow('Correct', _cardsCorrect.toString()),
            _buildSummaryRow('Incorrect', _cardsIncorrect.toString()),
            _buildSummaryRow(
              'Duration',
              duration.inMinutes > 0
                  ? '${duration.inMinutes}m ${duration.inSeconds % 60}s'
                  : '${duration.inSeconds}s',
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              Navigator.pop(context);
            },
            child: const Text('Done'),
          ),
          FilledButton(
            onPressed: () {
              Navigator.pop(context);
              _restartSession();
            },
            child: const Text('Study Again'),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(color: Colors.grey[600])),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }

  void _restartSession() {
    setState(() {
      _currentIndex = 0;
      _isFlipped = false;
      _sessionActive = false;
      _cardsStudied = 0;
      _cardsCorrect = 0;
      _cardsIncorrect = 0;
      if (_shuffleEnabled) _flashcards.shuffle();
    });
  }

  void _nextCard() {
    if (_currentIndex < _flashcards.length - 1) {
      setState(() {
        _currentIndex++;
        _isFlipped = false;
      });
    }
  }

  void _previousCard() {
    if (_currentIndex > 0) {
      setState(() {
        _currentIndex--;
        _isFlipped = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Study'),
          backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        ),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (_flashcards.isEmpty) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Study'),
          backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        ),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.school, size: 80, color: Colors.grey[400]),
              const SizedBox(height: 16),
              const Text(
                'No flashcards to study',
                style: TextStyle(fontSize: 20, color: Colors.grey),
              ),
              const SizedBox(height: 8),
              Text(
                'Add some cards or select a different deck',
                style: TextStyle(fontSize: 14, color: Colors.grey[500]),
              ),
            ],
          ),
        ),
      );
    }

    final currentCard = _flashcards[_currentIndex];
    final progress = '${_currentIndex + 1} / ${_flashcards.length}';

    return Scaffold(
      appBar: AppBar(
        title: const Text('Study'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        actions: [
          // Session stats indicator
          if (_sessionActive) ...[
            Padding(
              padding: const EdgeInsets.only(right: 8),
              child: Center(
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.check_circle,
                        size: 16, color: Colors.green[400]),
                    const SizedBox(width: 4),
                    Text(
                      '$_cardsCorrect',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: Colors.green[400],
                      ),
                    ),
                    const SizedBox(width: 8),
                    Icon(Icons.cancel, size: 16, color: Colors.red[400]),
                    const SizedBox(width: 4),
                    Text(
                      '$_cardsIncorrect',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: Colors.red[400],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
          Padding(
            padding: const EdgeInsets.only(right: 16),
            child: Center(
              child: Text(
                progress,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            // Progress bar
            LinearProgressIndicator(
              value: (_currentIndex + 1) / _flashcards.length,
              backgroundColor: Colors.grey[200],
              borderRadius: BorderRadius.circular(4),
            ),
            const SizedBox(height: 8),
            // Category badge
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: Theme.of(context)
                        .colorScheme
                        .primaryContainer,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    currentCard.category,
                    style: TextStyle(
                      fontSize: 11,
                      color: Theme.of(context).colorScheme.primary,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Flashcard
            Expanded(
              child: GestureDetector(
                onTap: _flipCard,
                child: AnimatedSwitcher(
                  duration: const Duration(milliseconds: 300),
                  child: _isFlipped
                      ? _buildCardBack(currentCard)
                      : _buildCardFront(currentCard),
                ),
              ),
            ),

            const SizedBox(height: 16),
            Text(
              _isFlipped ? 'Tap to see question' : 'Tap to reveal answer',
              style: TextStyle(
                color: Colors.grey[500],
                fontSize: 12,
              ),
            ),

            const SizedBox(height: 16),

            // Rating buttons (shown when card is flipped)
            if (_isFlipped) ...[
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _buildRatingButton(
                    icon: Icons.sentiment_very_dissatisfied,
                    label: 'Again',
                    color: Colors.red,
                    quality: 1,
                  ),
                  _buildRatingButton(
                    icon: Icons.sentiment_dissatisfied,
                    label: 'Hard',
                    color: Colors.orange,
                    quality: 2,
                  ),
                  _buildRatingButton(
                    icon: Icons.sentiment_satisfied,
                    label: 'Good',
                    color: Colors.blue,
                    quality: 3,
                  ),
                  _buildRatingButton(
                    icon: Icons.sentiment_very_satisfied,
                    label: 'Easy',
                    color: Colors.green,
                    quality: 5,
                  ),
                ],
              ),
              const SizedBox(height: 16),
            ],

            // Navigation buttons
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                IconButton.filled(
                  onPressed: _currentIndex > 0 ? _previousCard : null,
                  icon: const Icon(Icons.arrow_back),
                  tooltip: 'Previous',
                ),
                if (!_isFlipped)
                  FilledButton.tonalIcon(
                    onPressed: _flipCard,
                    icon: const Icon(Icons.flip),
                    label: const Text('Flip'),
                  ),
                IconButton.filled(
                  onPressed: _currentIndex < _flashcards.length - 1
                      ? _nextCard
                      : null,
                  icon: const Icon(Icons.arrow_forward),
                  tooltip: 'Next',
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRatingButton({
    required IconData icon,
    required String label,
    required Color color,
    required int quality,
  }) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        IconButton.filled(
          onPressed: () => _rateCard(quality),
          icon: Icon(icon),
          style: IconButton.styleFrom(backgroundColor: color),
          tooltip: label,
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 11,
            color: Colors.grey[600],
          ),
        ),
      ],
    );
  }

  Widget _buildCardFront(Flashcard card) {
    return Card(
      key: const ValueKey('front'),
      elevation: 4,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
      ),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(32),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Theme.of(context).colorScheme.primaryContainer,
              Theme.of(context).colorScheme.secondaryContainer,
            ],
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.help_outline,
              size: 40,
              color: Theme.of(context).colorScheme.primary,
            ),
            const SizedBox(height: 24),
            Text(
              card.question,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCardBack(Flashcard card) {
    return Card(
      key: const ValueKey('back'),
      elevation: 4,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
      ),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(32),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Theme.of(context).colorScheme.tertiaryContainer,
              Theme.of(context).colorScheme.surfaceContainerHighest,
            ],
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.lightbulb_outline,
              size: 40,
              color: Theme.of(context).colorScheme.tertiary,
            ),
            const SizedBox(height: 24),
            Text(
              card.answer,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}