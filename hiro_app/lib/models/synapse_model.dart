import 'dart:math';

class SynapseModel {
  String id;
  String title;
  String notes;
  double x;
  double y;
  double radius;
  double hue;
  double charge; // 0.0 to 1.0 (vitality / action potential)
  String type; // 'idea', 'task', 'question', 'resource', 'warning'
  bool starred;
  String tag;
  bool isCompleted;
  bool isReady;
  double sproutProgress; // 0.0 to 1.0 for sprouting growth animation
  DateTime createdAt;
  DateTime updatedAt;

  // Transient simulation state
  double vx;
  double vy;
  double pulseWave; // 0.0 to 1.0 for radiating ring when fired

  SynapseModel({
    required this.id,
    this.title = '',
    this.notes = '',
    required this.x,
    required this.y,
    this.radius = 26.0,
    double? hue,
    this.charge = 0.8,
    this.type = 'idea',
    this.starred = false,
    this.tag = '',
    this.isCompleted = false,
    this.isReady = true,
    this.sproutProgress = 1.0,
    DateTime? createdAt,
    DateTime? updatedAt,
    this.vx = 0.0,
    this.vy = 0.0,
    this.pulseWave = 0.0,
  })  : hue = hue ?? (Random().nextDouble() * 360),
        createdAt = createdAt ?? DateTime.now(),
        updatedAt = updatedAt ?? DateTime.now();

  factory SynapseModel.fromJson(Map<String, dynamic> json) {
    final titleStr = json['title']?.toString() ?? json['message']?.toString() ?? '';
    final notesStr = json['notes']?.toString() ?? '';
    final typeStr = json['type']?.toString() ??
        (json['templateType'] != null && json['templateType'].toString().isNotEmpty
            ? json['templateType'].toString()
            : 'idea');
    
    String tagStr = json['tag']?.toString() ?? '';
    if (tagStr.isEmpty && json['tags'] is List && (json['tags'] as List).isNotEmpty) {
      tagStr = (json['tags'] as List).first.toString();
    }

    return SynapseModel(
      id: json['id']?.toString() ?? 'syn_${DateTime.now().millisecondsSinceEpoch}',
      title: titleStr,
      notes: notesStr,
      x: (json['x'] as num?)?.toDouble() ?? 400.0,
      y: (json['y'] as num?)?.toDouble() ?? 300.0,
      radius: (json['radius'] as num?)?.toDouble() ??
          (json['manualRadius'] as num?)?.toDouble() ??
          26.0,
      hue: (json['hue'] as num?)?.toDouble() ?? 200.0,
      charge: (json['charge'] as num?)?.toDouble() ?? 0.8,
      type: typeStr.isEmpty ? 'idea' : typeStr,
      starred: json['starred'] == true,
      tag: tagStr,
      isCompleted: json['isCompleted'] == true,
      isReady: json['isReady'] != false,
      sproutProgress: (json['sproutProgress'] as num?)?.toDouble() ?? 1.0,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString()) ?? DateTime.now()
          : (json['created'] is num
              ? DateTime.fromMillisecondsSinceEpoch((json['created'] as num).toInt())
              : DateTime.now()),
      updatedAt: json['updatedAt'] != null
          ? DateTime.tryParse(json['updatedAt'].toString()) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'message': title, // compatibility with hi§ro web
      'notes': notes,
      'x': x,
      'y': y,
      'radius': radius,
      'manualRadius': radius,
      'hue': hue,
      'charge': charge,
      'type': type,
      'templateType': type,
      'starred': starred,
      'tag': tag,
      'tags': tag.isNotEmpty ? [tag] : <String>[],
      'isCompleted': isCompleted,
      'isReady': isReady,
      'sproutProgress': sproutProgress,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  SynapseModel copyWith({
    String? title,
    String? notes,
    double? x,
    double? y,
    double? radius,
    double? hue,
    double? charge,
    String? type,
    bool? starred,
    String? tag,
    bool? isCompleted,
    bool? isReady,
    double? sproutProgress,
  }) {
    return SynapseModel(
      id: id,
      title: title ?? this.title,
      notes: notes ?? this.notes,
      x: x ?? this.x,
      y: y ?? this.y,
      radius: radius ?? this.radius,
      hue: hue ?? this.hue,
      charge: charge ?? this.charge,
      type: type ?? this.type,
      starred: starred ?? this.starred,
      tag: tag ?? this.tag,
      isCompleted: isCompleted ?? this.isCompleted,
      isReady: isReady ?? this.isReady,
      sproutProgress: sproutProgress ?? this.sproutProgress,
      createdAt: createdAt,
      updatedAt: DateTime.now(),
      vx: vx,
      vy: vy,
      pulseWave: pulseWave,
    );
  }

  bool hitTest(double px, double py) {
    final r = radius * sproutProgress;
    return sqrt((px - x) * (px - x) + (py - y) * (py - y)) <= r + 10;
  }
}
