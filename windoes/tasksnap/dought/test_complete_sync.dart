import 'lib/services/mongodb_service.dart';

void main() async {
  print('═══════════════════════════════════════════════════════');
  print('  COMPLETE FLUTTER ↔ MONGODB SYNC TEST');
  print('═══════════════════════════════════════════════════════\n');
  
  try {
    // Step 1: Connect
    print('STEP 1: Connecting to MongoDB...');
    await MongoDBService.connect();
    if (!MongoDBService.isConnected) {
      print('✗ FAILED: Could not connect to MongoDB');
      return;
    }
    print('✓ Connected successfully\n');
    
    // Step 2: Read current state
    print('STEP 2: Reading current tasks...');
    var data = await MongoDBService.loadTasks();
    final initialTodoCount = (data?['todo'] as List?)?.length ?? 0;
    final initialDoneCount = (data?['done'] as List?)?.length ?? 0;
    print('✓ Current state:');
    print('  - Todo: $initialTodoCount tasks');
    print('  - Done: $initialDoneCount tasks\n');
    
    // Step 3: CREATE - Add a new task
    print('STEP 3: Testing CREATE (add new task)...');
    final newTaskId = DateTime.now().millisecondsSinceEpoch;
    final newTask = {
      'id': newTaskId,
      'title': 'SYNC TEST ${DateTime.now().toIso8601String()}',
      'description': 'This task tests Flutter → MongoDB sync',
      'due_date': '2026-03-01',
      'tags': <String>['test', 'sync'],
      'created': DateTime.now().toIso8601String(),
      'time_spent': 0,
    };
    
    data = await MongoDBService.loadTasks();
    final updatedTasks = <String, List<Map<String, dynamic>>>{
      'todo': [
        ...List<Map<String, dynamic>>.from(data?['todo'] ?? []),
        newTask,
      ],
      'in_progress': List<Map<String, dynamic>>.from(data?['in_progress'] ?? []),
      'done': List<Map<String, dynamic>>.from(data?['done'] ?? []),
    };
    
    await MongoDBService.saveTasks(updatedTasks);
    
    // Verify CREATE
    data = await MongoDBService.loadTasks();
    final afterCreateCount = (data?['todo'] as List?)?.length ?? 0;
    if (afterCreateCount == initialTodoCount + 1) {
      print('✓ CREATE successful: Todo count increased from $initialTodoCount to $afterCreateCount\n');
    } else {
      print('✗ CREATE failed: Expected ${initialTodoCount + 1}, got $afterCreateCount\n');
      return;
    }
    
    // Step 4: UPDATE - Move task to done
    print('STEP 4: Testing UPDATE (mark task complete)...');
    data = await MongoDBService.loadTasks();
    final todoTasks = List<Map<String, dynamic>>.from(data?['todo'] ?? []);
    final taskToComplete = todoTasks.firstWhere((t) => t['id'] == newTaskId);
    todoTasks.removeWhere((t) => t['id'] == newTaskId);
    
    final updatedTasks2 = <String, List<Map<String, dynamic>>>{
      'todo': todoTasks,
      'in_progress': List<Map<String, dynamic>>.from(data?['in_progress'] ?? []),
      'done': [
        ...List<Map<String, dynamic>>.from(data?['done'] ?? []),
        taskToComplete,
      ],
    };
    
    await MongoDBService.saveTasks(updatedTasks2);
    
    // Verify UPDATE
    data = await MongoDBService.loadTasks();
    final afterUpdateTodoCount = (data?['todo'] as List?)?.length ?? 0;
    final afterUpdateDoneCount = (data?['done'] as List?)?.length ?? 0;
    if (afterUpdateTodoCount == initialTodoCount && afterUpdateDoneCount == initialDoneCount + 1) {
      print('✓ UPDATE successful: Task moved from Todo to Done\n');
    } else {
      print('✗ UPDATE failed: Todo=$afterUpdateTodoCount (expected $initialTodoCount), Done=$afterUpdateDoneCount (expected ${initialDoneCount + 1})\n');
      return;
    }
    
    // Step 5: DELETE - Remove the task
    print('STEP 5: Testing DELETE (remove task)...');
    data = await MongoDBService.loadTasks();
    final doneTasks = List<Map<String, dynamic>>.from(data?['done'] ?? []);
    doneTasks.removeWhere((t) => t['id'] == newTaskId);
    
    final updatedTasks3 = <String, List<Map<String, dynamic>>>{
      'todo': List<Map<String, dynamic>>.from(data?['todo'] ?? []),
      'in_progress': List<Map<String, dynamic>>.from(data?['in_progress'] ?? []),
      'done': doneTasks,
    };
    
    await MongoDBService.saveTasks(updatedTasks3);
    
    // Verify DELETE
    data = await MongoDBService.loadTasks();
    final afterDeleteDoneCount = (data?['done'] as List?)?.length ?? 0;
    if (afterDeleteDoneCount == initialDoneCount) {
      print('✓ DELETE successful: Task removed from Done\n');
    } else {
      print('✗ DELETE failed: Expected $initialDoneCount, got $afterDeleteDoneCount\n');
      return;
    }
    
    // Final verification
    print('═══════════════════════════════════════════════════════');
    print('  ✓✓✓ ALL TESTS PASSED! ✓✓✓');
    print('═══════════════════════════════════════════════════════');
    print('\nFlutter app CRUD operations work correctly with MongoDB!');
    print('\nNext steps:');
    print('  1. Run: flutter run -d windows');
    print('  2. Add a task in Flutter app');
    print('  3. Open dought.exe or dought_widget.exe');
    print('  4. Verify the task appears in the exe app');
    print('\nIf the task appears, bidirectional sync is working! 🎉\n');
    
    await MongoDBService.disconnect();
  } catch (e, stackTrace) {
    print('\n✗✗✗ TEST FAILED ✗✗✗');
    print('Error: $e');
    print('Stack trace: $stackTrace');
  }
}
