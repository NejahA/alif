class AxonPulse {
  double progress; // 0.0 to 1.0 along the axon
  double speed;
  double hue;

  AxonPulse({
    this.progress = 0.0,
    this.speed = 0.02,
    this.hue = 190.0,
  });
}

class ConnectionModel {
  String fromId;
  String toId;
  double strength;
  bool manual;
  String label;
  List<AxonPulse> activePulses;

  ConnectionModel({
    required this.fromId,
    required this.toId,
    this.strength = 1.0,
    this.manual = true,
    this.label = '',
    List<AxonPulse>? activePulses,
  }) : activePulses = activePulses ?? [];

  factory ConnectionModel.fromJson(Map<String, dynamic> json) {
    final from = (json['aId'] ?? json['from'] ?? json['fromId'] ?? json['source'])
            ?.toString()
            .trim() ??
        '';
    final to = (json['bId'] ?? json['to'] ?? json['toId'] ?? json['target'])
            ?.toString()
            .trim() ??
        '';
    final weight = (json['weight'] as num?)?.toDouble() ??
        (json['strength'] as num?)?.toDouble() ??
        1.0;
    final isManual = json['manual'] != false;
    final lbl = json['label']?.toString() ?? '';

    return ConnectionModel(
      fromId: from,
      toId: to,
      strength: weight,
      manual: isManual,
      label: lbl,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'aId': fromId,
      'bId': toId,
      'from': fromId,
      'to': toId,
      'fromId': fromId,
      'toId': toId,
      'weight': strength,
      'strength': strength,
      'manual': manual,
      'label': label,
    };
  }

  bool involves(String synapseId) => fromId == synapseId || toId == synapseId;

  bool matches(String a, String b) =>
      (fromId == a && toId == b) || (fromId == b && toId == a);
}
