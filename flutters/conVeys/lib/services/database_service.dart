import 'dart:io';
import 'package:sqflite/sqflite.dart';
import 'package:sqflite_common_ffi/sqflite_ffi.dart';
import 'package:path/path.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import '../models/category.dart';
import '../models/question.dart';

/// Database service for managing SQLite database
/// Requirements: 8.1
class DatabaseService {
  static final DatabaseService instance = DatabaseService._init();
  static Database? _database;
  static bool _initialized = false;

  DatabaseService._init();

  /// Initialize sqflite for desktop platforms
  static void initializeSqflite() {
    if (_initialized) return;
    
    // Skip initialization on web
    if (kIsWeb) {
      _initialized = true;
      return;
    }
    
    // Only initialize FFI for desktop platforms (Windows, Linux, macOS)
    // Android and iOS use native SQLite
    if (Platform.isWindows || Platform.isLinux || Platform.isMacOS) {
      try {
        sqfliteFfiInit();
        databaseFactory = databaseFactoryFfi;
      } catch (e) {
        print('FFI initialization skipped: $e');
      }
    }
    
    _initialized = true;
  }

  Future<Database> get database async {
    if (_database != null) return _database!;
    
    // Ensure sqflite is initialized
    initializeSqflite();
    
    _database = await _initDB('conveys.db');
    return _database!;
  }

  Future<Database> _initDB(String filePath) async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, filePath);

    return await openDatabase(
      path,
      version: 1,
      onCreate: _createDB,
    );
  }

  Future<void> _createDB(Database db, int version) async {
    // Create questions table
    await db.execute('''
      CREATE TABLE questions (
        id TEXT PRIMARY KEY,
        text TEXT NOT NULL,
        category TEXT NOT NULL,
        tags TEXT,
        created_at INTEGER NOT NULL,
        CHECK (category IN ('fun_and_light', 'philosophical', 'about_your_past'))
      )
    ''');

    // Create index on category
    await db.execute('''
      CREATE INDEX idx_questions_category ON questions(category)
    ''');

    // Create session_state table
    await db.execute('''
      CREATE TABLE session_state (
        category TEXT PRIMARY KEY,
        current_index INTEGER DEFAULT 0,
        shuffle_seed INTEGER,
        viewed_questions TEXT,
        last_updated INTEGER
      )
    ''');
  }

  /// Insert a question into the database
  /// Requirements: 6.1, 6.4
  Future<void> insertQuestion(Question question) async {
    final db = await database;
    await db.insert(
      'questions',
      question.toMap(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  /// Insert multiple questions
  /// Requirements: 6.1, 6.4
  Future<void> insertQuestions(List<Question> questions) async {
    final db = await database;
    final batch = db.batch();
    
    for (final question in questions) {
      batch.insert(
        'questions',
        question.toMap(),
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
    }
    
    await batch.commit(noResult: true);
  }

  /// Get all questions for a specific category
  /// Requirements: 2.2, 6.4
  Future<List<Question>> getQuestionsByCategory(Category category) async {
    final db = await database;
    final maps = await db.query(
      'questions',
      where: 'category = ?',
      whereArgs: [category.value],
      orderBy: 'created_at',
    );

    return maps.map((map) => Question.fromMap(map)).toList();
  }

  /// Get all questions
  /// Requirements: 6.1, 6.4
  Future<List<Question>> getAllQuestions() async {
    final db = await database;
    final maps = await db.query(
      'questions',
      orderBy: 'category, created_at',
    );

    return maps.map((map) => Question.fromMap(map)).toList();
  }

  /// Get question count for a category
  /// Requirements: 6.4
  Future<int> getQuestionCount(Category category) async {
    final db = await database;
    final result = await db.rawQuery(
      'SELECT COUNT(*) as count FROM questions WHERE category = ?',
      [category.value],
    );

    return Sqflite.firstIntValue(result) ?? 0;
  }

  /// Check if database has been seeded
  /// Requirements: 6.4
  Future<bool> isSeeded() async {
    final db = await database;
    final result = await db.rawQuery('SELECT COUNT(*) as count FROM questions');
    final count = Sqflite.firstIntValue(result) ?? 0;
    return count > 0;
  }

  /// Save session state for a category
  /// Requirements: 1.4
  Future<void> saveSessionState(
    Category category,
    int currentIndex,
    int shuffleSeed,
    List<String> viewedQuestions,
  ) async {
    final db = await database;
    await db.insert(
      'session_state',
      {
        'category': category.value,
        'current_index': currentIndex,
        'shuffle_seed': shuffleSeed,
        'viewed_questions': viewedQuestions.join(','),
        'last_updated': DateTime.now().millisecondsSinceEpoch,
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  /// Load session state for a category
  /// Requirements: 1.4
  Future<Map<String, dynamic>?> loadSessionState(Category category) async {
    final db = await database;
    final maps = await db.query(
      'session_state',
      where: 'category = ?',
      whereArgs: [category.value],
    );

    if (maps.isEmpty) return null;

    final map = maps.first;
    return {
      'currentIndex': map['current_index'] as int,
      'shuffleSeed': map['shuffle_seed'] as int,
      'viewedQuestions': (map['viewed_questions'] as String)
          .split(',')
          .where((q) => q.isNotEmpty)
          .toList(),
    };
  }

  /// Clear all session state
  Future<void> clearSessionState() async {
    final db = await database;
    await db.delete('session_state');
  }

  /// Close database connection
  Future<void> close() async {
    final db = await database;
    await db.close();
    _database = null;
  }
}
