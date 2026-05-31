import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Exode Terminal',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.green,
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.green,
          foregroundColor: Colors.black,
        ),
      ),
      home: const TerminalScreen(),
    );
  }
}

class TerminalScreen extends StatefulWidget {
  const TerminalScreen({super.key});

  @override
  State<TerminalScreen> createState() => _TerminalScreenState();
}

class _TerminalScreenState extends State<TerminalScreen> {
  final TextEditingController _controller = TextEditingController();
  final List<String> _history = [];
  final List<String> _output = [];
  String _currentDirectory = '~';

  void _executeCommand(String command) {
    final trimmed = command.trim();
    if (trimmed.isEmpty) return;

    _history.add(trimmed);
    _output.add('$_currentDirectory\$ $trimmed');

    final parts = trimmed.split(' ');
    final cmd = parts[0].toLowerCase();
    final args = parts.sublist(1);

    switch (cmd) {
      case 'help':
        _output.add('Available commands:');
        _output.add('  help    - Show this help message');
        _output.add('  clear   - Clear the terminal');
        _output.add('  ls      - List files in current directory');
        _output.add('  cd      - Change directory (cd <dir>)');
        _output.add('  echo    - Print text (echo <text>)');
        _output.add('  date    - Show current date and time');
        _output.add('  whoami  - Show current user');
        break;

      case 'clear':
        _output.clear();
        break;

      case 'ls':
        _output.add('exode  exode-terminal  meads_recycler  original  spotify-downloader');
        break;

      case 'cd':
        if (args.isEmpty) {
          _currentDirectory = '~';
        } else if (args[0] == '..') {
          _currentDirectory = _currentDirectory == '~' ? '~' : '~';
        } else {
          _currentDirectory = '~/${args[0]}';
        }
        _output.add('');
        break;

      case 'echo':
        _output.add(args.join(' '));
        break;

      case 'date':
        _output.add(DateTime.now().toString());
        break;

      case 'whoami':
        _output.add('user');
        break;

      default:
        _output.add('Command not found: $cmd');
        _output.add('Type "help" for available commands.');
    }

    setState(() {});
  }

  void _handleSubmitted(String text) {
    _executeCommand(text);
    _controller.clear();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Exode Terminal'),
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(10.0),
              itemCount: _output.length,
              itemBuilder: (context, index) {
                final line = _output[index];
                if (line.endsWith('\$')) {
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 8.0),
                    child: Text(
                      line,
                      style: const TextStyle(
                        color: Colors.green,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  );
                }
                return Padding(
                  padding: const EdgeInsets.only(bottom: 4.0),
                  child: Text(
                    line,
                    style: const TextStyle(color: Colors.white),
                  ),
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Row(
              children: [
                Text(
                  '$_currentDirectory\$',
                  style: const TextStyle(
                    color: Colors.green,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                Expanded(
                  child: TextField(
                    controller: _controller,
                    style: const TextStyle(color: Colors.white),
                    decoration: const InputDecoration(
                      border: InputBorder.none,
                      hintText: 'Type a command...',
                    ),
                    onSubmitted: _handleSubmitted,
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
