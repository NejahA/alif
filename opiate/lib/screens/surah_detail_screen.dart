import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../theme/opiate_theme.dart';
import '../models/quran_models.dart';
import '../providers/quran_provider.dart';
import '../widgets/islamic_pattern_background.dart';

class SurahDetailScreen extends StatefulWidget {
  final Surah surah;

  const SurahDetailScreen({super.key, required this.surah});

  @override
  State<SurahDetailScreen> createState() => _SurahDetailScreenState();
}

class _SurahDetailScreenState extends State<SurahDetailScreen> {
  int? _activeAyahNumber;

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<QuranProvider>();
    final ayahs = provider.getAyahsForSurah(widget.surah.number);

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
            '${widget.surah.number}. ${widget.surah.nameEnglish}',
            style: GoogleFonts.cinzel(
              color: OpiateTheme.sacredGold,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          centerTitle: true,
          actions: [
            IconButton(
              icon: const Icon(Icons.text_fields, color: OpiateTheme.sacredGold),
              onPressed: () => _showFontSizeDialog(context, provider),
            ),
          ],
        ),
        body: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            children: [
              // Surah Banner Header
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 20),
                decoration: BoxDecoration(
                  color: OpiateTheme.deepEmerald.withValues(alpha: 0.8),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: OpiateTheme.borderGold, width: 1.5),
                  boxShadow: [
                    BoxShadow(
                      color: OpiateTheme.sacredGold.withValues(alpha: 0.15),
                      blurRadius: 20,
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    Text(
                      widget.surah.nameArabic,
                      style: GoogleFonts.amiri(
                        color: OpiateTheme.sacredGold,
                        fontSize: 36,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      '${widget.surah.nameTranslation} • ${widget.surah.revelationType} • ${widget.surah.numberOfAyahs} Verses',
                      style: GoogleFonts.cinzel(
                        color: OpiateTheme.textMuted,
                        fontSize: 11,
                        letterSpacing: 1.1,
                      ),
                    ),
                    const SizedBox(height: 16),

                    if (widget.surah.number != 1 && widget.surah.number != 9)
                      Text(
                        'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
                        style: GoogleFonts.amiri(
                          color: OpiateTheme.sacredGold.withValues(alpha: 0.9),
                          fontSize: 22,
                        ),
                      ),
                  ],
                ),
              ).animate().fadeIn(duration: 400.ms),

              const SizedBox(height: 20),

              // Ayahs List
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: ayahs.length,
                itemBuilder: (context, index) {
                  final ayah = ayahs[index];
                  final isCurrentlyPlaying = _activeAyahNumber == ayah.numberInSurah;

                  return Container(
                    margin: const EdgeInsets.only(bottom: 16),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: isCurrentlyPlaying
                          ? OpiateTheme.sacredGold.withValues(alpha: 0.12)
                          : OpiateTheme.slateCard,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: isCurrentlyPlaying
                            ? OpiateTheme.sacredGold
                            : OpiateTheme.borderGold,
                        width: isCurrentlyPlaying ? 1.5 : 0.8,
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // Verse Top Bar
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: OpiateTheme.deepEmerald,
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: OpiateTheme.sacredGold),
                              ),
                              child: Text(
                                '${widget.surah.number}:${ayah.numberInSurah}',
                                style: GoogleFonts.orbitron(
                                  color: OpiateTheme.sacredGold,
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            Row(
                              children: [
                                IconButton(
                                  icon: Icon(
                                    isCurrentlyPlaying ? Icons.pause_circle_filled : Icons.play_circle_fill,
                                    color: OpiateTheme.sacredGold,
                                    size: 26,
                                  ),
                                  onPressed: () {
                                    setState(() {
                                      _activeAyahNumber = isCurrentlyPlaying ? null : ayah.numberInSurah;
                                    });
                                    if (!provider.isPlaying) {
                                      provider.togglePlayPause();
                                    }
                                  },
                                ),
                                IconButton(
                                  icon: Icon(
                                    ayah.isBookmarked ? Icons.bookmark : Icons.bookmark_border,
                                    color: OpiateTheme.sacredGold,
                                    size: 20,
                                  ),
                                  onPressed: () => provider.toggleBookmark(ayah),
                                ),
                              ],
                            ),
                          ],
                        ),
                        const SizedBox(height: 14),

                        // Arabic Ayah Text
                        Text(
                          ayah.textArabic,
                          textAlign: TextAlign.right,
                          style: GoogleFonts.amiri(
                            color: OpiateTheme.textArabic,
                            fontSize: provider.arabicFontSize,
                            height: 2.0,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: 14),
                        const Divider(color: Colors.white12),
                        const SizedBox(height: 10),

                        // Translation Text
                        Text(
                          provider.selectedLanguage == 'Urdu' ? ayah.textUrdu : ayah.textEnglish,
                          style: GoogleFonts.outfit(
                            color: OpiateTheme.textMuted,
                            fontSize: 13,
                            height: 1.5,
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showFontSizeDialog(BuildContext context, QuranProvider provider) {
    showModalBottomSheet(
      context: context,
      backgroundColor: OpiateTheme.deepEmerald,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'ARABIC TYPOGRAPHY SIZE',
                style: GoogleFonts.cinzel(
                  color: OpiateTheme.sacredGold,
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),
              Slider(
                value: provider.arabicFontSize,
                min: 20.0,
                max: 42.0,
                divisions: 22,
                activeColor: OpiateTheme.sacredGold,
                inactiveColor: Colors.white12,
                onChanged: (val) => provider.setArabicFontSize(val),
              ),
            ],
          ),
        );
      },
    );
  }
}
