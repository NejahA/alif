import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../theme/opiate_theme.dart';
import '../providers/quran_provider.dart';
import '../widgets/islamic_pattern_background.dart';
import '../widgets/audio_player_sheet.dart';
import 'surah_detail_screen.dart';
import 'reciter_selection_screen.dart';
import 'memorization_companion_screen.dart';
import 'search_quran_screen.dart';
import 'tajweed_guide_screen.dart';
import 'tasbih_dhikr_screen.dart';
import 'prayer_times_screen.dart';
import 'khatm_planner_screen.dart';
import 'audio_downloads_screen.dart';
import 'quran_insights_screen.dart';

class HomeDashboard extends StatefulWidget {
  const HomeDashboard({super.key});

  @override
  State<HomeDashboard> createState() => _HomeDashboardState();
}

class _HomeDashboardState extends State<HomeDashboard> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<QuranProvider>();

    return IslamicPatternBackground(
      child: Scaffold(
        backgroundColor: Colors.transparent,
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          elevation: 0,
          title: Text(
            'O P I A T E',
            style: GoogleFonts.cinzelDecorative(
              color: OpiateTheme.sacredGold,
              fontSize: 22,
              fontWeight: FontWeight.bold,
              letterSpacing: 3.0,
            ),
          ),
          centerTitle: true,
          actions: [
            IconButton(
              icon: const Icon(Icons.search, color: OpiateTheme.sacredGold),
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const SearchQuranScreen()),
                );
              },
            ),
            IconButton(
              icon: const Icon(Icons.psychology, color: OpiateTheme.sacredGold),
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const MemorizationCompanionScreen()),
                );
              },
            ),
          ],
        ),
        body: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                child: Column(
                  children: [
                    // Verse of the Day Card
                    _buildVerseOfTheDayCard(context),

                    const SizedBox(height: 16),

                    // Active Reciter Quick Card
                    _buildReciterBanner(context, provider),

                    const SizedBox(height: 16),

                    // Quick Feature Action Buttons Row 1
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        _buildFeatureQuickTile(
                          context,
                          icon: Icons.access_time,
                          label: 'Prayer Times',
                          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const PrayerTimesScreen())),
                        ),
                        _buildFeatureQuickTile(
                          context,
                          icon: Icons.fingerprint,
                          label: 'Tasbih',
                          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const TasbihDhikrScreen())),
                        ),
                        _buildFeatureQuickTile(
                          context,
                          icon: Icons.auto_stories,
                          label: 'Tajweed',
                          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const TajweedGuideScreen())),
                        ),
                      ],
                    ),

                    const SizedBox(height: 10),

                    // Quick Feature Action Buttons Row 2
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        _buildFeatureQuickTile(
                          context,
                          icon: Icons.flag,
                          label: 'Khatm Plan',
                          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const KhatmPlannerScreen())),
                        ),
                        _buildFeatureQuickTile(
                          context,
                          icon: Icons.download_done,
                          label: 'Offline Audio',
                          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AudioDownloadsScreen())),
                        ),
                        _buildFeatureQuickTile(
                          context,
                          icon: Icons.quiz,
                          label: 'Quiz & Insights',
                          onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const QuranInsightsScreen())),
                        ),
                      ],
                    ),

                    const SizedBox(height: 16),

                    // Tabs (Surahs vs Juz)
                    TabBar(
                      controller: _tabController,
                      indicatorColor: OpiateTheme.sacredGold,
                      labelColor: OpiateTheme.sacredGold,
                      unselectedLabelColor: OpiateTheme.textMuted,
                      labelStyle: GoogleFonts.cinzel(fontSize: 13, fontWeight: FontWeight.bold),
                      tabs: const [
                        Tab(text: 'SURAHS (CHAPTERS)'),
                        Tab(text: 'JUZ (PARAS)'),
                      ],
                    ),

                    const SizedBox(height: 14),

                    // Surahs List
                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: provider.filteredSurahs.length,
                      itemBuilder: (context, index) {
                        final surah = provider.filteredSurahs[index];
                        final isSelected = provider.currentSurah?.number == surah.number;

                        return Container(
                          margin: const EdgeInsets.only(bottom: 10),
                          child: InkWell(
                            onTap: () {
                              provider.selectSurah(surah);
                              Navigator.push(
                                context,
                                MaterialPageRoute(builder: (_) => SurahDetailScreen(surah: surah)),
                              );
                            },
                            borderRadius: BorderRadius.circular(16),
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 250),
                              padding: const EdgeInsets.all(14),
                              decoration: BoxDecoration(
                                color: isSelected
                                    ? OpiateTheme.sacredGold.withValues(alpha: 0.12)
                                    : OpiateTheme.slateCard,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(
                                  color: isSelected ? OpiateTheme.sacredGold : OpiateTheme.borderGold,
                                  width: isSelected ? 1.5 : 1,
                                ),
                              ),
                              child: Row(
                                children: [
                                  Container(
                                    width: 38,
                                    height: 38,
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
                                        const SizedBox(height: 2),
                                        Text(
                                          '${surah.nameTranslation} • ${surah.revelationType}',
                                          style: GoogleFonts.outfit(
                                            color: OpiateTheme.textMuted,
                                            fontSize: 11,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  Text(
                                    surah.nameArabic,
                                    style: GoogleFonts.amiri(
                                      color: OpiateTheme.sacredGold,
                                      fontSize: 22,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),
            ),

            // Persistent Audio Player Bottom Sheet
            const AudioPlayerSheet(),
          ],
        ),
      ),
    );
  }

  Widget _buildVerseOfTheDayCard(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: OpiateTheme.deepEmerald,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: OpiateTheme.sacredGold, width: 1.5),
        boxShadow: [
          BoxShadow(
            color: OpiateTheme.sacredGold.withValues(alpha: 0.15),
            blurRadius: 18,
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'VERSE OF THE DAY',
                style: GoogleFonts.cinzel(
                  color: OpiateTheme.sacredGold,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.2,
                ),
              ),
              const Icon(Icons.auto_awesome, color: OpiateTheme.sacredGold, size: 18),
            ],
          ),
          const SizedBox(height: 14),

          Text(
            'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
            textAlign: TextAlign.center,
            style: GoogleFonts.amiri(
              color: OpiateTheme.textArabic,
              fontSize: 26,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 10),

          Text(
            '“Unquestionably, by the remembrance of Allah do hearts find rest.” (Ar-Ra\'d 13:28)',
            textAlign: TextAlign.center,
            style: GoogleFonts.outfit(
              color: OpiateTheme.textMuted,
              fontSize: 12,
              fontStyle: FontStyle.italic,
            ),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 400.ms);
  }

  Widget _buildReciterBanner(BuildContext context, QuranProvider provider) {
    return InkWell(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const ReciterSelectionScreen()),
        );
      },
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: OpiateTheme.slateCard,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: OpiateTheme.borderGold),
        ),
        child: Row(
          children: [
            const CircleAvatar(
              radius: 18,
              backgroundColor: OpiateTheme.sacredGold,
              child: Icon(Icons.record_voice_over, color: OpiateTheme.celestialMidnight, size: 18),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'ACTIVE RECITER (QARI)',
                    style: GoogleFonts.orbitron(color: OpiateTheme.sacredGold, fontSize: 9),
                  ),
                  Text(
                    provider.selectedReciter.name,
                    style: GoogleFonts.cinzel(
                      color: Colors.white,
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(Icons.swap_horiz, color: OpiateTheme.sacredGold, size: 22),
          ],
        ),
      ),
    );
  }

  Widget _buildFeatureQuickTile(
    BuildContext context, {
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return Expanded(
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 3),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          child: Container(
            padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 6),
            decoration: BoxDecoration(
              color: OpiateTheme.deepEmerald,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: OpiateTheme.borderGold),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(icon, color: OpiateTheme.sacredGold, size: 20),
                const SizedBox(height: 6),
                Text(
                  label,
                  textAlign: TextAlign.center,
                  style: GoogleFonts.cinzel(
                    color: Colors.white,
                    fontSize: 9,
                    fontWeight: FontWeight.bold,
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
