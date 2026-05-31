// lib/main.dart
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:intl/intl.dart';
import 'package:uuid/uuid.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'services/mongodb_service.dart';

part 'main.g.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Hive.initFlutter();
  Hive.registerAdapter(TaskAdapter());
  await Hive.openBox<Task>('tasks');
  
  // Initialize MongoDB
  print('🚀 Initializing MongoDB connection...');
  await MongoDBService.connect();
  if (MongoDBService.isConnected) {
    print('✅ MongoDB connected successfully in main()!');
  } else {
    print('❌ MongoDB connection FAILED in main()!');
  }
  
  runApp(const ProviderScope(child: MyApp()));
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'In The Name of God: ',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
        useMaterial3: true,
      ),
      home: const HomeScreen(),
    );
  }
}

// ────────────────────────────────────────────────
// Model
// ────────────────────────────────────────────────

@HiveType(typeId: 0)
class Task extends HiveObject {
  @HiveField(0)
  final String id;

  @HiveField(1)
  String title;

  @HiveField(2)
  String? description;

  @HiveField(3)
  DateTime? dueDate;

  @HiveField(4)
  bool isCompleted;

  @HiveField(5)
  DateTime createdAt;

  Task({
    String? id,
    required this.title,
    this.description,
    this.dueDate,
    this.isCompleted = false,
    DateTime? createdAt,
  })  : id = id ?? const Uuid().v4(),
        createdAt = createdAt ?? DateTime.now();
}

// ────────────────────────────────────────────────
// Repository
// ────────────────────────────────────────────────

class TaskRepository {
  final Box<Task> box = Hive.box<Task>('tasks');

  List<Task> getAll() => box.values.toList();
  
  Future<void> loadFromMongoDB() async {
    try {
      print('Loading tasks from MongoDB...');
      final data = await MongoDBService.loadTasks();
      
      if (data != null) {
        // Clear local storage
        await box.clear();
        
        // Convert MongoDB tasks to Flutter Task objects
        final allMongoTasks = [
          ...(data['todo'] as List? ?? []),
          ...(data['in_progress'] as List? ?? []),
          ...(data['done'] as List? ?? []),
        ];
        
        print('Found ${allMongoTasks.length} tasks in MongoDB');
        
        for (final mongoTask in allMongoTasks) {
          try {
            final task = Task(
              id: mongoTask['id']?.toString() ?? DateTime.now().millisecondsSinceEpoch.toString(),
              title: mongoTask['title'] ?? 'Untitled',
              description: mongoTask['description']?.toString().isEmpty == false 
                  ? mongoTask['description'] 
                  : null,
              dueDate: mongoTask['due_date']?.toString().isEmpty == false
                  ? DateTime.tryParse(mongoTask['due_date'])
                  : null,
              isCompleted: (data['done'] as List? ?? []).contains(mongoTask),
              createdAt: DateTime.tryParse(mongoTask['created'] ?? '') ?? DateTime.now(),
            );
            
            await box.put(task.id, task);
          } catch (e) {
            print('Error converting task: $e');
          }
        }
        
        print('✓ Loaded ${box.length} tasks from MongoDB to local storage');
      } else {
        print('No tasks found in MongoDB');
      }
    } catch (e, stackTrace) {
      print('Error loading from MongoDB: $e');
      print('Stack trace: $stackTrace');
    }
  }

  Future<void> add(Task task) async {
    print('📝 TaskRepository.add() - Saving to Hive: ${task.title}');
    await box.put(task.id, task);
    print('📝 TaskRepository.add() - Calling _syncToMongoDB()');
    await _syncToMongoDB();
    print('📝 TaskRepository.add() - Done!');
  }

  Future<void> update(Task task) async {
    print('✏️ TaskRepository.update() - Saving to Hive: ${task.title}');
    await box.put(task.id, task);
    print('✏️ TaskRepository.update() - Calling _syncToMongoDB()');
    await _syncToMongoDB();
    print('✏️ TaskRepository.update() - Done!');
  }

