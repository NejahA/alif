import 'dart:convert';
import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:crypto/crypto.dart';

void main() {
  runApp(const OmniToolApp());
}

class OmniToolApp extends StatelessWidget {
  const OmniToolApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'OmniTool',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.deepPurple,
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
      ),
      home: const MainScreen(),
    );
  }
}

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _selectedIndex = 0;

  final List<Widget> _screens = [
    const PasswordGeneratorScreen(),
    const Base64Screen(),
    const JsonFormatterScreen(),
    const HashCalculatorScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('OmniTool'),
      ),
      body: Row(
        children: [
          NavigationRail(
            selectedIndex: _selectedIndex,
            onDestinationSelected: (int index) {
              setState(() {
                _selectedIndex = index;
              });
            },
            labelType: NavigationRailLabelType.all,
            destinations: const [
              NavigationRailDestination(
                icon: Icon(Icons.password_outlined),
                selectedIcon: Icon(Icons.password),
                label: Text('Passwords'),
              ),
              NavigationRailDestination(
                icon: Icon(Icons.code_outlined),
                selectedIcon: Icon(Icons.code),
                label: Text('Base64'),
              ),
              NavigationRailDestination(
                icon: Icon(Icons.data_object_outlined),
                selectedIcon: Icon(Icons.data_object),
                label: Text('JSON'),
              ),
              NavigationRailDestination(
                icon: Icon(Icons.tag_outlined),
                selectedIcon: Icon(Icons.tag),
                label: Text('Hash'),
              ),
            ],
          ),
          const VerticalDivider(thickness: 1, width: 1),
          Expanded(
            child: _screens[_selectedIndex],
          )
        ],
      ),
    );
  }
}

class PasswordGeneratorScreen extends StatefulWidget {
  const PasswordGeneratorScreen({super.key});

  @override
  State<PasswordGeneratorScreen> createState() => _PasswordGeneratorScreenState();
}

class _PasswordGeneratorScreenState extends State<PasswordGeneratorScreen> {
  String _generatedPassword = '';
  double _length = 16;
  bool _useNumbers = true;
  bool _useSymbols = true;
  bool _useUppercase = true;

  List<String> _savedPasswords = [];

  @override
  void initState() {
    super.initState();
    _loadSavedPasswords();
  }

