import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../theme/opiate_theme.dart';
import '../widgets/islamic_pattern_background.dart';

class PrayerTimesScreen extends StatelessWidget {
  const PrayerTimesScreen({super.key});

  final List<Map<String, String>> _prayerTimes = const [
    {'name': 'Fajr', 'time': '04:42 AM', 'status': 'PASSED', 'arabic': 'الفجر'},
    {'name': 'Sunrise', 'time': '06:08 AM', 'status': 'PASSED', 'arabic': 'الشروق'},
    {'name': 'Dhuhr', 'time': '12:28 PM', 'status': 'NEXT PRAYER', 'arabic': 'الظهر'},
    {'name': 'Asr', 'time': '03:45 PM', 'status': 'UPCOMING', 'arabic': 'العصر'},
    {'name': 'Maghrib', 'time': '06:48 PM', 'status': 'UPCOMING', 'arabic': 'المغرب'},
    {'name': 'Isha', 'time': '08:12 PM', 'status': 'UPCOMING', 'arabic': 'العشاء'},
  ];

  @override
  Widget build(BuildContext context) {
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
            'PRAYER TIMES & QIBLA',
            style: GoogleFonts.cinzel(
              color: OpiateTheme.sacredGold,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          centerTitle: true,
        ),
        body: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            children: [
              // Next Prayer Countdown Card
              Container(
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
                    Text(
                      'NEXT PRAYER: DHUHR (12:28 PM)',
                      style: GoogleFonts.cinzel(
                        color: OpiateTheme.sacredGold,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 10),

                    Text(
                      '00:17:34',
                      style: GoogleFonts.orbitron(
                        color: Colors.white,
                        fontSize: 36,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),

                    Text(
                      'TIME REMAINING UNTIL ADHAN',
                      style: GoogleFonts.orbitron(color: OpiateTheme.textMuted, fontSize: 9),
                    ),
                  ],
                ),
              ).animate().fadeIn(duration: 400.ms),

              const SizedBox(height: 20),

              // Qibla Compass Simulator Box
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: OpiateTheme.slateCard,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: OpiateTheme.borderGold),
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.explore, color: OpiateTheme.sacredGold, size: 20),
                            const SizedBox(width: 8),
                            Text(
                              'QIBLA DIRECTION',
                              style: GoogleFonts.cinzel(
                                color: OpiateTheme.sacredGold,
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                        Text(
                          '114.2° SE • ALIGNED',
                          style: GoogleFonts.orbitron(color: OpiateTheme.emeraldGlow, fontSize: 10, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // Compass Graphic
                    Container(
                      width: 110,
                      height: 110,
                      decoration: BoxDecoration(
                        color: OpiateTheme.deepEmerald,
                        shape: BoxShape.circle,
                        border: Border.all(color: OpiateTheme.sacredGold, width: 2),
                      ),
                      child: const Center(
                        child: Icon(Icons.navigation, color: OpiateTheme.sacredGold, size: 48),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Prayer Times Table
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _prayerTimes.length,
                itemBuilder: (context, index) {
                  final p = _prayerTimes[index];
                  final isNext = p['status'] == 'NEXT PRAYER';

                  return Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: isNext
                          ? OpiateTheme.sacredGold.withValues(alpha: 0.12)
                          : OpiateTheme.slateCard,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: isNext ? OpiateTheme.sacredGold : OpiateTheme.borderGold,
                      ),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Icon(
                              isNext ? Icons.access_time_filled : Icons.access_time,
                              color: isNext ? OpiateTheme.sacredGold : Colors.white38,
                              size: 20,
                            ),
                            const SizedBox(width: 12),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  p['name']!,
                                  style: GoogleFonts.cinzel(
                                    color: isNext ? OpiateTheme.sacredGold : Colors.white,
                                    fontSize: 14,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                Text(
                                  p['arabic']!,
                                  style: GoogleFonts.amiri(color: OpiateTheme.textMuted, fontSize: 13),
                                ),
                              ],
                            ),
                          ],
                        ),
                        Text(
                          p['time']!,
                          style: GoogleFonts.orbitron(
                            color: isNext ? OpiateTheme.sacredGold : Colors.white,
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
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
}