  Future<void> delete(String id) async {
    print('🗑️ TaskRepository.delete() - Deleting from Hive: $id');
    await box.delete(id);
    print('🗑️ TaskRepository.delete() - Calling _syncToMongoDB()');
    await _syncToMongoDB();
    print('🗑️ TaskRepository.delete() - Done!');
  }

  Future<void> reorder(List<Task> orderedTasks) async {
    await box.clear();
    for (final task in orderedTasks) {
      await box.put(task.id, task);
    }
    await _syncToMongoDB();
  }

  Future<void> _syncToMongoDB() async {
    try {
      // Check if MongoDB is connected
      if (!MongoDBService.isConnected) {
        print('⚠️ MongoDB not connected! Attempting to reconnect...');
        await MongoDBService.connect();
        if (!MongoDBService.isConnected) {
          print('❌ MongoDB reconnection failed! Cannot sync.');
          return;
        }
        print('✅ MongoDB reconnected successfully!');
      }
      
      final allTasks = getAll();
      print('🔄 _syncToMongoDB() - Starting sync...');
      print('🔄 Total tasks in Hive: ${allTasks.length}');
      print('🔄 MongoDB connected: ${MongoDBService.isConnected}');
      
      // Convert to the format expected by MongoDB (matching Python apps)
      final tasks = {
        'todo': allTasks
            .where((t) => !t.isCompleted)
            .map((t) => {
                  'id': int.tryParse(t.id) ?? t.createdAt.millisecondsSinceEpoch,
                  'title': t.title,
                  'description': t.description ?? '',
                  'due_date': t.dueDate?.toIso8601String().split('T')[0] ?? '',
                  'tags': <String>[],
                  'created': t.createdAt.toIso8601String(),
                  'time_spent': 0,
                })
            .toList(),
        'in_progress': <Map<String, dynamic>>[],
        'done': allTasks
            .where((t) => t.isCompleted)
            .map((t) => {
                  'id': int.tryParse(t.id) ?? t.createdAt.millisecondsSinceEpoch,
                  'title': t.title,
                  'description': t.description ?? '',
                  'due_date': t.dueDate?.toIso8601String().split('T')[0] ?? '',
                  'tags': <String>[],
                  'created': t.createdAt.toIso8601String(),
                  'time_spent': 0,
                })
            .toList(),
      };

      print('🔄 Prepared data - Todo: ${tasks['todo']!.length}, Done: ${tasks['done']!.length}');
      print('🔄 Calling MongoDBService.saveTasks()...');
      await MongoDBService.saveTasks(tasks);
      print('✅ _syncToMongoDB() - Sync completed successfully!');
    } catch (e, stackTrace) {
      print('❌ _syncToMongoDB() - Error syncing to MongoDB: $e');
      print('Stack trace: $stackTrace');
    }
  }
}

// ────────────────────────────────────────────────
// Providers
// ────────────────────────────────────────────────

@riverpod
class TaskList extends _$TaskList {
  late final TaskRepository repo;
  Timer? _syncTimer;

  @override
  List<Task> build() {
    repo = TaskRepository();
    // Load from MongoDB on startup
    _loadFromMongoDB();
    
    // Start periodic sync every 3 seconds
    _syncTimer = Timer.periodic(const Duration(seconds: 3), (_) {
      _checkForUpdates();
    });
    
    // Cancel timer when provider is disposed
    ref.onDispose(() {
      _syncTimer?.cancel();
    });
    
    return repo.getAll();
  }

  Future<void> _loadFromMongoDB() async {
    await repo.loadFromMongoDB();
    // Update state after loading
    state = repo.getAll();
  }
  
