enum BiomeLayer {
  emergent,
  canopy,
  understory,
  forestFloor,
}

enum Rarity {
  common,
  uncommon,
  rare,
  mythic,
}

class Creature {
  final String id;
  final String name;
  final String scientificName;
  final String title;
  final String imagePath;
  final BiomeLayer layer;
  final Rarity rarity;
  final String bioAuraColor;
  final double bioFrequency; // In kHz
  final String status;
  final String description;
  final List<String> traits;
  final int vitalityReward;

  const Creature({
    required this.id,
    required this.name,
    required this.scientificName,
    required this.title,
    required this.imagePath,
    required this.layer,
    required this.rarity,
    required this.bioAuraColor,
    required this.bioFrequency,
    required this.status,
    required this.description,
    required this.traits,
    required this.vitalityReward,
  });

  String get layerName {
    switch (layer) {
      case BiomeLayer.emergent:
        return 'Emergent Layer (45m+)';
      case BiomeLayer.canopy:
        return 'Upper Canopy (30m)';
      case BiomeLayer.understory:
        return 'Dense Understory (15m)';
      case BiomeLayer.forestFloor:
        return 'Ancient Forest Floor';
    }
  }

  String get rarityName {
    switch (rarity) {
      case Rarity.common:
        return 'Abundant';
      case Rarity.uncommon:
        return 'Elusive';
      case Rarity.rare:
        return 'Exotic';
      case Rarity.mythic:
        return 'Legendary';
    }
  }
}

class JungleBestiary {
  static const List<Creature> allSpecimens = [
    Creature(
      id: 'jaguar',
      name: 'Shadow Jaguar',
      scientificName: 'Panthera onca',
      title: 'Apex Sovereign of the Understory',
      imagePath: 'assets/images/jaguar.jpg',
      layer: BiomeLayer.forestFloor,
      rarity: Rarity.mythic,
      bioAuraColor: '#F59E0B',
      bioFrequency: 432.0,
      status: 'Near Threatened • Protected',
      description:
          'Possessing the strongest bite force of any big cat relative to size, the Jaguar walks through the deep green like a shadow woven from sunlight and river moss.',
      traits: ['Crushing Jaw Strength', 'Master Swimmer', 'Silent Stalker', 'Sacred Mayan Deity'],
      vitalityReward: 150,
    ),
    Creature(
      id: 'frog',
      name: 'Azure Dart Frog',
      scientificName: 'Dendrobates tinctorius',
      title: 'Bio-Electric Gem of the Moss',
      imagePath: 'assets/images/frog.jpg',
      layer: BiomeLayer.understory,
      rarity: Rarity.rare,
      bioAuraColor: '#38BDF8',
      bioFrequency: 528.0,
      status: 'Endangered • Bio-Indicator',
      description:
          'Glistening like a polished sapphire after a tropical deluge, this tiny sentinel secretes potent bio-alkaloids derived from forest floor beetles.',
      traits: ['Aposematic Armor', 'Micro-Navigation', 'Moisture Sensitive', 'Pollen Alchemist'],
      vitalityReward: 95,
    ),
    Creature(
      id: 'macaw',
      name: 'Solar Macaw',
      scientificName: 'Ara macao',
      title: 'Herald of the Sunlit Canopy',
      imagePath: 'assets/images/macaw.jpg',
      layer: BiomeLayer.canopy,
      rarity: Rarity.uncommon,
      bioAuraColor: '#FF6B4A',
      bioFrequency: 639.0,
      status: 'Vulnerable • Canopy Seed Disperser',
      description:
          'Blazing across the misty jungle crown with wings of scarlet fire and celestial cobalt, the Solar Macaw mates for life and regenerates the rainforest through seed migration.',
      traits: ['Nut Cracker Beak', 'Vocal Telemetry', 'Canopy Architect', 'Lifelong Bond'],
      vitalityReward: 80,
    ),
    Creature(
      id: 'orchid',
      name: 'Moonlit Ghost Orchid',
      scientificName: 'Dendrophylax lindenii',
      title: 'Luminescent Epiphyte Enigma',
      imagePath: 'assets/images/orchid.jpg',
      layer: BiomeLayer.emergent,
      rarity: Rarity.mythic,
      bioAuraColor: '#C084FC',
      bioFrequency: 741.0,
      status: 'Critically Rare • Sacred Flora',
      description:
          'Suspended mid-air upon ancient cedar bark, this leafless blossom emits nocturnal pheromones and catches dew particles under tropical moonlight.',
      traits: ['Leafless Photosynthesis', 'Bioluminescent Dew', 'Sphinx Moth Symbiosis', 'High Elevation'],
      vitalityReward: 200,
    ),
  ];
}
