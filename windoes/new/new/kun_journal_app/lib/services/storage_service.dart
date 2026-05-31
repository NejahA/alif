import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/journal_entry.dart';

class StorageService {
  static const String _entriesKey = 'journal_entries';

  Future<List<JournalEntry>> loadEntries() async {
    final prefs = await SharedPreferences.getInstance();
    final String? entriesJson = prefs.getString(_entriesKey);
    
    if (entriesJson == null) {
      return [];
    }

    final List<dynamic> decoded = json.decode(entriesJson);
    return decoded.map((e) => JournalEntry.fromJson(e)).toList();
  }

  Future<void> saveEntries(List<JournalEntry> entries) async {
    final prefs = await SharedPreferences.getInstance();
    final String encoded = json.encode(entries.map((e) => e.toJson()).toList());
    await prefs.setString(_entriesKey, encoded);
  }

  Future<void> addEntry(JournalEntry entry, List<JournalEntry> currentEntries) async {
    currentEntries.insert(0, entry);
    await saveEntries(currentEntries);
  }

  Future<void> updateEntry(JournalEntry entry, List<JournalEntry> currentEntries) async {
    final index = currentEntries.indexWhere((e) => e.id == entry.id);
    if (index != -1) {
      currentEntries[index] = entry;
      await saveEntries(currentEntries);
    }
  }

  Future<void> deleteEntry(String id, List<JournalEntry> currentEntries) async {
    currentEntries.removeWhere((e) => e.id == id);
    await saveEntries(currentEntries);
  }
}
