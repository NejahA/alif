import 'package:equatable/equatable.dart';

/// A flight path (connection) between two blooms in the meadow.
class FlightPath extends Equatable {
  final String id;
  final String fromId;
  final String toId;
  final String label; // e.g. "pollinates", "reminds me of", "shares nectar"
  final double strength; // 0..1 — how strong the connection is
  final DateTime createdAt;

  const FlightPath({
    required this.id,
    required this.fromId,
    required this.toId,
    required this.label,
    required this.strength,
    required this.createdAt,
  });

  FlightPath copyWith({
    String? label,
    double? strength,
  }) {
    return FlightPath(
      id: id,
      fromId: fromId,
      toId: toId,
      label: label ?? this.label,
      strength: strength ?? this.strength,
      createdAt: createdAt,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'fromId': fromId,
        'toId': toId,
        'label': label,
        'strength': strength,
        'createdAt': createdAt.toIso8601String(),
      };

  factory FlightPath.fromJson(Map<String, dynamic> json) => FlightPath(
        id: json['id'] as String,
        fromId: json['fromId'] as String,
        toId: json['toId'] as String,
        label: json['label'] as String? ?? 'visits',
        strength: (json['strength'] as num?)?.toDouble() ?? 0.5,
        createdAt: DateTime.parse(json['createdAt'] as String),
      );

  @override
  List<Object?> get props => [id, fromId, toId, label, strength, createdAt];
}