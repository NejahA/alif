import 'dart:convert';

class StarMemory {
  final String id;
  final String intent;
  final Duration duration;
  final DateTime timestamp;
  final int stardustEarned;

  StarMemory({
    required this.id,
    required this.intent,
    required this.duration,
    required this.timestamp,
    required this.stardustEarned,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'intent': intent,
      'duration': duration.inSeconds,
      'timestamp': timestamp.toIso8601String(),
      'stardustEarned': stardustEarned,
    };
  }

  factory StarMemory.fromMap(Map<String, dynamic> map) {
    return StarMemory(
      id: map['id'],
      intent: map['intent'],
      duration: Duration(seconds: map['duration']),
      timestamp: DateTime.parse(map['timestamp']),
      stardustEarned: map['stardustEarned'],
    );
  }

  String toJson() => json.encode(toMap());

  factory StarMemory.fromJson(String source) => StarMemory.fromMap(json.decode(source));
}
