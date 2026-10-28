class ClusterModel {
  String id;
  String name;
  List<String> synapseIds;
  double hue;
  bool collapsed;

  ClusterModel({
    required this.id,
    this.name = 'Cluster',
    List<String>? synapseIds,
    this.hue = 210.0,
    this.collapsed = false,
  }) : synapseIds = synapseIds ?? [];

  factory ClusterModel.fromJson(Map<String, dynamic> json) {
    return ClusterModel(
      id: json['id']?.toString() ?? 'cl_${DateTime.now().millisecondsSinceEpoch}',
      name: json['name']?.toString() ?? 'Cluster',
      synapseIds: (json['synapseIds'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
      hue: (json['hue'] as num?)?.toDouble() ?? 210.0,
      collapsed: json['collapsed'] == true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'synapseIds': synapseIds,
      'hue': hue,
      'collapsed': collapsed,
    };
  }
}
