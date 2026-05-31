import 'package:sqflite/sqflite.dart';
import 'package:sqflite_common_ffi/sqflite_ffi.dart';
import 'package:path/path.dart';
import 'dart:io';
import 'mongodb_service.dart';

class Note {
  int? id;
  String title;
  String content;
  DateTime createdAt;
  DateTime updatedAt;

  Note({
    this.id,
    required this.title,
    required this.content,
    required this.createdAt,
    required this.updatedAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'title': title,
      'content': content,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  factory Note.fromMap(Map<String, dynamic> map) {
    return Note(
      id: map['id'],
      title: map['title'],
      content: map['content'],
      createdAt: DateTime.parse(map['createdAt']),
      updatedAt: DateTime.parse(map['updatedAt']),
    );
  }
}

class Link {
  final int sourceId;
  final int targetId;

  Link({required this.sourceId, required this.targetId});
}

class GraphData {
  final List<Note> nodes;
  final List<Link> links;

  GraphData({required this.nodes, required this.links});
}

class DatabaseService {
  Database? _database;
  final MongoDbService _mongoService = MongoDbService();
  Function? onSyncComplete;

  Future<void> initialize() async {
    // Initialize FFI for desktop platforms
    if (Platform.isWindows || Platform.isLinux || Platform.isMacOS) {
      sqfliteFfiInit();
      databaseFactory = databaseFactoryFfi;
    }

    final dbPath = await getDatabasesPath();
    final path = join(dbPath, 'nexus.db');

    _database = await openDatabase(
      path,
      version: 1,
      onCreate: (db, version) async {
        await db.execute('''
          CREATE TABLE Notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            createdAt TEXT NOT NULL,
            updatedAt TEXT NOT NULL
          )
        ''');
        await db.execute('''
          CREATE TABLE Links (
            sourceId INTEGER,
            targetId INTEGER,
            PRIMARY KEY (sourceId, targetId)
          )
        ''');
      },
    );
    
    // Connect to MongoDB and sync
    await _mongoService.connect();
    
    // Set up auto-sync callback
    _mongoService.onDataChanged = () async {
      await syncFromMongoDB();
      if (onSyncComplete != null) {
        onSyncComplete!();
      }
    };
    
    await syncFromMongoDB();
  }

  Future<void> syncFromMongoDB() async {
    try {
      // Get all notes from MongoDB
      final mongoNotes = await _mongoService.getAllNotes();
      final mongoLinks = await _mongoService.getAllLinks();

      bool hasChanges = false;

      // Sync notes
      for (var mongoNote in mongoNotes) {
        final localId = mongoNote['localId'] as int;
        
        // Handle DateTime conversion
        String createdAt;
        String updatedAt;
        
        if (mongoNote['createdAt'] is DateTime) {
          createdAt = (mongoNote['createdAt'] as DateTime).toIso8601String();
        } else {
          createdAt = mongoNote['createdAt'] as String;
        }
        
        if (mongoNote['updatedAt'] is DateTime) {
          updatedAt = (mongoNote['updatedAt'] as DateTime).toIso8601String();
        } else {
          updatedAt = mongoNote['updatedAt'] as String;
        }
        
        final existing = await _database!.query(
          'Notes',
          where: 'id = ?',
          whereArgs: [localId],
        );

        if (existing.isEmpty) {
          // Insert new note
          await _database!.insert(
            'Notes',
            {
              'id': localId,
              'title': mongoNote['title'],
              'content': mongoNote['content'],
              'createdAt': createdAt,
              'updatedAt': updatedAt,
            },
            conflictAlgorithm: ConflictAlgorithm.replace,
          );
          print('✅ Inserted note: ${mongoNote['title']}');
          hasChanges = true;
        } else {
          // Update if MongoDB version is newer
          final localUpdated = DateTime.parse(existing.first['updatedAt'] as String);
          final mongoUpdated = DateTime.parse(updatedAt);
          
          if (mongoUpdated.isAfter(localUpdated)) {
            await _database!.update(
              'Notes',
              {
                'title': mongoNote['title'],
                'content': mongoNote['content'],
                'updatedAt': updatedAt,
              },
              where: 'id = ?',
              whereArgs: [localId],
            );
            print('✅ Updated note: ${mongoNote['title']}');
            hasChanges = true;
          }
        }
      }

      // Sync links
      for (var mongoLink in mongoLinks) {
        final result = await _database!.insert(
          'Links',
          {
            'sourceId': mongoLink['sourceId'],
            'targetId': mongoLink['targetId'],
          },
          conflictAlgorithm: ConflictAlgorithm.ignore,
        );
        if (result > 0) hasChanges = true;
      }
      
      if (hasChanges) {
        print('🔄 Changes detected - triggering UI update');
      }
    } catch (e) {
      print('MongoDB sync error: $e');
      rethrow;
    }
  }

  Future<List<Note>> getAllNotes() async {
    final List<Map<String, dynamic>> maps = await _database!.query(
      'Notes',
      orderBy: 'updatedAt DESC',
    );
    return List.generate(maps.length, (i) => Note.fromMap(maps[i]));
  }

  Future<void> saveNote(Note note) async {
    if (note.id == null) {
      note.id = await _database!.insert('Notes', note.toMap());
    } else {
      await _database!.update(
        'Notes',
        note.toMap(),
        where: 'id = ?',
        whereArgs: [note.id],
      );
    }
    await _updateLinks(note);
    
    // Sync to MongoDB
    await _mongoService.syncNote(note);
  }

  Future<void> _updateLinks(Note note) async {
    await _database!.delete('Links', where: 'sourceId = ?', whereArgs: [note.id]);
    
    final linkPattern = RegExp(r'\[\[([^\]]+)\]\]');
    final matches = linkPattern.allMatches(note.content);
    
    for (final match in matches) {
      final targetTitle = match.group(1);
      final targetNotes = await _database!.query(
        'Notes',
        where: 'title = ?',
        whereArgs: [targetTitle],
      );
      
      if (targetNotes.isNotEmpty) {
        await _database!.insert(
          'Links',
          {'sourceId': note.id, 'targetId': targetNotes.first['id']},
          conflictAlgorithm: ConflictAlgorithm.ignore,
        );
      }
    }
  }

  Future<void> deleteNote(int id) async {
    await _database!.delete('Links', where: 'sourceId = ? OR targetId = ?', whereArgs: [id, id]);
    await _database!.delete('Notes', where: 'id = ?', whereArgs: [id]);
    
    // Sync to MongoDB
    await _mongoService.deleteNote(id);
  }

  Future<List<Note>> search(String query) async {
    final List<Map<String, dynamic>> maps = await _database!.query(
      'Notes',
      where: 'title LIKE ? OR content LIKE ?',
      whereArgs: ['%$query%', '%$query%'],
      orderBy: 'updatedAt DESC',
    );
    return List.generate(maps.length, (i) => Note.fromMap(maps[i]));
  }

  Future<GraphData> getGraphData() async {
    final notes = await getAllNotes();
    final List<Map<String, dynamic>> linkMaps = await _database!.query('Links');
    final links = linkMaps.map((m) => Link(sourceId: m['sourceId'], targetId: m['targetId'])).toList();
    return GraphData(nodes: notes, links: links);
  }

  Future<void> createLink(int sourceId, int targetId) async {
    await _database!.insert(
      'Links',
      {'sourceId': sourceId, 'targetId': targetId},
      conflictAlgorithm: ConflictAlgorithm.ignore,
    );
    
    // Sync to MongoDB
    await _mongoService.syncLink(sourceId, targetId);
  }

  Future<void> deleteLink(int sourceId, int targetId) async {
    await _database!.delete(
      'Links',
      where: 'sourceId = ? AND targetId = ?',
      whereArgs: [sourceId, targetId],
    );
    
    // Sync to MongoDB
    await _mongoService.deleteLink(sourceId, targetId);
  }

  Future<List<Link>> getAllLinks() async {
    final List<Map<String, dynamic>> maps = await _database!.query('Links');
    return maps.map((m) => Link(sourceId: m['sourceId'], targetId: m['targetId'])).toList();
  }
}
