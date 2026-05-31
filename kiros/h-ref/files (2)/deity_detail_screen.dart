import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../models/deity.dart';
import '../providers/deity_provider.dart';
import '../theme.dart';
import 'deity_form_screen.dart';

class DeityDetailScreen extends StatelessWidget {
  final String deityId;

  const DeityDetailScreen({super.key, required this.deityId});

  @override
  Widget build(BuildContext context) {
    return Consumer<DeityProvider>(
      builder: (context, provider, _) {
        final deity = provider.getById(deityId);
        if (deity == null) {
          return const Scaffold(
            body: Center(child: Text('Deity not found')),
          );
        }

        final color =
            AppTheme.categoryColors[deity.category.name] ?? AppTheme.accentSoft;

        return Scaffold(
          backgroundColor: AppTheme.bgDark,
          body: CustomScrollView(
            slivers: [
              SliverAppBar(
                expandedHeight: 260,
                pinned: true,
                backgroundColor: AppTheme.bgDark,
                leading: IconButton(
                  icon: const Icon(Icons.arrow_back_ios_new),
                  color: AppTheme.accent,
                  onPressed: () => Navigator.pop(context),
                ),
                actions: [
                  IconButton(
                    icon: Icon(
                      deity.isFavorite
                          ? Icons.star_rounded
                          : Icons.star_outline_rounded,
                      color: deity.isFavorite
                          ? AppTheme.accent
                          : AppTheme.textSecondary,
                    ),
                    onPressed: () => provider.toggleFavorite(deity.id),
                  ),
                  IconButton(
                    icon: const Icon(Icons.edit_outlined),
                    color: AppTheme.accent,
                    onPressed: () => _openEdit(context, deity),
                  ),
                  IconButton(
                    icon: const Icon(Icons.delete_outline),
                    color: AppTheme.error,
                    onPressed: () => _confirmDelete(context, deity, provider),
                  ),
                ],
                flexibleSpace: FlexibleSpaceBar(
                  background: Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          color.withOpacity(0.3),
                          AppTheme.bgDark,
                        ],
                      ),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const SizedBox(height: 60),
                        Container(
                          width: 90,
                          height: 90,
                          decoration: BoxDecoration(
                            color: color.withOpacity(0.15),
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: color.withOpacity(0.5),
                              width: 2,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: color.withOpacity(0.3),
                                blurRadius: 24,
                              ),
                            ],
                          ),
                          child: Center(
                            child: Text(
                              deity.symbol,
                              style: const TextStyle(fontSize: 40),
                            ),
                          ),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          deity.name,
                          style: GoogleFonts.cinzel(
                            color: AppTheme.textPrimary,
                            fontSize: 26,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 2.0,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          deity.domain,
                          style: GoogleFonts.cinzel(
                            color: AppTheme.accent,
                            fontSize: 11,
                            letterSpacing: 1.0,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),
                ),
              ),

              // Content
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Category badge
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 14, vertical: 7),
                        decoration: BoxDecoration(
                          color: color.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(20),
                          border:
                              Border.all(color: color.withOpacity(0.3)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(deity.category.emoji,
                                style: const TextStyle(fontSize: 14)),
                            const SizedBox(width: 6),
                            Text(
                              deity.category.displayName.toUpperCase(),
                              style: GoogleFonts.cinzel(
                                color: color,
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                letterSpacing: 1.5,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Origin
                      _DetailSection(
                        icon: Icons.place_outlined,
                        title: 'Origin',
                        child: Text(
                          deity.origin,
                          style: GoogleFonts.lato(
                            color: AppTheme.textPrimary,
                            fontSize: 15,
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Description
                      _DetailSection(
                        icon: Icons.auto_stories_outlined,
                        title: 'Mythology',
                        child: Text(
                          deity.description,
                          style: GoogleFonts.lato(
                            color: AppTheme.textSecondary,
                            fontSize: 14,
                            height: 1.7,
                          ),
                        ),
                      ),

                      // Aliases
                      if (deity.aliases.isNotEmpty) ...[
                        const SizedBox(height: 20),
                        _DetailSection(
                          icon: Icons.label_outline,
                          title: 'Also Known As',
                          child: Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: deity.aliases
                                .map(
                                  (alias) => Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 12, vertical: 5),
                                    decoration: BoxDecoration(
                                      color: AppTheme.bgCardLight,
                                      borderRadius:
                                          BorderRadius.circular(12),
                                      border: Border.all(
                                        color: const Color(0xFF2A2A4A),
                                      ),
                                    ),
                                    child: Text(
                                      alias,
                                      style: GoogleFonts.lato(
                                        color: AppTheme.textSecondary,
                                        fontSize: 12,
                                      ),
                                    ),
                                  ),
                                )
                                .toList(),
                          ),
                        ),
                      ],

                      const SizedBox(height: 30),
                      // Timestamps
                      Row(
                        children: [
                          _TimestampChip(
                            label: 'Added',
                            date: deity.createdAt,
                          ),
                          const SizedBox(width: 8),
                          _TimestampChip(
                            label: 'Updated',
                            date: deity.updatedAt,
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
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

  void _confirmDelete(
      BuildContext context, Deity deity, DeityProvider provider) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppTheme.bgCard,
        shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text(
          'Remove ${deity.name}?',
          style: GoogleFonts.cinzel(color: AppTheme.textPrimary),
        ),
        content: Text(
          'This deity will be permanently removed from the registry.',
          style: GoogleFonts.lato(color: AppTheme.textSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text('CANCEL',
                style: GoogleFonts.cinzel(color: AppTheme.textSecondary)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.error,
              foregroundColor: Colors.white,
            ),
            onPressed: () {
              provider.deleteDeity(deity.id);
              Navigator.pop(ctx);
              Navigator.pop(context);
            },
            child: Text('DELETE', style: GoogleFonts.cinzel()),
          ),
        ],
      ),
    );
  }
}

class _DetailSection extends StatelessWidget {
  final IconData icon;
  final String title;
  final Widget child;

  const _DetailSection({
    required this.icon,
    required this.title,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, color: AppTheme.accent, size: 16),
            const SizedBox(width: 8),
            Text(
              title.toUpperCase(),
              style: GoogleFonts.cinzel(
                color: AppTheme.accent,
                fontSize: 10,
                fontWeight: FontWeight.w700,
                letterSpacing: 2.0,
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        child,
      ],
    );
  }
}

class _TimestampChip extends StatelessWidget {
  final String label;
  final DateTime date;

  const _TimestampChip({required this.label, required this.date});

  @override
  Widget build(BuildContext context) {
    final formatted =
        '${date.day}/${date.month}/${date.year}';
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: AppTheme.bgCardLight,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        '$label: $formatted',
        style: GoogleFonts.lato(
          color: AppTheme.textMuted,
          fontSize: 11,
        ),
      ),
    );
  }
}
