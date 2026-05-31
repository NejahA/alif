import 'package:flutter/material.dart';
import 'package:phone_numbers_parser/phone_numbers_parser.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Dright',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.green,
          brightness: Brightness.light,
        ),
        useMaterial3: true,
      ),
      home: const CallScreen(),
    );
  }
}

class CallScreen extends StatefulWidget {
  const CallScreen({super.key});

  @override
  State<CallScreen> createState() => _CallScreenState();
}

class _CallScreenState extends State<CallScreen> {
  final TextEditingController _controller = TextEditingController();
  String _displayNumber = '';
  String _currentNumber = '';

  void _appendNumber(String num) {
    setState(() {
      _currentNumber += num;
      _displayNumber = _formatPhoneNumber(_currentNumber);
    });
  }

  void _backspace() {
    setState(() {
      if (_currentNumber.isNotEmpty) {
        _currentNumber = _currentNumber.substring(0, _currentNumber.length - 1);
        _displayNumber = _formatPhoneNumber(_currentNumber);
      }
    });
  }

  String _formatPhoneNumber(String number) {
    if (number.length <= 3) return number;
    if (number.length <= 6) {
      return '${number.substring(0, 3)}-${number.substring(3)}';
    }
    return '${number.substring(0, 3)}-${number.substring(3, 6)}-${number.substring(6, number.length)}';
  }

  void _makeCall() {
    if (_currentNumber.isNotEmpty) {
      // In a real app, you would use the url_launcher package to make actual calls
      // final uri = Uri.parse('tel:$_currentNumber');
      // if (await canLaunchUrl(uri)) await launchUrl(uri);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Calling $_displayNumber...')),
      );
    }
  }

  void _clear() {
    setState(() {
      _currentNumber = '';
      _displayNumber = '';
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Colors.green, Colors.lightGreen],
          ),
        ),
        child: Column(
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                children: [
                  const Text(
                    'Dright',
                    style: TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    _displayNumber.isEmpty ? 'Enter phone number' : _displayNumber,
                    style: TextStyle(
                      fontSize: 24,
                      color: _displayNumber.isEmpty ? Colors.white70 : Colors.white,
                    ),
                  ),
                ],
              ),
            ),

            // Keypad
            Expanded(
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(30),
                    topRight: Radius.circular(30),
                  ),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          _buildKey('1', () => _appendNumber('1')),
                          _buildKey('2', () => _appendNumber('2')),
                          _buildKey('3', () => _appendNumber('3')),
                        ],
                      ),
                      const SizedBox(height: 15),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          _buildKey('4', () => _appendNumber('4')),
                          _buildKey('5', () => _appendNumber('5')),
                          _buildKey('6', () => _appendNumber('6')),
                        ],
                      ),
                      const SizedBox(height: 15),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          _buildKey('7', () => _appendNumber('7')),
                          _buildKey('8', () => _appendNumber('8')),
                          _buildKey('9', () => _appendNumber('9')),
                        ],
                      ),
                      const SizedBox(height: 15),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          _buildKey('*', () => _appendNumber('*'), Colors.grey),
                          _buildKey('0', () => _appendNumber('0')),
                          _buildKey('#', () => _appendNumber('#'), Colors.grey),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),

            // Action Buttons
            Padding(
              padding: const EdgeInsets.all(20.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  // Backspace
                  Container(
                    width: 60,
                    height: 60,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.red.withOpacity(0.2),
                    ),
                    child: IconButton(
                      icon: const Icon(Icons.backspace, color: Colors.red),
                      onPressed: _backspace,
                      iconSize: 30,
                    ),
                  ),
                  // Clear
                  Container(
                    width: 60,
                    height: 60,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.orange.withOpacity(0.2),
                    ),
                    child: IconButton(
                      icon: const Icon(Icons.clear, color: Colors.orange),
                      onPressed: _clear,
                      iconSize: 30,
                    ),
                  ),
                  // Call
                  Container(
                    width: 70,
                    height: 70,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.green,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.green.withOpacity(0.4),
                          blurRadius: 15,
                          spreadRadius: 3,
                        ),
                      ],
                    ),
                    child: IconButton(
                      icon: const Icon(Icons.phone, color: Colors.white),
                      onPressed: _makeCall,
                      iconSize: 35,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildKey(String number, VoidCallback onPressed, [Color? color]) {
    return Container(
      width: 60,
      height: 60,
      margin: const EdgeInsets.symmetric(horizontal: 5),
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: color ?? Colors.green.withOpacity(0.1),
      ),
      child: ElevatedButton(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.transparent,
          shadowColor: Colors.transparent,
          padding: EdgeInsets.zero,
        ),
        child: Text(
          number,
          style: const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Colors.green,
          ),
        ),
      ),
    );
  }
}