  Future<void> _checkForUpdates() async {
    try {
      // Load from MongoDB without clearing local storage
      final data = await MongoDBService.loadTasks();
      
      if (data != null) {
        // Convert MongoDB tasks to Flutter Task objects
        final allMongoTasks = [
          ...(data['todo'] as List? ?? []),
          ...(data['in_progress'] as List? ?? []),
          ...(data['done'] as List? ?? []),
        ];
        
        // Create a map of current tasks by ID
        final currentTasksMap = {for (var t in state) t.id: t};
        
        // Check if there are differences in count or completion status
        bool hasChanges = false;
        
        // Check count difference
        if (allMongoTasks.length != state.length) {
          hasChanges = true;
        } else {
          // Check each task for completion status changes
          for (final mongoTask in allMongoTasks) {
            final id = mongoTask['id']?.toString() ?? '';
            final isInDone = (data['done'] as List? ?? []).contains(mongoTask);
            
            if (currentTasksMap.containsKey(id)) {
              final currentTask = currentTasksMap[id]!;
              if (currentTask.isCompleted != isInDone) {
                hasChanges = true;
                break;
              }
            } else {
              hasChanges = true;
              break;
            }
          }
        }
        
        // If there are differences, reload
        if (hasChanges) {
          print('🔄 Detected changes in MongoDB, reloading...');
          await repo.loadFromMongoDB();
          state = repo.getAll();
        }
      }
    } catch (e) {
      // Silently fail - don't spam console
    }
  }

  Future<void> add(Task task) async {
    print('🔵 TaskList.add() called for: ${task.title}');
    await repo.add(task);
    print('🔵 TaskList.add() completed');
    state = [...state, task];
  }

  Future<void> update(Task updated) async {
    print('🟡 TaskList.update() called for: ${updated.title}');
    await repo.update(updated);
    print('🟡 TaskList.update() completed');
    state = [
      for (final t in state) t.id == updated.id ? updated : t,
    ];
  }

  Future<void> toggle(String id) async {
    final idx = state.indexWhere((t) => t.id == id);
    if (idx == -1) return;

    final old = state[idx];
    final updated = Task(
      id: old.id,
      title: old.title,
      description: old.description,
      dueDate: old.dueDate,
      isCompleted: !old.isCompleted,
      createdAt: old.createdAt,
    );

    await repo.update(updated);
    state = [...state]..[idx] = updated;
  }

  Future<void> delete(String id) async {
    print('🔴 TaskList.delete() called for id: $id');
    await repo.delete(id);
    print('🔴 TaskList.delete() completed');
    state = state.where((t) => t.id != id).toList();
  }

  Future<void> reorder(int oldIndex, int newIndex) async {
    if (oldIndex == newIndex) return;

    final newList = List<Task>.from(state);
    final effectiveNewIndex = newIndex > oldIndex ? newIndex - 1 : newIndex;

    final task = newList.removeAt(oldIndex);
    newList.insert(effectiveNewIndex, task);

    await repo.reorder(newList);
    state = newList;
  }
}

enum TaskFilter { all, pending, completed }

@riverpod
class Filter extends _$Filter {
  @override
  TaskFilter build() => TaskFilter.all;

  void set(TaskFilter value) => state = value;
}

