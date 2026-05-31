import 'lib/services/mongodb_service.dart';

void main() async {
  print('Testing Flutter app sync logic...\n');
  
  try {
    // Initialize MongoDB (like the app does)
    print('1. Connecting to MongoDB...');
    await MongoDBService.connect();
    print('✓ Connected: ${MongoDBService.isConnected}\n');
    
    // Load existing tasks
    print('2. Loading existing tasks...');
    final existingData = await MongoDBService.loadTasks();
    print('✓ Loaded tasks:');
    print('  Todo: ${existingData?['todo']?.length ?? 0}');
    print('  In Progress: ${existingData?['in_progress']?.length ?? 0}');
    print('  Done: ${existingData?['done']?.length ?? 0}\n');
    
    // Simulate adding a new task (like the Flutter app does)
    print('3. Simulating Flutter app adding a task...');
    final newTask = {
      'id': DateTime.now().millisecondsSinceEpoch,
      'title': 'Flutter Sync Test - ${DateTime.now().toIso8601String()}',
      'description': 'Testing if Flutter sync works',
      'due_date': '',
      'tags': <String>[],
      'created': DateTime.now().toIso8601String(),
      'time_spent': 0,
    };
    
    // Build the tasks map (like _syncToMongoDB does)
    final allTasks = <String, List<Map<String, dynamic>>>{
      'todo': [
        ...List<Map<String, dynamic>>.from(existingData?['todo'] ?? []),
        newTask,
      ],
      'in_progress': List<Map<String, dynamic>>.from(existingData?['in_progress'] ?? []),
      'done': List<Map<String, dynamic>>.from(existingData?['done'] ?? []),
    };
    
    print('Saving tasks to MongoDB...');
    print('  Todo: ${allTasks['todo']!.length}');
    print('  In Progress: ${allTasks['in_progress']!.length}');
    print('  Done: ${allTasks['done']!.length}');
    
    await MongoDBService.saveTasks(allTasks);
    
    // Verify
    print('\n4. Verifying the task was saved...');
    final verifyData = await MongoDBService.loadTasks();
    print('✓ Tasks after save:');
    print('  Todo: ${verifyData?['todo']?.length ?? 0}');
    
    final savedTask = (verifyData?['todo'] as List?)?.firstWhere(
      (t) => t['id'] == newTask['id'],
      orElse: () => null,
    );
    
    if (savedTask != null) {
      print('\n✓✓✓ SUCCESS! Task was saved to MongoDB!');
      print('  Title: ${savedTask['title']}');
      print('\nThe Flutter app sync logic works correctly.');
      print('Check your exe apps - they should see this task.');
    } else {
      print('\n✗✗✗ FAILED! Task was NOT saved to MongoDB');
    }
    
    await MongoDBService.disconnect();
  } catch (e, stackTrace) {
    print('✗ Error: $e');
    print('Stack trace: $stackTrace');
  }
}
