import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/opiate_theme.dart';
import '../widgets/islamic_pattern_background.dart';

class MemorizationCompanionScreen extends StatefulWidget {
  const MemorizationCompanionScreen({super.key});

  @override
  State<MemorizationCompanionScreen> createState() => _MemorizationCompanionScreenState();
}

class _MemorizationCompanionScreenState extends State<MemorizationCompanionScreen> {
  bool _hideArabicText = false;
  int _repeatCount = 3;

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
            'HIFZ MEMORIZATION COMPANION',
            style: GoogleFonts.cinzel(
              color: OpiateTheme.sacredGold,
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
          centerTitle: true,
        ),
        body: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            children: [
              // Banner
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: OpiateTheme.deepEmerald,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: OpiateTheme.borderGold),
                ),
                child: Column(
                  children: [
                    const Icon(Icons.psychology, color: OpiateTheme.sacredGold, size: 32),
                    const SizedBox(height: 10),
                    Text(
                      'SYSTEMATIC AYAH REPETITION & TEST MODE',
                      style: GoogleFonts.cinzel(
                        color: OpiateTheme.sacredGold,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Listen to repeated recitation loops & hide Arabic text to recall from memory.',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.outfit(color: OpiateTheme.textMuted, fontSize: 11),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Controls Card
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'LOOP & REPEAT SETTINGS',
                        style: GoogleFonts.cinzel(
                          color: OpiateTheme.sacredGold,
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 12),

                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'AYAH REPEATS: $_repeatCount TIMED LOOPS',
                            style: GoogleFonts.orbitron(color: Colors.white, fontSize: 11),
                          ),
                        ],
                      ),
                      Slider(
                        value: _repeatCount.toDouble(),
                        min: 1,
                        max: 10,
                        divisions: 9,
                        activeColor: OpiateTheme.sacredGold,
                        inactiveColor: Colors.white12,
                        onChanged: (val) => setState(() => _repeatCount = val.toInt()),
                      ),

                      const Divider(color: Colors.white12),

                      SwitchListTile(
                        contentPadding: EdgeInsets.zero,
                        activeTrackColor: OpiateTheme.sacredGold,
                        title: Text(
                          'HIDE ARABIC TEXT (MEMORY RECALL TEST)',
                          style: GoogleFonts.cinzel(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                        ),
                        subtitle: Text(
                          'Blurs Arabic text so you recite from memory while listening.',
                          style: GoogleFonts.outfit(color: OpiateTheme.textMuted, fontSize: 10),
                        ),
                        value: _hideArabicText,
                        onChanged: (val) => setState(() => _hideArabicText = val),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 20),

              // Practice Verse Box
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: OpiateTheme.slateCard,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: OpiateTheme.borderGold),
                ),
                child: Column(
                  children: [
                    Text(
                      'PRACTICE VERSE • SURAH AL-FATIHAH (1:1)',
                      style: GoogleFonts.orbitron(color: OpiateTheme.sacredGold, fontSize: 10),
                    ),
                    const SizedBox(height: 16),

                    AnimatedOpacity(
                      duration: const Duration(milliseconds: 300),
                      opacity: _hideArabicText ? 0.05 : 1.0,
                      child: Text(
                        'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
                        style: GoogleFonts.amiri(
                          color: OpiateTheme.textArabic,
                          fontSize: 32,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),

                    const SizedBox(height: 16),

                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: OpiateTheme.sacredGold,
                        foregroundColor: OpiateTheme.celestialMidnight,
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                      ),
                      onPressed: () {
                        setState(() => _hideArabicText = !_hideArabicText);
                      },
                      icon: Icon(_hideArabicText ? Icons.visibility : Icons.visibility_off),
                      label: Text(
                        _hideArabicText ? 'REVEAL TEXT' : 'HIDE TEXT FOR MEMORIZATION TEST',
                        style: GoogleFonts.orbitron(fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
