import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'dart:async';
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

void main() => runApp(const ChronokeyApp());

class ChronokeyApp extends StatelessWidget {
  const ChronokeyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Chronokey',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.deepPurple,
        scaffoldBackgroundColor: const Color(0xFF0f0c29),
        colorScheme: ColorScheme.dark(
          primary: const Color(0xFF6C63FF),
          secondary: const Color(0xFFFF6584),
          surface: const Color(0xFF1a1a2e),
        ),
        cardTheme: CardThemeData(
          color: const Color(0xFF1a1a2e),
          elevation: 8,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        ),
      ),
      home: const HomeScreen(),
    );
  }
}

class TimeCapsule {
  final String id;
  final String title;
  final String message;
  final DateTime unlockDate;
  final String? imagePath;
  final bool isGroup;
  final List<String> members;

  TimeCapsule({
    required this.id,
    required this.title,
    required this.message,
    required this.unlockDate,
    this.imagePath,
    this.isGroup = false,
    this.members = const [],
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'message': message,
    'unlockDate': unlockDate.toIso8601String(),
    'imagePath': imagePath,
    'isGroup': isGroup,
    'members': members,
  };

  factory TimeCapsule.fromJson(Map<String, dynamic> json) => TimeCapsule(
    id: json['id'],
    title: json['title'],
    message: json['message'],
    unlockDate: DateTime.parse(json['unlockDate']),
    imagePath: json['imagePath'],
    isGroup: json['isGroup'] ?? false,
    members: List<String>.from(json['members'] ?? []),
  );
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with TickerProviderStateMixin {
  List<TimeCapsule> capsules = [];
  late AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    _loadCapsules();
    _pulseController = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  Future<void> _loadCapsules() async {
    final prefs = await SharedPreferences.getInstance();
    final capsulesJson = prefs.getStringList('capsules') ?? [];
    setState(() {
      capsules = capsulesJson
          .map((json) => TimeCapsule.fromJson(jsonDecode(json)))
          .toList();
    });
  }

  Future<void> _saveCapsules() async {
    final prefs = await SharedPreferences.getInstance();
    final capsulesJson = capsules.map((c) => jsonEncode(c.toJson())).toList();
    await prefs.setStringList('capsules', capsulesJson);
  }

  void _addCapsule(TimeCapsule capsule) {
    setState(() {
      capsules.add(capsule);
    });
    _saveCapsules();
  }

  @override
  Widget build(BuildContext context) {
    final lockedCapsules = capsules.where((c) => c.unlockDate.isAfter(DateTime.now())).toList();
    final unlockedCapsules = capsules.where((c) => !c.unlockDate.isAfter(DateTime.now())).toList();

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF0f0c29), Color(0xFF302b63), Color(0xFF24243e)],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              _buildHeader(),
              Expanded(
                child: capsules.isEmpty
                    ? _buildEmptyState()
                    : ListView(
                        padding: const EdgeInsets.all(16),
                        children: [
                          if (lockedCapsules.isNotEmpty) ...[
                            _buildSectionTitle('🔒 Locked Capsules', lockedCapsules.length),
                            ...lockedCapsules.map((c) => _buildCapsuleCard(c, true)),
                          ],
                          if (unlockedCapsules.isNotEmpty) ...[
                            const SizedBox(height: 20),
                            _buildSectionTitle('🔓 Unlocked Capsules', unlockedCapsules.length),
                            ...unlockedCapsules.map((c) => _buildCapsuleCard(c, false)),
                          ],
                        ],
                      ),
              ),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showCreateDialog(),
        icon: const Icon(Icons.add),
        label: const Text('Create Capsule'),
        backgroundColor: const Color(0xFF6C63FF),
      ),
    );
  }

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          Row(
            children: [
              ScaleTransition(
                scale: Tween(begin: 0.9, end: 1.1).animate(_pulseController),
                child: const Icon(Icons.lock_clock, size: 50, color: Color(0xFF6C63FF)),
              ),
              const SizedBox(width: 15),
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Chronokey',
                    style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                  Text(
                    'Time Capsule Network',
                    style: TextStyle(fontSize: 14, color: Colors.white70),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title, int count) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10),
      child: Row(
        children: [
          Text(
            title,
            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
          ),
          const SizedBox(width: 10),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFF6C63FF),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text('$count', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          ScaleTransition(
            scale: Tween(begin: 0.9, end: 1.1).animate(_pulseController),
            child: const Icon(Icons.inbox, size: 100, color: Colors.white24),
          ),
          const SizedBox(height: 20),
          const Text(
            'No Time Capsules Yet',
            style: TextStyle(fontSize: 24, color: Colors.white70),
          ),
          const SizedBox(height: 10),
          const Text(
            'Create your first capsule to get started!',
            style: TextStyle(fontSize: 16, color: Colors.white54),
          ),
        ],
      ),
    );
  }

  Widget _buildCapsuleCard(TimeCapsule capsule, bool isLocked) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: InkWell(
        onTap: () => isLocked ? null : _showCapsuleDetail(capsule),
        onLongPress: () => _showDeleteDialog(capsule),
        borderRadius: BorderRadius.circular(20),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(
                    isLocked ? Icons.lock : Icons.lock_open,
                    color: isLocked ? const Color(0xFFFF6584) : const Color(0xFF6C63FF),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      capsule.title,
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.delete, color: Colors.redAccent),
                    onPressed: () => _showDeleteDialog(capsule),
                  ),
                  if (capsule.isGroup)
                    const Icon(Icons.group, color: Colors.white54, size: 20),
                ],
              ),
              const SizedBox(height: 12),
              if (isLocked)
                CountdownTimer(unlockDate: capsule.unlockDate)
              else
                Text(
                  'Unlocked on ${DateFormat('MMM dd, yyyy').format(capsule.unlockDate)}',
                  style: const TextStyle(color: Colors.white70),
                ),
              if (capsule.isGroup && capsule.members.isNotEmpty) ...[
                const SizedBox(height: 8),
                Text(
                  'With: ${capsule.members.join(", ")}',
                  style: const TextStyle(color: Colors.white54, fontSize: 12),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  void _showDeleteDialog(TimeCapsule capsule) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF1a1a2e),
        title: const Text('Delete Capsule?', style: TextStyle(color: Colors.white)),
        content: Text(
          'Are you sure you want to delete "${capsule.title}"? This action cannot be undone.',
          style: const TextStyle(color: Colors.white70),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              setState(() {
                capsules.removeWhere((c) => c.id == capsule.id);
              });
              _saveCapsules();
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Capsule deleted')),
              );
            },
            child: const Text('Delete', style: TextStyle(color: Colors.redAccent)),
          ),
        ],
      ),
    );
  }

  void _showCreateDialog() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => CreateCapsuleSheet(onCreated: _addCapsule),
    );
  }

  void _showCapsuleDetail(TimeCapsule capsule) {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        backgroundColor: const Color(0xFF1a1a2e),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Icon(Icons.lock_open, color: Color(0xFF6C63FF), size: 30),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      capsule.title,
                      style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              Text(
                capsule.message,
                style: const TextStyle(fontSize: 16, color: Colors.white, height: 1.5),
              ),
              const SizedBox(height: 20),
              Text(
                'Unlocked: ${DateFormat('MMMM dd, yyyy').format(capsule.unlockDate)}',
                style: const TextStyle(color: Colors.white54),
              ),
              const SizedBox(height: 20),
              Align(
                alignment: Alignment.centerRight,
                child: TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Close'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class CountdownTimer extends StatefulWidget {
  final DateTime unlockDate;

  const CountdownTimer({super.key, required this.unlockDate});

  @override
  State<CountdownTimer> createState() => _CountdownTimerState();
}

class _CountdownTimerState extends State<CountdownTimer> {
  late Timer _timer;
  Duration _remaining = Duration.zero;

  @override
  void initState() {
    super.initState();
    _updateRemaining();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) => _updateRemaining());
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  void _updateRemaining() {
    setState(() {
      _remaining = widget.unlockDate.difference(DateTime.now());
    });
  }

  @override
  Widget build(BuildContext context) {
    final days = _remaining.inDays;
    final hours = _remaining.inHours % 24;
    final minutes = _remaining.inMinutes % 60;
    final seconds = _remaining.inSeconds % 60;

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF6C63FF), Color(0xFFFF6584)],
        ),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildTimeUnit(days, 'Days'),
          _buildTimeUnit(hours, 'Hours'),
          _buildTimeUnit(minutes, 'Mins'),
          _buildTimeUnit(seconds, 'Secs'),
        ],
      ),
    );
  }

  Widget _buildTimeUnit(int value, String label) {
    return Column(
      children: [
        Text(
          value.toString().padLeft(2, '0'),
          style: const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        Text(
          label,
          style: const TextStyle(fontSize: 10, color: Colors.white70),
        ),
      ],
    );
  }
}

