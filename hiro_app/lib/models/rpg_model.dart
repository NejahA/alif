class RpgModel {
  int level;
  int xp;
  int maxXp;
  int spiritualEnergy;
  int maxEnergy;
  int harvestedSouls;
  int karmaBalance;
  String rankTitle;
  List<String> equippedRelics;

  RpgModel({
    this.level = 1,
    this.xp = 0,
    this.maxXp = 100,
    this.spiritualEnergy = 100,
    this.maxEnergy = 100,
    this.harvestedSouls = 0,
    this.karmaBalance = 10,
    this.rankTitle = 'Novice Reaper',
    List<String>? equippedRelics,
  }) : equippedRelics = equippedRelics ??
            [
              '⚙️ Reaper Relic (+1 👻 / 10s auto-harvest)',
              '🛡️ Angelic Guard (+20% Energy Regen)',
              '🔮 Astral Lens (Highlights high-resonance clusters)',
            ];

  factory RpgModel.fromJson(Map<String, dynamic> json) {
    return RpgModel(
      level: (json['level'] as num?)?.toInt() ?? 1,
      xp: (json['xp'] as num?)?.toInt() ?? 0,
      maxXp: (json['maxXp'] as num?)?.toInt() ?? 100,
      spiritualEnergy: (json['spiritualEnergy'] as num?)?.toInt() ?? 100,
      maxEnergy: (json['maxEnergy'] as num?)?.toInt() ?? 100,
      harvestedSouls: (json['harvestedSouls'] as num?)?.toInt() ?? 0,
      karmaBalance: (json['karmaBalance'] as num?)?.toInt() ?? 10,
      rankTitle: json['rankTitle']?.toString() ?? 'Novice Reaper',
      equippedRelics: (json['equippedRelics'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [
            '⚙️ Reaper Relic (+1 👻 / 10s auto-harvest)',
            '🛡️ Angelic Guard (+20% Energy Regen)',
          ],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'level': level,
      'xp': xp,
      'maxXp': maxXp,
      'spiritualEnergy': spiritualEnergy,
      'maxEnergy': maxEnergy,
      'harvestedSouls': harvestedSouls,
      'karmaBalance': karmaBalance,
      'rankTitle': rankTitle,
      'equippedRelics': equippedRelics,
    };
  }

  void gainXp(int amount) {
    xp += amount;
    while (xp >= maxXp) {
      xp -= maxXp;
      level += 1;
      maxXp = (maxXp * 1.5).round();
      spiritualEnergy = maxEnergy;
      _updateRank();
    }
  }

  void _updateRank() {
    if (level >= 10) {
      rankTitle = 'Enlightened Sovereign';
    } else if (level >= 7) {
      rankTitle = 'Astral Architect';
    } else if (level >= 5) {
      rankTitle = 'Synapse Weaver';
    } else if (level >= 3) {
      rankTitle = 'Thought Alchemist';
    } else {
      rankTitle = 'Novice Reaper';
    }
  }
}
