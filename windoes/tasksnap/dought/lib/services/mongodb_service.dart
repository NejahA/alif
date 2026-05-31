import 'package:mongo_dart/mongo_dart.dart';

class MongoDBService {
  static const String connectionString =
      'mongodb+srv://achrefhamdi:21960975@cluster0.qd9v5k1.mongodb.net/dought?retryWrites=true&w=majority';
  static const String databaseName = 'dought';
  static const String collectionName = 'tasks';

  static Db? _db;
  static DbCollection? _collection;

  static Future<void> connect() async {
    try {
      if (_db != null && _db!.isConnected) {
        print('MongoDB already connected');
        return;
      }
      
      print('Connecting to MongoDB...');
      print('  Connection string: mongodb+srv://achrefhamdi:***@cluster0.qd9v5k1.mongodb.net/dought');
      
      _db = await Db.create(connectionString);
      await _db!.open();
      
      print('  Database opened, state: ${_db!.state}');
      
      _collection = _db!.collection(collectionName);
      
      print('✓ MongoDB connected successfully!');
      print('  Database: $databaseName');
      print('  Collection: $collectionName');
      print('  Connection state: ${_db!.state}');
      
      // Test the connection by trying to read
      final testDoc = await _collection!.findOne(where.eq('_id', 'tasks_data'));
      print('  Test query result: ${testDoc != null ? "Document found" : "No document yet"}');
      
    } catch (e, stackTrace) {
      print('✗ MongoDB connection failed: $e');
      print('Stack trace: $stackTrace');
    }
  }

  static Future<void> disconnect() async {
    try {
      await _db?.close();
      print('MongoDB disconnected');
    } catch (e) {
      print('Error disconnecting MongoDB: $e');
    }
  }

  static Future<Map<String, dynamic>?> loadTasks() async {
    if (_collection == null) {
      print('Collection not initialized, connecting...');
      await connect();
    }

    if (_collection == null) {
      print('✗ Cannot load: MongoDB collection is still null after connect attempt');
      return null;
    }

    try {
      print('Loading tasks from MongoDB...');
      final doc = await _collection!.findOne(where.eq('_id', 'tasks_data'));
      if (doc != null) {
        print('✓ Loaded tasks from MongoDB');
        print('  Todo: ${(doc['todo'] as List?)?.length ?? 0}');
        print('  In Progress: ${(doc['in_progress'] as List?)?.length ?? 0}');
        print('  Done: ${(doc['done'] as List?)?.length ?? 0}');
        return {
          'todo': doc['todo'] ?? [],
          'in_progress': doc['in_progress'] ?? [],
          'done': doc['done'] ?? [],
        };
      } else {
        print('No tasks document found in MongoDB');
      }
    } catch (e, stackTrace) {
      print('✗ Error loading from MongoDB: $e');
      print('Stack trace: $stackTrace');
    }
    return null;
  }

  static Future<void> saveTasks(Map<String, List<Map<String, dynamic>>> tasks) async {
    if (_collection == null) {
      print('MongoDB collection not initialized, attempting to connect...');
      await connect();
    }

    if (_collection == null) {
      print('✗ Cannot save: MongoDB collection is still null');
      return;
    }

    try {
      print('Attempting to save to MongoDB...');
      print('  Todo tasks: ${tasks['todo']?.length ?? 0}');
      print('  In Progress tasks: ${tasks['in_progress']?.length ?? 0}');
      print('  Done tasks: ${tasks['done']?.length ?? 0}');
      
      final result = await _collection!.replaceOne(
        where.eq('_id', 'tasks_data'),
        {
          '_id': 'tasks_data',
          'todo': tasks['todo'],
          'in_progress': tasks['in_progress'],
          'done': tasks['done'],
          'last_updated': DateTime.now().toIso8601String(),
        },
        upsert: true,
      );
      
      print('✓ Saved tasks to MongoDB');
      print('  Modified: ${result.nModified}');
      print('  Upserted: ${result.nUpserted}');
      print('  Matched: ${result.nMatched}');
    } catch (e, stackTrace) {
      print('✗ Error saving to MongoDB: $e');
      print('Stack trace: $stackTrace');
    }
  }

  static bool get isConnected => _db != null && _db!.isConnected;
}
