import 'package:mongo_dart/mongo_dart.dart';
import 'database_service.dart';
import 'dart:async';

class MongoDbService {
  static const String connectionString = 
      "mongodb+srv://achrefhamdi:21960975@cluster0.qd9v5k1.mongodb.net/nexus_db?retryWrites=true&w=majority";
  static const String databaseName = "nexus_db";
  
  Db? _db;
  DbCollection? _notesCollection;
  DbCollection? _linksCollection;
  bool _isConnected = false;
  Timer? _syncTimer;
  Function? onDataChanged;

  Future<void> connect() async {
    if (_isConnected) return;
    
    try {
      _db = await Db.create(connectionString);
      await _db!.open();
      
      _notesCollection = _db!.collection('notes');
      _linksCollection = _db!.collection('links');
      _isConnected = true;
      
      print('MongoDB connected successfully to $databaseName');
      
      // Start periodic sync every 3 seconds
      startAutoSync();
    } catch (e) {
      print('MongoDB connection error: $e');
      _isConnected = false;
    }
  }

  void startAutoSync() {
    _syncTimer?.cancel();
    _syncTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (onDataChanged != null) {
        onDataChanged!();
      }
    });
    print('Auto-sync started (every 1 second)');
  }

  void stopAutoSync() {
    _syncTimer?.cancel();
    print('Auto-sync stopped');
  }

  Future<void> close() async {
    stopAutoSync();
    if (_db != null && _isConnected) {
      await _db!.close();
      _isConnected = false;
    }
  }

  // Notes operations
  Future<List<Map<String, dynamic>>> getAllNotes() async {
    if (!_isConnected || _notesCollection == null) {
      print('MongoDB not connected, attempting to connect...');
      await connect();
      if (!_isConnected) return [];
    }
    
    try {
      final notes = await _notesCollection!.find().toList();
      print('Fetched ${notes.length} notes from MongoDB');
      return notes;
    } catch (e) {
      print('Error fetching notes: $e');
      return [];
    }
  }

  Future<void> syncNote(Note note) async {
    if (!_isConnected || _notesCollection == null) {
      await connect();
      if (!_isConnected) return;
    }
    
    try {
      final doc = {
        'localId': note.id,
        'title': note.title,
        'content': note.content,
        'createdAt': note.createdAt.toIso8601String(),
        'updatedAt': note.updatedAt.toIso8601String(),
      };

      final result = await _notesCollection!.replaceOne(
        where.eq('localId', note.id),
        doc,
        upsert: true,
      );
      
      print('Note synced: ${note.title} (modified: ${result.nModified}, upserted: ${result.nUpserted})');
    } catch (e) {
      print('Error syncing note: $e');
    }
  }

  Future<void> deleteNote(int localId) async {
    if (!_isConnected || _notesCollection == null) {
      await connect();
      if (!_isConnected) return;
    }
    
    try {
      final result = await _notesCollection!.deleteOne(where.eq('localId', localId));
      print('Note deleted: $localId (count: ${result.nRemoved})');
    } catch (e) {
      print('Error deleting note: $e');
    }
  }

  // Links operations
  Future<List<Map<String, dynamic>>> getAllLinks() async {
    if (!_isConnected || _linksCollection == null) {
      await connect();
      if (!_isConnected) return [];
    }
    
    try {
      final links = await _linksCollection!.find().toList();
      print('Fetched ${links.length} links from MongoDB');
      return links;
    } catch (e) {
      print('Error fetching links: $e');
      return [];
    }
  }

  Future<void> syncLink(int sourceId, int targetId) async {
    if (!_isConnected || _linksCollection == null) {
      await connect();
      if (!_isConnected) return;
    }
    
    try {
      final doc = {
        'sourceId': sourceId,
        'targetId': targetId,
      };

      final result = await _linksCollection!.replaceOne(
        where.eq('sourceId', sourceId).eq('targetId', targetId),
        doc,
        upsert: true,
      );
      
      print('Link synced: $sourceId -> $targetId (modified: ${result.nModified})');
    } catch (e) {
      print('Error syncing link: $e');
    }
  }

  Future<void> deleteLink(int sourceId, int targetId) async {
    if (!_isConnected || _linksCollection == null) {
      await connect();
      if (!_isConnected) return;
    }
    
    try {
      final result = await _linksCollection!.deleteOne(
        where.eq('sourceId', sourceId).eq('targetId', targetId),
      );
      print('Link deleted: $sourceId -> $targetId (count: ${result.nRemoved})');
    } catch (e) {
      print('Error deleting link: $e');
    }
  }

  Future<bool> testConnection() async {
    try {
      if (!_isConnected) await connect();
      return _isConnected && (_db?.isConnected ?? false);
    } catch (e) {
      print('Connection test failed: $e');
      return false;
    }
  }
}
