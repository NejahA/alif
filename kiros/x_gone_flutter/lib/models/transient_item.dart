import 'package:mongo_dart/mongo_dart.dart';

class TransientItem {
  final String id;
  final String content;
  final String type;
  bool isCompleted;
  final int createdAt;
  final int expiresAt;
  final int totalDuration;
  int life; // Local countdown in seconds
  bool vanishing;

  TransientItem({
    required this.id,
    required this.content,
    required this.type,
    this.isCompleted = false,
    required this.createdAt,
    required this.expiresAt,
    required this.totalDuration,
    required this.life,
    this.vanishing = false,
  });

  factory TransientItem.fromJson(Map<String, dynamic> json) {
    final now = DateTime.now().millisecondsSinceEpoch;

    int getMs(dynamic val) {
      if (val is DateTime) return val.millisecondsSinceEpoch;
      if (val is num) return val.toInt();
      return 0;
    }

    final createdAt = getMs(json['createdAt']);
    final expiresAt = getMs(json['expiresAt']);
    final id = json['_id'];
    final totalDuration = ((expiresAt - createdAt) / 1000).floor().clamp(1, 9999999).toInt();

    return TransientItem(
      id: (id is ObjectId) ? id.oid : (id ?? json['id']).toString(),
      content: (json['content'] ?? '') as String,
      type: (json['type'] ?? 'note') as String,
      isCompleted: json['isCompleted'] == true,
      createdAt: createdAt,
      expiresAt: expiresAt,
      totalDuration: totalDuration,
      life: ((expiresAt - now) / 1000).floor().clamp(0, 9999999).toInt(),
    );
  }

  void tick() {
    if (life > 0) {
      life--;
    } else {
      vanishing = true;
    }
  }
}
