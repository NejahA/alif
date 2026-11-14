// lib/main.dart
//
// dought - shared task board.
//
// Both this Flutter app and the Python (Tk) app read/write the same MongoDB
// document (`dought.tasks` -> `_id: 'tasks_data'`) with three lists:
// todo / in_progress / done. Every local change is pushed to MongoDB and the
// remote document is polled so changes made in the other app appear here in
// near real time.

import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:intl/intl.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

import 'services/mongodb_service.dart';

part 'main.g.dart';

// ────────────────────────────────────────────────
// Shared schema constants (must match dought.py)
// ────────────────────────────────────────────────

const String kStatusTodo = 'todo';
const String kStatusInProgress = 'in_progress';
const String kStatusDone = 'done';

const Duration kSyncInterval = Duration(seconds: 2);

const Color kBgDark = Color(0xFF1E1E2E);
const Color kBgMedium = Color(0xFF313244);
const Color kBgCard = Color(0xFF45475A);
const Color kTextWhite = Color(0xFFCDD6F4);
const Color kTextMuted = Color(0xFF9399B2);
const Color kAccentTodo = Color(0xFFF38BA8);
const Color kAccentProgress = Color(0xFFFAB387);
const Color kAccentDone = Color(0xFFA6E3A1);

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Local cache is a convenience only: if the platform blocks filesystem
  // access, still start the app so the MongoDB real-time sync keeps working.
  try {
    await Hive.initFlutter('dought');
    Hive.registerAdapter(TaskAdapter());
    await Hive.openBox<Task>('tasks');
  } catch (e) {
    debugPrint('dought: local storage unavailable ($e); using in-memory store');
  }

  await MongoDBService.connect();

  runApp(const ProviderScope(child: MyApp()));
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'dought',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        scaffoldBackgroundColor: kBgDark,
        colorScheme: ColorScheme.fromSeed(
          seedColor: kAccentTodo,
          brightness: Brightness.dark,
        ),
      ),
      home: const HomeScreen(),
    );
  }
}

// ────────────────────────────────────────────────
// Model (mirrors the JSON task shape used by dought.py)
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

  @HiveField(6)
  String status; // kStatusTodo | kStatusInProgress | kStatusDone

  @HiveField(7)
  List<String> tags;

  @HiveField(8)
  int timeSpent; // tracked time in seconds

  Task({
    String? id,
    required this.title,
    this.description,
    this.dueDate,
    bool? isCompleted,
    this.status = kStatusTodo,
    List<String>? tags,
    this.timeSpent = 0,
    DateTime? createdAt,
  })  : id = id ?? DateTime.now().microsecondsSinceEpoch.toString(),
        createdAt = createdAt ?? DateTime.now(),
        tags = tags ?? <String>[],
        isCompleted = isCompleted ?? (status == kStatusDone);

  bool get isDone => status == kStatusDone;

  /// Serialises to the exact task shape dought.py writes to MongoDB.
  Map<String, dynamic> toRemote() => {
        'id': int.tryParse(id) ?? createdAt.millisecondsSinceEpoch,
        'title': title,
        'description': description ?? '',
        'due_date':
            dueDate == null ? '' : DateFormat('yyyy-MM-dd').format(dueDate!),
        'tags': tags,
        'created': createdAt.toIso8601String(),
        'time_spent': timeSpent,
      };
}

// ────────────────────────────────────────────────
// Repository (Hive <-> MongoDB)
// ────────────────────────────────────────────────

class TaskRepository {
  final Box<Task>? _box =
      Hive.isBoxOpen('tasks') ? Hive.box<Task>('tasks') : null;
  final List<Task> _memory = [];

  List<Task> getAll() => _box?.values.toList() ?? List.of(_memory);

  Future<void> put(Task task) async {
    final box = _box;
    if (box != null) return box.put(task.id, task);
    _memory.removeWhere((t) => t.id == task.id);
    _memory.add(task);
  }

  Future<void> remove(String id) async {
    final box = _box;
    if (box != null) return box.delete(id);
    _memory.removeWhere((t) => t.id == id);
  }

  Future<void> replaceAll(List<Task> tasks) async {
    final box = _box;
    if (box != null) {
      await box.clear();
      for (final task in tasks) {
        await box.put(task.id, task);
      }
      return;
    }
    _memory
      ..clear()
      ..addAll(tasks);
  }

  /// Builds [Task]s out of the MongoDB document `{todo, in_progress, done}`.
  static List<Task> fromRemote(Map<String, dynamic> data) {
    final tasks = <Task>[];

    void collect(List<dynamic>? raw, String status) {
      for (final item in raw ?? const []) {
        if (item is Map) {
          tasks.add(_fromRemoteTask(item.cast<String, dynamic>(), status));
        }
      }
    }

    collect(data['todo'] as List?, kStatusTodo);
    collect(data['in_progress'] as List?, kStatusInProgress);
    collect(data['done'] as List?, kStatusDone);
    return tasks;
  }