class CreateCapsuleSheet extends StatefulWidget {
  final Function(TimeCapsule) onCreated;

  const CreateCapsuleSheet({super.key, required this.onCreated});

  @override
  State<CreateCapsuleSheet> createState() => _CreateCapsuleSheetState();
}

class _CreateCapsuleSheetState extends State<CreateCapsuleSheet> {
  final _titleController = TextEditingController();
  final _messageController = TextEditingController();
  final _membersController = TextEditingController();
  DateTime _selectedDate = DateTime.now().add(const Duration(days: 30));
  bool _isGroup = false;

  @override
  void dispose() {
    _titleController.dispose();
    _messageController.dispose();
    _membersController.dispose();
    super.dispose();
  }

  void _createCapsule() {
    if (_titleController.text.isEmpty || _messageController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill in all fields')),
      );
      return;
    }

    final capsule = TimeCapsule(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      title: _titleController.text,
      message: _messageController.text,
      unlockDate: _selectedDate,
      isGroup: _isGroup,
      members: _isGroup
          ? _membersController.text.split(',').map((e) => e.trim()).where((e) => e.isNotEmpty).toList()
          : [],
    );

    widget.onCreated(capsule);
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Color(0xFF1a1a2e),
        borderRadius: BorderRadius.vertical(top: Radius.circular(25)),
      ),
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.white24,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              const Text(
                '✨ Create Time Capsule',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white),
              ),
              const SizedBox(height: 20),
              TextField(
                controller: _titleController,
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  labelText: 'Title',
                  labelStyle: const TextStyle(color: Colors.white70),
                  filled: true,
                  fillColor: const Color(0xFF0f0c29),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Colors.white24),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _messageController,
                style: const TextStyle(color: Colors.white),
                maxLines: 4,
                decoration: InputDecoration(
                  labelText: 'Message to your future self',
                  labelStyle: const TextStyle(color: Colors.white70),
                  filled: true,
                  fillColor: const Color(0xFF0f0c29),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Colors.white24),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              SwitchListTile(
                title: const Text('Group Capsule', style: TextStyle(color: Colors.white)),
                subtitle: const Text('Share with friends', style: TextStyle(color: Colors.white54)),
                value: _isGroup,
                onChanged: (value) => setState(() => _isGroup = value),
                activeColor: const Color(0xFF6C63FF),
              ),
              if (_isGroup) ...[
                const SizedBox(height: 8),
                TextField(
                  controller: _membersController,
                  style: const TextStyle(color: Colors.white),
                  decoration: InputDecoration(
                    labelText: 'Friends (comma separated)',
                    labelStyle: const TextStyle(color: Colors.white70),
                    hintText: 'Alice, Bob, Charlie',
                    hintStyle: const TextStyle(color: Colors.white38),
                    filled: true,
                    fillColor: const Color(0xFF0f0c29),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: Colors.white24),
                    ),
                  ),
                ),
              ],
              const SizedBox(height: 16),
              InkWell(
                onTap: () async {
                  final date = await showDatePicker(
                    context: context,
                    initialDate: _selectedDate,
                    firstDate: DateTime.now(),
                    lastDate: DateTime.now().add(const Duration(days: 3650)),
                  );
                  if (date != null) setState(() => _selectedDate = date);
                },
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0f0c29),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.white24),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.calendar_today, color: Color(0xFF6C63FF)),
                      const SizedBox(width: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Unlock Date', style: TextStyle(color: Colors.white70, fontSize: 12)),
                          Text(
                            DateFormat('MMMM dd, yyyy').format(_selectedDate),
                            style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _createCapsule,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF6C63FF),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text('🔒 Lock Capsule', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
