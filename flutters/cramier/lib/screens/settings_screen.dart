import 'dart:io';
import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:share_plus/share_plus.dart';
import 'package:path_provider/path_provider.dart';
import '../services/database_helper.dart';
import '../services/shared_prefs_service.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final _dbHelper = DatabaseHelper();
  final _prefsService = SharedPrefsService();
  bool _darkMode = false;
  bool _shuffleEnabled = true;
  bool _isExporting = false;
  bool _isImporting = false;

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    final darkMode = await _prefsService.getDarkMode();
    final shuffle = await _prefsService.getShuffleEnabled();
    setState(() {
      _darkMode = darkMode;
      _shuffleEnabled = shuffle;
    });
  }

  Future<void> _exportAll() async {
    setState(() => _isExporting = true);
    try {
      final jsonData = await _dbHelper.exportAll();
      final dir = await getApplicationDocumentsDirectory();
      final file = File('${dir.path}/cramier_backup.json');
      await file.writeAsString(jsonData);
      await SharePlus.instance.share(
        ShareParams(
          files: [XFile(file.path)],
          text: 'Cramier Flashcard Backup',
        ),
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Export successful!')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Export failed: $e')),
        );
      }
    } finally {
      setState(() => _isExporting = false);
    }
  }

  Future<void> _import() async {
    setState(() => _isImporting = true);
    try {
      final result = await FilePicker.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['json'],
      );
      if (result != null && result.files.single.path != null) {
        final file = File(result.files.single.path!);
        final jsonData = await file.readAsString();
        await _dbHelper.importData(jsonData);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Import successful!')),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Import failed: $e')),
        );
      }
    } finally {
      setState(() => _isImporting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Appearance Section
          _buildSectionHeader('Appearance'),
          Card(
            child: SwitchListTile(
              title: const Text('Dark Mode'),
              subtitle: const Text('Toggle dark theme'),
              secondary: Icon(
                _darkMode ? Icons.dark_mode : Icons.light_mode,
                color: _darkMode ? Colors.amber : Colors.orange,
              ),
              value: _darkMode,
              onChanged: (value) async {
                await _prefsService.setDarkMode(value);
                setState(() => _darkMode = value);
                // The app will pick up the new theme on next launch
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                        value ? 'Dark mode enabled' : 'Light mode enabled',
                      ),
                      action: SnackBarAction(
                        label: 'Restart App',
                        onPressed: () {
                          // User can restart to see changes immediately
                        },
                      ),
                    ),
                  );
                }
              },
            ),
          ),
          const SizedBox(height: 24),

          // Study Section
          _buildSectionHeader('Study Preferences'),
          Card(
            child: SwitchListTile(
              title: const Text('Shuffle Cards'),
              subtitle: const Text('Randomize card order when studying'),
              secondary: const Icon(Icons.shuffle),
              value: _shuffleEnabled,
              onChanged: (value) async {
                await _prefsService.setShuffleEnabled(value);
                setState(() => _shuffleEnabled = value);
              },
            ),
          ),
          const SizedBox(height: 24),

          // Data Section
          _buildSectionHeader('Data Management'),
          Card(
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.file_upload_outlined),
                  title: const Text('Export All Data'),
                  subtitle: const Text('Save flashcards as JSON backup'),
                  trailing: _isExporting
                      ? const SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(Icons.chevron_right),
                  onTap: _isExporting ? null : _exportAll,
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.file_download_outlined),
                  title: const Text('Import Data'),
                  subtitle: const Text('Restore from JSON backup'),
                  trailing: _isImporting
                      ? const SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(Icons.chevron_right),
                  onTap: _isImporting ? null : _import,
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // About Section
          _buildSectionHeader('About'),
          Card(
            child: Column(
              children: [
                const ListTile(
                  leading: Icon(Icons.info_outline),
                  title: Text('Cramier'),
                  subtitle: Text('Version 1.0.0'),
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.auto_stories),
                  title: const Text('Features'),
                  subtitle: const Text(
                    'Flashcards • Decks • Categories\nSpaced Repetition • Statistics • Import/Export',
                  ),
                  isThreeLine: true,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 8),
      child: Text(
        title,
        style: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w600,
          color: Theme.of(context).colorScheme.primary,
          letterSpacing: 0.5,
        ),
      ),
    );
  }
}