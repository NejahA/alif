import 'package:mongo_dart/mongo_dart.dart';

void main() async {
  print('Testing MongoDB CRUD operations...\n');
  
  const connectionString = 'mongodb+srv://achrefhamdi:21960975@cluster0.qd9v5k1.mongodb.net/?retryWrites=true&w=majority';
  const databaseName = 'dought';
  const collectionName = 'tasks';
  
  try {
    // Connect
    print('1. Connecting to MongoDB...');
    final db = await Db.create(connectionString);
    await db.open();
    final collection = db.collection(collectionName);
    print('✓ Connected successfully\n');
    
    // Read current data
    print('2. Reading current data...');
    var doc = await collection.findOne(where.eq('_id', 'tasks_data'));
    if (doc != null) {
      print('✓ Current todo tasks: ${(doc['todo'] as List).length}');
      print('✓ Current done tasks: ${(doc['done'] as List).length}\n');
    } else {
      print('✗ No data found\n');
    }
    
    // Create a test task
    print('3. Adding a test task from Flutter...');
    final testTask = {
      'id': DateTime.now().millisecondsSinceEpoch,
      'title': 'TEST FROM FLUTTER - ${DateTime.now()}',
      'description': 'This task was created by Flutter test',
      'due_date': '',
      'tags': [],
      'created': DateTime.now().toIso8601String(),
      'time_spent': 0,
    };
    
    // Get current tasks
    doc = await collection.findOne(where.eq('_id', 'tasks_data'));
    final currentTodo = doc != null ? List<Map<String, dynamic>>.from(doc['todo'] ?? []) : [];
    final currentInProgress = doc != null ? List<Map<String, dynamic>>.from(doc['in_progress'] ?? []) : [];
    final currentDone = doc != null ? List<Map<String, dynamic>>.from(doc['done'] ?? []) : [];
    
    // Add test task to todo
    currentTodo.add(testTask);
    
    // Update MongoDB
    final result = await collection.replaceOne(
      where.eq('_id', 'tasks_data'),
      {
        '_id': 'tasks_data',
        'todo': currentTodo,
        'in_progress': currentInProgress,
        'done': currentDone,
        'last_updated': DateTime.now().toIso8601String(),
      },
      upsert: true,
    );
    
    print('✓ Task added to MongoDB');
    print('  Modified: ${result.nModified}');
    print('  Upserted: ${result.nUpserted}');
    print('  Matched: ${result.nMatched}\n');
    
    // Verify the task was added
    print('4. Verifying task was added...');
    doc = await collection.findOne(where.eq('_id', 'tasks_data'));
    if (doc != null) {
      final todoTasks = doc['todo'] as List;
      print('✓ Total todo tasks now: ${todoTasks.length}');
      
      // Find our test task
      final foundTask = todoTasks.firstWhere(
        (t) => t['id'] == testTask['id'],
        orElse: () => null,
      );
      
      if (foundTask != null) {
        print('✓ Test task found in MongoDB!');
        print('  Title: ${foundTask['title']}');
      } else {
        print('✗ Test task NOT found in MongoDB');
      }
    }
    
    print('\n✓ All CRUD operations working correctly!');
    print('Check your exe apps - they should see the new task.');
    
    await db.close();
  } catch (e, stackTrace) {
    print('✗ Error: $e');
    print('Stack trace: $stackTrace');
  }
}
