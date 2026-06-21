import 'dart:convert';
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart' as p;
import 'package:uuid/uuid.dart';
import '../models/flashcard.dart';
import '../models/deck.dart';
import '../models/study_session.dart';

class DatabaseHelper {
  static DatabaseHelper? _instance;
  static Database? _database;

  DatabaseHelper._internal();

  factory DatabaseHelper() {
    _instance ??= DatabaseHelper._internal();
    return _instance!;
  }

  Future<Database> get database async {
    _database ??= await _initDatabase();
    return _database!;
  }

  Future<Database> _initDatabase() async {
    final dbPath = await getDatabasesPath();
    final path = p.join(dbPath, 'cramier.db');
    return await openDatabase(
      path,
      version: 1,
      onCreate: _onCreate,
    );
  }

  Future<void> _onCreate(Database db, int version) async {
    await db.execute('''
      CREATE TABLE decks (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        createdAt TEXT NOT NULL
      )
    ''');

    await db.execute('''
      CREATE TABLE flashcards (
        id TEXT PRIMARY KEY,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        category TEXT DEFAULT 'General',
        deckId TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        lastReviewed TEXT,
        repetitions INTEGER DEFAULT 0,
        easeFactor REAL DEFAULT 2.5,
        interval INTEGER DEFAULT 0,
        nextReview TEXT,
        FOREIGN KEY (deckId) REFERENCES decks (id) ON DELETE CASCADE
      )
    ''');

    await db.execute('''
      CREATE TABLE study_sessions (
        id TEXT PRIMARY KEY,
        deckId TEXT NOT NULL,
        startTime TEXT NOT NULL,
        endTime TEXT,
        cardsStudied INTEGER DEFAULT 0,
        cardsCorrect INTEGER DEFAULT 0,
        cardsIncorrect INTEGER DEFAULT 0,
        FOREIGN KEY (deckId) REFERENCES decks (id) ON DELETE CASCADE
      )
    ''');

    // Create default deck
    final defaultDeck = Deck(
      id: const Uuid().v4(),
      name: 'Default Deck',
      description: 'Your default flashcard deck',
    );
    await db.insert('decks', defaultDeck.toMap());
  }

  // ==================== Deck Operations ====================

  Future<List<Deck>> getDecks() async {
    final db = await database;
    final maps = await db.query('decks', orderBy: 'createdAt DESC');
    return maps.map((map) => Deck.fromMap(map)).toList();
  }

  Future<Deck?> getDeck(String id) async {
    final db = await database;
    final maps = await db.query('decks', where: 'id = ?', whereArgs: [id]);
    if (maps.isEmpty) return null;
    return Deck.fromMap(maps.first);
  }

  Future<void> insertDeck(Deck deck) async {
    final db = await database;
    await db.insert('decks', deck.toMap(),
        conflictAlgorithm: ConflictAlgorithm.replace);
  }

  Future<void> updateDeck(Deck deck) async {
    final db = await database;
    await db.update('decks', deck.toMap(),
        where: 'id = ?', whereArgs: [deck.id]);
  }

  Future<void> deleteDeck(String id) async {
    final db = await database;
    await db.delete('flashcards', where: 'deckId = ?', whereArgs: [id]);
    await db.delete('study_sessions', where: 'deckId = ?', whereArgs: [id]);
    await db.delete('decks', where: 'id = ?', whereArgs: [id]);
  }

  // ==================== Flashcard Operations ====================

  Future<List<Flashcard>> getFlashcards({String? deckId, String? category}) async {
    final db = await database;
    List<String> conditions = [];
    List<dynamic> args = [];

    if (deckId != null) {
      conditions.add('deckId = ?');
      args.add(deckId);
    }
    if (category != null && category.isNotEmpty && category != 'All') {
      conditions.add('category = ?');
      args.add(category);
    }

    final where = conditions.isNotEmpty ? conditions.join(' AND ') : null;
    final maps = await db.query(
      'flashcards',
      where: where,
      whereArgs: args.isNotEmpty ? args : null,
      orderBy: 'createdAt DESC',
    );
    return maps.map((map) => Flashcard.fromMap(map)).toList();
  }

