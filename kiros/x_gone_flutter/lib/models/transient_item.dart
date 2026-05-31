import 'package:mongo_dart/mongo_dart.dart';

class TransientItem {
  final String id;
  final String content;
  final String type;
  final int createdAt;
  final int expiresAt;
  int life; // Local countdown in seconds
  bool vanishing;

  TransientItem({
    required this.id,
    required this.content,
    required this.type,
    required this.createdAt,
    required this.expiresAt,
    required this.life,
    this.vanishing = false,
  });

  factory TransientItem.fromJson(Map<String, dynamic> json) {
    final now = DateTime.now().millisecondsSinceEpoch;
    
    // Handle both DateTime (from mongo_dart) and num (from JSON API)
    int getMs(dynamic val) {
      if (val is DateTime) return val.millisecondsSinceEpoch;
      if (val is num) return val.toInt();
      return 0;
    }

    final expiresAt = getMs(json['expiresAt']);
    final id = json['_id'];
    
    return TransientItem(
      id: (id is ObjectId) ? id.toHexString() : (id ?? json['id']).toString(),
      content: json['content'] as String,
      type: json['type'] as String,
      createdAt: getMs(json['createdAt']),
      expiresAt: expiresAt,
      life: ((expiresAt - now) / 1000).floor().clamp(0, 999999).toInt(),
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
