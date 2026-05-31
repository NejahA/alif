import 'category.dart';

/// Question model
/// Requirements: 6.1, 6.2, 6.4
class Question {
  final String id;
  final String text;
  final Category category;
  final List<String> tags;
  final DateTime createdAt;

  const Question({
    required this.id,
    required this.text,
    required this.category,
    required this.tags,
    required this.createdAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'text': text,
      'category': category.value,
      'tags': tags.join(','),
      'created_at': createdAt.millisecondsSinceEpoch,
    };
  }

  factory Question.fromMap(Map<String, dynamic> map) {
    return Question(
      id: map['id'] as String,
      text: map['text'] as String,
      category: Category.fromString(map['category'] as String),
      tags: (map['tags'] as String).split(',').where((t) => t.isNotEmpty).toList(),
      createdAt: DateTime.fromMillisecondsSinceEpoch(map['created_at'] as int),
    );
  }
}