  static Task _fromRemoteTask(Map<String, dynamic> m, String status) {
    final created =
        DateTime.tryParse(m['created']?.toString() ?? '') ?? DateTime.now();
    final description = m['description']?.toString() ?? '';
    final due = m['due_date']?.toString() ?? '';
    final title = m['title']?.toString() ?? '';

    return Task(
      id: m['id']?.toString() ?? created.millisecondsSinceEpoch.toString(),
      title: title.isEmpty ? 'Untitled' : title,
      description: description.isEmpty ? null : description,
      dueDate: due.isEmpty ? null : DateTime.tryParse(due),
      status: status,
      isCompleted: status == kStatusDone,
      tags: (m['tags'] as List?)?.map((e) => e.toString()).toList(),
      timeSpent: (m['time_spent'] as num?)?.toInt() ?? 0,
      createdAt: created,
    );
  }
}

/// Stable signature used to detect whether the remote document differs from
/// what we already have locally (ignores DateTime formatting differences).
String _signatureOf(List<Task> tasks) {
  final todo = <Map<String, dynamic>>[];
  final inProgress = <Map<String, dynamic>>[];
  final done = <Map<String, dynamic>>[];

  for (final task in tasks) {
    final entry = <String, dynamic>{
      'id': int.tryParse(task.id) ?? task.createdAt.millisecondsSinceEpoch,
      'title': task.title,
      'description': task.description ?? '',
      'due_date': task.dueDate == null
          ? ''
          : DateFormat('yyyy-MM-dd').format(task.dueDate!),
      'tags': task.tags,
      'time_spent': task.timeSpent,
      'created': task.createdAt.millisecondsSinceEpoch,
    };
    switch (task.status) {
      case kStatusInProgress:
        inProgress.add(entry);
      case kStatusDone:
        done.add(entry);
      default:
        todo.add(entry);
    }
  }

  return jsonEncode({'todo': todo, 'in_progress': inProgress, 'done': done});
}

Map<String, List<Map<String, dynamic>>> _remoteDocOf(List<Task> tasks) {
  final todo = <Map<String, dynamic>>[];
  final inProgress = <Map<String, dynamic>>[];
  final done = <Map<String, dynamic>>[];

  for (final task in tasks) {
    final entry = task.toRemote();
    switch (task.status) {
      case kStatusInProgress:
        inProgress.add(entry);
      case kStatusDone:
        done.add(entry);
      default:
        todo.add(entry);
    }
  }

  return {'todo': todo, 'in_progress': inProgress, 'done': done};
}

// ────────────────────────────────────────────────
// State
// ────────────────────────────────────────────────

@riverpod
class TaskList extends _$TaskList {
  late final TaskRepository repo;
  Timer? _syncTimer;
  bool _busy = false;
  bool _disposed = false;

  @override
  List<Task> build() {
    repo = TaskRepository();

    _pullRemote(initial: true);

    _syncTimer = Timer.periodic(kSyncInterval, (_) => _pullRemote());

    ref.onDispose(() {
      _disposed = true;
      _syncTimer?.cancel();
    });

    return repo.getAll();
  }

  Future<void> _pullRemote({bool initial = false}) async {
    if (_busy) return;

    final data = await MongoDBService.loadTasks();
    if (data == null || _busy || _disposed) return;

    if (!initial && _signatureOf(TaskRepository.fromRemote(data)) == _signatureOf(state)) {
      return; // nothing changed remotely
    }

    _busy = true;
    try {
      final remoteTasks = TaskRepository.fromRemote(data);
      await repo.replaceAll(remoteTasks);
      if (_disposed) return;
      state = repo.getAll();
      debugPrint('dought: applied ${remoteTasks.length} task(s) from MongoDB');
    } finally {
      _busy = false;
    }
  }

  Future<void> _mutate(Future<void> Function() change) async {
    _busy = true;
    try {
      await change();
      state = repo.getAll();
      await MongoDBService.saveTasks(_remoteDocOf(state));
    } finally {
      _busy = false;
    }
  }

  Future<void> add(Task task) => _mutate(() => repo.put(task));

  Future<void> update(Task updated) => _mutate(() => repo.put(updated));

  Future<void> remove(String id) => _mutate(() => repo.remove(id));

  Future<void> move(String id, String status) => _mutate(() async {
        final index = state.indexWhere((t) => t.id == id);
        if (index == -1) return;
        final task = state[index]
          ..status = status
          ..isCompleted = status == kStatusDone;
        await repo.put(task);
      });

  Future<void> toggle(String id) {
    final index = state.indexWhere((t) => t.id == id);
    if (index == -1) return Future.value();
    final next = state[index].isDone ? kStatusTodo : kStatusDone;
    return move(id, next);
  }
}

