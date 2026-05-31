class Insight {
  final String id;
  final String text;
  final String category;
  final String timeline;
  final int upvotes;
  final int stakes;
  final String visualUrl;

  Insight({
    required this.id,
    required this.text,
    required this.category,
    required this.timeline,
    required this.upvotes,
    required this.stakes,
    required this.visualUrl,
  });

  factory Insight.fromJson(Map<String, dynamic> json) {
    return Insight(
      id: json['_id'] as String,
      text: json['text'] as String,
      category: json['category'] as String? ?? 'General',
      timeline: json['timeline'] as String? ?? 'PRIME',
      upvotes: json['upvotes'] as int? ?? 0,
      stakes: json['stakes'] as int? ?? 0,
      visualUrl: json['visualUrl'] as String? ?? '',
    );
  }
}

class Stats {
  final int totalInsights;
  final int totalEndorsements;
  final double systemEntropy;
  final double coreStability;
  final List<CategoryCount> distribution;

  Stats({
    required this.totalInsights,
    required this.totalEndorsements,
    required this.systemEntropy,
    required this.coreStability,
    required this.distribution,
  });

  factory Stats.fromJson(Map<String, dynamic> json) {
    return Stats(
      totalInsights: json['totalInsights'] as int? ?? 0,
      totalEndorsements: json['totalEndorsements'] as int? ?? 0,
      systemEntropy: double.tryParse('${json['systemEntropy']}') ?? 0.0,
      coreStability: double.tryParse('${json['coreStability']}') ?? 0.0,
      distribution: (json['distribution'] as List<dynamic>?)
              ?.map((item) => CategoryCount.fromJson(item as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }
}

class CategoryCount {
  final String category;
  final int count;

  CategoryCount({required this.category, required this.count});

  factory CategoryCount.fromJson(Map<String, dynamic> json) {
    return CategoryCount(
      category: json['_id'] as String? ?? 'Unknown',
      count: json['count'] as int? ?? 0,
    );
  }
}

class Seer {
  final String name;
  final int credits;
  final String rank;
  final double divergence;

  Seer({
    required this.name,
    required this.credits,
    required this.rank,
    required this.divergence,
  });

  factory Seer.fromJson(Map<String, dynamic> json) {
    return Seer(
      name: json['name'] as String? ?? 'Unnamed',
      credits: json['credits'] as int? ?? 0,
      rank: json['rank'] as String? ?? 'Initiate',
      divergence: double.tryParse('${json['divergence']}') ?? 0.0,
    );
  }
}

class Mission {
  final String id;
  final String title;
  final String description;
  final int reward;
  final String targetType;
  final int targetCount;

  Mission({
    required this.id,
    required this.title,
    required this.description,
    required this.reward,
    required this.targetType,
    required this.targetCount,
  });

  factory Mission.fromJson(Map<String, dynamic> json) {
    return Mission(
      id: json['_id'] as String? ?? '',
      title: json['title'] as String? ?? 'Mission',
      description: json['description'] as String? ?? '',
      reward: json['reward'] as int? ?? 0,
      targetType: json['targetType'] as String? ?? 'unknown',
      targetCount: json['targetCount'] as int? ?? 0,
    );
  }
}

class Anomaly {
  final String id;
  final String type;
  final int severity;
  final String location;
  final bool stabilized;

  Anomaly({
    required this.id,
    required this.type,
    required this.severity,
    required this.location,
    required this.stabilized,
  });

  factory Anomaly.fromJson(Map<String, dynamic> json) {
    return Anomaly(
      id: json['_id'] as String? ?? '',
      type: json['type'] as String? ?? 'Unknown',
      severity: json['severity'] as int? ?? 1,
      location: json['location'] as String? ?? 'Unknown',
      stabilized: json['stabilized'] as bool? ?? false,
    );
  }
}

class Weather {
  final String type;
  final String icon;
  final double entropyBoost;
  final String msg;

  Weather({
    required this.type,
    required this.icon,
    required this.entropyBoost,
    required this.msg,
  });

  factory Weather.fromJson(Map<String, dynamic> json) {
    return Weather(
      type: json['type'] as String? ?? 'Stable',
      icon: json['icon'] as String? ?? 'Sun',
      entropyBoost: double.tryParse('${json['entropyBoost']}') ?? 0.0,
      msg: json['msg'] as String? ?? '',
    );
  }
}

class SystemState {
  final double singularityProgress;

  SystemState({required this.singularityProgress});

  factory SystemState.fromJson(Map<String, dynamic> json) {
    return SystemState(
      singularityProgress: double.tryParse('${json['singularityProgress']}') ?? 0.0,
    );
  }
}

class Broadcast {
  final String id;
  final String sender;
  final String message;
  final DateTime timestamp;

  Broadcast({
    required this.id,
    required this.sender,
    required this.message,
    required this.timestamp,
  });

  factory Broadcast.fromJson(Map<String, dynamic> json) {
    return Broadcast(
      id: json['_id'] as String? ?? '',
      sender: json['sender'] as String? ?? 'Anonymous',
      message: json['message'] as String? ?? '',
      timestamp: DateTime.tryParse(json['timestamp'] as String? ?? '') ?? DateTime.now(),
    );
  }
}

class SystemEvent {
  final String id;
  final String title;
  final String description;
  final String type;
  final String timeline;
  final DateTime timestamp;

  SystemEvent({
    required this.id,
    required this.title,
    required this.description,
    required this.type,
    required this.timeline,
    required this.timestamp,
  });

  factory SystemEvent.fromJson(Map<String, dynamic> json) {
    return SystemEvent(
      id: json['_id'] as String? ?? '',
      title: json['title'] as String? ?? 'Event',
      description: json['description'] as String? ?? '',
      type: json['type'] as String? ?? 'Info',
      timeline: json['timeline'] as String? ?? 'PRIME',
      timestamp: DateTime.tryParse(json['timestamp'] as String? ?? '') ?? DateTime.now(),
    );
  }
}
