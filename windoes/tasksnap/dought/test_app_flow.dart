import 'package:hive_flutter/hive_flutter.dart';
import 'lib/main.dart';
import 'lib/services/mongodb_service.dart';

void main() async {
  print('═══════════════════════════════════════════════════════');
  print('  TESTING EXACT FLUTTER APP FLOW');
  print('═══════════════════════════════════════════════════════\n');
  
  try {
    // Step 1: Initialize exactly like the app does
    print('STEP 1: Initializing Hive (like Flutter app)...');
    await Hive.initFlutter();
    Hive.registerAdapter(TaskAdapter());
    await Hive.openBox<Task>('tasks');
    print('✓ Hive initialized\n');
    
    // Step 2: Connect to MongoDB (like Flutter app)
    print('STEP 2: Connecting to MongoDB (like Flutter app)...');
    await MongoDBService.connect();
    if (MongoDBService.isConnected) {
      print('✅ MongoDB connected successfully!\n');
    } else {
      print('❌ MongoDB connection FAILED!\n');
      return;
    }
    
    // Step 3: Create TaskRepository (like Flutter app)
    print('STEP 3: Creating TaskRepository...');
    final repo = TaskRepository();
    print('✓ Repository created\n');
    
    // Step 4: Load from MongoDB (like Flutter app startup)
    print('STEP 4: Loading from MongoDB...');
    await repo.loadFromMongoDB();
    final initialTasks = repo.getAll();
    print('✓ Loaded ${initialTasks.length} tasks from MongoDB\n');
    
    // Step 5: Add a task (like user clicking + button)
    print('STEP 5: Adding a new task (simulating user action)...');
    final newTask = Task(
      title: 'APP FLOW TEST - ${DateTime.now().toIso8601String()}',
      description: 'Testing if Flutter app flow syncs to MongoDB',
      dueDate: DateTime.now().add(const Duration(days: 1)),
      isCompleted: false,
    );
    
    print('Calling repo.add()...');
    await repo.add(newTask);
    print('✓ repo.add() completed\n');
    
    // Step 6: Verify it was saved to MongoDB
    print('STEP 6: Verifying task was saved to MongoDB...');
    final verifyData = await MongoDBService.loadTasks();
    if (verifyData != null) {
      final todoTasks = verifyData['todo'] as List;
      print('✓ Total todo tasks in MongoDB: ${todoTasks.length}');
      
      // Find our task
      final foundTask = todoTasks.firstWhere(
        (t) => t['title'] == newTask.title,
        orElse: () => null,
      );
      
      if (foundTask != null) {
        print('\n✅✅✅ SUCCESS! Task was synced to MongoDB!');
        print('  Title: ${foundTask['title']}');
        print('  Description: ${foundTask['description']}');
        print('\n🎉 The Flutter app flow works correctly!');
        print('📱 Open dought.exe - you should see this task!');
      } else {
        print('\n❌❌❌ FAILED! Task was NOT found in MongoDB');
        print('This means _syncToMongoDB() is not being called or failing silently');
      }
    } else {
      print('❌ Could not load from MongoDB to verify');
    }
    
    // Cleanup
    await Hive.close();
    await MongoDBService.disconnect();
    
  } catch (e, stackTrace) {
    print('\n❌❌❌ ERROR: $e');
    print('Stack trace: $stackTrace');
  }
}
