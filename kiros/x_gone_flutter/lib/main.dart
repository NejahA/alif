import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:animate_do/animate_do.dart';
import 'api_service.dart';
import 'models/transient_item.dart';

void main() {
  runApp(const XGoneApp());
}

class XGoneApp extends StatelessWidget {
  const XGoneApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'X-Gone // Ephemeral Workspace',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF08080A),
        textTheme: GoogleFonts.outfitTextTheme(ThemeData.dark().textTheme),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFFF43F5E),
          brightness: Brightness.dark,
          primary: const Color(0xFFF43F5E),
        ),
      ),
      home: const HomeScreen(),
    );
  }
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final ApiService _api = ApiService();
  final TextEditingController _inputController = TextEditingController();
  final TextEditingController _searchController = TextEditingController();

  List<TransientItem> _items = [];
  bool _isWiping = false;
  String _selectedType = 'note';
  int _selectedDuration = 300;
  String _filterType = 'all';
  String _searchQuery = '';
  final Set<String> _revealedSecrets = {};

  Timer? _pollTimer;
  Timer? _decayTimer;

  @override
  void initState() {
    super.initState();
    _refreshItems();
    _pollTimer = Timer.periodic(const Duration(seconds: 6), (_) => _refreshItems());
    _decayTimer = Timer.periodic(const Duration(seconds: 1), (_) => _tickItems());
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    _decayTimer?.cancel();
    _inputController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _refreshItems() async {
    final fetched = await _api.fetchItems();
    if (mounted) {
      setState(() {
        final existingMap = {for (var i in _items) i.id: i};
        _items = fetched.map((serverItem) {
          final existing = existingMap[serverItem.id];
          if (existing != null && (existing.life - serverItem.life).abs() < 3) {
            serverItem.life = existing.life;
            serverItem.vanishing = existing.vanishing;
          }
          return serverItem;
        }).toList();
      });
    }
  }

  void _tickItems() {
    if (mounted) {
      setState(() {
        final expiredIds = <String>[];
        for (var item in _items) {
          if (!item.vanishing) {
            if (item.life > 0) {
              item.life--;
            } else if (item.life == 0) {
              item.vanishing = true;
              expiredIds.add(item.id);
            }
          }
        }
        for (var id in expiredIds) {
          _api.deleteItem(id);
          Future.delayed(const Duration(milliseconds: 400), () {
            if (mounted) {
              setState(() {
                _items.removeWhere((item) => item.id == id);
              });
            }
          });
        }
      });
    }
  }

  Future<void> _addItem() async {
    final content = _inputController.text.trim();
    if (content.isEmpty) return;

    _inputController.clear();
    final newItem = await _api.addItem(
      content,
      type: _selectedType,
      durationSeconds: _selectedDuration,
    );
    if (newItem != null && mounted) {
      setState(() {
        _items.add(newItem);
      });
    }
  }

  Future<void> _deleteItem(String id) async {
    final index = _items.indexWhere((item) => item.id == id);
    if (index != -1 && mounted) {
      setState(() {
        _items[index].vanishing = true;
      });
      await Future.delayed(const Duration(milliseconds: 350));
      if (mounted) {
        setState(() {
          _items.removeWhere((item) => item.id == id);
          _revealedSecrets.remove(id);
        });
      }
      await _api.deleteItem(id);
    }
  }

  Future<void> _toggleTask(String id) async {
    final index = _items.indexWhere((item) => item.id == id);
    if (index != -1 && mounted) {
      setState(() {
        _items[index].isCompleted = !_items[index].isCompleted;
      });
      await _api.toggleTask(id, _items[index].isCompleted);
    }
  }

  Future<void> _wipeAll() async {
    setState(() => _isWiping = true);
    await _api.massWipe();
    await Future.delayed(const Duration(milliseconds: 1000));
    if (mounted) {
      setState(() {
        _items.clear();
        _revealedSecrets.clear();
        _isWiping = false;
      });
    }
  }

  List<TransientItem> get _filteredItems {
    return _items.where((item) {
      final matchesType = _filterType == 'all' || item.type == _filterType;
      final matchesSearch = _searchQuery.isEmpty ||
          item.content.toLowerCase().contains(_searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    }).toList();
  }

  int get _expiringSoonCount {
    return _items.where((i) => i.life > 0 && i.life <= 60).length;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Background ambient gradient
          Positioned.fill(
            child: Container(
              decoration: const BoxDecoration(
                gradient: RadialGradient(
                  center: Alignment(0, -0.8),
                  radius: 1.2,
                  colors: [
                    Color(0x1AF43F5E),
                    Color(0xFF08080A),
                  ],
                ),
              ),
            ),
          ),

          SafeArea(
            child: Column(
              children: [
                _buildHeader(),
                _buildSubToolbar(),
                const SizedBox(height: 8),
                Expanded(child: _buildGrid()),
              ],
            ),
          ),

          if (_isWiping) _buildWipeOverlay(),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: Image.asset(
                      "assets/images/logo.png",
                      width: 38,
                      height: 38,
                      fit: BoxFit.cover,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Text(
                    "X-GONE",
                    style: GoogleFonts.outfit(
                      fontSize: 26,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 4,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
              Row(
                children: [
                  if (_expiringSoonCount > 0)
                    Container(
                      margin: const EdgeInsets.only(right: 8),
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.red.withValues(alpha: 0.15),
                        border: Border.all(color: Colors.redAccent.withValues(alpha: 0.4)),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        "⚡ $_expiringSoonCount expiring",
                        style: const TextStyle(fontSize: 11, color: Colors.redAccent),
                      ),
                    ),
                  IconButton(
                    onPressed: _wipeAll,
                    icon: const Icon(Icons.delete_sweep_rounded, color: Color(0xFFF43F5E)),
                    tooltip: "Mass Wipe",
                    style: IconButton.styleFrom(
                      backgroundColor: const Color(0xFFF43F5E).withValues(alpha: 0.1),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Main Input with Type & Duration
          Row(
            children: [
              // Type Dropdown Button
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.05),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: _selectedType,
                    dropdownColor: const Color(0xFF141418),
                    style: GoogleFonts.outfit(color: Colors.white, fontSize: 13),
                    items: const [
                      DropdownMenuItem(value: "note", child: Text("📝 Note")),
                      DropdownMenuItem(value: "task", child: Text("✅ Task")),
                      DropdownMenuItem(value: "secret", child: Text("🔐 Secret")),
                      DropdownMenuItem(value: "code", child: Text("💻 Code")),
                    ],
                    onChanged: (val) {
                      if (val != null) setState(() => _selectedType = val);
                    },
                  ),
                ),
              ),
              const SizedBox(width: 8),

              // Duration Dropdown
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.05),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<int>(
                    value: _selectedDuration,
                    dropdownColor: const Color(0xFF141418),
                    style: GoogleFonts.outfit(color: Colors.white70, fontSize: 12),
                    items: const [
                      DropdownMenuItem(value: 60, child: Text("⚡ 1m")),
                      DropdownMenuItem(value: 300, child: Text("⏱️ 5m")),
                      DropdownMenuItem(value: 900, child: Text("☕ 15m")),
                      DropdownMenuItem(value: 3600, child: Text("🌙 1h")),
                      DropdownMenuItem(value: 86400, child: Text("🔒 24h")),
                    ],
                    onChanged: (val) {
                      if (val != null) setState(() => _selectedDuration = val);
                    },
                  ),
                ),
              ),
              const SizedBox(width: 8),

              // Text Field
              Expanded(
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.05),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
                  ),
                  child: TextField(
                    controller: _inputController,
                    onSubmitted: (_) => _addItem(),
                    style: const TextStyle(fontSize: 14),
                    decoration: InputDecoration(
                      hintText: _selectedType == "task"
                          ? "Enter task..."
                          : _selectedType == "secret"
                              ? "Enter secret thought..."
                              : _selectedType == "code"
                                  ? "Paste code snippet..."
                                  : "Inject thought...",
                      hintStyle: TextStyle(color: Colors.white.withValues(alpha: 0.3)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      border: InputBorder.none,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),

              // Submit Button
              IconButton.filled(
                onPressed: _addItem,
                icon: const Icon(Icons.add, size: 20),
                style: IconButton.styleFrom(
                  backgroundColor: const Color(0xFFF43F5E),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSubToolbar() {
    final types = ["all", "note", "task", "secret", "code"];

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Row(
        children: [
          // Filter Chips
          Expanded(
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: types.map((t) {
                  final isSelected = _filterType == t;
                  return Padding(
                    padding: const EdgeInsets.only(right: 6),
                    child: ChoiceChip(
                      label: Text(
                        t == "all" ? "All" : t,
                        style: TextStyle(
                          fontSize: 11,
                          color: isSelected ? Colors.white : Colors.white60,
                        ),
                      ),
                      selected: isSelected,
                      selectedColor: const Color(0xFFF43F5E).withValues(alpha: 0.25),
                      backgroundColor: Colors.white.withValues(alpha: 0.04),
                      side: BorderSide(
                        color: isSelected
                            ? const Color(0xFFF43F5E)
                            : Colors.white.withValues(alpha: 0.08),
                      ),
                      onSelected: (_) => setState(() => _filterType = t),
                    ),
                  );
                }).toList(),
              ),
            ),
          ),
          const SizedBox(width: 8),

          // Search Box
          SizedBox(
            width: 140,
            height: 34,
            child: TextField(
              controller: _searchController,
              onChanged: (val) => setState(() => _searchQuery = val),
              style: const TextStyle(fontSize: 12),
              decoration: InputDecoration(
                hintText: "Search...",
                hintStyle: TextStyle(fontSize: 12, color: Colors.white.withValues(alpha: 0.3)),
                prefixIcon: const Icon(Icons.search, size: 14, color: Colors.white38),
                filled: true,
                fillColor: Colors.white.withValues(alpha: 0.04),
                contentPadding: const EdgeInsets.symmetric(vertical: 0),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(20),
                  borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.08)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(20),
                  borderSide: BorderSide(color: Colors.white.withValues(alpha: 0.08)),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGrid() {
    final filtered = _filteredItems;

    if (filtered.isEmpty) {
      return Center(
        child: Opacity(
          opacity: 0.35,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.hourglass_empty_rounded, size: 48),
              const SizedBox(height: 12),
              Text(
                "The void is silent...",
                style: GoogleFonts.outfit(fontSize: 18, letterSpacing: 1),
              ),
            ],
          ),
        ),
      );
    }

    return LayoutBuilder(
      builder: (context, constraints) {
        final crossAxisCount = constraints.maxWidth > 800 ? 3 : (constraints.maxWidth > 500 ? 2 : 1);
        return GridView.builder(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: crossAxisCount,
            mainAxisSpacing: 14,
            crossAxisSpacing: 14,
            childAspectRatio: 1.4,
          ),
          itemCount: filtered.length,
          itemBuilder: (context, index) {
            final item = filtered[index];
            return NoteCard(
              key: ValueKey(item.id),
              item: item,
              isRevealed: _revealedSecrets.contains(item.id),
              onRevealSecret: () {
                setState(() {
                  if (_revealedSecrets.contains(item.id)) {
                    _revealedSecrets.remove(item.id);
                  } else {
                    _revealedSecrets.add(item.id);
                  }
                });
              },
              onToggleTask: () => _toggleTask(item.id),
              onDelete: () => _deleteItem(item.id),
            );
          },
        );
      },
    );
  }

  Widget _buildWipeOverlay() {
    return Container(
      color: Colors.black.withValues(alpha: 0.94),
      width: double.infinity,
      height: double.infinity,
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Flash(
              child: ClipRRect(
                borderRadius: BorderRadius.circular(20),
                child: Image.asset(
                  "assets/images/logo.png",
                  width: 90,
                  height: 90,
                  fit: BoxFit.cover,
                ),
              ),
            ),
            const SizedBox(height: 16),
            Flash(
              child: Text(
                "X-GONE",
                style: GoogleFonts.outfit(
                  fontSize: 56,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 8,
                  color: Colors.white,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class NoteCard extends StatelessWidget {
  final TransientItem item;
  final bool isRevealed;
  final VoidCallback onRevealSecret;
  final VoidCallback onToggleTask;
  final VoidCallback onDelete;

  const NoteCard({
    super.key,
    required this.item,
    required this.isRevealed,
    required this.onRevealSecret,
    required this.onToggleTask,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final double totalSecs = item.totalDuration.toDouble();
    final double progress = (item.life / (totalSecs > 0 ? totalSecs : 300.0)).clamp(0.0, 1.0);
    final isCritical = item.life <= 30;

    return FadeInUp(
      duration: const Duration(milliseconds: 300),
      child: AnimatedScale(
        scale: item.vanishing ? 1.15 : 1.0,
        duration: const Duration(milliseconds: 300),
        child: AnimatedOpacity(
          opacity: item.vanishing ? 0.0 : 1.0,
          duration: const Duration(milliseconds: 300),
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.035),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: item.type == 'code'
                    ? Colors.indigo.withValues(alpha: 0.3)
                    : Colors.white.withValues(alpha: 0.08),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Card Header
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          item.type == 'task'
                              ? Icons.check_circle_outline
                              : item.type == 'secret'
                                  ? Icons.lock_outline
                                  : item.type == 'code'
                                      ? Icons.code
                                      : Icons.description_outlined,
                          size: 14,
                          color: const Color(0xFFF43F5E),
                        ),
                        const SizedBox(width: 5),
                        Text(
                          item.type.toUpperCase(),
                          style: TextStyle(
                            fontSize: 10,
                            letterSpacing: 1,
                            fontWeight: FontWeight.w600,
                            color: Colors.white.withValues(alpha: 0.5),
                          ),
                        ),
                      ],
                    ),
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // Copy Button
                        IconButton(
                          icon: const Icon(Icons.copy_rounded, size: 15),
                          color: Colors.white54,
                          splashRadius: 14,
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(minWidth: 26, minHeight: 26),
                          tooltip: "Copy",
                          onPressed: () {
                            Clipboard.setData(ClipboardData(text: item.content));
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text("Copied to clipboard"),
                                duration: Duration(milliseconds: 800),
                              ),
                            );
                          },
                        ),
                        // Secret Peek Eye
                        if (item.type == 'secret')
                          IconButton(
                            icon: Icon(
                              isRevealed ? Icons.visibility_off : Icons.visibility,
                              size: 15,
                            ),
                            color: Colors.white54,
                            splashRadius: 14,
                            padding: EdgeInsets.zero,
                            constraints: const BoxConstraints(minWidth: 26, minHeight: 26),
                            tooltip: isRevealed ? "Hide" : "Reveal",
                            onPressed: onRevealSecret,
                          ),
                        // Delete Button
                        IconButton(
                          icon: const Icon(Icons.close, size: 15),
                          color: Colors.redAccent.withValues(alpha: 0.7),
                          splashRadius: 14,
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(minWidth: 26, minHeight: 26),
                          tooltip: "Vanish now",
                          onPressed: onDelete,
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 8),

                // Card Body
                Expanded(
                  child: item.type == 'task'
                      ? InkWell(
                          onTap: onToggleTask,
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Icon(
                                item.isCompleted ? Icons.check_box : Icons.check_box_outline_blank,
                                size: 18,
                                color: item.isCompleted ? Colors.greenAccent : Colors.white38,
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  item.content,
                                  style: TextStyle(
                                    fontSize: 14,
                                    height: 1.4,
                                    decoration: item.isCompleted
                                        ? TextDecoration.lineThrough
                                        : null,
                                    color: item.isCompleted
                                        ? Colors.white38
                                        : Colors.white.withValues(alpha: 0.9),
                                  ),
                                  maxLines: 3,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                        )
                      : item.type == 'secret' && !isRevealed
                          ? InkWell(
                              onTap: onRevealSecret,
                              child: Container(
                                width: double.infinity,
                                padding: const EdgeInsets.symmetric(vertical: 8),
                                alignment: Alignment.center,
                                decoration: BoxDecoration(
                                  color: Colors.red.withValues(alpha: 0.05),
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: Colors.red.withValues(alpha: 0.2)),
                                ),
                                child: const Text(
                                  "•••••••••••• (Tap to peek)",
                                  style: TextStyle(color: Color(0xFFF43F5E), fontSize: 13),
                                ),
                              ),
                            )
                          : item.type == 'code'
                              ? Container(
                                  width: double.infinity,
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: Colors.black.withValues(alpha: 0.5),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(
                                    item.content,
                                    style: GoogleFonts.jetBrainsMono(
                                      fontSize: 12,
                                      color: const Color(0xFFA5B4FC),
                                    ),
                                    maxLines: 4,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                )
                              : Text(
                                  item.content,
                                  style: TextStyle(
                                    fontSize: 14,
                                    height: 1.4,
                                    color: Colors.white.withValues(alpha: 0.9),
                                  ),
                                  maxLines: 4,
                                  overflow: TextOverflow.ellipsis,
                                ),
                ),
                const SizedBox(height: 8),

                // Card Footer Progress & Time
                Row(
                  children: [
                    Expanded(
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(2),
                        child: LinearProgressIndicator(
                          value: progress,
                          backgroundColor: Colors.white.withValues(alpha: 0.05),
                          valueColor: AlwaysStoppedAnimation<Color>(
                            isCritical
                                ? Colors.redAccent
                                : const Color(0xFFF43F5E).withValues(alpha: 0.8),
                          ),
                          minHeight: 2,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      "${(item.life ~/ 60)}:${(item.life % 60).toString().padLeft(2, '0')}",
                      style: GoogleFonts.jetBrainsMono(
                        fontSize: 10,
                        color: Colors.white.withValues(alpha: 0.4),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
