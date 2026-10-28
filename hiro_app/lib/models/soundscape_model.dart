class SoundscapeModel {
  double droneVolume; // 0.0 to 1.0
  double rainVolume; // 0.0 to 1.0
  double binauralVolume; // 0.0 to 1.0
  bool pentatonicNotesEnabled;
  bool isPlaying;

  SoundscapeModel({
    this.droneVolume = 0.5,
    this.rainVolume = 0.3,
    this.binauralVolume = 0.4,
    this.pentatonicNotesEnabled = true,
    this.isPlaying = false,
  });

  Map<String, dynamic> toJson() {
    return {
      'droneVolume': droneVolume,
      'rainVolume': rainVolume,
      'binauralVolume': binauralVolume,
      'pentatonicNotesEnabled': pentatonicNotesEnabled,
      'isPlaying': isPlaying,
    };
  }

  factory SoundscapeModel.fromJson(Map<String, dynamic> json) {
    return SoundscapeModel(
      droneVolume: (json['droneVolume'] as num?)?.toDouble() ?? 0.5,
      rainVolume: (json['rainVolume'] as num?)?.toDouble() ?? 0.3,
      binauralVolume: (json['binauralVolume'] as num?)?.toDouble() ?? 0.4,
      pentatonicNotesEnabled: json['pentatonicNotesEnabled'] != false,
      isPlaying: json['isPlaying'] == true,
    );
  }
}