  Future<List<Flashcard>> searchFlashcards(String query, {String? deckId}) async {
    final db = await database;
    List<String> conditions = [
      '(question LIKE ? OR answer LIKE ? OR category LIKE ?)'
    ];
    List<dynamic> args = ['%$query%', '%$query%', '%$query%'];

    if (deckId != null) {
      conditions.add('deckId = ?');
      args.add(deckId);
    }

    final where = conditions.join(' AND ');
    final maps = await db.query(
      'flashcards',
      where: where,
      whereArgs: args,
      orderBy: 'createdAt DESC',
    );
    return maps.map((map) => Flashcard.fromMap(map)).toList();
  }

  Future<List<String>> getCategories({String? deckId}) async {
    final db = await database;
    List<String> conditions = [];
    List<dynamic> args = [];

    if (deckId != null) {
      conditions.add('deckId = ?');
      args.add(deckId);
    }

    final where = conditions.isNotEmpty ? 'WHERE ${conditions.join(' AND ')}' : '';
    final result = await db.rawQuery(
      'SELECT DISTINCT category FROM flashcards $where ORDER BY category',
      args.isNotEmpty ? args : null,
    );
    return result.map((r) => r['category'] as String).toList();
  }

  Future<List<Flashcard>> getDueCards(String deckId) async {
    final db = await database;
    final now = DateTime.now().toIso8601String();
    final maps = await db.query(
      'flashcards',
      where: '(nextReview IS NULL OR nextReview <= ?) AND deckId = ?',
      whereArgs: [now, deckId],
      orderBy: 'createdAt DESC',
    );
    return maps.map((map) => Flashcard.fromMap(map)).toList();
  }

  Future<void> insertFlashcard(Flashcard card) async {
    final db = await database;
    await db.insert('flashcards', card.toMap(),
        conflictAlgorithm: ConflictAlgorithm.replace);
  }

  Future<void> updateFlashcard(Flashcard card) async {
    final db = await database;
    await db.update('flashcards', card.toMap(),
        where: 'id = ?', whereArgs: [card.id]);
  }

  Future<void> deleteFlashcard(String id) async {
    final db = await database;
    await db.delete('flashcards', where: 'id = ?', whereArgs: [id]);
  }

  // ==================== Study Session Operations ====================

  Future<void> insertStudySession(StudySession session) async {
    final db = await database;
    await db.insert('study_sessions', session.toMap(),
        conflictAlgorithm: ConflictAlgorithm.replace);
  }

  Future<void> updateStudySession(StudySession session) async {
    final db = await database;
    await db.update('study_sessions', session.toMap(),
        where: 'id = ?', whereArgs: [session.id]);
  }

  Future<List<StudySession>> getStudySessions({String? deckId}) async {
    final db = await database;
    List<String> conditions = [];
    List<dynamic> args = [];

    if (deckId != null) {
      conditions.add('deckId = ?');
      args.add(deckId);
    }

    final where = conditions.isNotEmpty ? conditions.join(' AND ') : null;
    final maps = await db.query(
      'study_sessions',
      where: where,
      whereArgs: args.isNotEmpty ? args : null,
      orderBy: 'startTime DESC',
    );
    return maps.map((map) => StudySession.fromMap(map)).toList();
  }

