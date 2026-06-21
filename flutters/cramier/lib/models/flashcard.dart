class Flashcard {
  final String id;
  final String question;
  final String answer;
  final String category;
  final String deckId;
  final DateTime createdAt;
  final DateTime? lastReviewed;
  final int repetitions;
  final double easeFactor;
  final int interval;
  final DateTime? nextReview;

  Flashcard({
    required this.id,
    required this.question,
    required this.answer,
    this.category = 'General',
    required this.deckId,
    DateTime? createdAt,
    this.lastReviewed,
    this.repetitions = 0,
    this.easeFactor = 2.5,
    this.interval = 0,
    this.nextReview,
  }) : createdAt = createdAt ?? DateTime.now();

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'question': question,
      'answer': answer,
      'category': category,
      'deckId': deckId,
      'createdAt': createdAt.toIso8601String(),
      'lastReviewed': lastReviewed?.toIso8601String(),
      'repetitions': repetitions,
      'easeFactor': easeFactor,
      'interval': interval,
      'nextReview': nextReview?.toIso8601String(),
    };
  }

  factory Flashcard.fromMap(Map<String, dynamic> map) {
    return Flashcard(
      id: map['id'] as String,
      question: map['question'] as String,
      answer: map['answer'] as String,
      category: map['category'] as String? ?? 'General',
      deckId: map['deckId'] as String,
      createdAt: DateTime.parse(map['createdAt'] as String),
      lastReviewed: map['lastReviewed'] != null
          ? DateTime.parse(map['lastReviewed'] as String)
          : null,
      repetitions: map['repetitions'] as int? ?? 0,
      easeFactor: (map['easeFactor'] as num?)?.toDouble() ?? 2.5,
      interval: map['interval'] as int? ?? 0,
      nextReview: map['nextReview'] != null
          ? DateTime.parse(map['nextReview'] as String)
          : null,
    );
  }

  Flashcard copyWith({
    String? id,
    String? question,
    String? answer,
    String? category,
    String? deckId,
    DateTime? createdAt,
    DateTime? lastReviewed,
    int? repetitions,
    double? easeFactor,
    int? interval,
    DateTime? nextReview,
  }) {
    return Flashcard(
      id: id ?? this.id,
      question: question ?? this.question,
      answer: answer ?? this.answer,
      category: category ?? this.category,
      deckId: deckId ?? this.deckId,
      createdAt: createdAt ?? this.createdAt,
      lastReviewed: lastReviewed ?? this.lastReviewed,
      repetitions: repetitions ?? this.repetitions,
      easeFactor: easeFactor ?? this.easeFactor,
      interval: interval ?? this.interval,
      nextReview: nextReview ?? this.nextReview,
    );
  }
}