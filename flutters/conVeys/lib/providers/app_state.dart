import 'package:flutter/foundation.dart';
import '../models/category.dart' as models;
import '../models/question.dart';
import '../services/question_manager.dart';
import '../services/database_service.dart';
import '../services/seed_data.dart';

/// App state provider
/// Requirements: All
class AppState extends ChangeNotifier {
  models.Category _activeCategory = models.Category.funAndLight;
  Question? _currentQuestion;
  bool _isLoading = true;
  String? _error;

  models.Category get activeCategory => _activeCategory;
  Question? get currentQuestion => _currentQuestion;
  bool get isLoading => _isLoading;
  String? get error => _error;

  final QuestionManager _questionManager = QuestionManager.instance;

  /// Initialize app state
  Future<void> initialize() async {
    try {
      _isLoading = true;
      notifyListeners();

      // Initialize database
      await DatabaseService.instance.database;
      
      // Seed database if needed
      await seedDatabase();
      
      // Initialize question manager
      await _questionManager.initialize();
      
      // Load initial question
      _currentQuestion = _questionManager.getCurrentQuestion(_activeCategory);
      
      _isLoading = false;
      _error = null;
      notifyListeners();
    } catch (e) {
      _error = 'Failed to initialize app: $e';
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Navigate to next question
  /// Requirements: 1.2
  void nextQuestion() {
    if (_questionManager.nextQuestion(_activeCategory)) {
      _currentQuestion = _questionManager.getCurrentQuestion(_activeCategory);
      notifyListeners();
    }
  }

  /// Navigate to previous question
  /// Requirements: 1.2
  void previousQuestion() {
    if (_questionManager.previousQuestion(_activeCategory)) {
      _currentQuestion = _questionManager.getCurrentQuestion(_activeCategory);
      notifyListeners();
    }
  }

  /// Switch category
  /// Requirements: 2.2, 2.4
  void switchCategory(models.Category category) {
    _activeCategory = category;
    _currentQuestion = _questionManager.getCurrentQuestion(_activeCategory);
    notifyListeners();
  }

  /// Reset deck
  /// Requirements: 9.2, 9.4
  void resetDeck() {
    _questionManager.resetDeck(_activeCategory);
    _currentQuestion = _questionManager.getCurrentQuestion(_activeCategory);
    notifyListeners();
  }

  /// Check if more questions available
  /// Requirements: 1.3
  bool hasMoreQuestions() {
    return _questionManager.hasMoreQuestions(_activeCategory);
  }

  /// Get progress
  /// Requirements: 1.3
  Map<String, int> getProgress() {
    return _questionManager.getProgress(_activeCategory);
  }
}