  Future<Map<String, dynamic>> getStatistics({String? deckId}) async {
    final db = await database;
    List<String> conditions = [];
    List<dynamic> args = [];

    if (deckId != null) {
      conditions.add('deckId = ?');
      args.add(deckId);
    }

    final where = conditions.isNotEmpty ? 'WHERE ${conditions.join(' AND ')}' : '';

    // Total cards
    final totalCardsResult = await db.rawQuery(
      'SELECT COUNT(*) as count FROM flashcards $where',
      args.isNotEmpty ? args : null,
    );
    final totalCards = totalCardsResult.first['count'] as int;

    // Cards due for review
    final now = DateTime.now().toIso8601String();
    List<dynamic> dueArgs = [...args, now];
    String dueWhere = conditions.isNotEmpty
        ? '${conditions.join(' AND ')} AND (nextReview IS NULL OR nextReview <= ?)'
        : '(nextReview IS NULL OR nextReview <= ?)';

    final dueCardsResult = await db.rawQuery(
      'SELECT COUNT(*) as count FROM flashcards WHERE $dueWhere',
      dueArgs,
    );
    final dueCards = dueCardsResult.first['count'] as int;

    // Total study sessions
    final sessionsResult = await db.rawQuery(
      'SELECT COUNT(*) as count FROM study_sessions $where',
      args.isNotEmpty ? args : null,
    );
    final totalSessions = sessionsResult.first['count'] as int;

    // Total cards studied
    final studiedResult = await db.rawQuery(
      'SELECT SUM(cardsStudied) as total FROM study_sessions $where',
      args.isNotEmpty ? args : null,
    );
    final totalStudied = studiedResult.first['total'] as int? ?? 0;

    // Average accuracy
    final accuracyResult = await db.rawQuery(
      'SELECT SUM(cardsCorrect) as correct, SUM(cardsIncorrect) as incorrect FROM study_sessions $where',
      args.isNotEmpty ? args : null,
    );
    final totalCorrect = accuracyResult.first['correct'] as int? ?? 0;
    final totalIncorrect = accuracyResult.first['incorrect'] as int? ?? 0;
    final totalAttempted = totalCorrect + totalIncorrect;
    final averageAccuracy =
        totalAttempted > 0 ? (totalCorrect / totalAttempted) * 100 : 0.0;

    return {
      'totalCards': totalCards,
      'dueCards': dueCards,
      'totalSessions': totalSessions,
      'totalStudied': totalStudied,
      'averageAccuracy': averageAccuracy,
    };
  }

  // ==================== Import/Export ====================

  Future<String> exportDeck(String deckId) async {
    final deck = await getDeck(deckId);
    if (deck == null) throw Exception('Deck not found');

    final flashcards = await getFlashcards(deckId: deckId);
    final sessions = await getStudySessions(deckId: deckId);

    final exportData = {
      'version': 1,
      'exportDate': DateTime.now().toIso8601String(),
      'deck': deck.toMap(),
      'flashcards': flashcards.map((c) => c.toMap()).toList(),
      'studySessions': sessions.map((s) => s.toMap()).toList(),
    };

    return jsonEncode(exportData);
  }

  Future<String> exportAll() async {
    final decks = await getDecks();
    final flashcards = await getFlashcards();
    final sessions = await getStudySessions();

    final exportData = {
      'version': 1,
      'exportDate': DateTime.now().toIso8601String(),
      'decks': decks.map((d) => d.toMap()).toList(),
      'flashcards': flashcards.map((c) => c.toMap()).toList(),
      'studySessions': sessions.map((s) => s.toMap()).toList(),
    };

    return jsonEncode(exportData);
  }

  Future<void> importData(String jsonString) async {
    final db = await database;
    final data = jsonDecode(jsonString) as Map<String, dynamic>;

    await db.transaction((txn) async {
      // Import decks
      if (data['decks'] != null) {
        for (final deckMap in data['decks'] as List) {
          await txn.insert('decks', deckMap as Map<String, dynamic>,
              conflictAlgorithm: ConflictAlgorithm.replace);
        }
      } else if (data['deck'] != null) {
        await txn.insert('decks', data['deck'] as Map<String, dynamic>,
            conflictAlgorithm: ConflictAlgorithm.replace);
      }

      // Import flashcards
      if (data['flashcards'] != null) {
        for (final cardMap in data['flashcards'] as List) {
          await txn.insert('flashcards', cardMap as Map<String, dynamic>,
              conflictAlgorithm: ConflictAlgorithm.replace);
        }
      }

      // Import study sessions
      if (data['studySessions'] != null) {
        for (final sessionMap in data['studySessions'] as List) {
          await txn.insert(
              'study_sessions', sessionMap as Map<String, dynamic>,
              conflictAlgorithm: ConflictAlgorithm.replace);
        }
      }
    });
  }
}