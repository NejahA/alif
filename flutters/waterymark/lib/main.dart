import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:timezone/data/latest.dart' as tz;
import 'package:timezone/timezone.dart' as tz;
import 'package:fl_chart/fl_chart.dart';
import 'package:intl/intl.dart';
import 'package:path_provider/path_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  tz.initializeTimeZones();
  await _initNotifications();
  runApp(const WaterReminderApp());
}

FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin =
    FlutterLocalNotificationsPlugin();

Future<void> _initNotifications() async {
  const AndroidInitializationSettings androidSettings =
      AndroidInitializationSettings('@mipmap/ic_launcher');
  const InitializationSettings settings = InitializationSettings(android: androidSettings);

  try {
    await flutterLocalNotificationsPlugin.initialize(settings);
    await flutterLocalNotificationsPlugin
        .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
        ?.requestNotificationsPermission();
  } catch (e) {
    debugPrint('Notification init error: $e');
  }
}

// ────────────────────────────────────────────────────────────────
//  Local Storage Helper
// ────────────────────────────────────────────────────────────────
class LocalStorage {
  static Future<File> _getFile() async {
    final directory = await getApplicationDocumentsDirectory();
    return File('${directory.path}/water_reminder_data.json');
  }

  static Future<Map<String, dynamic>> read() async {
    try {
      final file = await _getFile();
      if (!await file.exists()) {
        return {};
      }
      final contents = await file.readAsString();
      return json.decode(contents) as Map<String, dynamic>;
    } catch (e) {
      debugPrint('Error reading file: $e');
      return {};
    }
  }

  static Future<void> write(Map<String, dynamic> data) async {
    try {
      final file = await _getFile();
      await file.writeAsString(json.encode(data));
    } catch (e) {
      debugPrint('Error writing file: $e');
    }
  }

  static Future<void> clear() async {
    try {
      final file = await _getFile();
      if (await file.exists()) {
        await file.delete();
      }
    } catch (e) {
      debugPrint('Error clearing file: $e');
    }
  }
}

class WaterReminderApp extends StatelessWidget {
  const WaterReminderApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'WateryMark',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.blue,
        useMaterial3: true,
      ),
      home: const InitialScreen(),
    );
  }
}

// ────────────────────────────────────────────────────────────────
//  Initial screen – goes directly to home
// ────────────────────────────────────────────────────────────────
class InitialScreen extends StatelessWidget {
  const InitialScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const HomeScreen();
  }
}

