import 'dart:convert';

enum DeityCategory {
  ancient,
  abrahamic,
  eastern,
  norse,
  celtic,
  mesoamerican,
  african,
  modern,
}

extension DeityCategoryExtension on DeityCategory {
  String get displayName {
    switch (this) {
      case DeityCategory.ancient:
        return 'Ancient (Greek/Roman/Egyptian)';
      case DeityCategory.abrahamic:
        return 'Abrahamic';
      case DeityCategory.eastern:
        return 'Eastern (Hindu/Buddhist/Shinto)';
      case DeityCategory.norse:
        return 'Norse';
      case DeityCategory.celtic:
        return 'Celtic';
      case DeityCategory.mesoamerican:
        return 'Mesoamerican';
      case DeityCategory.african:
        return 'African';
      case DeityCategory.modern:
        return 'Modern / New Age';
    }
  }

  String get emoji {
    switch (this) {
      case DeityCategory.ancient:
        return '🏛️';
      case DeityCategory.abrahamic:
        return '☪️';
      case DeityCategory.eastern:
        return '🪷';
      case DeityCategory.norse:
        return '⚡';
      case DeityCategory.celtic:
        return '🍀';
      case DeityCategory.mesoamerican:
        return '🌞';
      case DeityCategory.african:
        return '🌍';
      case DeityCategory.modern:
        return '✨';
    }
  }
}

class Deity {
  final String id;
  String name;
  String origin;
  String domain; // e.g., "God of Thunder", "Goddess of Love"
  String description;
  String symbol;
  DeityCategory category;
  List<String> aliases;
  bool isFavorite;
  DateTime createdAt;
  DateTime updatedAt;

  Deity({
    required this.id,
    required this.name,
    required this.origin,
    required this.domain,
    required this.description,
    required this.symbol,
    required this.category,
    this.aliases = const [],
    this.isFavorite = false,
    required this.createdAt,
    required this.updatedAt,
  });

  Deity copyWith({
    String? id,
    String? name,
    String? origin,
    String? domain,
    String? description,
    String? symbol,
    DeityCategory? category,
    List<String>? aliases,
    bool? isFavorite,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Deity(
      id: id ?? this.id,
      name: name ?? this.name,
      origin: origin ?? this.origin,
      domain: domain ?? this.domain,
      description: description ?? this.description,
      symbol: symbol ?? this.symbol,
      category: category ?? this.category,
      aliases: aliases ?? this.aliases,
      isFavorite: isFavorite ?? this.isFavorite,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'origin': origin,
      'domain': domain,
      'description': description,
      'symbol': symbol,
      'category': category.index,
      'aliases': aliases,
      'isFavorite': isFavorite,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  factory Deity.fromJson(Map<String, dynamic> json) {
    return Deity(
      id: json['id'],
      name: json['name'],
      origin: json['origin'],
      domain: json['domain'],
      description: json['description'],
      symbol: json['symbol'],
      category: DeityCategory.values[json['category']],
      aliases: List<String>.from(json['aliases'] ?? []),
      isFavorite: json['isFavorite'] ?? false,
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  String toJsonString() => jsonEncode(toJson());
  factory Deity.fromJsonString(String source) =>
      Deity.fromJson(jsonDecode(source));
}