// ────────────────────────────────────────────────
// Screens & widgets
// ────────────────────────────────────────────────

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final tasks = ref.watch(taskListProvider);

    return Scaffold(
      appBar: AppBar(
        backgroundColor: kBgMedium,
        title: const Text('📋 dought'),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16),
            child: Center(
              child: Text(
                'Total: ${tasks.length}  |  Done: ${tasks.where((t) => t.isDone).length}',
                style: const TextStyle(fontSize: 12, color: kTextMuted),
              ),
            ),
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(10),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Expanded(
              child: _BoardColumn(
                title: '📝 To Do',
                color: kAccentTodo,
                status: kStatusTodo,
                tasks: tasks.where((t) => t.status == kStatusTodo).toList(),
              ),
            ),
            Expanded(
              child: _BoardColumn(
                title: '⚡ In Progress',
                color: kAccentProgress,
                status: kStatusInProgress,
                tasks: tasks.where((t) => t.status == kStatusInProgress).toList(),
              ),
            ),
            Expanded(
              child: _BoardColumn(
                title: '✅ Done',
                color: kAccentDone,
                status: kStatusDone,
                tasks: tasks.where((t) => t.status == kStatusDone).toList(),
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const AddEditScreen()),
        ),
        icon: const Icon(Icons.add),
        label: const Text('New Task'),
        backgroundColor: kAccentTodo,
        foregroundColor: kBgDark,
      ),
    );
  }
}

class _BoardColumn extends StatelessWidget {
  final String title;
  final Color color;
  final String status;
  final List<Task> tasks;

  const _BoardColumn({
    required this.title,
    required this.color,
    required this.status,
    required this.tasks,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 5),
      decoration: BoxDecoration(
        color: kBgDark,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 12),
            decoration: BoxDecoration(
              color: color,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(10)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    title,
                    style: const TextStyle(
                      color: kBgDark,
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                  ),
                ),
                Text(
                  '(${tasks.length})',
                  style: const TextStyle(color: kBgDark, fontSize: 12),
                ),
              ],
            ),
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
              children: [
                for (final task in tasks) _TaskCard(task: task),
                if (tasks.isEmpty)
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 24),
                    child: Text(
                      'Nothing here',
                      textAlign: TextAlign.center,
                      style: TextStyle(color: kTextMuted, fontSize: 12),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _TaskCard extends ConsumerWidget {
  final Task task;

  const _TaskCard({required this.task});

  bool get _overdue =>
      !task.isDone && task.dueDate?.isBefore(DateTime.now()) == true;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notifier = ref.read(taskListProvider.notifier);

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: kBgCard,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Text(
                  task.title,
                  style: TextStyle(
                    color: kTextWhite,
                    fontWeight: FontWeight.bold,
                    fontSize: 13,
                    decoration:
                        task.isDone ? TextDecoration.lineThrough : null,
                  ),
                ),
              ),
              InkWell(
                onTap: () => notifier.remove(task.id),
                child: const Icon(Icons.delete_outline, size: 18, color: kAccentTodo),
              ),
            ],
          ),
          if (task.description?.isNotEmpty ?? false) ...[
            const SizedBox(height: 4),
            Text(
              task.description!,
              style: const TextStyle(color: kTextMuted, fontSize: 11),
            ),
          ],
          if (task.dueDate != null) ...[
            const SizedBox(height: 6),
            Text(
              '📅 Due: ${DateFormat('MMM d, yyyy').format(task.dueDate!)}',
              style: TextStyle(
                color: _overdue ? kAccentTodo : kAccentProgress,
                fontSize: 11,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
          if (task.tags.isNotEmpty) ...[
            const SizedBox(height: 6),
            Wrap(
              spacing: 5,
              runSpacing: 5,
              children: [
                for (final tag in task.tags)
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: kBgMedium,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      '#$tag',
                      style: const TextStyle(color: kTextWhite, fontSize: 10),
                    ),
                  ),
              ],
            ),
          ],
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 4,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              Text(
                '🕐 ${DateFormat('MMM d, HH:mm').format(task.createdAt)}',
                style: const TextStyle(color: kTextMuted, fontSize: 10),
              ),
              if (task.timeSpent > 0)
                Text(
                  '⏱️ ${task.timeSpent ~/ 60}m',
                  style: const TextStyle(color: kTextMuted, fontSize: 10),
                ),
            ],
          ),
          const SizedBox(height: 8),
          _Actions(task: task, notifier: notifier),
        ],
      ),
    );
  }
}

class _Actions extends StatelessWidget {
  final Task task;
  final TaskList notifier;

  const _Actions({required this.task, required this.notifier});

