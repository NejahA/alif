import 'package:flutter/material.dart';
import '../models/quran_models.dart';

class QuranProvider extends ChangeNotifier {
  Surah? _currentSurah;
  int _currentAyahIndex = 0;
  bool _isPlaying = false;
  double _playbackSpeed = 1.0;
  bool _isLoopingAyah = false;
  int _loopCount = 3;
  final int _currentLoopProgress = 1;

  Reciter _selectedReciter = const Reciter(
    id: 'alafasy',
    name: 'Mishary Rashid Alafasy',
    style: 'Murattal • Emotional & Crystal Clear',
    avatarUrl: '',
    audioBaseUrl: 'https://server8.mp3quran.net/afs/',
  );

  String _searchQuery = '';
  String _selectedLanguage = 'English'; // English / Urdu / French
  double _arabicFontSize = 26.0;

  final List<Reciter> _availableReciters = const [
    Reciter(
      id: 'alafasy',
      name: 'Mishary Rashid Alafasy',
      style: 'Murattal • Soulful & Precise',
      avatarUrl: '',
      audioBaseUrl: 'https://server8.mp3quran.net/afs/',
    ),
    Reciter(
      id: 'sudais',
      name: 'Abdul Rahman Al-Sudais',
      style: 'Haramain • Reverent & Reverberant',
      avatarUrl: '',
      audioBaseUrl: 'https://server11.mp3quran.net/sds/',
    ),
    Reciter(
      id: 'muaiqly',
      name: 'Maher Al-Muaiqly',
      style: 'Haramain • Melodic & Deep',
      avatarUrl: '',
      audioBaseUrl: 'https://server12.mp3quran.net/maher/',
    ),
    Reciter(
      id: 'ghamdi',
      name: 'Saad Al-Ghamdi',
      style: 'Murattal • Tranquil & Soothing',
      avatarUrl: '',
      audioBaseUrl: 'https://server7.mp3quran.net/s_gmd/',
    ),
  ];

  final List<Surah> _surahs = const [
    Surah(
      number: 1,
      nameArabic: 'الفاتحة',
      nameEnglish: 'Al-Fatihah',
      nameTranslation: 'The Opening',
      numberOfAyahs: 7,
      revelationType: 'Meccan',
      audioUrl: 'https://server8.mp3quran.net/afs/001.mp3',
    ),
    Surah(
      number: 2,
      nameArabic: 'البقرة',
      nameEnglish: 'Al-Baqarah',
      nameTranslation: 'The Cow',
      numberOfAyahs: 286,
      revelationType: 'Medinan',
      audioUrl: 'https://server8.mp3quran.net/afs/002.mp3',
    ),
    Surah(
      number: 3,
      nameArabic: 'آل عمران',
      nameEnglish: 'Ali \'Imran',
      nameTranslation: 'Family of Imran',
      numberOfAyahs: 200,
      revelationType: 'Medinan',
      audioUrl: 'https://server8.mp3quran.net/afs/003.mp3',
    ),
    Surah(
      number: 18,
      nameArabic: 'الكهف',
      nameEnglish: 'Al-Kahf',
      nameTranslation: 'The Cave',
      numberOfAyahs: 110,
      revelationType: 'Meccan',
      audioUrl: 'https://server8.mp3quran.net/afs/018.mp3',
    ),
    Surah(
      number: 36,
      nameArabic: 'يس',
      nameEnglish: 'Ya-Sin',
      nameTranslation: 'Ya-Sin',
      numberOfAyahs: 83,
      revelationType: 'Meccan',
      audioUrl: 'https://server8.mp3quran.net/afs/036.mp3',
    ),
    Surah(
      number: 55,
      nameArabic: 'الرحمن',
      nameEnglish: 'Ar-Rahman',
      nameTranslation: 'The Beneficent',
      numberOfAyahs: 78,
      revelationType: 'Medinan',
      audioUrl: 'https://server8.mp3quran.net/afs/055.mp3',
    ),
    Surah(
      number: 67,
      nameArabic: 'الملك',
      nameEnglish: 'Al-Mulk',
      nameTranslation: 'The Sovereignty',
      numberOfAyahs: 30,
      revelationType: 'Meccan',
      audioUrl: 'https://server8.mp3quran.net/afs/067.mp3',
    ),
    Surah(
      number: 112,
      nameArabic: 'الإخلاص',
      nameEnglish: 'Al-Ikhlas',
      nameTranslation: 'Sincerity',
      numberOfAyahs: 4,
      revelationType: 'Meccan',
      audioUrl: 'https://server8.mp3quran.net/afs/112.mp3',
    ),
    Surah(
      number: 113,
      nameArabic: 'الفلق',
      nameEnglish: 'Al-Falaq',
      nameTranslation: 'The Daybreak',
      numberOfAyahs: 5,
      revelationType: 'Meccan',
      audioUrl: 'https://server8.mp3quran.net/afs/113.mp3',
    ),
    Surah(
      number: 114,
      nameArabic: 'الناس',
      nameEnglish: 'An-Nas',
      nameTranslation: 'Mankind',
      numberOfAyahs: 6,
      revelationType: 'Meccan',
      audioUrl: 'https://server8.mp3quran.net/afs/114.mp3',
    ),
  ];

