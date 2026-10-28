import 'dart:ui';

class Projectile {
  Offset position;
  Offset velocity;
  double damage;
  bool isPlayer;
  final bool isEcho;
  Color color;
  double radius;
  double life;
  final double maxLife;
  bool canPenetrate;

  // Resonance & Refraction Attributes
  bool isResonant;
  bool hasRefracted;
  int piercesRemaining;

  // Graze & Parry Attributes
  bool hasGrazed = false;
  bool isDeflected = false;

  Projectile({
    required this.position,
    required this.velocity,
    required this.damage,
    required this.isPlayer,
    this.isEcho = false,
    required this.color,
    this.radius = 4.0,
    this.maxLife = 2.5,
    this.canPenetrate = false,
    this.isResonant = false,
    this.hasRefracted = false,
    this.piercesRemaining = 0,
    this.hasGrazed = false,
    this.isDeflected = false,
  }) : life = maxLife;

  /// Deflects an enemy projectile into a player homing tachyon shard
  void deflect({
    required Offset targetDir,
    required double newDamage,
    required Color deflectColor,
  }) {
    isPlayer = true;
    isDeflected = true;
    hasGrazed = true;
    damage = newDamage;
    color = deflectColor;
    radius = (radius * 1.3).clamp(5.0, 8.0);
    velocity = targetDir * 780.0;
    canPenetrate = true;
    piercesRemaining = 2;
    life = 2.0; // Reset lifetime so deflected shard travels across screen
  }

  /// Supercharges the projectile when fired through an active Temporal Echo
  void refract({
    required double damageMultiplier,
    required Color prismaticColor,
    int extraPierces = 2,
  }) {
    if (hasRefracted) return;
    hasRefracted = true;
    isResonant = true;
    damage *= damageMultiplier;
    color = prismaticColor;
    radius = (radius * 1.35).clamp(5.0, 9.0);
    velocity = velocity * 1.3; // High velocity beam acceleration
    canPenetrate = true;
    piercesRemaining = extraPierces;
  }

  bool update(double dt) {
    life -= dt;
    if (life <= 0) return false;
    position += velocity * dt;
    return true;
  }
}
