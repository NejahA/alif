import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Remade',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.amber,
          brightness: Brightness.light,
        ),
        useMaterial3: true,
      ),
      home: const HomeScreen(),
    );
  }
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int meadsCollected = 0;
  int meadsRecycled = 0;

  void addMeads(int amount) {
    setState(() {
      meadsCollected += amount;
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Added $amount mead(s) for recycling!'),
        backgroundColor: Colors.amber,
        action: SnackBarAction(
          label: 'Recycle',
          textColor: Colors.white,
          onPressed: () {
            setState(() {
              if (meadsCollected >= amount) {
                meadsCollected -= amount;
                meadsRecycled += amount;
              }
            });
          },
        ),
      ),
    );
  }

  void resetProgress() {
    setState(() {
      meadsCollected = 0;
      meadsRecycled = 0;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Remade'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: resetProgress,
            tooltip: 'Reset progress',
          ),
        ],
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                color: Colors.amber,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.recycling,
                size: 64,
                color: Colors.white,
              ),
            ),
            const SizedBox(height: 20),
            Text(
              'Meads Recycled: $meadsRecycled',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 10),
            Text(
              'Meads Collected: $meadsCollected',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 40),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              spacing: 10,
              children: [
                ElevatedButton.icon(
                  onPressed: () => addMeads(1),
                  icon: const Icon(Icons.add),
                  label: const Text('+1'),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                    backgroundColor: Colors.amber,
                    foregroundColor: Colors.white,
                  ),
                ),
                ElevatedButton.icon(
                  onPressed: () => addMeads(10),
                  icon: const Icon(Icons.add),
                  label: const Text('+10'),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                    backgroundColor: Colors.amber,
                    foregroundColor: Colors.white,
                  ),
                ),
                ElevatedButton.icon(
                  onPressed: () => addMeads(100),
                  icon: const Icon(Icons.add),
                  label: const Text('+100'),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                    backgroundColor: Colors.amber,
                    foregroundColor: Colors.white,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              spacing: 10,
              children: [
                ElevatedButton.icon(
                  onPressed: () {
                    if (meadsCollected > 0) {
                      setState(() {
                        meadsRecycled++;
                        meadsCollected--;
                      });
                    }
                  },
                  icon: const Icon(Icons.recycling),
                  label: const Text('Recycle 1'),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                    backgroundColor: Colors.green,
                    foregroundColor: Colors.white,
                  ),
                ),
                ElevatedButton.icon(
                  onPressed: () {
                    if (meadsCollected >= 10) {
                      setState(() {
                        meadsRecycled += 10;
                        meadsCollected -= 10;
                      });
                    }
                  },
                  icon: const Icon(Icons.recycling),
                  label: const Text('Recycle 10'),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                    backgroundColor: Colors.green,
                    foregroundColor: Colors.white,
                  ),
                ),
                ElevatedButton.icon(
                  onPressed: () {
                    if (meadsCollected >= 100) {
                      setState(() {
                        meadsRecycled += 100;
                        meadsCollected -= 100;
                      });
                    }
                  },
                  icon: const Icon(Icons.recycling),
                  label: const Text('Recycle 100'),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                    backgroundColor: Colors.green,
                    foregroundColor: Colors.white,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
