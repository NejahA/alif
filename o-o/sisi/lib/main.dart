import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:provider/provider.dart';

// --- Models ---
class Throne {
  final String id;
  String name;
  String type;
  String material;
  String description;
  String image;
  String royalty;
  int powerLevel;
  String proclamation;
  bool isCursed;
  String era;

  Throne({
    required this.id,
    required this.name,   
    required this.type,
    required this.material,
    required this.description,
    required this.image,
    required this.royalty,
    required this.powerLevel,
    required this.proclamation,
    this.isCursed = false,
    this.era = 'Unknown Era',
  });

  factory Throne.fromJson(Map<String, dynamic> json) {
    return Throne(
      id: json['_id'] ?? '',
      name: json['name'] ?? '',
      type: json['type'] ?? '',
      material: json['material'] ?? '',
      description: json['description'] ?? '',
      image: json['image'] ?? '',
      royalty: json['royalty'] ?? '',
      powerLevel: json['powerLevel'] ?? 50,
      proclamation: json['proclamation'] ?? "Long live the King!",
      isCursed: json['isCursed'] ?? false,
      era: json['era'] ?? 'Unknown Era',
    );
  }

  Map<String, dynamic> toJson() => {
    'name': name,
    'type': type,
    'material': material,
    'description': description,
    'image': image,
    'royalty': royalty,
    'powerLevel': powerLevel,
    'proclamation': proclamation,
    'isCursed': isCursed,
    'era': era,
  };
}

// --- Provider ---
class ThroneProvider with ChangeNotifier {
  List<Throne> _thrones = [];
  bool _isLoading = false;
  String _searchQuery = '';
  bool _isDarkMode = true;
  bool _sortByPower = false;
  bool _showCursedOnly = false;

  bool get isDarkMode => _isDarkMode;
  bool get sortByPower => _sortByPower;
  bool get showCursedOnly => _showCursedOnly;

  void toggleTheme() {
    _isDarkMode = !_isDarkMode;
    notifyListeners();
  }

  void toggleSort() {
    _sortByPower = !_sortByPower;
    notifyListeners();
  }

  void toggleCursedFilter() {
    _showCursedOnly = !_showCursedOnly;
    notifyListeners();
  }

  List<Throne> get thrones {
    List<Throne> result = List.from(_thrones);
    if (_searchQuery.isNotEmpty) {
      result = result.where((t) => t.name.toLowerCase().contains(_searchQuery.toLowerCase()) || t.type.toLowerCase().contains(_searchQuery.toLowerCase())).toList();
    }
    if (_showCursedOnly) {
      result = result.where((t) => t.isCursed).toList();
    }
    if (_sortByPower) {
      result.sort((a, b) => b.powerLevel.compareTo(a.powerLevel));
    }
    return result;
  }
  
  bool get isLoading => _isLoading;

  void updateSearchQuery(String query) {
    _searchQuery = query;
    notifyListeners();
  }

  final String baseUrl = 'https://sackend-ixoc.onrender.com/api/thrones';

