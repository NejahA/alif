import 'dart:async';
import 'package:flutter/material.dart';
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
      title: 'X_Gone',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0A0A0A),
        textTheme: GoogleFonts.outfitTextTheme(ThemeData.dark().textTheme),
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.redAccent,
          brightness: Brightness.dark,
          primary: Colors.redAccent,
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
  List<TransientItem> _items = [];
  bool _isWiping = false;
  Timer? _pollTimer;
  Timer? _decayTimer;

  @override
  void initState() {
    super.initState();
    _refreshItems();
    _pollTimer = Timer.periodic(const Duration(seconds: 5), (_) => _refreshItems());
    _decayTimer = Timer.periodic(const Duration(seconds: 1), (_) => _tickItems());
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    _decayTimer?.cancel();
    _inputController.dispose();
    super.dispose();
  }

  Future<void> _refreshItems() async {
    final fetched = await _api.fetchItems();
    if (mounted) {
      setState(() {
        _items = fetched;
      });
    }
  }

  void _tickItems() {
    if (mounted) {
      setState(() {
        for (var item in _items) {
          item.tick();
        }
        // Remove items that have finished vanishing
        _items.removeWhere((item) => item.life <= -1);
      });
    }
  }

  Future<void> _addItem() async {
    final content = _inputController.text.trim();
    if (content.isEmpty) return;

    _inputController.clear();
    final newItem = await _api.addItem(content);
    if (newItem != null && mounted) {
      setState(() {
        _items.add(newItem);
      });
    }
  }

  Future<void> _wipeAll() async {
    setState(() => _isWiping = true);
    await _api.massWipe();
    await Future.delayed(const Duration(milliseconds: 1000));
    if (mounted) {
      setState(() {
        _items.clear();
        _isWiping = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Background Texture
          Opacity(
            opacity: 0.05,
            child: Container(
              decoration: const BoxDecoration(
                image: DecorationImage(
                  image: NetworkImage("https://grainy-gradients.vercel.app/noise.svg"),
                  repeat: ImageRepeat.repeat,
                ),
              ),
            ),
          ),

          SafeArea(
            child: Column(
              children: [
                _buildHeader(),
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
    return Container(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          FadeInDown(
            child: Text(
              "X_Gone",
              style: GoogleFonts.outfit(
                fontSize: 48,
                fontWeight: FontWeight.w900,
                letterSpacing: 8,
                color: Colors.white,
              ),
            ),
          ),
          const SizedBox(height: 24),
          Row(
            children: [
              Expanded(
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.05),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.white.withOpacity(0.1)),
                  ),
                  child: TextField(
                    controller: _inputController,
                    onSubmitted: (_) => _addItem(),
                    decoration: const InputDecoration(
                      hintText: "Inject a thought...",
                      contentPadding: EdgeInsets.symmetric(horizontal: 20),
                      border: InputBorder.none,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              IconButton.filled(
                onPressed: _addItem,
                icon: const Icon(Icons.add),
                style: IconButton.styleFrom(
                  backgroundColor: Colors.white.withOpacity(0.1),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(width: 8),
              IconButton(
                onPressed: _wipeAll,
                icon: const Icon(Icons.delete_sweep_rounded, color: Colors.redAccent),
                style: IconButton.styleFrom(
                  backgroundColor: Colors.redAccent.withOpacity(0.1),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildGrid() {
    if (_items.isEmpty) {
      return Center(
        child: Opacity(
          opacity: 0.3,
          child: Text("The void is empty...", style: GoogleFonts.outfit(fontSize: 18)),
        ),
      );
    }

    return GridView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
        maxCrossAxisExtent: 300,
        mainAxisSpacing: 16,
        crossAxisSpacing: 16,
        childAspectRatio: 1.2,
      ),
      itemCount: _items.length,
      itemBuilder: (context, index) {
        final item = _items[index];
        return NoteCard(key: ValueKey(item.id), item: item);
      },
    );
  }

  Widget _buildWipeOverlay() {
    return Container(
      color: Colors.black,
      width: double.infinity,
      height: double.infinity,
      child: Center(
        child: Flash(
          child: Text(
            "X_Gone",
            style: GoogleFonts.outfit(
              fontSize: 64,
              fontWeight: FontWeight.w900,
              color: Colors.white,
            ),
          ),
        ),
      ),
    );
  }
}

class NoteCard extends StatelessWidget {
  final TransientItem item;
  const NoteCard({super.key, required this.item});

  @override
  Widget build(BuildContext context) {
    final double progress = (item.life / 300).clamp(0.0, 1.0);

    return FadeInUp(
      duration: const Duration(milliseconds: 400),
      child: AnimatedScale(
        scale: item.vanishing ? 1.2 : 1.0,
        duration: const Duration(milliseconds: 400),
        child: AnimatedOpacity(
          opacity: item.vanishing ? 0.0 : 1.0,
          duration: const Duration(milliseconds: 400),
          child: Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.03),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.white.withOpacity(0.08)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Icon(item.type == "note" ? Icons.description_outlined : Icons.timer_outlined, 
                         size: 16, color: Colors.white.withOpacity(0.4)),
                    Text(
                      "${(item.life ~/ 60)}:${(item.life % 60).toString().padLeft(2, '0')}",
                      style: TextStyle(fontSize: 12, color: Colors.white.withOpacity(0.4)),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Expanded(
                  child: Text(
                    item.content,
                    style: const TextStyle(fontSize: 16, height: 1.4),
                    maxLines: 4,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const SizedBox(height: 12),
                ClipRRect(
                  borderRadius: BorderRadius.circular(2),
                  child: LinearProgressIndicator(
                    value: progress,
                    backgroundColor: Colors.white.withOpacity(0.05),
                    valueColor: AlwaysStoppedAnimation<Color>(
                      progress < 0.2 ? Colors.redAccent.withOpacity(0.5) : Colors.white.withOpacity(0.2),
                    ),
                    minHeight: 2,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
