class Verse {
  final String arabic;
  final String translation;
  final String reference;

  const Verse({
    required this.arabic,
    required this.translation,
    required this.reference,
  });
}

class Hadith {
  final String arabic;
  final String translation;
  final String source;

  const Hadith({
    required this.arabic,
    required this.translation,
    required this.source,
  });
}

class NameOfAllah {
  final String arabic;
  final String translit;
  final String meaning;

  const NameOfAllah({
    required this.arabic,
    required this.translit,
    required this.meaning,
  });
}

class Dua {
  final String arabic;
  final String translation;
  final String occasion;

  const Dua({
    required this.arabic,
    required this.translation,
    required this.occasion,
  });
}

class QuizQuestion {
  final String question;
  final List<String> options;
  final int answer;

  const QuizQuestion({
    required this.question,
    required this.options,
    required this.answer,
  });
}