// ────────────────────────────────────────────────────────────────
//  Home Screen
// ────────────────────────────────────────────────────────────────
class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with WidgetsBindingObserver {
  double _dailyGoal = 2.5;
  double _currentIntake = 0.0;
  String _unit = 'Liters';
  int _streak = 0;
  final List<double> _undoStack = [];
  List<Map<String, dynamic>> _weeklyHistory = [];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _loadData();
    _scheduleReminders();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.paused || state == AppLifecycleState.inactive) {
      _saveData();
    }
  }

  Future<void> _loadData() async {
    try {
      final data = await LocalStorage.read();

      setState(() {
        _dailyGoal = (data['dailyGoal'] as num?)?.toDouble() ?? 2.5;
        _unit = data['unit'] as String? ?? 'Liters';

        final today = DateFormat('yyyy-MM-dd').format(DateTime.now());
        final lastDate = data['lastDate'] as String?;
        _currentIntake = (data['currentIntake'] as num?)?.toDouble() ?? 0.0;

        // Reset if new day
        if (lastDate != today) {
          _currentIntake = 0.0;
          data['currentIntake'] = 0.0;
          data['lastDate'] = today;
          _updateStreak(data, today);
        } else {
          _streak = (data['streak'] as num?)?.toInt() ?? 0;
        }

        _weeklyHistory = _generateWeeklyHistory(data);
      });

      await LocalStorage.write(data);
    } catch (e) {
      debugPrint('Error loading data: $e');
    }
  }

  void _updateStreak(Map<String, dynamic> data, String today) {
    final yesterday = DateTime.now().subtract(const Duration(days: 1));
    final yesterdayKey = DateFormat('yyyy-MM-dd').format(yesterday);

    final yesterdayIntake = data['intake_$yesterdayKey'] as num?;
    if (yesterdayIntake != null && yesterdayIntake >= _dailyGoal) {
      _streak = (data['streak'] as num? ?? 0).toInt() + 1;
    } else if (yesterdayIntake == null || yesterdayIntake < _dailyGoal) {
      _streak = 0;
    }

    data['streak'] = _streak;
  }

  List<Map<String, dynamic>> _generateWeeklyHistory(Map<String, dynamic> data) {
    final List<Map<String, dynamic>> history = [];
    final now = DateTime.now();

    for (int i = 6; i >= 0; i--) {
      final date = now.subtract(Duration(days: i));
      final key = DateFormat('yyyy-MM-dd').format(date);
      final intake = (data['intake_$key'] as num?)?.toDouble() ?? 0.0;
      history.add({'date': date, 'intake': intake});
    }

    return history;
  }

  Future<void> _saveData() async {
    try {
      final data = await LocalStorage.read();
      final today = DateFormat('yyyy-MM-dd').format(DateTime.now());

      data['currentIntake'] = _currentIntake;
      data['lastDate'] = today;
      data['intake_$today'] = _currentIntake;
      data['streak'] = _streak;
      data['dailyGoal'] = _dailyGoal;
      data['unit'] = _unit;

      await LocalStorage.write(data);
      _updateWeeklyHistory();
    } catch (e) {
      debugPrint('Error saving data: $e');
    }
  }

  void _updateWeeklyHistory() {
    final today = DateTime.now();
    final todayKey = DateFormat('yyyy-MM-dd').format(today);

    setState(() {
      for (int i = 0; i < _weeklyHistory.length; i++) {
        final entryDate = _weeklyHistory[i]['date'] as DateTime;
        final entryKey = DateFormat('yyyy-MM-dd').format(entryDate);
        if (entryKey == todayKey) {
          _weeklyHistory[i]['intake'] = _currentIntake;
          break;
        }
      }
    });
  }

  void _addIntake(double ml) {
    setState(() {
      final liters = ml / 1000;
      _currentIntake += liters;
      _undoStack.add(liters);
    });
    _saveData();
  }

  void _undoLast() {
    if (_undoStack.isNotEmpty) {
      setState(() {
        _currentIntake -= _undoStack.removeLast();
        if (_currentIntake < 0) _currentIntake = 0;
      });
      _saveData();
    }
  }

  double get _displayCurrent => _unit == 'Ounces' ? _currentIntake * 33.814 : _currentIntake;
  double get _displayGoal => _unit == 'Ounces' ? _dailyGoal * 33.814 : _dailyGoal;

  // Accurate percentage calculation
  double get _percentage {
    if (_dailyGoal == 0) return 0;
    return (_currentIntake / _dailyGoal * 100).clamp(0, 999);
  }

  String _getHydrationTip() {
    final percent = _percentage;
    if (percent >= 100) return '🎉 Amazing! You hit your goal!';
    if (percent >= 75) return '💪 Almost there! Keep going!';
    if (percent >= 50) return '👍 Halfway done! Great progress!';
    if (percent >= 25) return '🌊 Good start! Keep hydrating!';
    return '💧 Time to start drinking water!';
  }

  Future<void> _showCustomAmountDialog() async {
    final controller = TextEditingController();
    final result = await showDialog<double>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add Custom Amount'),
        content: TextField(
          controller: controller,
          keyboardType: TextInputType.number,
          autofocus: true,
          decoration: const InputDecoration(
            labelText: 'Amount (ml)',
            border: OutlineInputBorder(),
            suffixText: 'ml',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () {
              final amount = double.tryParse(controller.text);
              if (amount != null && amount > 0) {
                Navigator.pop(context, amount);
              }
            },
            child: const Text('Add'),
          ),
        ],
      ),
    );
    if (result != null) {
      _addIntake(result);
    }
  }

  Future<void> _showGoalDialog() async {
    final controller = TextEditingController(text: _dailyGoal.toStringAsFixed(1));
    final result = await showDialog<double>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Set Daily Goal'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: controller,
              keyboardType: TextInputType.number,
              autofocus: true,
              decoration: InputDecoration(
                labelText: 'Daily Goal',
                border: const OutlineInputBorder(),
                suffixText: _unit == 'Liters' ? 'L' : 'fl oz',
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Recommended: 2-3 liters per day',
              style: TextStyle(fontSize: 12, color: Colors.grey),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () {
              final goal = double.tryParse(controller.text);
              if (goal != null && goal > 0) {
                Navigator.pop(context, goal);
              }
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
    if (result != null) {
      setState(() => _dailyGoal = result);
      _saveData();
    }
  }

  Future<void> _scheduleReminders() async {
    try {
      final now = tz.TZDateTime.now(tz.local);
      for (int hour = 8; hour <= 22; hour += 3) {
        var scheduled = tz.TZDateTime(tz.local, now.year, now.month, now.day, hour);
        if (scheduled.isBefore(now)) {
          scheduled = scheduled.add(const Duration(days: 1));
        }
        await flutterLocalNotificationsPlugin.zonedSchedule(
          hour,
          'Time to hydrate',
          'You are at ${(_currentIntake / _dailyGoal * 100).toStringAsFixed(0)}%',
          scheduled,
          const NotificationDetails(
            android: AndroidNotificationDetails(
              'hydration_reminder',
              'Hydration Reminders',
              importance: Importance.high,
              priority: Priority.high,
            ),
          ),
          androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
          uiLocalNotificationDateInterpretation: UILocalNotificationDateInterpretation.absoluteTime,
          matchDateTimeComponents: DateTimeComponents.time,
        );
      }
    } catch (e) {
      debugPrint('Notification scheduling error: $e');
    }
  }

  Future<void> _resetData() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Reset All Data?'),
        content: const Text('This will clear all your progress and history. This action cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            style: FilledButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Reset'),
          ),
        ],
      ),
    );
    
    if (confirm == true) {
      try {
        await LocalStorage.clear();
        setState(() {
          _dailyGoal = 2.5;
          _currentIntake = 0.0;
          _streak = 0;
          _undoStack.clear();
          _weeklyHistory = [];
        });
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('All data has been reset')),
        );
      } catch (e) {
        debugPrint('Reset error: $e');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final progress = (_currentIntake / _dailyGoal).clamp(0.0, 1.5);

    return Scaffold(
      appBar: AppBar(
        title: const Text('WateryMark'),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit),
            tooltip: 'Edit daily goal',
            onPressed: _showGoalDialog,
          ),
          PopupMenuButton<String>(
            onSelected: (value) {
              if (value == 'reset') _resetData();
              if (value == 'unit') {
                setState(() {
                  _unit = _unit == 'Liters' ? 'Ounces' : 'Liters';
                });
                _saveData();
              }
            },
            itemBuilder: (context) => [
              PopupMenuItem(
                value: 'unit',
                child: Text('Switch to ${_unit == 'Liters' ? 'Ounces' : 'Liters'}'),
              ),
              const PopupMenuItem(
                value: 'reset',
                child: Text('Reset all data'),
              ),
            ],
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              GestureDetector(
                onTap: _showGoalDialog,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: Colors.blue.shade50,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.flag, size: 18, color: Colors.blue),
                      const SizedBox(width: 8),
                      Text(
                        'Daily Goal: ${_displayGoal.toStringAsFixed(1)} ${_unit == 'Liters' ? 'L' : 'fl oz'}',
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                      ),
                      const SizedBox(width: 4),
                      const Icon(Icons.edit, size: 14, color: Colors.blue),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 32),
              Stack(
                alignment: Alignment.center,
                children: [
                  SizedBox(
                    width: 240,
                    height: 240,
                    child: CircularProgressIndicator(
                      value: progress,
                      strokeWidth: 28,
                      backgroundColor: Colors.blue.shade100,
                      color: progress > 1.0 ? Colors.green : Colors.blue,
                    ),
                  ),
                  Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        '${_percentage.toStringAsFixed(1)}%',
                        style: const TextStyle(fontSize: 56, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        '${_displayCurrent.toStringAsFixed(1)} / ${_displayGoal.toStringAsFixed(1)}',
                        style: const TextStyle(fontSize: 20),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        _unit == 'Liters' ? 'Liters' : 'fl oz',
                        style: TextStyle(fontSize: 14, color: Colors.grey.shade600),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 24),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Colors.blue.shade50, Colors.blue.shade100],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.local_fire_department, color: Colors.orange, size: 24),
                        const SizedBox(width: 8),
                        Text(
                          'Streak: $_streak day${_streak == 1 ? '' : 's'}',
                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      _getHydrationTip(),
                      style: const TextStyle(fontSize: 16, fontStyle: FontStyle.italic),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),
              const Text(
                'Quick Add',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 16),
              Wrap(
                spacing: 12,
                runSpacing: 12,
                alignment: WrapAlignment.center,
                children: const [
                  _QuickAddButton(amount: 200, label: '200 ml', icon: Icons.water_drop),
                  _QuickAddButton(amount: 250, label: 'Glass', icon: Icons.local_drink),
                  _QuickAddButton(amount: 330, label: 'Can', icon: Icons.sports_bar),
                  _QuickAddButton(amount: 500, label: 'Bottle', icon: Icons.water),
                  _QuickAddButton(amount: 750, label: 'Large', icon: Icons.local_drink),
                  _QuickAddButton(amount: 1000, label: '1 Liter', icon: Icons.water_drop_outlined),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  OutlinedButton.icon(
                    onPressed: _showCustomAmountDialog,
                    icon: const Icon(Icons.add),
                    label: const Text('Custom'),
                  ),
                  const SizedBox(width: 12),
                  FilledButton.icon(
                    onPressed: _undoStack.isNotEmpty ? _undoLast : null,
                    icon: const Icon(Icons.undo),
                    label: const Text('Undo'),
                  ),
                ],
              ),
              const SizedBox(height: 48),
              const Text('This week', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
              const SizedBox(height: 16),
              SizedBox(
                height: 200,
                child: BarChart(
                  BarChartData(
                    alignment: BarChartAlignment.spaceAround,
                    barGroups: _weeklyHistory.asMap().entries.map((e) {
                      final idx = e.key;
                      final intake = e.value['intake'] as double;
                      return BarChartGroupData(
                        x: idx,
                        barRods: [
                          BarChartRodData(
                            toY: intake,
                            color: intake >= _dailyGoal ? Colors.green : Colors.blue,
                            width: 20,
                          )
                        ],
                      );
                    }).toList(),
                    titlesData: FlTitlesData(
                      leftTitles: const AxisTitles(
                        sideTitles: SideTitles(showTitles: true, reservedSize: 40),
                      ),
                      bottomTitles: AxisTitles(
                        sideTitles: SideTitles(
                          showTitles: true,
                          getTitlesWidget: (value, meta) {
                            final date = _weeklyHistory[value.toInt()]['date'] as DateTime;
                            return Padding(
                              padding: const EdgeInsets.only(top: 6),
                              child: Text(
                                DateFormat('E').format(date),
                                style: const TextStyle(fontSize: 12),
                              ),
                            );
                          },
                        ),
                      ),
                      topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                      rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    ),
                    gridData: const FlGridData(show: false),
                    borderData: FlBorderData(show: false),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _QuickAddButton extends StatelessWidget {
  final int amount;
  final String label;
  final IconData icon;

  const _QuickAddButton({
    required this.amount,
    required this.label,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: () {
        final state = context.findAncestorStateOfType<_HomeScreenState>();
        state?._addIntake(amount.toDouble());
      },
      style: ElevatedButton.styleFrom(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 20),
          const SizedBox(height: 4),
          Text(label, style: const TextStyle(fontSize: 12)),
        ],
      ),
    );
  }
}