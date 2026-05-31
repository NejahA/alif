import 'lib/services/mongodb_service.dart';

void main() async {
  print('Testing MongoDB connection...');
  
  await MongoDBService.connect();
  
  if (MongoDBService.isConnected) {
    print('\n✓ Connection successful!');
    
    // Test loading
    print('\nTesting load...');
    final data = await MongoDBService.loadTasks();
    if (data != null) {
      print('Loaded data:');
      print('  Todo: ${data['todo']?.length ?? 0} tasks');
      print('  In Progress: ${data['in_progress']?.length ?? 0} tasks');
      print('  Done: ${data['done']?.length ?? 0} tasks');
    } else {
      print('No data found');
    }
    
    // Test saving
    print('\nTesting save...');
    final testData = {
      'todo': [
        {
          'id': DateTime.now().millisecondsSinceEpoch,
          'title': 'Test task from Flutter',
          'description': 'Testing MongoDB sync',
          'due_date': '',
          'tags': <String>[],
          'created': DateTime.now().toIso8601String(),
          'time_spent': 0,
        }
      ],
      'in_progress': <Map<String, dynamic>>[],
      'done': <Map<String, dynamic>>[],
    };
    
    await MongoDBService.saveTasks(testData);
    print('Save test completed');
    
    // Verify save
    print('\nVerifying save...');
    final verifyData = await MongoDBService.loadTasks();
    if (verifyData != null) {
      print('Verified data:');
      print('  Todo: ${verifyData['todo']?.length ?? 0} tasks');
    }
    
  } else {
    print('\n✗ Connection failed!');
  }
  
  await MongoDBService.disconnect();
  print('\nTest completed');
}
