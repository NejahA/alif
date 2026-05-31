import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'screens/home_screen.dart';
import 'services/database_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  try {
    final dbService = DatabaseService();
    await dbService.initialize();
    
    final notesProvider = NotesProvider(dbService);
    
    // Set up auto-sync callback
    dbService.onSyncComplete = () {
      notesProvider.loadNotes();
    };
    
    runApp(
      ChangeNotifierProvider.value(
        value: notesProvider,
        child: const NexusApp(),
      ),
    );
  } catch (e) {
    print('Error initializing app: $e');
    runApp(
      MaterialApp(
        home: Scaffold(
          body: Center(
            child: Text('Error: $e'),
          ),
        ),
      ),
    );
  }
}

class NexusApp extends StatelessWidget {
  const NexusApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Nexus',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        colorScheme: ColorScheme.dark(
          primary: const Color(0xFF7c3aed),
          secondary: const Color(0xFFa78bfa),
          surface: const Color(0xFF1a1625),
          background: const Color(0xFF0f0a1a),
          onPrimary: Colors.white,
          onSecondary: Colors.white,
          onSurface: const Color(0xFFe9d5ff),
          onBackground: const Color(0xFFe9d5ff),
        ),
        scaffoldBackgroundColor: const Color(0xFF0f0a1a),
        cardColor: const Color(0xFF2d2438),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF2d2438),
          elevation: 0,
        ),
      ),
      home: const HomeScreen(),
    );
  }
}

class NotesProvider extends ChangeNotifier {
  final DatabaseService _db;
  List<Note> _notes = [];
  Note? _currentNote;

  NotesProvider(this._db) {
    loadNotes();
  }

  List<Note> get notes => _notes;
  Note? get currentNote => _currentNote;

  Future<void> loadNotes() async {
    try {
      _notes = await _db.getAllNotes();
      print('Loaded ${_notes.length} notes');
      notifyListeners();
    } catch (e) {
      print('Error loading notes: $e');
    }
  }

  Future<void> saveNote(Note note) async {
    try {
      await _db.saveNote(note);
      await loadNotes();
      notifyListeners();
    } catch (e) {
      print('Error saving note: $e');
    }
  }

  Future<void> deleteNote(int id) async {
    try {
      await _db.deleteNote(id);
      _currentNote = null;
      await loadNotes();
      notifyListeners();
    } catch (e) {
      print('Error deleting note: $e');
    }
  }

  void setCurrentNote(Note? note) {
    _currentNote = note;
    notifyListeners();
  }

  Future<List<Note>> search(String query) async {
    try {
      return await _db.search(query);
    } catch (e) {
      print('Error searching: $e');
      return [];
    }
  }

  Future<GraphData> getGraphData() async {
    try {
      return await _db.getGraphData();
    } catch (e) {
      print('Error getting graph data: $e');
      return GraphData(nodes: [], links: []);
    }
  }

  Future<void> createLink(int sourceId, int targetId) async {
    try {
      await _db.createLink(sourceId, targetId);
      notifyListeners();
    } catch (e) {
      print('Error creating link: $e');
    }
  }

  Future<void> deleteLink(int sourceId, int targetId) async {
    try {
      await _db.deleteLink(sourceId, targetId);
      notifyListeners();
    } catch (e) {
      print('Error deleting link: $e');
    }
  }

  Future<List<Link>> getAllLinks() async {
    try {
      return await _db.getAllLinks();
    } catch (e) {
      print('Error getting links: $e');
      return [];
    }
  }

  Future<void> syncFromMongoDB() async {
    try {
      await _db.syncFromMongoDB();
      await loadNotes();
    } catch (e) {
      print('Error syncing from MongoDB: $e');
      rethrow;
    }
  }
}
