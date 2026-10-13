import 'dart:math';
import 'package:flutter/material.dart';

enum ParticleType {
  cherryPetal,
  spark,
  shadowSmoke,
  spiritBurst,
  fireEmber,
  voidDust,
  slashArc,
}

class Particle {
  Offset position;
  Offset velocity;
  double size;
  double life; // 1.0 -> 0.0
  double maxLife;
  Color color;
  ParticleType type;
  double rotation;
  double rotationSpeed;

  Particle({
    required this.position,
    required this.velocity,
    required this.size,
    required this.life,
    required this.color,
    required this.type,
    this.rotation = 0.0,
    this.rotationSpeed = 0.0,
  }) : maxLife = life;

  void update(double dt) {
    position += velocity * dt;
    life -= dt / maxLife;
    rotation += rotationSpeed * dt;

    if (type == ParticleType.cherryPetal) {
      // Fluttering motion
      velocity = Offset(velocity.dx + sin(life * 10) * 5, velocity.dy);
    } else if (type == ParticleType.shadowSmoke) {
      velocity *= 0.95; // Drag
      size *= 1.01; // Expand
    } else if (type == ParticleType.fireEmber) {
      velocity = Offset(velocity.dx, velocity.dy - 10 * dt); // Rise
    }
  }
}

class ParticleEngine {
  final List<Particle> particles = [];
  final Random _rng = Random();

  void update(double dt) {
    for (int i = particles.length - 1; i >= 0; i--) {
      final p = particles[i];
      p.update(dt);
      if (p.life <= 0) {
        particles.removeAt(i);
      }
    }
  }

  void spawnCherryPetals(Size canvasSize, {int count = 2}) {
    for (int i = 0; i < count; i++) {
      particles.add(
        Particle(
          position: Offset(_rng.nextDouble() * canvasSize.width, -10),
          velocity: Offset(_rng.nextDouble() * 40 - 20, 30 + _rng.nextDouble() * 30),
          size: 4 + _rng.nextDouble() * 5,
          life: 4.0 + _rng.nextDouble() * 2,
          color: const Color(0xFFF472B6).withValues(alpha: 0.7),
          type: ParticleType.cherryPetal,
          rotation: _rng.nextDouble() * pi * 2,
          rotationSpeed: _rng.nextDouble() * 2 - 1,
        ),
      );
    }
  }

  void spawnSlashSparks(Offset pos, Color color, {int count = 12}) {
    for (int i = 0; i < count; i++) {
      final angle = _rng.nextDouble() * pi * 2;
      final speed = 80 + _rng.nextDouble() * 200;
      particles.add(
        Particle(
          position: pos,
          velocity: Offset(cos(angle) * speed, sin(angle) * speed),
          size: 2 + _rng.nextDouble() * 4,
          life: 0.2 + _rng.nextDouble() * 0.3,
          color: color,
          type: ParticleType.spark,
        ),
      );
    }
  }

  void spawnShadowDashTrail(Offset pos, Color glowColor) {
    for (int i = 0; i < 6; i++) {
      particles.add(
        Particle(
          position: pos + Offset(_rng.nextDouble() * 20 - 10, _rng.nextDouble() * 20 - 10),
          velocity: Offset(_rng.nextDouble() * 30 - 15, _rng.nextDouble() * 30 - 15),
          size: 8 + _rng.nextDouble() * 12,
          life: 0.4,
          color: glowColor.withValues(alpha: 0.5),
          type: ParticleType.shadowSmoke,
        ),
      );
    }
  }

  void spawnSpiritBurst(Offset pos, Color color, {int count = 15}) {
    for (int i = 0; i < count; i++) {
      final angle = _rng.nextDouble() * pi * 2;
      final speed = 100 + _rng.nextDouble() * 180;
      particles.add(
        Particle(
          position: pos,
          velocity: Offset(cos(angle) * speed, sin(angle) * speed),
          size: 4 + _rng.nextDouble() * 6,
          life: 0.5 + _rng.nextDouble() * 0.3,
          color: color,
          type: ParticleType.spiritBurst,
        ),
      );
    }
  }

  void spawnFireEmbers(Offset pos, {int count = 3}) {
    for (int i = 0; i < count; i++) {
      particles.add(
        Particle(
          position: pos + Offset(_rng.nextDouble() * 20 - 10, 0),
          velocity: Offset(_rng.nextDouble() * 20 - 10, -50 - _rng.nextDouble() * 40),
          size: 3 + _rng.nextDouble() * 4,
          life: 0.5 + _rng.nextDouble() * 0.4,
          color: _rng.nextBool() ? const Color(0xFFEF4444) : const Color(0xFFF59E0B),
          type: ParticleType.fireEmber,
        ),
      );
    }
  }

  void draw(Canvas canvas) {
    for (final p in particles) {
      final opacity = (p.life / p.maxLife).clamp(0.0, 1.0);
      final paint = Paint()
        ..color = p.color.withValues(alpha: p.color.a * opacity)
        ..style = PaintingStyle.fill;

      canvas.save();
      canvas.translate(p.position.dx, p.position.dy);
      if (p.rotation != 0) canvas.rotate(p.rotation);

      if (p.type == ParticleType.cherryPetal) {
        final path = Path()
          ..moveTo(0, -p.size)
          ..quadraticBezierTo(p.size, 0, 0, p.size)
          ..quadraticBezierTo(-p.size, 0, 0, -p.size);
        canvas.drawPath(path, paint);
      } else if (p.type == ParticleType.spark) {
        canvas.drawCircle(Offset.zero, p.size, paint);
      } else if (p.type == ParticleType.shadowSmoke) {
        canvas.drawCircle(Offset.zero, p.size * (1.0 + (1 - opacity)), paint);
      } else {
        canvas.drawCircle(Offset.zero, p.size, paint);
      }
      canvas.restore();
    }
  }
}
