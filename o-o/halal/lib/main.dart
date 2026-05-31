import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

void main() {
  runApp(const HalalApp());
}

class HalalApp extends StatelessWidget {
  const HalalApp({super.key});

  @override
  Widget build(BuildContext context) {
    const seed = Color(0xFF147A4F);
    return MaterialApp(
      title: 'halal',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: seed,
          primary: seed,
          secondary: const Color(0xFFE7B10A),
          surface: const Color(0xFFF6F8F7),
        ),
        scaffoldBackgroundColor: const Color(0xFFF6F8F7),
        textTheme: GoogleFonts.interTextTheme(ThemeData.light().textTheme),
      ),
      home: const HalalHome(),
    );
  }
}

enum FlagSeverity { verify, avoid }

class WatchTerm {
  final String id;
  String term;
  String notes;
  FlagSeverity severity;

  WatchTerm({
    required this.id,
    required this.term,
    required this.notes,
    required this.severity,
  });
}

class PantryItem {
  final String id;
  String name;
  String category;
  bool verifiedHalal;
  String notes;

  PantryItem({
    required this.id,
    required this.name,
    required this.category,
    required this.verifiedHalal,
    required this.notes,
  });
}

class Finding {
  final WatchTerm term;
  final String matchedText;

  Finding({required this.term, required this.matchedText});
}

class HalalHome extends StatefulWidget {
  const HalalHome({super.key});

  @override
  State<HalalHome> createState() => _HalalHomeState();
}

class _HalalHomeState extends State<HalalHome> {
  int _tabIndex = 0;
  final TextEditingController _ingredientsController = TextEditingController();

  final List<WatchTerm> _watchlist = [
    WatchTerm(
      id: 'w1',
      term: 'gelatin',
      notes: 'Often sourced from pork/beef. Verify halal certification.',
      severity: FlagSeverity.verify,
    ),
    WatchTerm(
      id: 'w2',
      term: 'lard',
      notes: 'Pork fat.',
      severity: FlagSeverity.avoid,
    ),
    WatchTerm(
      id: 'w3',
      term: 'alcohol',
      notes: 'May appear as ethanol, wine vinegar, flavor extracts. Verify.',
      severity: FlagSeverity.verify,
    ),
    WatchTerm(
      id: 'w4',
      term: 'E120',
      notes: 'Carmine/cochineal (insect-derived). Many prefer to avoid. Verify.',
      severity: FlagSeverity.verify,
    ),
    WatchTerm(
      id: 'w5',
      term: 'pork',
      notes: 'Non-halal.',
      severity: FlagSeverity.avoid,
    ),
  ];

  final List<PantryItem> _pantry = [
    PantryItem(
      id: 'p1',
      name: 'Chicken breast',
      category: 'Protein',
      verifiedHalal: true,
      notes: 'Local butcher, labeled halal.',
    ),
    PantryItem(
      id: 'p2',
      name: 'Marshmallows',
      category: 'Snacks',
      verifiedHalal: false,
      notes: 'Check gelatin source.',
    ),
  ];

  final List<String> _tips = [
    'Look for halal certification logos and verify the certifier when possible.',
    'When you see “gelatin”, check if it is halal-certified bovine or fish gelatin.',
    '“Natural flavors” can be ambiguous. If unsure, contact the manufacturer.',
    'E-numbers can vary by source. Use them as “review prompts”, not final rulings.',
    'If you share a home-cooked meal, label common allergens and any meat source.',
  ];

  final List<String> _activityFeed = [
    'Welcome to halal. Build your watchlist and pantry to make checks faster.',
  ];

  bool _liveScan = true;
  bool _showOnlyFlagged = false;

  List<Finding> _scanIngredients(String ingredientsText) {
    final haystack = ingredientsText.toLowerCase();
    final findings = <Finding>[];
    for (final term in _watchlist) {
      final needle = term.term.toLowerCase();
      if (needle.isEmpty) continue;
      if (haystack.contains(needle)) {
        findings.add(Finding(term: term, matchedText: term.term));
      }
    }
    findings.sort((a, b) => _severityRank(a.term.severity).compareTo(_severityRank(b.term.severity)));
    return findings;
  }

