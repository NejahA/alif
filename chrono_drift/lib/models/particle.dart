import 'dart:math';
import 'dart:ui';

enum ParticleType {
  spark,
  smoke,
  glowRing,
  warpRibbon,
  chronoCore,
  shockwave,
  resonanceRing,
  prismaticSparks,
}

class FloatingCombatText {
  final String text;
  Offset position;
  final Color color;
  double life;
  final double maxLife;
  final double fontSize;

  FloatingCombatText({
    required this.text,
    required this.position,
    required this.color,
    this.maxLife = 0.85,
    this.fontSize = 13.0,
  }) : life = maxLife;

  bool update(double dt) {
    life -= dt;
    if (life <= 0) return false;
    position += const Offset(0, -38.0) * dt; // Float gently upwards
    return true;
  }

  double get progress => (1.0 - (life / maxLife)).clamp(0.0, 1.0);
}

class GameParticle {
  Offset position;
  Offset velocity;
  Color color;
  double radius;
  double life; // Remaining life 0.0 to 1.0
  double maxLife;
  final ParticleType type;
  final double extraVal; // e.g. shockwave max radius or core value

  GameParticle({
    required this.position,
    required this.velocity,
    required this.color,
    required this.radius,
    required this.maxLife,
    this.type = ParticleType.spark,
    this.extraVal = 0.0,
  }) : life = maxLife;

  bool update(double dt) {
    life -= dt;
    if (life <= 0) return false;

    // Movement & drag
    if (type == ParticleType.shockwave || type == ParticleType.resonanceRing) {
      // expands
      radius += (extraVal - radius) * 6.0 * dt;
    } else {
      position += velocity * dt;
      if (type == ParticleType.spark || type == ParticleType.smoke || type == ParticleType.prismaticSparks) {
        velocity *= (1.0 - 1.8 * dt).clamp(0.0, 1.0);
      }
    }

    return true;
  }

  double get progress => (1.0 - (life / maxLife)).clamp(0.0, 1.0);
}

class ChronoCoreParticle {
  Offset position;
  Offset velocity;
  final int value;
  double life;
  final double maxLife;
  final double pulseOffset;

  ChronoCoreParticle({
    required this.position,
    required this.value,
    this.maxLife = 20.0,
  })  : velocity = Offset(
          (Random().nextDouble() - 0.5) * 80,
          (Random().nextDouble() - 0.5) * 80,
        ),
        life = 20.0,
        pulseOffset = Random().nextDouble() * pi * 2;

  bool update(double dt, Offset playerPos, double magnetRange) {
    life -= dt;
    if (life <= 0) return false;

    final diff = playerPos - position;
    final dist = diff.distance;

    if (dist < magnetRange && dist > 0.001) {
      final pullStrength = (1.0 - (dist / magnetRange)) * 550.0 + 150.0;
      final dir = diff / dist;
      velocity += dir * pullStrength * dt;
      // Cap speed
      if (velocity.distance > 600) {
        velocity = (velocity / velocity.distance) * 600;
      }
    } else {
      velocity *= (1.0 - 2.5 * dt).clamp(0.0, 1.0);
    }

    position += velocity * dt;
    return true;
  }
}
