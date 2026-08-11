import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'data/haiiah_data.dart';
import 'models/verse.dart';
import 'theme/haiiah_theme.dart';

void main() {
  runApp(const HaiiahApp());
}

class HaiiahApp extends StatelessWidget {
  const HaiiahApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'HAIIAH — God Consciousness',
      debugShowCheckedModeBanner: false,
      theme: HaiiahTheme.lightTheme,
      home: const HomeScreen(),
    );
  }
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;
  final List<Widget> _screens = const [
    DailyScreen(),
    NamesScreen(),
    TasbihScreen(),
    DuaScreen(),
    QuizScreen(),
    ReflectScreen(),
    SearchScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) {
          setState(() => _currentIndex = index);
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.menu_book_outlined),
            selectedIcon: Icon(Icons.menu_book),
            label: 'Daily',
          ),
          NavigationDestination(
            icon: Icon(Icons.star_outline),
            selectedIcon: Icon(Icons.star),
            label: 'Names',
          ),
          NavigationDestination(
            icon: Icon(Icons.touch_app_outlined),
            selectedIcon: Icon(Icons.touch_app),
            label: 'Tasbih',
          ),
          NavigationDestination(
            icon: Icon(Icons.handshake_outlined),
            selectedIcon: Icon(Icons.handshake),
            label: 'Du\'a',
          ),
          NavigationDestination(
            icon: Icon(Icons.quiz_outlined),
            selectedIcon: Icon(Icons.quiz),
            label: 'Quiz',
          ),
          NavigationDestination(
            icon: Icon(Icons.self_improvement_outlined),
            selectedIcon: Icon(Icons.self_improvement),
            label: 'Reflect',
          ),
          NavigationDestination(
            icon: Icon(Icons.search_outlined),
            selectedIcon: Icon(Icons.search),
            label: 'Search',
          ),
        ],
      ),
    );
  }
}

/* ============ Daily Screen ============ */
class DailyScreen extends StatefulWidget {
  const DailyScreen({super.key});

  @override
  State<DailyScreen> createState() => _DailyScreenState();
}

class _DailyScreenState extends State<DailyScreen> {
  late Verse _dailyVerse;
  late Hadith _dailyHadith;
  int _lastVerseIndex = -1;
  int _lastHadithIndex = -1;

  @override
  void initState() {
    super.initState();
    final days = DateTime.now().millisecondsSinceEpoch ~/ (1000 * 60 * 60 * 24);
    _dailyVerse = HaiiahData.verses[days % HaiiahData.verses.length];
    _dailyHadith = HaiiahData.hadiths[days % HaiiahData.hadiths.length];
  }

  void _showRandomVerse() {
    setState(() {
      int idx;
      do {
        idx = DateTime.now().millisecondsSinceEpoch % HaiiahData.verses.length;
      } while (idx == _lastVerseIndex && HaiiahData.verses.length > 1);
      _lastVerseIndex = idx;
      _dailyVerse = HaiiahData.verses[idx];
    });
  }

  void _showRandomHadith() {
    setState(() {
      int idx;
      do {
        idx = DateTime.now().millisecondsSinceEpoch % HaiiahData.hadiths.length;
      } while (idx == _lastHadithIndex && HaiiahData.hadiths.length > 1);
      _lastHadithIndex = idx;
      _dailyHadith = HaiiahData.hadiths[idx];
    });
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const SizedBox(height: 8),
            Text(
              'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 22,
                color: HaiiahTheme.gold,
                fontFamily: 'serif',
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Cultivate God Consciousness',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.headlineLarge,
            ),
            const SizedBox(height: 4),
            Text(
              'Taqwa — the living awareness of Allah in every breath, every thought, every deed.',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 24),

            // Daily Verse Card
            _SectionHeader(
              icon: Icons.menu_book,
              title: 'Ayah of the Day',
            ),
            const SizedBox(height: 12),
            _VerseCard(verse: _dailyVerse),
            const SizedBox(height: 8),
            Center(
              child: TextButton.icon(
                onPressed: _showRandomVerse,
                icon: const Icon(Icons.shuffle),
                label: const Text('Another Verse'),
              ),
            ),

            const SizedBox(height: 24),

            // Hadith Card
            _SectionHeader(
              icon: Icons.format_quote,
              title: 'Hadith of the Day',
            ),
            const SizedBox(height: 12),
            _HadithCard(hadith: _dailyHadith),
            const SizedBox(height: 8),
            Center(
              child: TextButton.icon(
                onPressed: _showRandomHadith,
                icon: const Icon(Icons.shuffle),
                label: const Text('Another Hadith'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final IconData icon;
  final String title;

  const _SectionHeader({required this.icon, required this.title});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, color: HaiiahTheme.gold, size: 20),
        const SizedBox(width: 8),
        Text(
          title,
          style: Theme.of(context).textTheme.titleLarge,
        ),
      ],
    );
  }
}

