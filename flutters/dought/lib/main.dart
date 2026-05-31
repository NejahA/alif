// lib/main.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:intl/intl.dart';
import 'package:uuid/uuid.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'main.g.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Hive.initFlutter();
  Hive.registerAdapter(TaskAdapter());
  await Hive.openBox<Task>('tasks');
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

  Future<void> add(Task task) => box.put(task.id, task);

  Future<void> update(Task task) => box.put(task.id, task);

  Future<void> delete(String id) => box.delete(id);

  Future<void> reorder(List<Task> orderedTasks) async {
    await box.clear();
    for (final task in orderedTasks) {
      await box.put(task.id, task);
    }
  }
}

// ────────────────────────────────────────────────
// Providers
// ────────────────────────────────────────────────

@riverpod
class TaskList extends _$TaskList {
  late final TaskRepository repo;

  @override
  List<Task> build() {
    repo = TaskRepository();
    return repo.getAll();
  }

  Future<void> add(Task task) async {
    await repo.add(task);
    state = [...state, task];
  }

  Future<void> update(Task updated) async {
    await repo.update(updated);
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
    await repo.delete(id);
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
                  direction: canReorderAndDelete
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
                    // Delete task
                    ref.read(taskListProvider.notifier).delete(task.id);

                    // Show undo snackbar
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: const Text('Task deleted'),
                        duration: const Duration(seconds: 5),
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
                  },
                  child: TaskTile(
                    task: task,
                    onToggle: () => ref.read(taskListProvider.notifier).toggle(task.id),
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

    if (widget.task == null) {
      await notifier.add(newTask);
    } else {
      await notifier.update(newTask);
    }

    if (mounted) Navigator.pop(context);
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