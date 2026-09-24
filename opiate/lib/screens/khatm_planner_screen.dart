import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../theme/opiate_theme.dart';
import '../widgets/islamic_pattern_background.dart';

class KhatmPlannerScreen extends StatefulWidget {
  const KhatmPlannerScreen({super.key});

  @override
  State<KhatmPlannerScreen> createState() => _KhatmPlannerScreenState();
}

class _KhatmPlannerScreenState extends State<KhatmPlannerScreen> {
  int _targetDays = 30;
  int _completedPages = 142;
  final int _totalPages = 604;

  @override
  Widget build(BuildContext context) {
    final double progressPct = (_completedPages / _totalPages);
    final int remainingPages = _totalPages - _completedPages;
    final int dailyTargetPages = (remainingPages / (_targetDays == 0 ? 1 : _targetDays)).ceil();

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
            'KHATM AL-QURAN PLANNER',
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
              // Progress Banner
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
                      'KHATM COMPLETION PROGRESS',
                      style: GoogleFonts.cinzel(
                        color: OpiateTheme.sacredGold,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 14),

                    Stack(
                      alignment: Alignment.center,
                      children: [
                        SizedBox(
                          width: 140,
                          height: 140,
                          child: CircularProgressIndicator(
                            value: progressPct,
                            strokeWidth: 8,
                            color: OpiateTheme.sacredGold,
                            backgroundColor: Colors.white12,
                          ),
                        ),
                        Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              '${(progressPct * 100).toStringAsFixed(1)}%',
                              style: GoogleFonts.orbitron(
                                color: Colors.white,
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            Text(
                              '$_completedPages / $_totalPages PAGES',
                              style: GoogleFonts.orbitron(color: OpiateTheme.textMuted, fontSize: 8),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
              ).animate().fadeIn(duration: 400.ms),

              const SizedBox(height: 20),

              // Target Calculator Card
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'TARGET COMPLETION DAYS',
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
                            'TARGET: $_targetDays DAYS (RAMADAN GOAL)',
                            style: GoogleFonts.orbitron(color: Colors.white, fontSize: 10),
                          ),
                          Text(
                            '$dailyTargetPages PAGES / DAY',
                            style: GoogleFonts.orbitron(
                              color: OpiateTheme.sacredGold,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      Slider(
                        value: _targetDays.toDouble(),
                        min: 7,
                        max: 90,
                        divisions: 83,
                        activeColor: OpiateTheme.sacredGold,
                        inactiveColor: Colors.white12,
                        onChanged: (val) => setState(() => _targetDays = val.toInt()),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 20),

              // Log Progress Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: OpiateTheme.sacredGold,
                    foregroundColor: OpiateTheme.celestialMidnight,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  onPressed: () {
                    setState(() {
                      if (_completedPages + 10 <= _totalPages) {
                        _completedPages += 10;
                      }
                    });
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('📖 RECORDED 10 PAGES READ! BARAKALLAHU FEEK!'),
                        backgroundColor: OpiateTheme.deepEmerald,
                      ),
                    );
                  },
                  icon: const Icon(Icons.bookmark_add),
                  label: Text(
                    'LOG TODAY\'S READING (+10 PAGES)',
                    style: GoogleFonts.orbitron(fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
