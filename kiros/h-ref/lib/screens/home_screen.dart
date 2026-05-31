import 'package:flutter/material.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../models/deity.dart';
import '../providers/deity_provider.dart';
import '../theme.dart';
import '../widgets/deity_card.dart';
import 'deity_detail_screen.dart';
import 'deity_form_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen>
    with SingleTickerProviderStateMixin {
  final _searchCtrl = TextEditingController();
  late AnimationController _fabAnimCtrl;

  @override
  void initState() {
    super.initState();
    _fabAnimCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
    )..forward();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    _fabAnimCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<DeityProvider>(
      builder: (context, provider, _) {
        if (provider.isLoading) {
          return const Scaffold(
            backgroundColor: AppTheme.bgDark,
            body: Center(
              child: CircularProgressIndicator(color: AppTheme.accent),
            ),
          );
        }

        final deities = provider.deities;

        return Scaffold(
          backgroundColor: AppTheme.bgDark,
          appBar: _buildAppBar(context, provider),
          body: Column(
            children: [
              _SearchBar(
                controller: _searchCtrl,
                onChanged: provider.setSearchQuery,
              ),
              _FilterRow(provider: provider),
              _StatsRow(provider: provider),
              Expanded(
                child: deities.isEmpty
                    ? _EmptyState(hasFilters: provider.searchQuery.isNotEmpty ||
                        provider.filterCategory != null)
                    : AnimationLimiter(
                        child: ListView.builder(
                          padding: const EdgeInsets.only(top: 8, bottom: 100),
                          itemCount: deities.length,
                          itemBuilder: (context, index) {
                            final deity = deities[index];
                            return AnimationConfiguration.staggeredList(
                              position: index,
                              duration: const Duration(milliseconds: 375),
                              child: SlideAnimation(
                                verticalOffset: 40,
                                child: FadeInAnimation(
                                  child: DeityCard(
                                    deity: deity,
                                    onTap: () => _openDetail(context, deity.id),
                                    onEdit: () => _openEdit(context, deity),
                                    onDelete: () =>
                                        provider.deleteDeity(deity.id),
                                  ),
                                ),
                              ),
                            );
                          },
                        ),
                      ),
              ),
            ],
          ),
          floatingActionButton: ScaleTransition(
            scale: CurvedAnimation(
              parent: _fabAnimCtrl,
              curve: Curves.elasticOut,
            ),
            child: FloatingActionButton.extended(
              onPressed: () => _openCreate(context),
              icon: const Icon(Icons.add),
              label: Text(
                'ADD DEITY',
                style: GoogleFonts.cinzel(
                  fontWeight: FontWeight.w700,
                  letterSpacing: 1.5,
                  fontSize: 12,
                ),
              ),
              backgroundColor: AppTheme.accent,
              foregroundColor: AppTheme.bgDark,
              elevation: 12,
            ),
          ),
        );
      },
    );
  }

  AppBar _buildAppBar(BuildContext context, DeityProvider provider) {
    return AppBar(
      title: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'H-REF',
            style: GoogleFonts.cinzel(
              color: AppTheme.accent,
              fontSize: 22,
              fontWeight: FontWeight.w800,
              letterSpacing: 4.0,
            ),
          ),
          Text(
            'Divine Encyclopedia',
            style: GoogleFonts.cinzel(
              color: AppTheme.textMuted,
              fontSize: 9,
              letterSpacing: 2.5,
            ),
          ),
        ],
      ),
      actions: [
        // Favorites toggle
        IconButton(
          icon: Icon(
            provider.showFavoritesOnly
                ? Icons.star_rounded
                : Icons.star_outline_rounded,
            color: provider.showFavoritesOnly
                ? AppTheme.accent
                : AppTheme.textMuted,
          ),
          tooltip: 'Favorites',
          onPressed: provider.toggleFavoritesOnly,
        ),
        // Clear filters
        if (provider.searchQuery.isNotEmpty ||
            provider.filterCategory != null ||
            provider.showFavoritesOnly)
          IconButton(
            icon: const Icon(Icons.filter_alt_off_outlined),
            color: AppTheme.textSecondary,
            tooltip: 'Clear filters',
            onPressed: () {
              provider.clearFilters();
              _searchCtrl.clear();
            },
          ),
        const SizedBox(width: 4),
      ],
    );
  }

  void _openDetail(BuildContext context, String id) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => DeityDetailScreen(deityId: id),
      ),
    );
  }

  void _openEdit(BuildContext context, Deity deity) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => DeityFormScreen(deity: deity),
      ),
    );
  }

  void _openCreate(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => const DeityFormScreen(),
      ),
    );
  }
}

