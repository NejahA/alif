import 'package:mongo_dart/mongo_dart.dart';

void main() async {
  print('Testing MongoDB connection...');
  
  const connectionString = 
      'mongodb+srv://achrefhamdi:21960975@cluster0.qd9v5k1.mongodb.net/dought?retryWrites=true&w=majority';
  
  try {
    print('Creating database connection...');
    final db = await Db.create(connectionString);
    
    print('Opening connection...');
    await db.open();
    
    print('✓ Connected! State: ${db.state}');
    
    final collection = db.collection('tasks');
    print('✓ Collection accessed: tasks');
    
    // Try to read existing data
    print('\nReading existing data...');
    final doc = await collection.findOne(where.eq('_id', 'tasks_data'));
    
    if (doc != null) {
      print('✓ Found tasks document:');
      print('  Todo: ${(doc['todo'] as List?)?.length ?? 0} tasks');
      print('  In Progress: ${(doc['in_progress'] as List?)?.length ?? 0} tasks');
      print('  Done: ${(doc['done'] as List?)?.length ?? 0} tasks');
      print('  Last updated: ${doc['last_updated']}');
    } else {
      print('No tasks document found (this is OK for first run)');
    }
    
    // Try to write test data
    print('\nTesting write operation...');
    final testResult = await collection.replaceOne(
      where.eq('_id', 'tasks_data'),
      {
        '_id': 'tasks_data',
        'todo': [
          {
            'id': DateTime.now().millisecondsSinceEpoch,
            'title': 'Test task from Flutter',
            'description': 'Testing MongoDB connection',
            'due_date': '',
            'tags': [],
            'created': DateTime.now().toIso8601String(),
            'time_spent': 0,
          }
        ],
        'in_progress': [],
        'done': [],
        'last_updated': DateTime.now().toIso8601String(),
      },
      upsert: true,
    );
    
    print('✓ Write successful!');
    print('  Modified: ${testResult.nModified}');
    print('  Upserted: ${testResult.nUpserted}');
    print('  Matched: ${testResult.nMatched}');
    
    await db.close();
    print('\n✓ All tests passed! MongoDB is working correctly.');
    
  } catch (e, stackTrace) {
    print('✗ Error: $e');
    print('Stack trace: $stackTrace');
  }
}
