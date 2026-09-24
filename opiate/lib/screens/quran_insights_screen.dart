import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../theme/opiate_theme.dart';
import '../widgets/islamic_pattern_background.dart';

class QuranInsightsScreen extends StatefulWidget {
  const QuranInsightsScreen({super.key});

  @override
  State<QuranInsightsScreen> createState() => _QuranInsightsScreenState();
}

class _QuranInsightsScreenState extends State<QuranInsightsScreen> {
  int _currentQuestionIndex = 0;
  int _score = 0;
  bool _quizCompleted = false;

  final List<Map<String, dynamic>> _quizQuestions = const [
    {
      'question': 'Which Surah is known as the "Heart of the Quran"?',
      'options': ['Surah Al-Fatihah', 'Surah Ya-Sin', 'Surah Ar-Rahman', 'Surah Al-Mulk'],
      'answerIndex': 1,
      'explanation': 'Prophet Muhammad (ﷺ) referred to Surah Ya-Sin (Chapter 36) as the Heart of the Quran.',
    },
    {
      'question': 'Which Surah does not begin with Bismillah-ir-Rahman-ir-Rahim?',
      'options': ['Surah At-Tawbah', 'Surah Al-Anfal', 'Surah Maryam', 'Surah Al-Fatiha'],
      'answerIndex': 0,
      'explanation': 'Surah At-Tawbah (Chapter 9) is the only Surah that does not begin with Bismillah.',
    },
    {
      'question': 'How many Surahs are there in the Holy Quran?',
      'options': ['110', '114', '120', '99'],
      'answerIndex': 1,
      'explanation': 'The Holy Quran consists of 114 Surahs (chapters) divided into 30 Juz.',
    },
  ];

  void _answerQuestion(int selectedIndex) {
    if (_quizQuestions[_currentQuestionIndex]['answerIndex'] == selectedIndex) {
      _score++;
    }
    setState(() {
      if (_currentQuestionIndex + 1 < _quizQuestions.length) {
        _currentQuestionIndex++;
      } else {
        _quizCompleted = true;
      }
    });
  }

  void _resetQuiz() {
    setState(() {
      _currentQuestionIndex = 0;
      _score = 0;
      _quizCompleted = false;
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
            'QURAN INSIGHTS & KNOWLEDGE',
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
              // Tafsir Reflection Card
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
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'DAILY TAFSIR REFLECTION',
                          style: GoogleFonts.cinzel(
                            color: OpiateTheme.sacredGold,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const Icon(Icons.menu_book, color: OpiateTheme.sacredGold, size: 20),
                      ],
                    ),
                    const SizedBox(height: 12),

                    Text(
                      '“The Quran was revealed as a healing for hearts, a light for minds, and an eternal guide for humanity.”',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.outfit(
                        color: Colors.white,
                        fontSize: 13,
                        fontStyle: FontStyle.italic,
                        height: 1.5,
                      ),
                    ),
                  ],
                ),
              ).animate().fadeIn(duration: 400.ms),

              const SizedBox(height: 20),

              // Interactive Quiz Card
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(18.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'QURANIC KNOWLEDGE QUIZ',
                            style: GoogleFonts.cinzel(
                              color: OpiateTheme.sacredGold,
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Text(
                            _quizCompleted ? 'FINISHED' : 'QUESTION ${_currentQuestionIndex + 1}/${_quizQuestions.length}',
                            style: GoogleFonts.orbitron(color: OpiateTheme.textMuted, fontSize: 10),
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),

                      if (!_quizCompleted) ...[
                        Text(
                          _quizQuestions[_currentQuestionIndex]['question'],
                          style: GoogleFonts.cinzel(
                            color: Colors.white,
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 16),

                        ...List.generate(4, (i) {
                          final optionText = _quizQuestions[_currentQuestionIndex]['options'][i];
                          return Container(
                            margin: const EdgeInsets.only(bottom: 10),
                            width: double.infinity,
                            child: OutlinedButton(
                              style: OutlinedButton.styleFrom(
                                foregroundColor: Colors.white,
                                side: const BorderSide(color: OpiateTheme.borderGold),
                                padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              ),
                              onPressed: () => _answerQuestion(i),
                              child: Text(
                                optionText,
                                style: GoogleFonts.outfit(fontSize: 13),
                              ),
                            ),
                          );
                        }),
                      ] else ...[
                        Center(
                          child: Column(
                            children: [
                              const Icon(Icons.emoji_events, color: OpiateTheme.sacredGold, size: 48),
                              const SizedBox(height: 12),
                              Text(
                                'QUIZ COMPLETED!',
                                style: GoogleFonts.cinzel(
                                  color: OpiateTheme.sacredGold,
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                'Your Score: $_score / ${_quizQuestions.length}',
                                style: GoogleFonts.orbitron(
                                  color: Colors.white,
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 16),

                              ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: OpiateTheme.sacredGold,
                                  foregroundColor: OpiateTheme.celestialMidnight,
                                ),
                                onPressed: _resetQuiz,
                                child: Text(
                                  'TRY AGAIN',
                                  style: GoogleFonts.orbitron(fontWeight: FontWeight.bold),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ],
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
