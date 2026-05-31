import 'package:flutter/material.dart';

void main() => runApp(const LumoraApp());

class LumoraApp extends StatelessWidget {
  const LumoraApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Lumora',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        primaryColor: const Color(0xFFFFD700),
        scaffoldBackgroundColor: const Color(0xFF1A1A2E),
      ),
      home: const HabitTrackerScreen(),
    );
  }
}

class HabitTrackerScreen extends StatefulWidget {
  const HabitTrackerScreen({super.key});

  @override
  State<HabitTrackerScreen> createState() => _HabitTrackerScreenState();
}

class _HabitTrackerScreenState extends State<HabitTrackerScreen> {
  List<Map<String, dynamic>> habits = [
    {'name': 'Morning Exercise', 'done': true},
    {'name': 'Read 30 min', 'done': true},
    {'name': 'Meditate', 'done': false},
    {'name': 'Drink Water', 'done': true},
  ];

  int get completedCount => habits.where((h) => h['done']).length;
  int get energyPercent => ((completedCount / habits.length) * 100).round();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('💡 Lumora - Habit Tracker')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 150,
              height: 150,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [Colors.amber, Colors.amber.withOpacity(0.1)],
                ),
                boxShadow: [BoxShadow(color: Colors.amber.withOpacity(0.5), blurRadius: 30, spreadRadius: 10)],
              ),
              child: Center(child: Text('$energyPercent%', style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold))),
            ),
            const SizedBox(height: 40),
            const Text('Your Energy Today', style: TextStyle(fontSize: 24)),
            const SizedBox(height: 40),
            ...habits.asMap().entries.map((entry) {
              int i = entry.key;
              var habit = entry.value;
              return Padding(
                padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 20),
                child: ListTile(
                  leading: Icon(
                    habit['done'] ? Icons.check_circle : Icons.circle_outlined,
                    color: habit['done'] ? Colors.amber : Colors.grey,
                  ),
                  title: Text(habit['name']),
                  trailing: IconButton(
                    icon: Icon(habit['done'] ? Icons.undo : Icons.check),
                    onPressed: () {
                      setState(() {
                        habits[i]['done'] = !habits[i]['done'];
                      });
                    },
                  ),
                  onTap: () {
                    setState(() {
                      habits[i]['done'] = !habits[i]['done'];
                    });
                  },
                ),
              );
            }).toList(),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          showDialog(
            context: context,
            builder: (context) {
              String newHabit = '';
              return AlertDialog(
                title: const Text('Add Habit'),
                content: TextField(
                  onChanged: (value) => newHabit = value,
                  decoration: const InputDecoration(hintText: 'Habit name'),
                ),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Cancel'),
                  ),
                  TextButton(
                    onPressed: () {
                      if (newHabit.isNotEmpty) {
                        setState(() {
                          habits.add({'name': newHabit, 'done': false});
                        });
                      }
                      Navigator.pop(context);
                    },
                    child: const Text('Add'),
                  ),
                ],
              );
            },
          );
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}
