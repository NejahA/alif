import 'package:flutter/material.dart';
import 'package:flutter_blue_plus/flutter_blue_plus.dart';
import 'package:permission_handler/permission_handler.dart';
import 'device_control_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<ScanResult> _scanResults = [];
  bool _isScanning = false;
  bool _hideUnknownDevices = false;

  @override
  void initState() {
    super.initState();
    _checkPermissions();
  }

  Future<void> _checkPermissions() async {
    if (await Permission.bluetoothScan.isDenied) {
      await Permission.bluetoothScan.request();
    }
    if (await Permission.bluetoothConnect.isDenied) {
      await Permission.bluetoothConnect.request();
    }
    if (await Permission.location.isDenied) {
      await Permission.location.request();
    }
  }

  Future<void> _startScan() async {
    setState(() {
      _scanResults = [];
      _isScanning = true;
    });

    await FlutterBluePlus.startScan(timeout: const Duration(seconds: 4));

    FlutterBluePlus.scanResults.listen((results) {
      setState(() {
        _scanResults = results;
      });
    });

    await Future.delayed(const Duration(seconds: 4));
    await FlutterBluePlus.stopScan();
    
    setState(() {
      _isScanning = false;
    });
  }

  List<ScanResult> _getFilteredResults() {
    if (_hideUnknownDevices) {
      return _scanResults.where((result) {
        return result.device.platformName.isNotEmpty || 
               result.advertisementData.advName.isNotEmpty;
      }).toList();
    }
    return _scanResults;
  }

  IconData _getDeviceIcon(String deviceName) {
    final name = deviceName.toLowerCase();
    if (name.contains('earpod') || name.contains('airpod') || name.contains('headphone') || name.contains('buds') || name.contains('pro')) {
      return Icons.headphones;
    } else if (name.contains('watch')) {
      return Icons.watch;
    } else if (name.contains('phone') || name.contains('mobile')) {
      return Icons.phone_android;
    } else if (name.contains('laptop') || name.contains('pc')) {
      return Icons.computer;
    } else if (name.contains('speaker')) {
      return Icons.speaker;
    }
    return Icons.bluetooth;
  }

  String _getSignalStrength(int rssi) {
    if (rssi >= -50) return 'Excellent';
    if (rssi >= -60) return 'Good';
    if (rssi >= -70) return 'Fair';
    return 'Weak';
  }

  Color _getSignalColor(int rssi) {
    if (rssi >= -50) return Colors.green;
    if (rssi >= -60) return Colors.lightGreen;
    if (rssi >= -70) return Colors.orange;
    return Colors.red;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Truetooth'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              children: [
                ElevatedButton(
                  onPressed: _isScanning ? null : _startScan,
                  child: Text(_isScanning ? 'Scanning...' : 'Scan for Devices'),
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Checkbox(
                      value: _hideUnknownDevices,
                      onChanged: (value) {
                        setState(() {
                          _hideUnknownDevices = value ?? false;
                        });
                      },
                    ),
                    const Text('Hide Unknown Devices'),
                  ],
                ),
              ],
            ),
          ),
          Expanded(
            child: _getFilteredResults().isEmpty
                ? const Center(child: Text('No devices found'))
                : ListView.builder(
                    itemCount: _getFilteredResults().length,
                    itemBuilder: (context, index) {
                      final result = _getFilteredResults()[index];
                      final serviceUuids = result.advertisementData.serviceUuids;
                      final manufacturerData = result.advertisementData.manufacturerData;
                      final localName = result.advertisementData.advName;
                      
                      String deviceType = result.device.platformName.isNotEmpty 
                          ? result.device.platformName 
                          : (localName.isNotEmpty ? localName : 'Unknown Device');
                      
                      return Card(
                        margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        child: ListTile(
                          leading: Icon(
                            _getDeviceIcon(deviceType),
                            size: 40,
                            color: Colors.blue,
                          ),
                          title: Text(
                            deviceType,
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('MAC: ${result.device.remoteId}'),
                              if (result.advertisementData.connectable)
                                const Text('✓ Connectable', style: TextStyle(color: Colors.green)),
                              if (serviceUuids.isNotEmpty)
                                Text('Services: ${serviceUuids.length}'),
                              if (manufacturerData.isNotEmpty)
                                Text('Manufacturer ID: 0x${manufacturerData.keys.first.toRadixString(16)}'),
                              Text('Signal: ${result.rssi} dBm (${_getSignalStrength(result.rssi)})',
                                style: TextStyle(color: _getSignalColor(result.rssi))),
                            ],
                          ),
                          trailing: const Icon(Icons.arrow_forward_ios),
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) =>
                                    DeviceControlScreen(device: result.device),
                              ),
                            );
                          },
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
