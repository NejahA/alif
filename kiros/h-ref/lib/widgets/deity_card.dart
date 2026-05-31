import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../models/deity.dart';
import '../providers/deity_provider.dart';
import '../theme.dart';

class DeityCard extends StatelessWidget {
  final Deity deity;
  final VoidCallback onTap;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  const DeityCard({
    super.key,
    required this.deity,
    required this.onTap,
    required this.onEdit,
    required this.onDelete,
  });

  Color get _categoryColor {
    final colors = AppTheme.categoryColors;
    return colors[deity.category.name] ?? AppTheme.accentSoft;
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        decoration: BoxDecoration(
          color: AppTheme.bgCard,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: _categoryColor.withOpacity(0.3),
            width: 1,
          ),
          boxShadow: [
            BoxShadow(
              color: _categoryColor.withOpacity(0.08),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Symbol circle
                  Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      color: _categoryColor.withOpacity(0.15),
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: _categoryColor.withOpacity(0.4),
                        width: 1.5,
                      ),
                    ),
                    child: Center(
                      child: Text(
                        deity.symbol,
                        style: const TextStyle(fontSize: 24),
                      ),
                    ),
                  ),
                  const SizedBox(width: 14),
                  // Main content
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                deity.name,
                                style: GoogleFonts.cinzel(
                                  color: AppTheme.textPrimary,
                                  fontSize: 17,
                                  fontWeight: FontWeight.w700,
                                  letterSpacing: 1.0,
                                ),
                              ),
                            ),
                            _FavoriteButton(deity: deity),
                          ],
                        ),
                        const SizedBox(height: 2),
                        Text(
                          deity.domain,
                          style: GoogleFonts.cinzel(
                            color: AppTheme.accent,
                            fontSize: 10.5,
                            fontWeight: FontWeight.w500,
                            letterSpacing: 0.8,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          deity.origin,
                          style: GoogleFonts.lato(
                            color: AppTheme.textSecondary,
                            fontSize: 12,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          deity.description,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.lato(
                            color: AppTheme.textMuted,
                            fontSize: 12.5,
                            height: 1.5,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            // Footer bar
            Container(
              decoration: BoxDecoration(
                color: _categoryColor.withOpacity(0.08),
                borderRadius: const BorderRadius.vertical(
                  bottom: Radius.circular(16),
                ),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                children: [
                  Text(
                    deity.category.emoji,
                    style: const TextStyle(fontSize: 12),
                  ),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      deity.category.displayName.toUpperCase(),
                      style: GoogleFonts.cinzel(
                        color: _categoryColor,
                        fontSize: 9.5,
                        fontWeight: FontWeight.w600,
                        letterSpacing: 1.2,
                      ),
                    ),
                  ),
                  // Edit button
                  IconButton(
                    onPressed: onEdit,
                    icon: const Icon(Icons.edit_outlined, size: 16),
                    color: AppTheme.textSecondary,
                    padding: const EdgeInsets.all(4),
                    constraints: const BoxConstraints(),
                    tooltip: 'Edit',
                  ),
                  const SizedBox(width: 8),
                  // Delete button
                  IconButton(
                    onPressed: () => _confirmDelete(context),
                    icon: const Icon(Icons.delete_outline, size: 16),
                    color: AppTheme.error.withOpacity(0.7),
                    padding: const EdgeInsets.all(4),
                    constraints: const BoxConstraints(),
                    tooltip: 'Delete',
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _confirmDelete(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppTheme.bgCard,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text(
          'Remove ${deity.name}?',
          style: GoogleFonts.cinzel(
            color: AppTheme.textPrimary,
            fontWeight: FontWeight.w700,
          ),
        ),
        content: Text(
          'This deity will be permanently removed from the divine registry.',
          style: GoogleFonts.lato(color: AppTheme.textSecondary, height: 1.5),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text(
              'CANCEL',
              style: GoogleFonts.cinzel(color: AppTheme.textSecondary),
            ),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.error,
              foregroundColor: Colors.white,
            ),
            onPressed: () {
              Navigator.pop(ctx);
              onDelete();
            },
            child: Text('DELETE', style: GoogleFonts.cinzel()),
          ),
        ],
      ),
    );
  }
}

class _FavoriteButton extends StatelessWidget {
  final Deity deity;
  const _FavoriteButton({required this.deity});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        context.read<DeityProvider>().toggleFavorite(deity.id);
      },
      child: Icon(
        deity.isFavorite ? Icons.star_rounded : Icons.star_outline_rounded,
        color: deity.isFavorite ? AppTheme.accent : AppTheme.textMuted,
        size: 20,
      ),
    );
  }
}
