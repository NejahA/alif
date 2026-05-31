class Flashcard {
  final String id;
  final String category;
  final String question;
  final String answer;
  final String? codeSnippet;
  final String? wikipediaUrl;
  int reviewLevel; // 0 = New, 1 = Learning, 2 = Mastered

  Flashcard({
    required this.id,
    required this.category,
    required this.question,
    required this.answer,
    this.codeSnippet,
    this.wikipediaUrl,
    this.reviewLevel = 0,
  });
}
