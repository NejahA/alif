import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:culinara/core/theme.dart';
import 'package:culinara/core/culinary_data.dart';

class WisdomSpotlight extends StatelessWidget {
  const WisdomSpotlight({super.key});

  @override
  Widget build(BuildContext context) {
    // Select a random tip seeded by the day to keep it consistent throughout the day
    final dayOrdinal = DateTime.now().difference(DateTime(2024, 1, 1)).inDays;
    final tip = culinaryTipsData[dayOrdinal % culinaryTipsData.length];

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: tip.accentColor.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: tip.accentColor.withValues(alpha: 0.15)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: tip.accentColor.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(tip.icon, size: 16, color: tip.accentColor),
              ),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "CHEF'S WISDOM",
                    style: GoogleFonts.inter(
                      fontSize: 9,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1.5,
                      color: tip.accentColor.withValues(alpha: 0.7),
                    ),
                  ),
                  Text(
                    tip.category.toUpperCase(),
                    style: GoogleFonts.inter(
                      fontSize: 8,
                      fontWeight: FontWeight.w600,
                      color: CuisineTheme.cream.withValues(alpha: 0.3),
                    ),
                  ),
                ],
              ),
              const Spacer(),
              Icon(LucideIcons.sparkles, size: 14, color: CuisineTheme.saffron.withValues(alpha: 0.3)),
            ],
          ),
          const SizedBox(height: 20),
          Text(
            tip.title,
            style: GoogleFonts.playfairDisplay(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: CuisineTheme.cream,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            tip.description,
            maxLines: 4,
            overflow: TextOverflow.ellipsis,
            style: GoogleFonts.inter(
              fontSize: 12,
              height: 1.6,
              color: CuisineTheme.cream.withValues(alpha: 0.6),
            ),
          ),
          if (tip.proTip != null) ...[
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: CuisineTheme.saffron.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: CuisineTheme.saffron.withValues(alpha: 0.1)),
              ),
              child: Row(
                children: [
                   const Icon(LucideIcons.lightbulb, size: 12, color: CuisineTheme.saffron),
                   const SizedBox(width: 8),
                   Expanded(
                     child: Text(
                       tip.proTip!,
                       style: GoogleFonts.inter(
                         fontSize: 10,
                         fontStyle: FontStyle.italic,
                         color: CuisineTheme.saffron.withValues(alpha: 0.8),
                       ),
                     ),
                   ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}