  Future<void> _loadSavedPasswords() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _savedPasswords = prefs.getStringList('saved_passwords') ?? [];
    });
  }

  Future<void> _saveCurrentPassword() async {
    if (_generatedPassword.isEmpty) return;
    
    final prefs = await SharedPreferences.getInstance();
    final List<String> updatedPasswords = List.from(_savedPasswords)..insert(0, _generatedPassword);
    
    await prefs.setStringList('saved_passwords', updatedPasswords);
    setState(() {
      _savedPasswords = updatedPasswords;
    });
    
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Password saved locally!')),
      );
    }
  }

  Future<void> _clearSavedPasswords() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('saved_passwords');
    setState(() {
      _savedPasswords = [];
    });
  }

  void _generatePassword() {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#\$%^&*()_+~`|}{[]:;?><,./-=';

    String chars = letters;
    if (_useUppercase) chars += uppercase;
    if (_useNumbers) chars += numbers;
    if (_useSymbols) chars += symbols;

    Random rnd = Random();
    String password = '';
    for (int i = 0; i < _length.toInt(); i++) {
        password += chars[rnd.nextInt(chars.length)];
    }
    setState(() {
      _generatedPassword = password;
    });
  }

  void _copyToClipboard(String text) {
    if (text.isNotEmpty) {
      Clipboard.setData(ClipboardData(text: text));
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Copied to clipboard')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(32.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            flex: 2,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: SelectableText(
                        _generatedPassword.isEmpty ? 'Generate a password' : _generatedPassword,
                        style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                          fontFamily: 'Consolas',
                        ),
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.copy),
                      onPressed: () => _copyToClipboard(_generatedPassword),
                      tooltip: 'Copy to Clipboard',
                    ),
                    IconButton(
                      icon: const Icon(Icons.save),
                      onPressed: _saveCurrentPassword,
                      tooltip: 'Save Password locally',
                    ),
                  ],
                ),
                const SizedBox(height: 32),
                Text('Length: ${_length.toInt()}'),
                Slider(
                  value: _length,
                  min: 8,
                  max: 64,
                  divisions: 56,
                  label: _length.round().toString(),
                  onChanged: (double value) {
                    setState(() {
                      _length = value;
                    });
                  },
                ),
                SwitchListTile(
                  title: const Text('Include Uppercase'),
                  value: _useUppercase,
                  onChanged: (bool value) {
                    setState(() {
                      _useUppercase = value;
                    });
                  },
                ),
                SwitchListTile(
                  title: const Text('Include Numbers'),
                  value: _useNumbers,
                  onChanged: (bool value) {
                    setState(() {
                      _useNumbers = value;
                    });
                  },
                ),
                SwitchListTile(
                  title: const Text('Include Symbols'),
                  value: _useSymbols,
                  onChanged: (bool value) {
                    setState(() {
                      _useSymbols = value;
                    });
                  },
                ),
                const SizedBox(height: 32),
                Center(
                  child: ElevatedButton.icon(
                    onPressed: _generatePassword,
                    icon: const Icon(Icons.refresh),
                    label: const Text('Generate Password'),
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                    ),
                  ),
                )
              ],
            ),
          ),
          const SizedBox(width: 32),
          Expanded(
            flex: 1,
            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Saved Passwords', style: Theme.of(context).textTheme.titleLarge),
                        IconButton(
                          icon: const Icon(Icons.delete_outline),
                          onPressed: _clearSavedPasswords,
                          tooltip: 'Clear all',
                        )
                      ],
                    ),
                    const Divider(),
                    Expanded(
                      child: _savedPasswords.isEmpty
                          ? const Center(child: Text('No saved passwords.'))
                          : ListView.builder(
                              itemCount: _savedPasswords.length,
                              itemBuilder: (context, index) {
                                return ListTile(
                                  title: SelectableText(
                                    _savedPasswords[index],
                                    style: const TextStyle(fontFamily: 'Consolas'),
                                  ),
                                  trailing: IconButton(
                                    icon: const Icon(Icons.copy, size: 20),
                                    onPressed: () => _copyToClipboard(_savedPasswords[index]),
                                  ),
                                );
                              },
                            ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class Base64Screen extends StatefulWidget {
  const Base64Screen({super.key});

  @override
  State<Base64Screen> createState() => _Base64ScreenState();
}

class _Base64ScreenState extends State<Base64Screen> {
  final TextEditingController _inputController = TextEditingController();
  final TextEditingController _outputController = TextEditingController();
  bool _isEncoding = true;

  void _process() {
    String input = _inputController.text;
    if (input.isEmpty) {
        _outputController.text = '';
        return;
    }
    
    try {
      if (_isEncoding) {
        _outputController.text = base64Encode(utf8.encode(input));
      } else {
        _outputController.text = utf8.decode(base64Decode(input));
      }
    } catch (e) {
      _outputController.text = 'Error processing text: \${e.toString()}';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(32.0),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text('Decode'),
              Switch(
                value: _isEncoding,
                onChanged: (val) {
                  setState(() {
                    _isEncoding = val;
                    _process();
                  });
                },
              ),
              const Text('Encode'),
            ],
          ),
          const SizedBox(height: 16),
          Expanded(
            child: TextField(
              controller: _inputController,
              decoration: const InputDecoration(
                border: OutlineInputBorder(),
                labelText: 'Input Text',
              ),
              maxLines: null,
              expands: true,
              onChanged: (_) => _process(),
            ),
          ),
          const SizedBox(height: 16),
          Expanded(
            child: TextField(
              controller: _outputController,
              decoration: const InputDecoration(
                border: OutlineInputBorder(),
                labelText: 'Output Text',
              ),
              maxLines: null,
              expands: true,
              readOnly: true,
            ),
          ),
        ],
      ),
    );
  }
}

