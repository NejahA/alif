import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../theme/opiate_theme.dart';
import '../widgets/islamic_pattern_background.dart';

class TasbihDhikrScreen extends StatefulWidget {
  const TasbihDhikrScreen({super.key});

  @override
  State<TasbihDhikrScreen> createState() => _TasbihDhikrScreenState();
}

class _TasbihDhikrScreenState extends State<TasbihDhikrScreen> {
  int _counter = 0;
  int _target = 33;
  int _totalCompletedLaps = 0;
  String _selectedDhikrArabic = 'سُبْحَانَ اللَّهِ';
  String _selectedDhikrTranslation = 'Glory be to Allah';

  final List<Map<String, dynamic>> _dhikrPresets = const [
    {
      'arabic': 'سُبْحَانَ اللَّهِ',
      'english': 'SubhanAllah',
      'translation': 'Glory be to Allah',
      'target': 33,
    },
    {
      'arabic': 'الْحَمْدُ لِلَّهِ',
      'english': 'Alhamdulillah',
      'translation': 'Praise be to Allah',
      'target': 33,
    },
    {
      'arabic': 'اللَّهُ أَكْبَرُ',
      'english': 'Allahu Akbar',
      'translation': 'Allah is the Greatest',
      'target': 34,
    },
    {
      'arabic': 'أَسْتَغْفِرُ اللَّهَ',
      'english': 'Astaghfirullah',
      'translation': 'I seek forgiveness from Allah',
      'target': 100,
    },
    {
      'arabic': 'لَا إِلَٰهَ إِلَّا اللَّهُ',
      'english': 'La ilaha illallah',
      'translation': 'There is no deity except Allah',
      'target': 100,
    },
  ];

  void _incrementCounter() {
    setState(() {
      _counter++;
      if (_counter >= _target) {
        _counter = 0;
        _totalCompletedLaps++;
      }
    });
  }

  void _resetCounter() {
    setState(() {
      _counter = 0;
      _totalCompletedLaps = 0;
    });
  }

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
            'DIGITAL TASBIH & ATHKAR',
            style: GoogleFonts.cinzel(
              color: OpiateTheme.sacredGold,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          centerTitle: true,
          actions: [
            IconButton(
              icon: const Icon(Icons.refresh, color: OpiateTheme.sacredGold),
              onPressed: _resetCounter,
            ),
          ],
        ),
        body: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            children: [
              // Dhikr Selector Dropdown
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                decoration: BoxDecoration(
                  color: OpiateTheme.deepEmerald,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: OpiateTheme.borderGold),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<Map<String, dynamic>>(
                    value: _dhikrPresets.firstWhere((d) => d['arabic'] == _selectedDhikrArabic),
                    dropdownColor: OpiateTheme.deepEmerald,
                    icon: const Icon(Icons.keyboard_arrow_down, color: OpiateTheme.sacredGold),
                    items: _dhikrPresets.map((preset) {
                      return DropdownMenuItem<Map<String, dynamic>>(
                        value: preset,
                        child: Text(
                          '${preset['english']} (${preset['arabic']})',
                          style: GoogleFonts.cinzel(
                            color: Colors.white,
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      );
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) {
                        setState(() {
                          _selectedDhikrArabic = val['arabic'];
                          _selectedDhikrTranslation = val['translation'];
                          _target = val['target'];
                          _counter = 0;
                        });
                      }
                    },
                  ),
                ),
              ),

              const SizedBox(height: 24),

              // Big Circular Digital Tasbih Counter Button
              GestureDetector(
                onTap: _incrementCounter,
                child: Container(
                  width: 220,
                  height: 220,
                  decoration: BoxDecoration(
                    color: OpiateTheme.deepEmerald,
                    shape: BoxShape.circle,
                    border: Border.all(color: OpiateTheme.sacredGold, width: 3),
                    boxShadow: [
                      BoxShadow(
                        color: OpiateTheme.sacredGold.withValues(alpha: 0.25),
                        blurRadius: 24,
                        spreadRadius: 2,
                      ),
                    ],
                  ),
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      SizedBox(
                        width: 200,
                        height: 200,
                        child: CircularProgressIndicator(
                          value: _counter / _target,
                          strokeWidth: 6,
                          color: OpiateTheme.sacredGold,
                          backgroundColor: Colors.white12,
                        ),
                      ),
                      Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            _selectedDhikrArabic,
                            style: GoogleFonts.amiri(
                              color: OpiateTheme.sacredGold,
                              fontSize: 26,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 4),

                          Text(
                            '$_counter / $_target',
                            style: GoogleFonts.orbitron(
                              color: Colors.white,
                              fontSize: 32,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 4),

                          Text(
                            'LAPS COMPLETED: $_totalCompletedLaps',
                            style: GoogleFonts.orbitron(
                              color: OpiateTheme.textMuted,
                              fontSize: 9,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ).animate(target: _counter > 0 ? 1 : 0).scale(duration: 100.ms, begin: const Offset(0.96, 0.96)),
              ),

              const SizedBox(height: 16),

              Text(
                'TAP CIRCLE TO COUNT DHIKR',
                style: GoogleFonts.cinzel(
                  color: OpiateTheme.sacredGold.withValues(alpha: 0.8),
                  fontSize: 11,
                  letterSpacing: 1.5,
                ),
              ),

              const SizedBox(height: 24),

              // Dhikr Translation Card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: OpiateTheme.slateCard,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: OpiateTheme.borderGold),
                ),
                child: Column(
                  children: [
                    Text(
                      'MEANING & INTENTION',
                      style: GoogleFonts.cinzel(
                        color: OpiateTheme.sacredGold,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      '“$_selectedDhikrTranslation”',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.outfit(
                        color: Colors.white70,
                        fontSize: 13,
                        fontStyle: FontStyle.italic,
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
