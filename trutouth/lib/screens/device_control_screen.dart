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
  double _volume = 0.5;
  String _eqPreset = 'Flat';
  String _firmwareVersion = '1.0.0';
  String _deviceModel = 'Unknown';
  bool _isCharging = false;
  int _leftBattery = 0;
  int _rightBattery = 0;
  int _caseBattery = 0;
  bool _inEar = false;
  String _connectionProtocol = 'BLE 5.3';
  String _codec = 'AAC';

  final List<String> _eqPresets = [
    'Flat', 'Bass Boost', 'Treble Boost', 'Vocal', 'Classical', 'Rock', 'Jazz', 'Custom'
  ];

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
        _simulateDeviceInfo();
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

  void _simulateDeviceInfo() {
    // Simulated device data — in production, read from BLE characteristics
    _deviceModel = 'Truetooth Pro X1';
    _firmwareVersion = '2.4.1';
    _leftBattery = 87;
    _rightBattery = 92;
    _caseBattery = 100;
    _batteryLevel = ((_leftBattery + _rightBattery) / 2).round();
    _isCharging = false;
    _inEar = true;
    _connectionProtocol = 'BLE 5.3';
    _codec = 'LDAC';
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
            ? _deviceModel
            : widget.device.platformName),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        actions: [
          IconButton(
            icon: Icon(_isCharging ? Icons.battery_charging_full : Icons.battery_full),
            color: _batteryLevel > 20 ? Colors.green : Colors.red,
            onPressed: null,
          ),
        ],
      ),
      body: _isConnected
          ? SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // --- Device Info Card ---
                  _buildDeviceInfoCard(),
                  const SizedBox(height: 16),

                  // --- Battery Status ---
                  _buildBatteryCard(),
                  const SizedBox(height: 16),

                  // --- Volume Slider ---
                  _buildVolumeCard(),
                  const SizedBox(height: 16),

                  // --- Noise Control ---
                  _buildNoiseControlCard(),
                  const SizedBox(height: 16),

                  // --- EQ Presets ---
                  _buildEQCard(),
                  const SizedBox(height: 16),

                  // --- Toggles ---
                  _buildTogglesCard(),
                  const SizedBox(height: 16),

                  // --- Connection Info ---
                  _buildConnectionInfoCard(),
                  const SizedBox(height: 24),

                  // --- Disconnect Button ---
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: _disconnect,
                      icon: const Icon(Icons.bluetooth_disabled),
                      label: const Text('Disconnect'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.red,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                      ),
                    ),
                  ),
                ],
              ),
            )
          : const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(),
                  SizedBox(height: 16),
                  Text('Connecting to device...'),
                ],
              ),
            ),
    );
  }

  Widget _buildDeviceInfoCard() {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.blue.shade50,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(Icons.headphones, size: 40, color: Colors.blue.shade700),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(_deviceModel,
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  Text('Firmware: $_firmwareVersion',
                      style: TextStyle(color: Colors.grey.shade600)),
                  Row(
                    children: [
                      Icon(Icons.bluetooth, size: 14, color: Colors.blue.shade400),
                      const SizedBox(width: 4),
                      Text('$_connectionProtocol • $_codec',
                          style: TextStyle(color: Colors.grey.shade600, fontSize: 12)),
                    ],
                  ),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: _inEar ? Colors.green.shade50 : Colors.grey.shade100,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                _inEar ? 'In Ear' : 'Out of Ear',
                style: TextStyle(
                  color: _inEar ? Colors.green.shade700 : Colors.grey.shade600,
                  fontWeight: FontWeight.w500,
                  fontSize: 12,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBatteryCard() {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Battery', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Row(
              children: [
                _batteryIndicator('L', _leftBattery, Icons.headphones),
                const SizedBox(width: 8),
                _batteryIndicator('R', _rightBattery, Icons.headphones),
                const SizedBox(width: 8),
                _batteryIndicator('Case', _caseBattery, Icons.battery_std),
              ],
            ),
            if (_isCharging)
              Padding(
                padding: const EdgeInsets.only(top: 8),
                child: Row(
                  children: [
                    Icon(Icons.battery_charging_full, size: 16, color: Colors.orange.shade700),
                    const SizedBox(width: 4),
                    Text('Charging', style: TextStyle(color: Colors.orange.shade700, fontSize: 13)),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _batteryIndicator(String label, int level, IconData icon) {
    Color color;
    if (level > 60) {
      color = Colors.green;
    } else if (level > 20) {
      color = Colors.orange;
    } else {
      color = Colors.red;
    }

    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Column(
          children: [
            Icon(icon, size: 20, color: color),
            const SizedBox(height: 4),
            Text(label, style: TextStyle(fontSize: 11, color: Colors.grey.shade600)),
            Text('$level%', style: TextStyle(fontWeight: FontWeight.bold, color: color, fontSize: 14)),
          ],
        ),
      ),
    );
  }

  Widget _buildVolumeCard() {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Volume', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                Text('${(_volume * 100).round()}%',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              ],
            ),
            Slider(
              value: _volume,
              min: 0,
              max: 1,
              divisions: 20,
              label: '${(_volume * 100).round()}%',
              onChanged: (value) {
                setState(() {
                  _volume = value;
                });
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNoiseControlCard() {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Noise Control',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            SegmentedButton<String>(
              segments: const [
                ButtonSegment(value: 'Off', label: Text('Off'), icon: Icon(Icons.block)),
                ButtonSegment(value: 'ANC', label: Text('ANC'), icon: Icon(Icons.noise_control_off)),
                ButtonSegment(
                    value: 'Transparency',
                    label: Text('Transparency'),
                    icon: Icon(Icons.hearing)),
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
    );
  }

  Widget _buildEQCard() {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Equalizer',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            SizedBox(
              height: 40,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: _eqPresets.length,
                separatorBuilder: (_, __) => const SizedBox(width: 8),
                itemBuilder: (context, index) {
                  final preset = _eqPresets[index];
                  final isSelected = _eqPreset == preset;
                  return FilterChip(
                    label: Text(preset, style: TextStyle(fontSize: 12)),
                    selected: isSelected,
                    onSelected: (selected) {
                      if (selected) {
                        setState(() {
                          _eqPreset = preset;
                        });
                      }
                    },
                    selectedColor: Colors.blue.shade100,
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTogglesCard() {
    return Card(
      elevation: 2,
      child: Column(
        children: [
          SwitchListTile(
            secondary: const Icon(Icons.earbuds),
            title: const Text('Auto Ear Detection'),
            subtitle: Text(_autoEarDetection ? 'Pause when removed' : 'Disabled',
                style: TextStyle(color: Colors.grey.shade600, fontSize: 12)),
            value: _autoEarDetection,
            onChanged: (value) {
              setState(() {
                _autoEarDetection = value;
              });
            },
          ),
          const Divider(height: 1, indent: 16, endIndent: 16),
          SwitchListTile(
            secondary: const Icon(Icons.surround_sound),
            title: const Text('Spatial Audio'),
            subtitle: Text(_spatialAudio ? 'Head tracking enabled' : 'Disabled',
                style: TextStyle(color: Colors.grey.shade600, fontSize: 12)),
            value: _spatialAudio,
            onChanged: (value) {
              setState(() {
                _spatialAudio = value;
              });
            },
          ),
          const Divider(height: 1, indent: 16, endIndent: 16),
          SwitchListTile(
            secondary: const Icon(Icons.mic),
            title: const Text('Voice Assistant'),
            subtitle: const Text('Double-tap to activate',
                style: TextStyle(color: Colors.grey, fontSize: 12)),
            value: false,
            onChanged: (value) {
              // Placeholder for voice assistant toggle
            },
          ),
        ],
      ),
    );
  }

  Widget _buildConnectionInfoCard() {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Connection',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            _infoRow('Protocol', _connectionProtocol),
            _infoRow('Codec', _codec),
            _infoRow('Device ID', widget.device.remoteId.toString().substring(0, 17)),
          ],
        ),
      ),
    );
  }

  Widget _infoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(color: Colors.grey.shade600)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }

  @override
  void dispose() {
    widget.device.disconnect();
    super.dispose();
  }
}