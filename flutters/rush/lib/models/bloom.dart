import 'package:equatable/equatable.dart';

/// A single memory/note represented as a flower (bloom) in the meadow.
class Bloom extends Equatable {
  final String id;
  final String title;
  final String body;
  final List<String> tags;
  final int nectar; // 1..5 (1 = dry, 5 = overflowing with nectar)
  final DateTime createdAt;
  final DateTime updatedAt;
  final double x; // normalized 0..1 position in meadow
  final double y; // normalized 0..1 position in meadow
  final double size; // bloom size 0.5..1.5

  const Bloom({
    required this.id,
    required this.title,
    required this.body,
    required this.tags,
    required this.nectar,
    required this.createdAt,
    required this.updatedAt,
    required this.x,
    required this.y,
    required this.size,
  });

  Bloom copyWith({
    String? title,
    String? body,
    List<String>? tags,
    int? nectar,
    DateTime? updatedAt,
    double? x,
    double? y,
    double? size,
  }) {
    return Bloom(
      id: id,
      title: title ?? this.title,
      body: body ?? this.body,
      tags: tags ?? this.tags,
      nectar: nectar ?? this.nectar,
      createdAt: createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      x: x ?? this.x,
      y: y ?? this.y,
      size: size ?? this.size,
    );
  }

  /// Sweetness derived from nectar level: cool/dry (1) → warm/sweet (5).
  double get sweetness => (nectar - 1) / 4.0;

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'body': body,
        'tags': tags,
        'nectar': nectar,
        'createdAt': createdAt.toIso8601String(),
        'updatedAt': updatedAt.toIso8601String(),
        'x': x,
        'y': y,
        'size': size,
      };

  factory Bloom.fromJson(Map<String, dynamic> json) => Bloom(
        id: json['id'] as String,
        title: json['title'] as String,
        body: json['body'] as String? ?? '',
        tags: (json['tags'] as List<dynamic>? ?? []).cast<String>(),
        nectar: json['nectar'] as int? ?? 3,
        createdAt: DateTime.parse(json['createdAt'] as String),
        updatedAt: DateTime.parse(json['updatedAt'] as String),
        x: (json['x'] as num?)?.toDouble() ?? 0.5,
        y: (json['y'] as num?)?.toDouble() ?? 0.5,
        size: (json['size'] as num?)?.toDouble() ?? 1.0,
      );

  @override
  List<Object?> get props =>
      [id, title, body, tags, nectar, createdAt, updatedAt, x, y, size];
}