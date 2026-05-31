import 'package:flutter/material.dart';
import 'package:flutter_blue_plus/flutter_blue_plus.dart';

class DeviceControlScreen extends StatefulWidget {
  final BluetoothDevice device;

  const DeviceControlScreen({super.key, required this.device});

  @override
  State<DeviceControlScreen> createState() => _DeviceControlScreenState();
}

class _DeviceControlScreenState extends State<DeviceControlScreen> {
  bool _isConnected = false;
  int _batteryLevel = 0;
  String _noiseMode = 'Off';
  bool _autoEarDetection = false;
  bool _spatialAudio = false;

  @override
  void initState() {
    super.initState();
    _connectToDevice();
  }

  Future<void> _connectToDevice() async {
    try {
      await widget.device.connect();
      setState(() {
        _isConnected = true;
      });
      await widget.device.discoverServices();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Connection failed: $e')),
        );
      }
    }
  }

  Future<void> _disconnect() async {
    await widget.device.disconnect();
    if (mounted) {
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.device.platformName.isEmpty
            ? 'Device Control'
            : widget.device.platformName),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: _isConnected
          ? SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Card(
                    child: ListTile(
                      leading: const Icon(Icons.battery_std),
                      title: const Text('Battery Level'),
                      trailing: Text('$_batteryLevel%'),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Noise Control',
                              style: TextStyle(
                                  fontSize: 18, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 8),
                          SegmentedButton<String>(
                            segments: const [
                              ButtonSegment(value: 'Off', label: Text('Off')),
                              ButtonSegment(value: 'ANC', label: Text('ANC')),
                              ButtonSegment(
                                  value: 'Transparency',
                                  label: Text('Transparency')),
                            ],
                            selected: {_noiseMode},
                            onSelectionChanged: (Set<String> newSelection) {
                              setState(() {
                                _noiseMode = newSelection.first;
                              });
                            },
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Card(
                    child: Column(
                      children: [
                        SwitchListTile(
                          title: const Text('Auto Ear Detection'),
                          value: _autoEarDetection,
                          onChanged: (value) {
                            setState(() {
                              _autoEarDetection = value;
                            });
                          },
                        ),
                        SwitchListTile(
                          title: const Text('Spatial Audio'),
                          value: _spatialAudio,
                          onChanged: (value) {
                            setState(() {
                              _spatialAudio = value;
                            });
                          },
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _disconnect,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.red,
                        foregroundColor: Colors.white,
                      ),
                      child: const Text('Disconnect'),
                    ),
                  ),
                ],
              ),
            )
          : const Center(child: CircularProgressIndicator()),
    );
  }

  @override
  void dispose() {
    widget.device.disconnect();
    super.dispose();
  }
}