// ────────────────────────────────────────────────
// Screens & Widgets
// ────────────────────────────────────────────────

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final tasks = ref.watch(taskListProvider);
    final filter = ref.watch(filterProvider);

    final visibleTasks = switch (filter) {
      TaskFilter.all => tasks,
      TaskFilter.pending => tasks.where((t) => !t.isCompleted).toList(),
      TaskFilter.completed => tasks.where((t) => t.isCompleted).toList(),
    };

    final canReorderAndDelete = filter == TaskFilter.all;

    return Scaffold(
      appBar: AppBar(
        title: const Text('In The Name of God: '),
        actions: [
          PopupMenuButton<TaskFilter>(
            onSelected: (v) => ref.read(filterProvider.notifier).set(v),
            itemBuilder: (ctx) => TaskFilter.values
                .map((f) => PopupMenuItem(
                      value: f,
                      child: Text(f.name[0].toUpperCase() + f.name.substring(1)),
                    ))
                .toList(),
          ),
        ],
      ),
      body: tasks.isEmpty
          ? const Center(child: Text('No tasks yet'))
          : ReorderableListView.builder(
              buildDefaultDragHandles: canReorderAndDelete,
              physics: canReorderAndDelete
                  ? const AlwaysScrollableScrollPhysics()
                  : const NeverScrollableScrollPhysics(),
              itemCount: visibleTasks.length,
              itemBuilder: (context, index) {
                final task = visibleTasks[index];
                return Dismissible(
                  key: ValueKey(task.id),
                  direction: canReorderAndDelete && !task.isCompleted
                      ? DismissDirection.endToStart
                      : DismissDirection.none,
                  background: Container(
                    color: Colors.red,
                    alignment: Alignment.centerRight,
                    padding: const EdgeInsets.only(right: 24),
                    child: const Icon(Icons.delete, color: Colors.white),
                  ),
                  confirmDismiss: (direction) async {
                    return await showDialog<bool>(
                          context: context,
                          builder: (context) => AlertDialog(
                            title: const Text('Delete Task'),
                            content: const Text(
                              'Are you sure you want to delete this task?\nThis action cannot be undone after confirmation.',
                            ),
                            actions: [
                              TextButton(
                                onPressed: () => Navigator.pop(context, false),
                                child: const Text('Cancel'),
                              ),
                              TextButton(
                                style: TextButton.styleFrom(
                                  foregroundColor: Colors.red,
                                ),
                                onPressed: () => Navigator.pop(context, true),
                                child: const Text('Delete'),
                              ),
                            ],
                          ),
                        ) ??
                        false;
                  },
                  onDismissed: (_) {
                    // Show syncing message
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('💾 Deleting and syncing to MongoDB...'),
                        duration: Duration(seconds: 1),
                      ),
                    );

                    // Delete task
                    ref.read(taskListProvider.notifier).delete(task.id).then((_) {
                      // Show success message
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: const Text('✅ Task deleted and synced to MongoDB!'),
                          backgroundColor: Colors.green,
                          duration: const Duration(seconds: 2),
                          action: SnackBarAction(
                            label: 'Undo',
                            onPressed: () {
                              final restoredTask = Task(
                                id: task.id,
                                title: task.title,
                                description: task.description,
                                dueDate: task.dueDate,
                                isCompleted: task.isCompleted,
                                createdAt: task.createdAt,
                              );
                              ref.read(taskListProvider.notifier).add(restoredTask);
                            },
                          ),
                        ),
                      );
                    });
                  },
                  child: TaskTile(
                    task: task,
                    onToggle: () {
      // Show syncing message
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('💾 Syncing to MongoDB...'),
          duration: Duration(seconds: 1),
        ),
      );
      
      ref.read(taskListProvider.notifier).toggle(task.id).then((_) {
        // Show success message
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('✅ Task synced to MongoDB!'),
            backgroundColor: Colors.green,
            duration: Duration(seconds: 2),
          ),
        );
      });
    },
                    onEdit: () => Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => AddEditScreen(task: task),
                      ),
                    ),
                  ),
                );
              },
              onReorder: (int oldIndex, int newIndex) {
                if (!canReorderAndDelete) return;
                ref.read(taskListProvider.notifier).reorder(oldIndex, newIndex);
              },
              proxyDecorator: (child, index, animation) {
                return Material(
                  elevation: 8,
                  color: Colors.transparent,
                  child: ScaleTransition(
                    scale: animation.drive(Tween<double>(begin: 1.0, end: 1.05)),
                    child: child,
                  ),
                );
              },
            ),
      floatingActionButton: FloatingActionButton(
        child: const Icon(Icons.add),
        onPressed: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const AddEditScreen()),
        ),
      ),
    );
  }
}

class TaskTile extends StatelessWidget {
  final Task task;
  final VoidCallback onToggle;
  final VoidCallback onEdit;

  const TaskTile({
    super.key,
    required this.task,
    required this.onToggle,
    required this.onEdit,
  });