  @override
  Widget build(BuildContext context) {
    final buttons = <Widget>[];

    if (task.status == kStatusTodo) {
      buttons.add(_btn('Mark Complete', kBgMedium, () => notifier.toggle(task.id)));
      buttons.add(_btn('→ Progress', kBgMedium,
          () => notifier.move(task.id, kStatusInProgress)));
    } else if (task.status == kStatusInProgress) {
      buttons.add(_btn('← Back', kBgMedium,
          () => notifier.move(task.id, kStatusTodo)));
      buttons.add(_btn('✓ Done', kAccentDone, () => notifier.move(task.id, kStatusDone),
          foreground: kBgDark));
    } else {
      buttons.add(_btn('← Reopen', kBgMedium,
          () => notifier.move(task.id, kStatusInProgress)));
    }

    buttons.add(_btn('✏️ Edit', kBgMedium, () {
      Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => AddEditScreen(task: task)),
      );
    }));

    return Wrap(spacing: 6, runSpacing: 6, children: buttons);
  }

  Widget _btn(String label, Color background, VoidCallback onTap,
      {Color foreground = kTextWhite}) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(5),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: background,
          borderRadius: BorderRadius.circular(5),
        ),
        child: Text(
          label,
          style: TextStyle(color: foreground, fontSize: 10, fontWeight: FontWeight.bold),
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
  late final TextEditingController titleCtrl;
  late final TextEditingController descCtrl;
  late final TextEditingController tagsCtrl;
  DateTime? dueDate;
  late String status;

  @override
  void initState() {
    super.initState();
    final task = widget.task;
    titleCtrl = TextEditingController(text: task?.title ?? '');
    descCtrl = TextEditingController(text: task?.description ?? '');
    tagsCtrl = TextEditingController(text: task?.tags.join(', ') ?? '');
    dueDate = task?.dueDate;
    status = task?.status ?? kStatusTodo;
  }

  @override
  void dispose() {
    titleCtrl.dispose();
    descCtrl.dispose();
    tagsCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: dueDate ?? DateTime.now(),
      firstDate: DateTime(2000),
      lastDate: DateTime.now().add(const Duration(days: 3650)),
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

    final tags = tagsCtrl.text
        .split(',')
        .map((t) => t.trim())
        .where((t) => t.isNotEmpty)
        .toList();

    final task = Task(
      id: widget.task?.id,
      title: titleCtrl.text.trim(),
      description: descCtrl.text.trim().isEmpty ? null : descCtrl.text.trim(),
      dueDate: dueDate,
      status: status,
      isCompleted: status == kStatusDone,
      tags: tags,
      timeSpent: widget.task?.timeSpent ?? 0,
      createdAt: widget.task?.createdAt,
    );

    final notifier = ref.read(taskListProvider.notifier);
    if (widget.task == null) {
      await notifier.add(task);
    } else {
      await notifier.update(task);
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
            autofocus: !isEdit,
            decoration: const InputDecoration(
              labelText: 'Title *',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 20),
          TextField(
            controller: descCtrl,
            maxLines: 4,
            decoration: const InputDecoration(
              labelText: 'Description (optional)',
              border: OutlineInputBorder(),
              alignLabelWithHint: true,
            ),
          ),
          const SizedBox(height: 20),
          TextField(
            controller: tagsCtrl,
            decoration: const InputDecoration(
              labelText: 'Tags (comma separated)',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 20),
          DropdownButtonFormField<String>(
            initialValue: status,
            decoration: const InputDecoration(
              labelText: 'Status',
              border: OutlineInputBorder(),
            ),
            items: const [
              DropdownMenuItem(value: kStatusTodo, child: Text('To Do')),
              DropdownMenuItem(
                  value: kStatusInProgress, child: Text('In Progress')),
              DropdownMenuItem(value: kStatusDone, child: Text('Done')),
            ],
            onChanged: (value) => setState(() => status = value ?? kStatusTodo),
          ),
          const SizedBox(height: 20),
          ListTile(
            contentPadding: EdgeInsets.zero,
            title: const Text('Due Date (optional)'),
            subtitle: Text(
              dueDate == null
                  ? 'Not set'
                  : DateFormat('EEEE, MMM d, yyyy').format(dueDate!),
            ),
            trailing: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                IconButton(
                  icon: const Icon(Icons.calendar_month),
                  onPressed: _pickDate,
                ),
                if (dueDate != null)
                  IconButton(
                    icon: const Icon(Icons.clear),
                    onPressed: () => setState(() => dueDate = null),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          FilledButton.icon(
            onPressed: _save,
            icon: const Icon(Icons.save),
            label: Text(isEdit ? 'Update' : 'Create'),
            style: FilledButton.styleFrom(
              minimumSize: const Size.fromHeight(54),
              backgroundColor: kAccentDone,
              foregroundColor: kBgDark,
            ),
          ),
        ],
      ),
    );
  }
}