  int _severityRank(FlagSeverity s) => s == FlagSeverity.avoid ? 0 : 1;

  Color _severityColor(FlagSeverity s) {
    return s == FlagSeverity.avoid ? const Color(0xFFB00020) : const Color(0xFF8A6D00);
  }

  String _severityLabel(FlagSeverity s) => s == FlagSeverity.avoid ? 'Avoid' : 'Verify';

  void _pushActivity(String text) {
    setState(() {
      _activityFeed.insert(0, '${_timeNow()} • $text');
      if (_activityFeed.length > 30) _activityFeed.removeLast();
    });
  }

  String _timeNow() {
    final now = DateTime.now();
    final h = now.hour.toString().padLeft(2, '0');
    final m = now.minute.toString().padLeft(2, '0');
    return '$h:$m';
  }

  void _showAddWatchTerm() {
    final termController = TextEditingController();
    final notesController = TextEditingController();
    FlagSeverity severity = FlagSeverity.verify;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setSheetState) {
            return Padding(
              padding: EdgeInsets.only(
                left: 16,
                right: 16,
                top: 16,
                bottom: MediaQuery.of(context).viewInsets.bottom + 16,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Add Watch Term', style: Theme.of(context).textTheme.titleLarge),
                  const SizedBox(height: 12),
                  TextField(
                    controller: termController,
                    textInputAction: TextInputAction.next,
                    decoration: const InputDecoration(
                      labelText: 'Term (e.g., gelatin, E120)',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: notesController,
                    maxLines: 2,
                    decoration: const InputDecoration(
                      labelText: 'Notes (optional)',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 12),
                  SegmentedButton<FlagSeverity>(
                    segments: const [
                      ButtonSegment(value: FlagSeverity.verify, label: Text('Verify')),
                      ButtonSegment(value: FlagSeverity.avoid, label: Text('Avoid')),
                    ],
                    selected: {severity},
                    onSelectionChanged: (set) => setSheetState(() => severity = set.first),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      onPressed: () {
                        final term = termController.text.trim();
                        if (term.isEmpty) return;
                        setState(() {
                          _watchlist.insert(
                            0,
                            WatchTerm(
                              id: DateTime.now().microsecondsSinceEpoch.toString(),
                              term: term,
                              notes: notesController.text.trim(),
                              severity: severity,
                            ),
                          );
                        });
                        Navigator.pop(context);
                        _pushActivity('Watchlist updated: added "$term".');
                      },
                      child: const Text('Save'),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  void _showEditWatchTerm(WatchTerm term) {
    final termController = TextEditingController(text: term.term);
    final notesController = TextEditingController(text: term.notes);
    FlagSeverity severity = term.severity;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setSheetState) {
            return Padding(
              padding: EdgeInsets.only(
                left: 16,
                right: 16,
                top: 16,
                bottom: MediaQuery.of(context).viewInsets.bottom + 16,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Edit Watch Term', style: Theme.of(context).textTheme.titleLarge),
                  const SizedBox(height: 12),
                  TextField(
                    controller: termController,
                    textInputAction: TextInputAction.next,
                    decoration: const InputDecoration(
                      labelText: 'Term',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: notesController,
                    maxLines: 2,
                    decoration: const InputDecoration(
                      labelText: 'Notes',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 12),
                  SegmentedButton<FlagSeverity>(
                    segments: const [
                      ButtonSegment(value: FlagSeverity.verify, label: Text('Verify')),
                      ButtonSegment(value: FlagSeverity.avoid, label: Text('Avoid')),
                    ],
                    selected: {severity},
                    onSelectionChanged: (set) => setSheetState(() => severity = set.first),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () {
                            setState(() => _watchlist.removeWhere((w) => w.id == term.id));
                            Navigator.pop(context);
                            _pushActivity('Watchlist updated: removed "${term.term}".');
                          },
                          child: const Text('Remove'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () {
                            final newTerm = termController.text.trim();
                            if (newTerm.isEmpty) return;
                            setState(() {
                              term.term = newTerm;
                              term.notes = notesController.text.trim();
                              term.severity = severity;
                            });
                            Navigator.pop(context);
                            _pushActivity('Watchlist updated: edited "$newTerm".');
                          },
                          child: const Text('Save'),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  void _showAddPantryItem() {
    final nameController = TextEditingController();
    final notesController = TextEditingController();
    final categories = ['Protein', 'Snacks', 'Dairy', 'Pantry', 'Frozen', 'Other'];
    String category = categories.first;
    bool verified = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setSheetState) {
            return Padding(
              padding: EdgeInsets.only(
                left: 16,
                right: 16,
                top: 16,
                bottom: MediaQuery.of(context).viewInsets.bottom + 16,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Add Pantry Item', style: Theme.of(context).textTheme.titleLarge),
                  const SizedBox(height: 12),
                  TextField(
                    controller: nameController,
                    decoration: const InputDecoration(
                      labelText: 'Name',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    initialValue: category,
                    items: categories.map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
                    onChanged: (v) => setSheetState(() => category = v ?? category),
                    decoration: const InputDecoration(
                      labelText: 'Category',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: notesController,
                    maxLines: 2,
                    decoration: const InputDecoration(
                      labelText: 'Notes (optional)',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 12),
                  SwitchListTile(
                    value: verified,
                    onChanged: (v) => setSheetState(() => verified = v),
                    title: const Text('Verified halal'),
                    contentPadding: EdgeInsets.zero,
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      onPressed: () {
                        final name = nameController.text.trim();
                        if (name.isEmpty) return;
                        setState(() {
                          _pantry.insert(
                            0,
                            PantryItem(
                              id: DateTime.now().microsecondsSinceEpoch.toString(),
                              name: name,
                              category: category,
                              verifiedHalal: verified,
                              notes: notesController.text.trim(),
                            ),
                          );
                        });
                        Navigator.pop(context);
                        _pushActivity('Pantry updated: added "$name".');
                      },
                      child: const Text('Save'),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  void _showEditPantryItem(PantryItem item) {
    final nameController = TextEditingController(text: item.name);
    final notesController = TextEditingController(text: item.notes);
    final categories = ['Protein', 'Snacks', 'Dairy', 'Pantry', 'Frozen', 'Other'];
    String category = item.category;
    bool verified = item.verifiedHalal;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setSheetState) {
            return Padding(
              padding: EdgeInsets.only(
                left: 16,
                right: 16,
                top: 16,
                bottom: MediaQuery.of(context).viewInsets.bottom + 16,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Edit Pantry Item', style: Theme.of(context).textTheme.titleLarge),
                  const SizedBox(height: 12),
                  TextField(
                    controller: nameController,
                    decoration: const InputDecoration(
                      labelText: 'Name',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    initialValue: categories.contains(category) ? category : categories.first,
                    items: categories.map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
                    onChanged: (v) => setSheetState(() => category = v ?? category),
                    decoration: const InputDecoration(
                      labelText: 'Category',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: notesController,
                    maxLines: 2,
                    decoration: const InputDecoration(
                      labelText: 'Notes',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 12),
                  SwitchListTile(
                    value: verified,
                    onChanged: (v) => setSheetState(() => verified = v),
                    title: const Text('Verified halal'),
                    contentPadding: EdgeInsets.zero,
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () {
                            setState(() => _pantry.removeWhere((p) => p.id == item.id));
                            Navigator.pop(context);
                            _pushActivity('Pantry updated: removed "${item.name}".');
                          },
                          child: const Text('Remove'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () {
                            final name = nameController.text.trim();
                            if (name.isEmpty) return;
                            setState(() {
                              item.name = name;
                              item.category = category;
                              item.notes = notesController.text.trim();
                              item.verifiedHalal = verified;
                            });
                            Navigator.pop(context);
                            _pushActivity('Pantry updated: edited "$name".');
                          },
                          child: const Text('Save'),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  void dispose() {
    _ingredientsController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final screens = [
      _buildChecker(),
      _buildPantry(),
      _buildWatchlist(),
      _buildFeed(),
    ];

    return Scaffold(
      appBar: AppBar(
        title: Text('halal', style: GoogleFonts.inter(fontWeight: FontWeight.w700)),
        actions: [
          IconButton(
            onPressed: () => _showInfo(context),
            icon: const Icon(Icons.info_outline),
            tooltip: 'Info',
          ),
        ],
      ),
      body: screens[_tabIndex],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tabIndex,
        onDestinationSelected: (i) => setState(() => _tabIndex = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.search), label: 'Checker'),
          NavigationDestination(icon: Icon(Icons.kitchen_outlined), label: 'Pantry'),
          NavigationDestination(icon: Icon(Icons.visibility_outlined), label: 'Watchlist'),
          NavigationDestination(icon: Icon(Icons.dynamic_feed_outlined), label: 'Feed'),
        ],
      ),
      floatingActionButton: _tabIndex == 1
          ? FloatingActionButton.extended(
              onPressed: _showAddPantryItem,
              icon: const Icon(Icons.add),
              label: const Text('Add item'),
            )
          : _tabIndex == 2
              ? FloatingActionButton.extended(
                  onPressed: _showAddWatchTerm,
                  icon: const Icon(Icons.add),
                  label: const Text('Add term'),
                )
              : null,
    );
  }

  void _showInfo(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('About'),
        content: const Text(
          'halal helps you organize your pantry and watchlist, and flags common ingredient terms for review. '
          'It is an assistant, not a religious ruling. When in doubt, consult a trusted source and verify product certification.',
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('OK')),
        ],
      ),
    );
  }

  Widget _buildChecker() {
    final findings = _scanIngredients(_ingredientsController.text);
    final avoid = findings.where((f) => f.term.severity == FlagSeverity.avoid).toList();
    final verify = findings.where((f) => f.term.severity == FlagSeverity.verify).toList();

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Ingredient Checker', style: Theme.of(context).textTheme.titleLarge),
                const SizedBox(height: 6),
                Text(
                  'Paste an ingredients list. The app flags watchlist terms to help you review quickly.',
                  style: TextStyle(color: Colors.black.withValues(alpha: 0.6)),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _ingredientsController,
                  maxLines: 5,
                  decoration: const InputDecoration(
                    hintText: 'e.g., sugar, gelatin, natural flavors, E120...',
                    border: OutlineInputBorder(),
                  ),
                  onChanged: (v) {
                    if (_liveScan) setState(() {});
                  },
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Switch(
                      value: _liveScan,
                      onChanged: (v) => setState(() => _liveScan = v),
                    ),
                    const SizedBox(width: 8),
                    const Text('Live scan'),
                    const Spacer(),
                    FilledButton.icon(
                      onPressed: () {
                        setState(() {});
                        _pushActivity('Ran an ingredient scan.');
                      },
                      icon: const Icon(Icons.bolt),
                      label: const Text('Scan'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),
        _buildFindingsSummary(avoidCount: avoid.length, verifyCount: verify.length),
        const SizedBox(height: 12),
        if (findings.isEmpty)
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Text(
                'No watchlist terms found. If the product still feels unclear, consider adding terms to your watchlist.',
                style: TextStyle(color: Colors.black.withValues(alpha: 0.7)),
              ),
            ),
          )
        else
          Column(
            children: findings.map((f) => _buildFindingCard(f)).toList(),
          ),
      ],
    );
  }

  Widget _buildFindingsSummary({required int avoidCount, required int verifyCount}) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            _pill(
              label: 'Avoid: $avoidCount',
              color: const Color(0xFFB00020),
              background: const Color(0xFFB00020).withValues(alpha: 0.08),
              icon: Icons.block,
            ),
            const SizedBox(width: 12),
            _pill(
              label: 'Verify: $verifyCount',
              color: const Color(0xFF8A6D00),
              background: const Color(0xFF8A6D00).withValues(alpha: 0.08),
              icon: Icons.help_outline,
            ),
            const Spacer(),
            TextButton(
              onPressed: () => setState(() => _tabIndex = 2),
              child: const Text('Edit watchlist'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _pill({required String label, required Color color, required Color background, required IconData icon}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(color: background, borderRadius: BorderRadius.circular(999)),
      child: Row(
        children: [
          Icon(icon, size: 16, color: color),
          const SizedBox(width: 8),
          Text(label, style: TextStyle(color: color, fontWeight: FontWeight.w700)),
        ],
      ),
    );
  }

  Widget _buildFindingCard(Finding f) {
    final color = _severityColor(f.term.severity);
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.10),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(_severityLabel(f.term.severity), style: TextStyle(color: color, fontWeight: FontWeight.w700)),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    f.term.term,
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
                  ),
                ),
                IconButton(
                  onPressed: () => _showEditWatchTerm(f.term),
                  icon: const Icon(Icons.edit_outlined),
                  tooltip: 'Edit term',
                ),
              ],
            ),
            if (f.term.notes.trim().isNotEmpty) ...[
              const SizedBox(height: 8),
              Text(f.term.notes, style: TextStyle(color: Colors.black.withValues(alpha: 0.7))),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildPantry() {
    final items = _showOnlyFlagged ? _pantry.where((p) => !p.verifiedHalal).toList() : _pantry;
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Row(
          children: [
            Text('Pantry', style: Theme.of(context).textTheme.titleLarge),
            const Spacer(),
            FilterChip(
              label: const Text('Needs review'),
              selected: _showOnlyFlagged,
              onSelected: (v) => setState(() => _showOnlyFlagged = v),
            ),
          ],
        ),
        const SizedBox(height: 12),
        if (items.isEmpty)
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Text(
                'No pantry items yet. Add items you buy often to track what is verified.',
                style: TextStyle(color: Colors.black.withValues(alpha: 0.7)),
              ),
            ),
          )
        else
          ...items.map(_buildPantryCard),
        const SizedBox(height: 12),
        FilledButton.icon(
          onPressed: _showAddPantryItem,
          icon: const Icon(Icons.add),
          label: const Text('Add pantry item'),
        ),
      ],
    );
  }

  Widget _buildPantryCard(PantryItem item) {
    final color = item.verifiedHalal ? const Color(0xFF147A4F) : const Color(0xFF8A6D00);
    final badgeText = item.verifiedHalal ? 'Verified' : 'Review';
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        onTap: () => _showEditPantryItem(item),
        title: Text(item.name, style: const TextStyle(fontWeight: FontWeight.w700)),
        subtitle: Text(
          item.notes.trim().isEmpty ? item.category : '${item.category} • ${item.notes}',
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
        ),
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.10),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Text(badgeText, style: TextStyle(color: color, fontWeight: FontWeight.w700)),
        ),
      ),
    );
  }

  Widget _buildWatchlist() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Row(
          children: [
            Text('Watchlist', style: Theme.of(context).textTheme.titleLarge),
            const Spacer(),
            FilledButton.icon(
              onPressed: _showAddWatchTerm,
              icon: const Icon(Icons.add),
              label: const Text('Add'),
            ),
          ],
        ),
        const SizedBox(height: 12),
        if (_watchlist.isEmpty)
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Text(
                'Your watchlist is empty. Add terms you want the checker to flag.',
                style: TextStyle(color: Colors.black.withValues(alpha: 0.7)),
              ),
            ),
          )
        else
          ..._watchlist.map((t) => _buildWatchTermCard(t)),
      ],
    );
  }

  Widget _buildWatchTermCard(WatchTerm term) {
    final color = _severityColor(term.severity);
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        onTap: () => _showEditWatchTerm(term),
        title: Text(term.term, style: const TextStyle(fontWeight: FontWeight.w700)),
        subtitle: term.notes.trim().isEmpty ? null : Text(term.notes, maxLines: 2, overflow: TextOverflow.ellipsis),
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.10),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Text(_severityLabel(term.severity), style: TextStyle(color: color, fontWeight: FontWeight.w700)),
        ),
      ),
    );
  }

  Widget _buildFeed() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text('Feed', style: Theme.of(context).textTheme.titleLarge),
        const SizedBox(height: 12),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Today’s tips', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
                const SizedBox(height: 8),
                ..._tips.take(5).map((t) => Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Icon(Icons.lightbulb_outline, size: 18),
                          const SizedBox(width: 10),
                          Expanded(child: Text(t)),
                        ],
                      ),
                    )),
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Activity', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
                const SizedBox(height: 8),
                ..._activityFeed.map((e) => Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: Text(e, style: TextStyle(color: Colors.black.withValues(alpha: 0.75))),
                    )),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
