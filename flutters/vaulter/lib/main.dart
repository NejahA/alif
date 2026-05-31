import 'package:flutter/material.dart';

void main() => runApp(const VaulterApp());

class VaulterApp extends StatelessWidget {
  const VaulterApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Vaulter',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        primaryColor: const Color(0xFF212121),
        scaffoldBackgroundColor: const Color(0xFF121212),
      ),
      home: const VaultScreen(),
    );
  }
}

class VaultScreen extends StatefulWidget {
  const VaultScreen({super.key});

  @override
  State<VaultScreen> createState() => _VaultScreenState();
}

class _VaultScreenState extends State<VaultScreen> {
  bool isUnlocked = false;
  List<Map<String, String>> secrets = [
    {'title': 'Password', 'content': '••••••••'},
    {'title': 'Bank Account', 'content': '••••••••'},
    {'title': 'Secret Note', 'content': '••••••••'},
  ];

  @override
  Widget build(BuildContext context) {
    if (!isUnlocked) {
      return Scaffold(
        appBar: AppBar(title: const Text('🔐 Vaulter')),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.fingerprint, size: 120, color: Colors.tealAccent),
              const SizedBox(height: 40),
              const Text('Secure Vault', style: TextStyle(fontSize: 28)),
              const SizedBox(height: 20),
              const Text('Touch to unlock', style: TextStyle(color: Colors.grey)),
              const SizedBox(height: 60),
              ElevatedButton.icon(
                onPressed: () {
                  setState(() {
                    isUnlocked = true;
                  });
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('🔓 Vault Unlocked')),
                  );
                },
                icon: const Icon(Icons.lock_open),
                label: const Text('Unlock with Biometric'),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('🔐 Vaulter - Unlocked'),
        actions: [
          IconButton(
            icon: const Icon(Icons.lock),
            onPressed: () {
              setState(() {
                isUnlocked = false;
              });
            },
          ),
        ],
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: secrets.length,
        itemBuilder: (context, index) {
          return Card(
            child: ListTile(
              leading: const Icon(Icons.vpn_key, color: Colors.tealAccent),
              title: Text(secrets[index]['title']!),
              subtitle: Text(secrets[index]['content']!),
              trailing: IconButton(
                icon: const Icon(Icons.visibility),
                onPressed: () {
                  showDialog(
                    context: context,
                    builder: (context) => AlertDialog(
                      title: Text(secrets[index]['title']!),
                      content: Text('This is your secret: ${secrets[index]['content']}'),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.pop(context),
                          child: const Text('Close'),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          showDialog(
            context: context,
            builder: (context) {
              String title = '';
              String content = '';
              return AlertDialog(
                title: const Text('Add Secret'),
                content: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TextField(
                      onChanged: (value) => title = value,
                      decoration: const InputDecoration(hintText: 'Title'),
                    ),
                    TextField(
                      onChanged: (value) => content = value,
                      decoration: const InputDecoration(hintText: 'Secret'),
                      obscureText: true,
                    ),
                  ],
                ),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Cancel'),
                  ),
                  TextButton(
                    onPressed: () {
                      if (title.isNotEmpty && content.isNotEmpty) {
                        setState(() {
                          secrets.add({'title': title, 'content': content});
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
