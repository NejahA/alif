import 'package:mongo_dart/mongo_dart.dart';
import 'models/transient_item.dart';

class ApiService {
  static const String _uri = "mongodb+srv://nejahachref:96176065@cluster0.ajw0g.mongodb.net/href?retryWrites=true&w=majority&appName=x_gone";
  Db? _db;
  DbCollection? _collection;

  Future<void> _ensureConnected() async {
    if (_db == null || !_db!.isConnected) {
      _db = await Db.create(_uri);
      await _db!.open();
      _collection = _db!.collection('items');
    }
  }

  Future<List<TransientItem>> fetchItems() async {
    try {
      await _ensureConnected();
      final items = await _collection!.find(where.sortBy('createdAt', descending: false)).toList();
      return items.map((item) => TransientItem.fromJson(item)).toList();
    } catch (e) {
      print("Error fetching items: $e");
    }
    return [];
  }

  Future<TransientItem?> addItem(String content, {String type = "note", int durationSeconds = 300}) async {
    try {
      await _ensureConnected();
      final now = DateTime.now();
      final expiresAt = now.add(Duration(seconds: durationSeconds));
      
      final doc = {
        "_id": ObjectId(),
        "content": content,
        "type": type,
        "createdAt": now,
        "expiresAt": expiresAt,
      };

      await _collection!.insertOne(doc);
      return TransientItem.fromJson(doc);
    } catch (e) {
      print("Error adding item: $e");
    }
    return null;
  }

  Future<bool> deleteItem(String id) async {
    try {
      await _ensureConnected();
      await _collection!.remove(where.id(ObjectId.fromHexString(id)));
      return true;
    } catch (e) {
      print("Error deleting item: $e");
      return false;
    }
  }

  Future<bool> massWipe() async {
    try {
      await _ensureConnected();
      await _collection!.remove(<String, dynamic>{});
      return true;
    } catch (e) {
      print("Error mass wiping items: $e");
      return false;
    }
  }

  Future<void> close() async {
    await _db?.close();
  }
}