// ── Search Bar ──────────────────────────────────────────────────────────────
class _SearchBar extends StatelessWidget {
  final TextEditingController controller;
  final ValueChanged<String> onChanged;

  const _SearchBar({required this.controller, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
      child: TextField(
        controller: controller,
        onChanged: onChanged,
        style: GoogleFonts.lato(color: AppTheme.textPrimary, fontSize: 14),
        decoration: InputDecoration(
          hintText: 'Search deities, domains, origins...',
          prefixIcon:
              const Icon(Icons.search, color: AppTheme.textMuted, size: 20),
          suffixIcon: controller.text.isNotEmpty
              ? IconButton(
                  icon: const Icon(Icons.clear, size: 18),
                  color: AppTheme.textMuted,
                  onPressed: () {
                    controller.clear();
                    onChanged('');
                  },
                )
              : null,
        ),
      ),
    );
  }
}

// ── Filter Row ───────────────────────────────────────────────────────────────
class _FilterRow extends StatelessWidget {
  final DeityProvider provider;

  const _FilterRow({required this.provider});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 48,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        children: [
          // All chip
          Padding(
            padding: const EdgeInsets.only(right: 6),
            child: FilterChip(
              label: Text(
                'All',
                style: GoogleFonts.cinzel(fontSize: 11),
              ),
              selected: provider.filterCategory == null,
              onSelected: (_) => provider.setFilterCategory(null),
            ),
          ),
          ...DeityCategory.values.map((cat) {
            final isSelected = provider.filterCategory == cat;
            return Padding(
              padding: const EdgeInsets.only(right: 6),
              child: FilterChip(
                label: Text(
                  '${cat.emoji} ${cat.name[0].toUpperCase()}${cat.name.substring(1)}',
                  style: GoogleFonts.cinzel(fontSize: 10),
                ),
                selected: isSelected,
                onSelected: (_) => provider.setFilterCategory(
                  isSelected ? null : cat,
                ),
              ),
            );
          }),
        ],
      ),
    );
  }
}

// ── Stats Row ────────────────────────────────────────────────────────────────
class _StatsRow extends StatelessWidget {
  final DeityProvider provider;

  const _StatsRow({required this.provider});

  @override
  Widget build(BuildContext context) {
    final shown = provider.deities.length;
    final total = provider.totalCount;
    final favorites = provider.deities.where((d) => d.isFavorite).length;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      child: Row(
        children: [
          Text(
            'Showing $shown of $total',
            style: GoogleFonts.cinzel(
              color: AppTheme.textMuted,
              fontSize: 10,
              letterSpacing: 1.0,
            ),
          ),
          const Spacer(),
          Icon(Icons.star_rounded, color: AppTheme.accent, size: 12),
          const SizedBox(width: 4),
          Text(
            '$favorites favorites',
            style: GoogleFonts.cinzel(
              color: AppTheme.textMuted,
              fontSize: 10,
              letterSpacing: 1.0,
            ),
          ),
        ],
      ),
    );
  }
}

// ── Empty State ───────────────────────────────────────────────────────────────
class _EmptyState extends StatelessWidget {
  final bool hasFilters;

  const _EmptyState({required this.hasFilters});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            hasFilters ? '🔍' : '🌌',
            style: const TextStyle(fontSize: 60),
          ),
          const SizedBox(height: 16),
          Text(
            hasFilters ? 'No Deities Found' : 'The Divine Realm Awaits',
            style: GoogleFonts.cinzel(
              color: AppTheme.textPrimary,
              fontSize: 18,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            hasFilters
                ? 'Try adjusting your search or filters'
                : 'Tap + to add your first deity',
            style: GoogleFonts.lato(
              color: AppTheme.textMuted,
              fontSize: 13,
            ),
          ),
        ],
      ),
    );
  }
}