class JsonFormatterScreen extends StatefulWidget {
  const JsonFormatterScreen({super.key});

  @override
  State<JsonFormatterScreen> createState() => _JsonFormatterScreenState();
}

class _JsonFormatterScreenState extends State<JsonFormatterScreen> {
  final TextEditingController _inputController = TextEditingController();
  final TextEditingController _outputController = TextEditingController();

  void _formatJson() {
    String input = _inputController.text.trim();
    if (input.isEmpty) {
      _outputController.text = '';
      return;
    }

    try {
      final object = json.decode(input);
      final prettyString = const JsonEncoder.withIndent('  ').convert(object);
      _outputController.text = prettyString;
    } catch (e) {
      _outputController.text = 'Invalid JSON: \n\${e.toString()}';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(32.0),
      child: Column(
        children: [
          const Text('Paste raw/minified JSON to format it beautifully.'),
          const SizedBox(height: 16),
          Expanded(
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _inputController,
                    decoration: const InputDecoration(
                      border: OutlineInputBorder(),
                      labelText: 'Raw JSON',
                    ),
                    maxLines: null,
                    expands: true,
                    onChanged: (_) => _formatJson(),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: TextField(
                    controller: _outputController,
                    decoration: const InputDecoration(
                      border: OutlineInputBorder(),
                      labelText: 'Formatted Result',
                    ),
                    maxLines: null,
                    expands: true,
                    readOnly: true,
                    style: const TextStyle(fontFamily: 'Consolas'),
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

class HashCalculatorScreen extends StatefulWidget {
  const HashCalculatorScreen({super.key});

  @override
  State<HashCalculatorScreen> createState() => _HashCalculatorScreenState();
}

class _HashCalculatorScreenState extends State<HashCalculatorScreen> {
  final TextEditingController _inputController = TextEditingController();
  String _md5 = '';
  String _sha1 = '';
  String _sha256 = '';

  void _calculateHashes() {
    String input = _inputController.text;
    if (input.isEmpty) {
      setState(() {
        _md5 = '';
        _sha1 = '';
        _sha256 = '';
      });
      return;
    }

    final bytes = utf8.encode(input);
    setState(() {
      _md5 = md5.convert(bytes).toString();
      _sha1 = sha1.convert(bytes).toString();
      _sha256 = sha256.convert(bytes).toString();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(32.0),
      child: Column(
        children: [
          TextField(
            controller: _inputController,
            decoration: const InputDecoration(
              border: OutlineInputBorder(),
              labelText: 'Text to Hash',
            ),
            onChanged: (_) => _calculateHashes(),
          ),
          const SizedBox(height: 32),
          _HashResult(label: 'MD5', value: _md5),
          const SizedBox(height: 16),
          _HashResult(label: 'SHA-1', value: _sha1),
          const SizedBox(height: 16),
          _HashResult(label: 'SHA-256', value: _sha256),
        ],
      ),
    );
  }
}

class _HashResult extends StatelessWidget {
  final String label;
  final String value;
  const _HashResult({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: Container(
                padding: const EdgeInsets.all(12),
                color: Theme.of(context).colorScheme.surfaceVariant,
                child: SelectableText(
                  value.isEmpty ? '-' : value,
                  style: const TextStyle(fontFamily: 'Consolas'),
                ),
              ),
            ),
            IconButton(
              icon: const Icon(Icons.copy),
              onPressed: value.isEmpty ? null : () {
                Clipboard.setData(ClipboardData(text: value));
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('\$label copied to clipboard')),
                );
              },
            )
          ],
        )
      ],
    );
  }
}