  final Map<int, List<Ayah>> _surahAyahs = {
    1: [
      Ayah(
        numberInSurah: 1,
        numberInQuran: 1,
        textArabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        textEnglish: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
        textUrdu: 'شروع اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3',
      ),
      Ayah(
        numberInSurah: 2,
        numberInQuran: 2,
        textArabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
        textEnglish: '[All] praise is [due] to Allah, Lord of the worlds -',
        textUrdu: 'تمام تعریفیں اللہ ہی کے لیے ہیں جو تمام جہانوں کا پروردگار ہے',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/2.mp3',
      ),
      Ayah(
        numberInSurah: 3,
        numberInQuran: 3,
        textArabic: 'الرَّحْمَٰنِ الرَّحِيمِ',
        textEnglish: 'The Entirely Merciful, the Especially Merciful,',
        textUrdu: 'بڑا مہربان نہایت رحم والا',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/3.mp3',
      ),
      Ayah(
        numberInSurah: 4,
        numberInQuran: 4,
        textArabic: 'مَالِكِ يَوْمِ الدِّينِ',
        textEnglish: 'Sovereign of the Day of Recompense.',
        textUrdu: 'بدلے کے دن کا مالک',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/4.mp3',
      ),
      Ayah(
        numberInSurah: 5,
        numberInQuran: 5,
        textArabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
        textEnglish: 'It is You we worship and You we ask for help.',
        textUrdu: 'ہم تیری ہی عبادت کرتے ہیں اور تجھ ہی سے مدد مانگتے ہیں',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/5.mp3',
      ),
      Ayah(
        numberInSurah: 6,
        numberInQuran: 6,
        textArabic: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
        textEnglish: 'Guide us to the straight path -',
        textUrdu: 'ہمیں سیدھے راستے کی ہدایت فرما',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6.mp3',
      ),
      Ayah(
        numberInSurah: 7,
        numberInQuran: 7,
        textArabic: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
        textEnglish: 'The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.',
        textUrdu: 'ان لوگوں کا راستہ جن پر تو نے انعام فرمایا، نہ ان کا جن پر غضب ہوا اور نہ گمراہوں کا',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/7.mp3',
      ),
    ],
    67: [
      Ayah(
        numberInSurah: 1,
        numberInQuran: 5242,
        textArabic: 'تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',
        textEnglish: 'Blessed is He in whose hand is dominion, and He is over all things competent -',
        textUrdu: 'بہت بابرکت ہے وہ جس کے ہاتھ میں بادشاہی ہے اور وہ ہر چیز پر قادر ہے',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/5242.mp3',
      ),
      Ayah(
        numberInSurah: 2,
        numberInQuran: 5243,
        textArabic: 'الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا ۚ وَهُوَ الْعَزِيزُ الْغَفُورُ',
        textEnglish: 'He who created death and life to test you as to which of you is best in deed - and He is the Exalted in Might, the Forgiving -',
        textUrdu: 'جس نے موت اور زندگی کو پیدا کیا تاکہ تمہاری آزمائش کرے کہ تم میں سے کون عمل میں سب سے اچھا ہے',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/5243.mp3',
      ),
    ],
  };

  Surah? get currentSurah => _currentSurah;
  int get currentAyahIndex => _currentAyahIndex;
  bool get isPlaying => _isPlaying;
  double get playbackSpeed => _playbackSpeed;
  bool get isLoopingAyah => _isLoopingAyah;
  int get loopCount => _loopCount;
  int get currentLoopProgress => _currentLoopProgress;
  Reciter get selectedReciter => _selectedReciter;
  List<Reciter> get availableReciters => _availableReciters;
  String get searchQuery => _searchQuery;
  String get selectedLanguage => _selectedLanguage;
  double get arabicFontSize => _arabicFontSize;

  List<Surah> get filteredSurahs {
    if (_searchQuery.isEmpty) return _surahs;
    final q = _searchQuery.toLowerCase();
    return _surahs.where((s) {
      return s.nameEnglish.toLowerCase().contains(q) ||
          s.nameTranslation.toLowerCase().contains(q) ||
          s.nameArabic.contains(q) ||
          s.number.toString() == q;
    }).toList();
  }

  QuranProvider() {
    _currentSurah = _surahs.first;
  }

  void selectSurah(Surah surah) {
    _currentSurah = surah;
    _currentAyahIndex = 0;
    _isPlaying = false;
    notifyListeners();
  }

  void selectReciter(Reciter reciter) {
    _selectedReciter = reciter;
    notifyListeners();
  }

  void togglePlayPause() {
    _isPlaying = !_isPlaying;
    notifyListeners();
  }

  void setPlaybackSpeed(double speed) {
    _playbackSpeed = speed;
    notifyListeners();
  }

  void toggleLoopAyah() {
    _isLoopingAyah = !_isLoopingAyah;
    notifyListeners();
  }

  void setLoopCount(int count) {
    _loopCount = count;
    notifyListeners();
  }

  void setArabicFontSize(double size) {
    _arabicFontSize = size;
    notifyListeners();
  }

  void setSearchQuery(String q) {
    _searchQuery = q;
    notifyListeners();
  }

  void setSelectedLanguage(String lang) {
    _selectedLanguage = lang;
    notifyListeners();
  }

  List<Ayah> getAyahsForSurah(int surahNumber) {
    return _surahAyahs[surahNumber] ?? [
      Ayah(
        numberInSurah: 1,
        numberInQuran: 1,
        textArabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        textEnglish: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
        textUrdu: 'شروع اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے',
        audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3',
      ),
    ];
  }

  void toggleBookmark(Ayah ayah) {
    ayah.isBookmarked = !ayah.isBookmarked;
    notifyListeners();
  }
}