class _VerseCard extends StatelessWidget {
  final Verse verse;

  const _VerseCard({required this.verse});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: HaiiahTheme.gold.withValues(alpha: 0.2)),
        boxShadow: [
          BoxShadow(
            color: HaiiahTheme.deep.withValues(alpha: 0.08),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        children: [
          Text(
            '﴿ ${verse.arabic} ﴾',
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 20,
              height: 2,
              color: HaiiahTheme.deep,
              fontFamily: 'serif',
            ),
          ),
          const SizedBox(height: 16),
          Text(
            '"${verse.translation}"',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  fontStyle: FontStyle.italic,
                ),
          ),
          const SizedBox(height: 12),
          Text(
            verse.reference,
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: HaiiahTheme.gold,
              fontWeight: FontWeight.w600,
              fontSize: 13,
            ),
          ),
        ],
      ),
    );
  }
}

class _HadithCard extends StatelessWidget {
  final Hadith hadith;

  const _HadithCard({required this.hadith});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: HaiiahTheme.deep,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: HaiiahTheme.deep.withValues(alpha: 0.2),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        children: [
          Text(
            '❝ ${hadith.arabic} ❞',
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 18,
              height: 2,
              color: HaiiahTheme.ivory,
              fontFamily: 'serif',
            ),
          ),
          const SizedBox(height: 16),
          Text(
            '"${hadith.translation}"',
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: HaiiahTheme.goldLight,
              fontSize: 14,
              height: 1.6,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            hadith.source,
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: HaiiahTheme.gold,
              fontWeight: FontWeight.w500,
              fontSize: 13,
            ),
          ),
        ],
      ),
    );
  }
}