  bool get overdue => !task.isCompleted && task.dueDate?.isBefore(DateTime.now()) == true;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      child: ListTile(
        leading: Checkbox(
          value: task.isCompleted,
          onChanged: (_) => onToggle(),
        ),
        title: Text(
          task.title,
          style: TextStyle(
            decoration: task.isCompleted ? TextDecoration.lineThrough : null,
            color: overdue ? Colors.red : null,
          ),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (task.description?.isNotEmpty ?? false) Text(task.description!),
            if (task.dueDate != null)
              Text(
                'Due: ${DateFormat('MMM d, yyyy').format(task.dueDate!)}',
                style: TextStyle(color: overdue ? Colors.red : theme.colorScheme.secondary),
              ),
          ],
        ),
        trailing: IconButton(
          icon: const Icon(Icons.edit_outlined),
          onPressed: onEdit,
        ),
      ),
    );
  }
}

class AddEditScreen extends ConsumerStatefulWidget {
  final Task? task;

  const AddEditScreen({super.key, this.task});

  @override
  ConsumerState<AddEditScreen> createState() => _AddEditScreenState();
}

class _AddEditScreenState extends ConsumerState<AddEditScreen> {
  late TextEditingController titleCtrl;
  late TextEditingController descCtrl;
  DateTime? dueDate;

  @override
  void initState() {
    super.initState();
    titleCtrl = TextEditingController(text: widget.task?.title ?? '');
    descCtrl = TextEditingController(text: widget.task?.description ?? '');
    dueDate = widget.task?.dueDate;
  }

  @override
  void dispose() {
    titleCtrl.dispose();
    descCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: dueDate ?? DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 730)),
    );
    if (picked != null) setState(() => dueDate = picked);
  }

  Future<void> _save() async {
    if (titleCtrl.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Title is required')),
      );
      return;
    }

    final newTask = Task(
      id: widget.task?.id,
      title: titleCtrl.text.trim(),
      description: descCtrl.text.trim().isEmpty ? null : descCtrl.text.trim(),
      dueDate: dueDate,
      isCompleted: widget.task?.isCompleted ?? false,
      createdAt: widget.task?.createdAt ?? DateTime.now(),
    );

    final notifier = ref.read(taskListProvider.notifier);

    // Show syncing message
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('💾 Syncing to MongoDB...'),
          duration: Duration(seconds: 2),
        ),
      );
    }

    if (widget.task == null) {
      await notifier.add(newTask);
    } else {
      await notifier.update(newTask);
    }

    // Show success message
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(widget.task == null 
            ? '✅ Task created and synced to MongoDB!' 
            : '✅ Task updated and synced to MongoDB!'),
          backgroundColor: Colors.green,
          duration: const Duration(seconds: 2),
        ),
      );
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isEdit = widget.task != null;
    return Scaffold(
      appBar: AppBar(title: Text(isEdit ? 'Edit Task' : 'New Task')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          TextField(
            controller: titleCtrl,
            decoration: const InputDecoration(
              labelText: 'Title *',
              border: OutlineInputBorder(),
            ),
            textCapitalization: TextCapitalization.sentences,
            autofocus: !isEdit,
          ),
          const SizedBox(height: 20),
          TextField(
            controller: descCtrl,
            decoration: const InputDecoration(
              labelText: 'Description (optional)',
              border: OutlineInputBorder(),
              alignLabelWithHint: true,
            ),
            maxLines: 4,
            textCapitalization: TextCapitalization.sentences,
          ),
          const SizedBox(height: 24),
          ListTile(
            contentPadding: EdgeInsets.zero,
            title: const Text('Due Date (optional)'),
            subtitle: dueDate == null
                ? const Text('Not set')
                : Text(DateFormat('EEEE, MMM d, yyyy').format(dueDate!)),
            trailing: IconButton(
              icon: const Icon(Icons.calendar_month),
              onPressed: _pickDate,
            ),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
              side: BorderSide(color: Theme.of(context).dividerColor),
            ),
          ),
          const SizedBox(height: 32),
          FilledButton.icon(
            onPressed: _save,
            icon: const Icon(Icons.save),
            label: Text(isEdit ? 'Update' : 'Create'),
            style: FilledButton.styleFrom(minimumSize: const Size.fromHeight(54)),
          ),
        ],
      ),
    );
  }
}