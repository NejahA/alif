import 'dart:math';
import '../models/category.dart';
import '../models/question.dart';
import 'database_service.dart';

/// QuestionManager service for managing question navigation and shuffling
/// Requirements: 1.1, 1.2, 1.3, 1.4, 9.1, 9.2, 9.3, 9.4
class QuestionManager {
  static final QuestionManager instance = QuestionManager._init();
  
  final Map<Category, List<Question>> _shuffledQuestions = {};
  final Map<Category, int> _currentIndices = {};
  final Map<Category, Set<String>> _viewedQuestions = {};
  final Map<Category, int> _shuffleSeeds = {};
  
  bool _initialized = false;

  QuestionManager._init();

  /// Initialize the question manager
  /// Requirements: 1.4
  Future<void> initialize() async {
    if (_initialized) return;

    final db = DatabaseService.instance;
    
    // Load questions for each category
    for (final category in Category.values) {
      final questions = await db.getQuestionsByCategory(category);
      
      // Load persisted state or initialize new
      final state = await db.loadSessionState(category);
      
      if (state != null) {
        _currentIndices[category] = state['currentIndex'] as int;
        _shuffleSeeds[category] = state['shuffleSeed'] as int;
        _viewedQuestions[category] = (state['viewedQuestions'] as List<String>).toSet();
        
        // Shuffle with persisted seed
        _shuffledQuestions[category] = _shuffleWithSeed(
          questions,
          _shuffleSeeds[category]!,
        );
      } else {
        // Initialize new session
        _currentIndices[category] = 0;
        _shuffleSeeds[category] = Random().nextInt(1000000);
        _viewedQuestions[category] = {};
        
        _shuffledQuestions[category] = _shuffleWithSeed(
          questions,
          _shuffleSeeds[category]!,
        );
      }
    }

    _initialized = true;
  }

  /// Get current question for a category
  /// Requirements: 1.1
  Question? getCurrentQuestion(Category category) {
    final questions = _shuffledQuestions[category];
    if (questions == null || questions.isEmpty) return null;
    
    final index = _currentIndices[category] ?? 0;
    if (index >= questions.length) return null;
    
    return questions[index];
  }

  /// Navigate to next question
  /// Requirements: 1.2
  bool nextQuestion(Category category) {
    final questions = _shuffledQuestions[category];
    if (questions == null || questions.isEmpty) return false;
    
    final currentIndex = _currentIndices[category] ?? 0;
    if (currentIndex >= questions.length - 1) return false;
    
    _currentIndices[category] = currentIndex + 1;
    final currentQuestion = questions[_currentIndices[category]!];
    _viewedQuestions[category]?.add(currentQuestion.id);
    
    _persistState(category);
    return true;
  }

  /// Navigate to previous question
  /// Requirements: 1.2
  bool previousQuestion(Category category) {
    final currentIndex = _currentIndices[category] ?? 0;
    if (currentIndex <= 0) return false;
    
    _currentIndices[category] = currentIndex - 1;
    _persistState(category);
    return true;
  }

  /// Check if more questions are available
  /// Requirements: 1.3
  bool hasMoreQuestions(Category category) {
    final questions = _shuffledQuestions[category];
    if (questions == null || questions.isEmpty) return false;
    
    final currentIndex = _currentIndices[category] ?? 0;
    return currentIndex < questions.length - 1;
  }

  /// Get progress information
  /// Requirements: 1.3
  Map<String, int> getProgress(Category category) {
    final questions = _shuffledQuestions[category];
    final currentIndex = _currentIndices[category] ?? 0;
    
    return {
      'current': currentIndex + 1,
      'total': questions?.length ?? 0,
    };
  }

  /// Shuffle deck with new seed
  /// Requirements: 9.3, 9.4
  void shuffleDeck(Category category) {
    final questions = _shuffledQuestions[category];
    if (questions == null) return;
    
    final newSeed = Random().nextInt(1000000);
    _shuffleSeeds[category] = newSeed;
    _shuffledQuestions[category] = _shuffleWithSeed(questions, newSeed);
    _currentIndices[category] = 0;
    _viewedQuestions[category]?.clear();
    
    _persistState(category);
  }

  /// Reset deck (clear viewed questions and reshuffle)
  /// Requirements: 9.2, 9.4
  void resetDeck(Category category) {
    _viewedQuestions[category]?.clear();
    _currentIndices[category] = 0;
    shuffleDeck(category);
  }

  /// Fisher-Yates shuffle with seeded RNG
  /// Requirements: 9.3
  List<Question> _shuffleWithSeed(List<Question> questions, int seed) {
    final random = Random(seed);
    final shuffled = List<Question>.from(questions);
    
    for (int i = shuffled.length - 1; i > 0; i--) {
      final j = random.nextInt(i + 1);
      final temp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = temp;
    }
    
    return shuffled;
  }

  /// Persist state to database
  /// Requirements: 1.4
  Future<void> _persistState(Category category) async {
    final db = DatabaseService.instance;
    await db.saveSessionState(
      category,
      _currentIndices[category] ?? 0,
      _shuffleSeeds[category] ?? 0,
      _viewedQuestions[category]?.toList() ?? [],
    );
  }
}
