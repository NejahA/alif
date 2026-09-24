import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/opiate_theme.dart';
import '../providers/quran_provider.dart';
import '../widgets/islamic_pattern_background.dart';

class ReciterSelectionScreen extends StatelessWidget {
  const ReciterSelectionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<QuranProvider>();

    return IslamicPatternBackground(
      child: Scaffold(
        backgroundColor: Colors.transparent,
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new, color: OpiateTheme.sacredGold),
            onPressed: () => Navigator.pop(context),
          ),
          title: Text(
            'SELECT QARI & RECITER',
            style: GoogleFonts.cinzel(
              color: OpiateTheme.sacredGold,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          centerTitle: true,
        ),
        body: ListView.builder(
          padding: const EdgeInsets.all(16.0),
          itemCount: provider.availableReciters.length,
          itemBuilder: (context, index) {
            final reciter = provider.availableReciters[index];
            final isSelected = provider.selectedReciter.id == reciter.id;

            return InkWell(
              onTap: () {
                provider.selectReciter(reciter);
                Navigator.pop(context);
              },
              borderRadius: BorderRadius.circular(16),
              child: Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: isSelected
                      ? OpiateTheme.sacredGold.withValues(alpha: 0.15)
                      : OpiateTheme.slateCard,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: isSelected ? OpiateTheme.sacredGold : OpiateTheme.borderGold,
                    width: isSelected ? 1.8 : 1,
                  ),
                ),
                child: Row(
                  children: [
                    const CircleAvatar(
                      radius: 26,
                      backgroundColor: OpiateTheme.deepEmerald,
                      child: Icon(Icons.person, color: OpiateTheme.sacredGold, size: 24),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            reciter.name,
                            style: GoogleFonts.cinzel(
                              color: isSelected ? OpiateTheme.sacredGold : Colors.white,
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            reciter.style,
                            style: GoogleFonts.outfit(color: OpiateTheme.textMuted, fontSize: 11),
                          ),
                        ],
                      ),
                    ),
                    if (isSelected)
                      const Icon(Icons.check_circle, color: OpiateTheme.sacredGold, size: 22),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