/* ============ Names Screen ============ */
class NamesScreen extends StatelessWidget {
  const NamesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const SizedBox(height: 8),
            Text(
              'Asma ul-Husna',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.headlineLarge,
            ),
            const SizedBox(height: 4),
            Text(
              '"And to Allah belong the best names, so invoke Him by them." — Qur\'an 7:180',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 20),
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                childAspectRatio: 1.1,
              ),
              itemCount: HaiiahData.namesOfAllah.length,
              itemBuilder: (context, index) {
                final name = HaiiahData.namesOfAllah[index];
                return _NameCard(name: name);
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _NameCard extends StatelessWidget {
  final NameOfAllah name;

  const _NameCard({required this.name});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: HaiiahTheme.gold.withValues(alpha: 0.15)),
        boxShadow: [
          BoxShadow(
            color: HaiiahTheme.deep.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            name.arabic,
            style: const TextStyle(
              fontSize: 22,
              color: HaiiahTheme.emerald,
              fontFamily: 'serif',
            ),
          ),
          const SizedBox(height: 6),
          Text(
            name.translit,
            style: const TextStyle(
              fontWeight: FontWeight.w600,
              color: HaiiahTheme.deep,
              fontSize: 14,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            name.meaning,
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: HaiiahTheme.muted,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }
}

/* ============ Tasbih Screen ============ */
class TasbihScreen extends StatefulWidget {
  const TasbihScreen({super.key});

  @override
  State<TasbihScreen> createState() => _TasbihScreenState();
}

class _TasbihScreenState extends State<TasbihScreen> {
  int _count = 0;
  final int _target = 33;
  int _activePhrase = 0;

  static const List<Map<String, String>> _phrases = [
    {'arabic': 'سُبْحَانَ اللَّهِ', 'translation': 'Glory be to Allah'},
    {'arabic': 'الْحَمْدُ لِلَّهِ', 'translation': 'Praise be to Allah'},
    {'arabic': 'اللَّهُ أَكْبَرُ', 'translation': 'Allah is the Greatest'},
    {'arabic': 'لَا إِلَٰهَ إِلَّا اللَّهُ', 'translation': 'There is no god but Allah'},
    {'arabic': 'أَسْتَغْفِرُ اللَّهَ', 'translation': 'I seek forgiveness from Allah'},
  ];

  void _increment() {
    setState(() {
      _count++;
      if (_count >= _target) {
        _count = 0;
      }
    });
  }

  void _reset() {
    setState(() => _count = 0);
  }

  void _selectPhrase(int index) {
    setState(() {
      _activePhrase = index;
      _count = 0;
    });
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const SizedBox(height: 8),
            Text(
              'Dhikr',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.headlineLarge,
            ),
            const SizedBox(height: 4),
            Text(
              'Tasbih Counter — "So remember Me; I will remember you." (Qur\'an 2:152)',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(32),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: HaiiahTheme.gold.withValues(alpha: 0.15)),
                boxShadow: [
                  BoxShadow(
                    color: HaiiahTheme.deep.withValues(alpha: 0.08),
                    blurRadius: 20,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Column(
                children: [
                  Text(
                    _phrases[_activePhrase]['arabic']!,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 28,
                      height: 1.8,
                      color: HaiiahTheme.deep,
                      fontFamily: 'serif',
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _phrases[_activePhrase]['translation']!,
                    style: const TextStyle(
                      color: HaiiahTheme.muted,
                      fontStyle: FontStyle.italic,
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 24),
                  Text(
                    '$_count',
                    style: const TextStyle(
                      fontSize: 64,
                      fontWeight: FontWeight.bold,
                      color: HaiiahTheme.emerald,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Target: $_target',
                    style: const TextStyle(
                      color: HaiiahTheme.gold,
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: _increment,
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 20),
                      textStyle: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    child: const Text('⭑  Count'),
                  ),
                ),
                const SizedBox(width: 12),
                SizedBox(
                  width: 100,
                  child: OutlinedButton(
                    onPressed: _reset,
                    child: const Text('Reset'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            Text(
              'Choose a Dhikr',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              alignment: WrapAlignment.center,
              children: List.generate(_phrases.length, (index) {
                final isActive = index == _activePhrase;
                return ChoiceChip(
                  label: Text(
                    _phrases[index]['arabic']!,
                    style: const TextStyle(fontFamily: 'serif'),
                  ),
                  selected: isActive,
                  onSelected: (_) => _selectPhrase(index),
                  selectedColor: HaiiahTheme.goldSoft,
                  backgroundColor: Colors.white,
                  labelStyle: TextStyle(
                    fontSize: 14,
                    fontFamily: 'serif',
                    color: isActive ? HaiiahTheme.deep : HaiiahTheme.muted,
                  ),
                );
              }),
            ),
          ],
        ),
      ),
    );
  }
}

/* ============ Du'a Screen ============ */
class DuaScreen extends StatelessWidget {
  const DuaScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const SizedBox(height: 8),
            Text(
              'Du\'a Library',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.headlineLarge,
            ),
            const SizedBox(height: 4),
            Text(
              '"Supplication is worship." — Hadith, At-Tirmidhi',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 20),
            ...HaiiahData.duas.map((dua) {
              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: HaiiahTheme.gold.withValues(alpha: 0.12),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      dua.arabic,
                      style: const TextStyle(
                        fontSize: 16,
                        height: 2,
                        color: HaiiahTheme.deep,
                        fontFamily: 'serif',
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '"${dua.translation}"',
                      style: const TextStyle(
                        color: HaiiahTheme.muted,
                        fontSize: 13,
                        height: 1.6,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Align(
                      alignment: Alignment.centerLeft,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: HaiiahTheme.goldSoft,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          dua.occasion,
                          style: const TextStyle(
                            color: HaiiahTheme.deep,
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              );
            }),
          ],
        ),
      ),
    );
  }
}

/* ============ Quiz Screen ============ */
class QuizScreen extends StatefulWidget {
  const QuizScreen({super.key});

  @override
  State<QuizScreen> createState() => _QuizScreenState();
}

class _QuizScreenState extends State<QuizScreen> {
  int _currentIndex = 0;
  int _score = 0;
  bool _answered = false;
  int? _selectedAnswer;

  @override
  Widget build(BuildContext context) {
    final quiz = HaiiahData.quizQuestions[_currentIndex];
    final isLast = _currentIndex == HaiiahData.quizQuestions.length - 1;
    final isComplete = _currentIndex >= HaiiahData.quizQuestions.length;

    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const SizedBox(height: 8),
            Text(
              'Islamic Quiz',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.headlineLarge,
            ),
            const SizedBox(height: 4),
            Text(
              'Test your knowledge of Islam',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 24),

            if (!isComplete) ...[
              // Progress bar
              ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: LinearProgressIndicator(
                  value: (_currentIndex + 1) / HaiiahData.quizQuestions.length,
                  minHeight: 8,
                  backgroundColor: HaiiahTheme.goldSoft,
                  valueColor: const AlwaysStoppedAnimation<Color>(
                    HaiiahTheme.emerald,
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Question
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: HaiiahTheme.gold.withValues(alpha: 0.12),
                  ),
                ),
                child: Text(
                  '${_currentIndex + 1}. ${quiz.question}',
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 16,
                    height: 1.7,
                    color: HaiiahTheme.deep,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Options
              ...List.generate(quiz.options.length, (i) {
                final option = quiz.options[i];
                final isCorrect = i == quiz.answer;
                final isSelected = i == _selectedAnswer;

                Color borderColor = HaiiahTheme.gold.withValues(alpha: 0.2);
                Color bgColor = HaiiahTheme.ivory;
                IconData? icon;

                if (_answered) {
                  if (isCorrect) {
                    borderColor = HaiiahTheme.emerald;
                    bgColor = HaiiahTheme.emeraldLight.withValues(alpha: 0.1);
                    icon = Icons.check_circle;
                  } else if (isSelected) {
                    borderColor = const Color(0xFFC0392B);
                    bgColor = const Color(0xFFC0392B).withValues(alpha: 0.08);
                    icon = Icons.cancel;
                  }
                }

                return Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: InkWell(
                    onTap: _answered
                        ? null
                        : () {
                            setState(() {
                              _answered = true;
                              _selectedAnswer = i;
                              if (isCorrect) _score++;
                            });
                          },
                    borderRadius: BorderRadius.circular(16),
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: bgColor,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: borderColor, width: 2),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: Text(
                              option,
                              style: const TextStyle(
                                fontSize: 15,
                                color: HaiiahTheme.ink,
                              ),
                            ),
                          ),
                          if (icon != null)
                            Icon(icon, color: borderColor, size: 20),
                        ],
                      ),
                    ),
                  ),
                );
              }),

              const SizedBox(height: 16),

              // Result / Feedback
              if (_answered)
                Text(
                  _selectedAnswer == quiz.answer
                      ? '✅ Correct!'
                      : '❌ The correct answer is: ${quiz.options[quiz.answer]}',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: _selectedAnswer == quiz.answer
                        ? HaiiahTheme.emerald
                        : const Color(0xFFC0392B),
                  ),
                ),

              const SizedBox(height: 20),

              // Actions
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (_answered && !isLast)
                    ElevatedButton(
                      onPressed: () {
                        setState(() {
                          _currentIndex++;
                          _answered = false;
                          _selectedAnswer = null;
                        });
                      },
                      child: const Text('Next Question'),
                    ),
                  if (_answered && isLast)
                    ElevatedButton(
                      onPressed: () {
                        setState(() {
                          _currentIndex++;
                        });
                      },
                      child: const Text('See Results'),
                    ),
                ],
              ),
            ] else ...[
              // Quiz complete
              Container(
                padding: const EdgeInsets.all(40),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(
                    color: HaiiahTheme.gold.withValues(alpha: 0.2),
                  ),
                ),
                child: Column(
                  children: [
                    const Text(
                      '🏆',
                      style: TextStyle(fontSize: 64),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Quiz Complete!',
                      style: Theme.of(context).textTheme.headlineMedium,
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'You scored $_score / ${HaiiahData.quizQuestions.length}',
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: HaiiahTheme.emerald,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      _score >= 8
                          ? 'MashaAllah! Excellent knowledge!'
                          : _score >= 5
                              ? 'Well done! Keep learning!'
                              : 'Keep learning — every step counts!',
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton.icon(
                      onPressed: () {
                        setState(() {
                          _currentIndex = 0;
                          _score = 0;
                          _answered = false;
                          _selectedAnswer = null;
                        });
                      },
                      icon: const Icon(Icons.refresh),
                      label: const Text('Restart Quiz'),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

/* ============ Reflect Screen ============ */
class ReflectScreen extends StatefulWidget {
  const ReflectScreen({super.key});

  @override
  State<ReflectScreen> createState() => _ReflectScreenState();
}

class _ReflectScreenState extends State<ReflectScreen> {
  late String _prompt;
  final TextEditingController _journalController = TextEditingController();
  int _lastPromptIndex = -1;

  @override
  void initState() {
    super.initState();
    _prompt = HaiiahData.reflectionPrompts[0];
    _loadJournal();
  }

  @override
  void dispose() {
    _journalController.dispose();
    super.dispose();
  }

  Future<void> _loadJournal() async {
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getString('haiiah_journal');
    if (saved != null) {
      _journalController.text = saved;
    }
  }

  void _showNewPrompt() {
    setState(() {
      int idx;
      do {
        idx = DateTime.now().millisecondsSinceEpoch % HaiiahData.reflectionPrompts.length;
      } while (idx == _lastPromptIndex && HaiiahData.reflectionPrompts.length > 1);
      _lastPromptIndex = idx;
      _prompt = HaiiahData.reflectionPrompts[idx];
    });
  }

  Future<void> _saveJournal() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('haiiah_journal', _journalController.text);
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Saved — may Allah accept it.'),
        backgroundColor: HaiiahTheme.emerald,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const SizedBox(height: 8),
            Text(
              'A Moment to Reflect',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.headlineLarge,
            ),
            const SizedBox(height: 4),
            Text(
              'Tadabbur — pondering the signs of Allah',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: HaiiahTheme.gold.withValues(alpha: 0.2)),
              ),
              child: Text(
                '🕊  $_prompt',
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 16,
                  height: 1.8,
                  color: HaiiahTheme.deep,
                ),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                ElevatedButton.icon(
                  onPressed: _showNewPrompt,
                  icon: const Icon(Icons.refresh),
                  label: const Text('New Reflection'),
                ),
                const SizedBox(width: 12),
                OutlinedButton.icon(
                  onPressed: _saveJournal,
                  icon: const Icon(Icons.save_outlined),
                  label: const Text('Save'),
                ),
              ],
            ),
            const SizedBox(height: 24),
            Text(
              'My Journal',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _journalController,
              maxLines: 8,
              decoration: InputDecoration(
                hintText: 'Write your reflections here... Your words are between you and your Lord.',
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: BorderSide(color: HaiiahTheme.gold.withValues(alpha: 0.3)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: BorderSide(color: HaiiahTheme.gold.withValues(alpha: 0.3)),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: const BorderSide(color: HaiiahTheme.gold, width: 2),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/* ============ Search Screen ============ */
class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final TextEditingController _searchController = TextEditingController();
  List<dynamic> _results = [];
  bool _hasSearched = false;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _performSearch(String query) {
    final q = query.trim().toLowerCase();
    if (q.isEmpty) {
      setState(() {
        _results = [];
        _hasSearched = false;
      });
      return;
    }

    final matches = <dynamic>[];
    for (final verse in HaiiahData.verses) {
      if (verse.translation.toLowerCase().contains(q) ||
          verse.reference.toLowerCase().contains(q) ||
          verse.arabic.contains(query.trim())) {
        matches.add({'type': 'Qur\'an', 'item': verse});
      }
    }
    for (final hadith in HaiiahData.hadiths) {
      if (hadith.translation.toLowerCase().contains(q) ||
          hadith.source.toLowerCase().contains(q) ||
          hadith.arabic.contains(query.trim())) {
        matches.add({'type': 'Hadith', 'item': hadith});
      }
    }

    setState(() {
      _results = matches;
      _hasSearched = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const SizedBox(height: 8),
            Text(
              'Search the Verses',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.headlineLarge,
            ),
            const SizedBox(height: 4),
            Text(
              'Explore the wisdom of the Quran and Sunnah',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 20),
            TextField(
              controller: _searchController,
              onChanged: _performSearch,
              decoration: InputDecoration(
                hintText: 'Search for taqwa, mercy, patience, gratitude...',
                prefixIcon: const Icon(Icons.search, color: HaiiahTheme.gold),
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(50),
                  borderSide: BorderSide(color: HaiiahTheme.gold.withValues(alpha: 0.3)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(50),
                  borderSide: BorderSide(color: HaiiahTheme.gold.withValues(alpha: 0.3)),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(50),
                  borderSide: const BorderSide(color: HaiiahTheme.gold, width: 2),
                ),
              ),
            ),
            const SizedBox(height: 20),
            if (_hasSearched && _results.isEmpty)
              Padding(
                padding: const EdgeInsets.all(32),
                child: Text(
                  'No verses found. Try another word — perhaps "mercy", "patience", or "heart".',
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        fontStyle: FontStyle.italic,
                      ),
                ),
              )
            else
              ..._results.map((result) {
                final isQuran = result['type'] == 'Qur\'an';
                final item = result['item'];
                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border(
                      left: BorderSide(
                        color: HaiiahTheme.gold,
                        width: 4,
                      ),
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        isQuran
                            ? '﴿ ${item.arabic} ﴾'
                            : '❝ ${item.arabic} ❞',
                        style: const TextStyle(
                          fontSize: 16,
                          height: 1.8,
                          color: HaiiahTheme.deep,
                          fontFamily: 'serif',
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        '"${item.translation}"',
                        style: const TextStyle(
                          color: HaiiahTheme.muted,
                          fontSize: 13,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        '${isQuran ? 'Qur\'an' : 'Hadith'} — ${isQuran ? item.reference : item.source}',
                        style: const TextStyle(
                          color: HaiiahTheme.gold,
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                );
              }),
          ],
        ),
      ),
    );
  }
}