  Future<void> fetchThrones() async {
    _isLoading = true;
    notifyListeners();
    try {
      final response = await http.get(Uri.parse(baseUrl));
      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        _thrones = data.map((item) => Throne.fromJson(item)).toList();
      }
    } catch (e) {
      debugPrint('Fetch Error: $e');
    }
    _isLoading = false;
    notifyListeners();
  }

  Future<void> updateThrone(Throne throne) async {
    try {
      final response = await http.put(
        Uri.parse('$baseUrl/${throne.id}'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(throne.toJson()),
      );
      if (response.statusCode == 200) {
        final index = _thrones.indexWhere((t) => t.id == throne.id);
        if (index != -1) {
          _thrones[index] = throne;
          notifyListeners();
        }
      }
    } catch (e) {
      debugPrint('Update Error: $e');
    }
  }

  Future<void> addThrone(Throne throne) async {
    try {
      final response = await http.post(
        Uri.parse(baseUrl),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(throne.toJson()),
      );
      if (response.statusCode == 201) {
        _thrones.add(Throne.fromJson(json.decode(response.body)));
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Add Error: $e');
    }
  }

  Future<void> deleteThrone(String id) async {
    try {
      final response = await http.delete(Uri.parse('$baseUrl/$id'));
      if (response.statusCode == 204) {
        _thrones.removeWhere((t) => t.id == id);
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Delete Error: $e');
    }
  }
}

// --- Main App ---
void main() {
  runApp(
    ChangeNotifierProvider(
      create: (_) => ThroneProvider()..fetchThrones(),
      child: const SisiApp(),
    ),
  );
}

class SisiApp extends StatelessWidget {
  const SisiApp({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Provider.of<ThroneProvider>(context).isDarkMode;
    return MaterialApp(
      title: 'Sisi - Royal Forge',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: isDark ? Brightness.dark : Brightness.light,
        primaryColor: const Color(0xFFD4AF37),
        scaffoldBackgroundColor: isDark ? const Color(0xFF050505) : const Color(0xFFF5F5F5),
        cardColor: isDark ? const Color(0xFF111111) : Colors.white,
        fontFamily: 'Georgia',
        textTheme: TextTheme(
          displayLarge: const TextStyle(color: Color(0xFFD4AF37), fontSize: 32, fontWeight: FontWeight.bold, letterSpacing: 4),
          bodyLarge: TextStyle(color: isDark ? Colors.white70 : Colors.black87),
          bodyMedium: TextStyle(color: isDark ? Colors.white54 : Colors.black54),
        ),
      ),
      home: const ThroneSelectionPage(),
    );
  }
}

class ThroneSelectionPage extends StatefulWidget {
  const ThroneSelectionPage({super.key});

  @override
  State<ThroneSelectionPage> createState() => _ThroneSelectionPageState();
}

class _ThroneSelectionPageState extends State<ThroneSelectionPage> with SingleTickerProviderStateMixin {
  Throne? _selectedThrone;
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(seconds: 2))..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _showEditDialog(BuildContext context, Throne throne) {
    final nameCtrl = TextEditingController(text: throne.name);
    final descCtrl = TextEditingController(text: throne.description);
    final procCtrl = TextEditingController(text: throne.proclamation);
    final eraCtrl = TextEditingController(text: throne.era);
    double power = throne.powerLevel.toDouble();
    bool isCursed = throne.isCursed;

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: Theme.of(context).cardColor,
        title: const Text('Edit Royal Decree', style: TextStyle(color: Color(0xFFD4AF37))),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: nameCtrl, decoration: const InputDecoration(labelText: 'Throne Name')),
              TextField(controller: descCtrl, decoration: const InputDecoration(labelText: 'Description'), maxLines: 3),
              TextField(controller: procCtrl, decoration: const InputDecoration(labelText: 'Proclamation')),
              TextField(controller: eraCtrl, decoration: const InputDecoration(labelText: 'Era')),
              const SizedBox(height: 20),
              const Text('Power Level'),
              StatefulBuilder(builder: (context, setDialogState) {
                return Column(
                  children: [
                    Slider(
                      value: power,
                      min: 0,
                      max: 100,
                      activeColor: const Color(0xFFD4AF37),
                      onChanged: (v) => setDialogState(() => power = v),
                    ),
                    CheckboxListTile(
                      title: const Text('Is Cursed?'),
                      activeColor: const Color(0xFFD4AF37),
                      value: isCursed,
                      onChanged: (v) => setDialogState(() => isCursed = v ?? false),
                    ),
                  ],
                );
              }),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFD4AF37)),
            onPressed: () {
              throne.name = nameCtrl.text;
              throne.description = descCtrl.text;
              throne.proclamation = procCtrl.text;
              throne.era = eraCtrl.text;
              throne.powerLevel = power.toInt();
              throne.isCursed = isCursed;
              Provider.of<ThroneProvider>(context, listen: false).updateThrone(throne);
              Navigator.pop(ctx);
            },
            child: const Text('Save Proclamation', style: TextStyle(color: Colors.black)),
          ),
        ],
      ),
    );
  }

  void _showAddDialog(BuildContext context) {
    final nameCtrl = TextEditingController();
    final typeCtrl = TextEditingController(text: 'Ethereal Seat');
    final materialCtrl = TextEditingController(text: 'Stardust');
    final descCtrl = TextEditingController();
    final imageCtrl = TextEditingController(text: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&auto=format&fit=crop');
    final royaltyCtrl = TextEditingController(text: 'Divine');
    final procCtrl = TextEditingController();
    final eraCtrl = TextEditingController();
    double power = 50;
    bool isCursed = false;

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: Theme.of(context).cardColor,
        title: const Text('Forge New Throne', style: TextStyle(color: Color(0xFFD4AF37))),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: nameCtrl, decoration: const InputDecoration(labelText: 'Throne Name')),
              TextField(controller: typeCtrl, decoration: const InputDecoration(labelText: 'Type (e.g. Iron, Crystal)')),
              TextField(controller: materialCtrl, decoration: const InputDecoration(labelText: 'Material')),
              TextField(controller: descCtrl, decoration: const InputDecoration(labelText: 'Description'), maxLines: 2),
              TextField(controller: imageCtrl, decoration: const InputDecoration(labelText: 'Image URL')),
              TextField(controller: royaltyCtrl, decoration: const InputDecoration(labelText: 'Royalty')),
              TextField(controller: procCtrl, decoration: const InputDecoration(labelText: 'Proclamation')),
              TextField(controller: eraCtrl, decoration: const InputDecoration(labelText: 'Era')),
              const SizedBox(height: 20),
              const Text('Power Level'),
              StatefulBuilder(builder: (context, setDialogState) {
                return Column(
                  children: [
                    Slider(
                      value: power,
                      min: 0,
                      max: 100,
                      activeColor: const Color(0xFFD4AF37),
                      onChanged: (v) => setDialogState(() => power = v),
                    ),
                    CheckboxListTile(
                      title: const Text('Is Cursed?'),
                      activeColor: const Color(0xFFD4AF37),
                      value: isCursed,
                      onChanged: (v) => setDialogState(() => isCursed = v ?? false),
                    ),
                  ],
                );
              }),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFD4AF37)),
            onPressed: () {
              final newT = Throne(
                id: '',
                name: nameCtrl.text.isNotEmpty ? nameCtrl.text : 'Unnamed Throne',
                type: typeCtrl.text,
                material: materialCtrl.text,
                description: descCtrl.text,
                image: imageCtrl.text.isNotEmpty ? imageCtrl.text : 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&auto=format&fit=crop',
                royalty: royaltyCtrl.text,
                powerLevel: power.toInt(),
                proclamation: procCtrl.text,
                isCursed: isCursed,
                era: eraCtrl.text.isNotEmpty ? eraCtrl.text : 'Unknown Era',
              );
              Provider.of<ThroneProvider>(context, listen: false).addThrone(newT);
              Navigator.pop(ctx);
            },
            child: const Text('Forge', style: TextStyle(color: Colors.black)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<ThroneProvider>(context);
    final thrones = provider.thrones;
    if (_selectedThrone == null && thrones.isNotEmpty) {
      _selectedThrone = thrones[0];
    }

    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Row(
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Sisi', style: Theme.of(context).textTheme.displayLarge),
                const Text('CHAIRS & THRONES | FORGE MODE', style: TextStyle(color: Colors.grey, fontSize: 8, letterSpacing: 2)),
              ],
            ),
            const SizedBox(width: 40),
            Expanded(
              child: TextField(
                decoration: InputDecoration(
                  hintText: 'Search thrones...',
                  hintStyle: const TextStyle(color: Colors.white38),
                  prefixIcon: const Icon(Icons.search, color: Color(0xFFD4AF37)),
                  filled: true,
                  fillColor: Colors.white10,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(30), borderSide: BorderSide.none),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 0),
                ),
                onChanged: (val) => provider.updateSearchQuery(val),
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: Icon(provider.showCursedOnly ? Icons.warning : Icons.warning_amber_rounded, color: provider.showCursedOnly ? Colors.redAccent : const Color(0xFFD4AF37)),
            tooltip: 'Filter Cursed',
            onPressed: () => provider.toggleCursedFilter(),
          ),
          IconButton(
            icon: Icon(provider.sortByPower ? Icons.sort : Icons.sort_by_alpha, color: const Color(0xFFD4AF37)),
            tooltip: 'Sort by Power',
            onPressed: () => provider.toggleSort(),
          ),
          IconButton(
            icon: Icon(provider.isDarkMode ? Icons.light_mode : Icons.dark_mode, color: const Color(0xFFD4AF37)),
            tooltip: 'Toggle Theme',
            onPressed: () => provider.toggleTheme(),
          ),
          IconButton(
            icon: const Icon(Icons.add_circle_outline, color: Color(0xFFD4AF37)),
            tooltip: 'Forge New Throne',
            onPressed: () => _showAddDialog(context),
          )
        ],
      ),
      body: provider.isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFFD4AF37)))
          : Stack(
              children: [
                // Animated background particles simulated via Shader/CustomPaint could go here
                Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: Column(
                    children: [
                      if (_selectedThrone != null)
                        Expanded(
                          flex: 4,
                          child: Container(
                            decoration: BoxDecoration(
                              color: Theme.of(context).cardColor,
                              borderRadius: BorderRadius.circular(30),
                              border: Border.all(color: const Color(0xFFD4AF37).withOpacity(0.4)),
                              boxShadow: [
                                BoxShadow(color: const Color(0xFFD4AF37).withOpacity(0.1), blurRadius: 40),
                              ],
                            ),
                            clipBehavior: Clip.antiAlias,
                            child: Column(
                              children: [
                                Expanded(
                                  flex: 6,
                                  child: Stack(
                                    fit: StackFit.expand,
                                    children: [
                                      Image.network(_selectedThrone!.image, fit: BoxFit.cover),
                                      Positioned(
                                        bottom: 20,
                                        right: 20,
                                        child: Column(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            FloatingActionButton(
                                              mini: true,
                                              heroTag: 'delete',
                                              backgroundColor: Colors.redAccent.withOpacity(0.8),
                                              onPressed: () {
                                                Provider.of<ThroneProvider>(context, listen: false).deleteThrone(_selectedThrone!.id);
                                                setState(() {
                                                  _selectedThrone = null;
                                                });
                                              },
                                              child: const Icon(Icons.delete, color: Colors.white),
                                            ),
                                            const SizedBox(height: 10),
                                            FloatingActionButton(
                                              heroTag: 'edit',
                                              backgroundColor: const Color(0xFFD4AF37),
                                              onPressed: () => _showEditDialog(context, _selectedThrone!),
                                              child: const Icon(Icons.edit, color: Colors.black),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                Expanded(
                                  flex: 4,
                                  child: Padding(
                                    padding: const EdgeInsets.all(20),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                          children: [
                                          Text(_selectedThrone!.name, style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Color(0xFFD4AF37))),
                                            Text('POWER: ${_selectedThrone!.powerLevel}%', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Theme.of(context).textTheme.bodyLarge?.color)),
                                          ],
                                        ),
                                        const SizedBox(height: 5),
                                        Row(
                                          children: [
                                            Text('${_selectedThrone!.type} | ${_selectedThrone!.material} | ${_selectedThrone!.era}', style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontSize: 14)),
                                            if (_selectedThrone!.isCursed)
                                              const Padding(
                                                padding: EdgeInsets.only(left: 8.0),
                                                child: Text('💀', style: TextStyle(fontSize: 16)),
                                              ),
                                          ],
                                        ),
                                        const Divider(color: Color(0xFFD4AF37), height: 30),
                                        Text(_selectedThrone!.description, style: Theme.of(context).textTheme.bodyLarge?.copyWith(fontSize: 16, height: 1.4)),
                                        const Spacer(),
                                        Text('📜 PROCLAMATION: "${_selectedThrone!.proclamation}"', style: const TextStyle(fontStyle: FontStyle.italic, color: Color(0xFFD4AF37))),
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      const SizedBox(height: 20),
                      SizedBox(
                        height: 140,
                        child: ListView.builder(
                          scrollDirection: Axis.horizontal,
                          itemCount: thrones.length,
                          itemBuilder: (context, index) {
                            final t = thrones[index];
                            final active = _selectedThrone?.id == t.id;
                            return GestureDetector(
                              onTap: () => setState(() => _selectedThrone = t),
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 300),
                                width: 110,
                                margin: const EdgeInsets.only(right: 15),
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(15),
                                  border: Border.all(color: active ? const Color(0xFFD4AF37) : Colors.transparent, width: 2),
                                ),
                                clipBehavior: Clip.antiAlias,
                                child: Image.network(t.image, fit: BoxFit.cover),
                              ),
                            );
                          },
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

