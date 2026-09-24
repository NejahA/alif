class Surah {
  final int number;
  final String nameArabic;
  final String nameEnglish;
  final String nameTranslation;
  final int numberOfAyahs;
  final String revelationType; // Meccan / Medinan
  final String audioUrl;

  const Surah({
    required this.number,
    required this.nameArabic,
    required this.nameEnglish,
    required this.nameTranslation,
    required this.numberOfAyahs,
    required this.revelationType,
    required this.audioUrl,
  });
}

class Ayah {
  final int numberInSurah;
  final int numberInQuran;
  final String textArabic;
  final String textEnglish;
  final String textUrdu;
  final String audioUrl;
  bool isBookmarked;

  Ayah({
    required this.numberInSurah,
    required this.numberInQuran,
    required this.textArabic,
    required this.textEnglish,
    required this.textUrdu,
    required this.audioUrl,
    this.isBookmarked = false,
  });
}

class Reciter {
  final String id;
  final String name;
  final String style;
  final String avatarUrl;
  final String audioBaseUrl;

  const Reciter({
    required this.id,
    required this.name,
    required this.style,
    required this.avatarUrl,
    required this.audioBaseUrl,
  });
}
