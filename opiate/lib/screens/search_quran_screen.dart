import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/opiate_theme.dart';
import '../providers/quran_provider.dart';
import '../widgets/islamic_pattern_background.dart';
import 'surah_detail_screen.dart';

class SearchQuranScreen extends StatelessWidget {
  const SearchQuranScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<QuranProvider>();
    final results = provider.filteredSurahs;

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
          title: TextField(
            autofocus: true,
            onChanged: provider.setSearchQuery,
            style: GoogleFonts.outfit(color: Colors.white, fontSize: 16),
            decoration: InputDecoration(
              hintText: 'Search Surah name, number or translation...',
              hintStyle: GoogleFonts.outfit(color: OpiateTheme.textMuted, fontSize: 14),
              border: InputBorder.none,
            ),
          ),
        ),
        body: ListView.builder(
          padding: const EdgeInsets.all(16.0),
          itemCount: results.length,
          itemBuilder: (context, index) {
            final surah = results[index];

            return InkWell(
              onTap: () {
                provider.selectSurah(surah);
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => SurahDetailScreen(surah: surah)),
                );
              },
              borderRadius: BorderRadius.circular(14),
              child: Container(
                margin: const EdgeInsets.only(bottom: 10),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: OpiateTheme.slateCard,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: OpiateTheme.borderGold),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: OpiateTheme.deepEmerald,
                        shape: BoxShape.circle,
                        border: Border.all(color: OpiateTheme.sacredGold),
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        '${surah.number}',
                        style: GoogleFonts.orbitron(
                          color: OpiateTheme.sacredGold,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            surah.nameEnglish,
                            style: GoogleFonts.cinzel(
                              color: Colors.white,
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Text(
                            '${surah.nameTranslation} • ${surah.numberOfAyahs} Verses',
                            style: GoogleFonts.outfit(color: OpiateTheme.textMuted, fontSize: 11),
                          ),
                        ],
                      ),
                    ),
                    Text(
                      surah.nameArabic,
                      style: GoogleFonts.amiri(
                        color: OpiateTheme.sacredGold,
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
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
