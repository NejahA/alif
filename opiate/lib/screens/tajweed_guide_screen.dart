import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../theme/opiate_theme.dart';
import '../widgets/islamic_pattern_background.dart';

class TajweedGuideScreen extends StatelessWidget {
  const TajweedGuideScreen({super.key});

  final List<Map<String, dynamic>> _tajweedRules = const [
    {
      'title': 'Qalqalah (Echo / Bouncing Sound)',
      'arabic': 'قَلْقَلَة',
      'color': Color(0xFFEF4444), // Red
      'letters': 'ق ط ب ج د (قطب جد)',
      'desc': 'Releasing the sound with a slight bouncing echo when the letter carries a Sukoon.',
      'example': 'قُلْ هُوَ اللَّهُ أَحَدٌ ﴿١﴾',
    },
    {
      'title': 'Ghunnah (Nasalization)',
      'arabic': 'غُنَّة',
      'color': Color(0xFF10B981), // Emerald
      'letters': 'نّ , مّ',
      'desc': 'Holding a nasal tone for 2 counts when Noon or Meem carries a Shaddah.',
      'example': 'إِنَّ الْإِنسَانَ لَفِي خُسْرٍ',
    },
    {
      'title': 'Ikhfa (Concealment)',
      'arabic': 'إِخْفَاء',
      'color': Color(0xFF3B82F6), // Blue
      'letters': 'ت ث ج د ذ ز س ش ص ض ط ظ ف ق ك',
      'desc': 'Concealing the Noon Sakinah or Tanween with a light nasal sound before these 15 letters.',
      'example': 'مِن شَرِّ مَا خَلَقَ',
    },
    {
      'title': 'Madd (Lengthening / Elongation)',
      'arabic': 'مَدّ',
      'color': Color(0xFF8B5CF6), // Purple
      'letters': 'ا , و , ي',
      'desc': 'Prolonging the vowel sound for 2 to 6 counts depending on the surrounding Hamzah or Sukoon.',
      'example': 'وَالصَّافَّاتِ صَفًّا',
    },
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
            'TAJWEED RULES & PRONUNCIATION',
            style: GoogleFonts.cinzel(
              color: OpiateTheme.sacredGold,
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
          centerTitle: true,
        ),
        body: ListView.builder(
          padding: const EdgeInsets.all(16.0),
          itemCount: _tajweedRules.length,
          itemBuilder: (context, index) {
            final rule = _tajweedRules[index];
            final Color ruleColor = rule['color'];

            return Container(
              margin: const EdgeInsets.only(bottom: 16),
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: OpiateTheme.slateCard,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: ruleColor.withValues(alpha: 0.6), width: 1.5),
                boxShadow: [
                  BoxShadow(
                    color: ruleColor.withValues(alpha: 0.1),
                    blurRadius: 12,
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          rule['title'],
                          style: GoogleFonts.cinzel(
                            color: Colors.white,
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: ruleColor.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: ruleColor),
                        ),
                        child: Text(
                          rule['arabic'],
                          style: GoogleFonts.amiri(
                            color: ruleColor,
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),

                  Text(
                    'Letters: ${rule['letters']}',
                    style: GoogleFonts.amiri(
                      color: OpiateTheme.sacredGold,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 6),

                  Text(
                    rule['desc'],
                    style: GoogleFonts.outfit(color: OpiateTheme.textMuted, fontSize: 11, height: 1.4),
                  ),
                  const SizedBox(height: 12),
                  const Divider(color: Colors.white12),
                  const SizedBox(height: 8),

                  Text(
                    'EXAMPLE VERSE:',
                    style: GoogleFonts.orbitron(color: Colors.white38, fontSize: 9),
                  ),
                  const SizedBox(height: 4),

                  Text(
                    rule['example'],
                    textAlign: TextAlign.right,
                    style: GoogleFonts.amiri(
                      color: ruleColor,
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ).animate().fadeIn(delay: (index * 100).ms);
          },
        ),
      ),
    );
  }
}
