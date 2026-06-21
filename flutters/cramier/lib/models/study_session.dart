class StudySession {
  final String id;
  final String deckId;
  final DateTime startTime;
  final DateTime? endTime;
  final int cardsStudied;
  final int cardsCorrect;
  final int cardsIncorrect;

  StudySession({
    required this.id,
    required this.deckId,
    required this.startTime,
    this.endTime,
    this.cardsStudied = 0,
    this.cardsCorrect = 0,
    this.cardsIncorrect = 0,
  });

  Duration get duration {
    if (endTime == null) return Duration.zero;
    return endTime!.difference(startTime);
  }

  double get accuracy {
    if (cardsStudied == 0) return 0;
    return (cardsCorrect / cardsStudied) * 100;
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'deckId': deckId,
      'startTime': startTime.toIso8601String(),
      'endTime': endTime?.toIso8601String(),
      'cardsStudied': cardsStudied,
      'cardsCorrect': cardsCorrect,
      'cardsIncorrect': cardsIncorrect,
    };
  }

  factory StudySession.fromMap(Map<String, dynamic> map) {
    return StudySession(
      id: map['id'] as String,
      deckId: map['deckId'] as String,
      startTime: DateTime.parse(map['startTime'] as String),
      endTime: map['endTime'] != null
          ? DateTime.parse(map['endTime'] as String)
          : null,
      cardsStudied: map['cardsStudied'] as int? ?? 0,
      cardsCorrect: map['cardsCorrect'] as int? ?? 0,
      cardsIncorrect: map['cardsIncorrect'] as int? ?? 0,
    );
  }
}