import 'dart:io';
import 'package:flutter/material.dart';
import 'package:battery_plus/battery_plus.dart';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

class SystemStatsScreen extends StatefulWidget {
  const SystemStatsScreen({super.key});

  @override
  State<SystemStatsScreen> createState() => _SystemStatsScreenState();
}

class _SystemStatsScreenState extends State<SystemStatsScreen> {
  final Battery _battery = Battery();
  final DeviceInfoPlugin _deviceInfo = DeviceInfoPlugin();
  
  int _batteryLevel = 0;
  BatteryState _batteryState = BatteryState.unknown;
  AndroidDeviceInfo? _androidInfo;

  @override
  void initState() {
    super.initState();
    _loadStats();
    _battery.onBatteryStateChanged.listen((state) {
      if (mounted) setState(() => _batteryState = state);
    });
  }

  Future<void> _loadStats() async {
    final level = await _battery.batteryLevel;
    if (mounted) {
      setState(() => _batteryLevel = level);
    }
    
    if (Platform.isAndroid) {
      final info = await _deviceInfo.androidInfo;
      if (mounted) {
        setState(() => _androidInfo = info);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('System Analyzer'),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            _buildBatteryCard(),
            const SizedBox(height: 24),
            if (_androidInfo != null) _buildDeviceInfoCard(),
          ],
        ),
      ),
    );
  }

  Widget _buildBatteryCard() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Column(
        children: [
          Icon(
            _batteryState == BatteryState.charging ? LucideIcons.batteryCharging : LucideIcons.battery,
            size: 48,
            color: _batteryLevel > 20 ? Colors.greenAccent : Colors.redAccent,
          ),
          const SizedBox(height: 16),
          Text(
            '$_batteryLevel%',
            style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
          ),
          Text(
            _batteryState.name.toUpperCase(),
            style: const TextStyle(color: Colors.white38, letterSpacing: 1),
          ),
        ],
      ),
    );
  }

  Widget _buildDeviceInfoCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(28),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Device Info', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          _infoRow('Model', _androidInfo!.model),
          _infoRow('Manufacturer', _androidInfo!.manufacturer),
          _infoRow('Android Version', _androidInfo!.version.release),
          _infoRow('SDK', _androidInfo!.version.sdkInt.toString()),
          _infoRow('Hardware', _androidInfo!.hardware),
        ],
      ),
    );
  }

  Widget _infoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.white54)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}
