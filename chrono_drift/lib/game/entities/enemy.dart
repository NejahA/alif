import 'dart:math';
import 'dart:ui';
import 'projectile.dart';

enum EnemyType {
  pulseChaser,
  sentinelTurret,
  phaseSniper,
  quantumLeviathan, // Boss
}

class Enemy {
  final String id;
  final EnemyType type;
  Offset position;
  Offset velocity = Offset.zero;
  double angle = 0.0;
  double health;
  final double maxHealth;
  final double speed;
  final double collisionRadius;
  final int coreReward;
  final int scoreValue;

  double shootTimer = 0.0;
  double sniperAimTimer = 0.0; // Charge up time before shot
  bool isAimingSniper = false;
  Offset sniperLockDir = Offset.zero;

  // Boss rotation phase
  double bossSpiralAngle = 0.0;

  Enemy({
    required this.id,
    required this.type,
    required this.position,
    required this.health,
    required this.maxHealth,
    required this.speed,
    required this.collisionRadius,
    required this.coreReward,
    required this.scoreValue,
  }) {
    shootTimer = 1.0 + Random().nextDouble() * 1.5;
  }

  factory Enemy.create({
    required EnemyType type,
    required Offset spawnPos,
    required int wave,
  }) {
    final randomId = '${type.name}_${DateTime.now().microsecondsSinceEpoch}_${Random().nextInt(9999)}';
    final waveMultiplier = 1.0 + (wave - 1) * 0.18;

    switch (type) {
      case EnemyType.pulseChaser:
        return Enemy(
          id: randomId,
          type: type,
          position: spawnPos,
          health: 35.0 * waveMultiplier,
          maxHealth: 35.0 * waveMultiplier,
          speed: 190.0 + min(wave * 5.0, 80.0),
          collisionRadius: 16.0,
          coreReward: 1,
          scoreValue: 100,
        );

      case EnemyType.sentinelTurret:
        return Enemy(
          id: randomId,
          type: type,
          position: spawnPos,
          health: 70.0 * waveMultiplier,
          maxHealth: 70.0 * waveMultiplier,
          speed: 90.0,
          collisionRadius: 22.0,
          coreReward: 2,
          scoreValue: 250,
        );

      case EnemyType.phaseSniper:
        return Enemy(
          id: randomId,
          type: type,
          position: spawnPos,
          health: 50.0 * waveMultiplier,
          maxHealth: 50.0 * waveMultiplier,
          speed: 130.0,
          collisionRadius: 18.0,
          coreReward: 3,
          scoreValue: 400,
        );

      case EnemyType.quantumLeviathan:
        return Enemy(
          id: randomId,
          type: type,
          position: spawnPos,
          health: 900.0 * waveMultiplier,
          maxHealth: 900.0 * waveMultiplier,
          speed: 55.0,
          collisionRadius: 46.0,
          coreReward: 15,
          scoreValue: 3000,
        );
    }
  }

  List<Projectile> update(
    double dt,
    Offset targetPos,
    Size bounds,
  ) {
    final diff = targetPos - position;
    final dist = diff.distance;
    final dir = dist > 0.001 ? diff / dist : const Offset(1, 0);

    angle = atan2(dir.dy, dir.dx);
    final spawnedProjectiles = <Projectile>[];

    switch (type) {
      case EnemyType.pulseChaser:
        // Direct pursuit
        velocity = dir * speed;
        position += velocity * dt;
        break;

      case EnemyType.sentinelTurret:
        // Maintains distance around 250px
        if (dist > 300) {
          velocity = dir * speed;
        } else if (dist < 180) {
          velocity = -dir * speed;
        } else {
          // Strafe in orbit
          velocity = Offset(-dir.dy, dir.dx) * speed;
        }
        position += velocity * dt;

        // Firing logic
        shootTimer -= dt;
        if (shootTimer <= 0) {
          shootTimer = 2.2;
          spawnedProjectiles.add(
            Projectile(
              position: position,
              velocity: dir * 320.0,
              damage: 15.0,
              isPlayer: false,
              color: const Color(0xFFFF1744),
              radius: 5.0,
            ),
          );
        }
        break;

      case EnemyType.phaseSniper:
        // Keeps long distance
        if (dist < 320) {
          velocity = -dir * speed;
          position += velocity * dt;
        }

        shootTimer -= dt;
        if (shootTimer <= 1.2 && !isAimingSniper) {
          isAimingSniper = true;
          sniperAimTimer = 1.2;
          sniperLockDir = dir;
        }

        if (isAimingSniper) {
          sniperAimTimer -= dt;
          // Track slowly
          sniperLockDir = Offset.lerp(sniperLockDir, dir, 3.0 * dt) ?? dir;
          if (sniperAimTimer <= 0) {
            isAimingSniper = false;
            shootTimer = 3.5;
            // High speed rail beam
            spawnedProjectiles.add(
              Projectile(
                position: position,
                velocity: sniperLockDir * 650.0,
                damage: 32.0,
                isPlayer: false,
                color: const Color(0xFFFF3D00),
                radius: 6.0,
                canPenetrate: true,
              ),
            );
          }
        }
        break;

      case EnemyType.quantumLeviathan:
        // Boss moves toward center or drifts
        final center = Offset(bounds.width / 2, bounds.height / 2);
        final toCenter = center - position;
        if (toCenter.distance > 80) {
          velocity = (toCenter / toCenter.distance) * speed;
        } else {
          velocity = dir * (speed * 0.5);
        }
        position += velocity * dt;

        bossSpiralAngle += dt * 2.5;
        shootTimer -= dt;
        if (shootTimer <= 0) {
          shootTimer = 1.0;
          // 6-way spiral burst
          const arms = 6;
          for (int i = 0; i < arms; i++) {
            final theta = bossSpiralAngle + (i * 2 * pi / arms);
            final bulletDir = Offset(cos(theta), sin(theta));
            spawnedProjectiles.add(
              Projectile(
                position: position,
                velocity: bulletDir * 240.0,
                damage: 18.0,
                isPlayer: false,
                color: const Color(0xFFFF007F),
                radius: 5.5,
              ),
            );
          }
        }
        break;
    }

    // Keep in arena with padding
    const pad = 20.0;
    position = Offset(
      position.dx.clamp(pad, bounds.width - pad),
      position.dy.clamp(pad, bounds.height - pad),
    );

    return spawnedProjectiles;
  }

  void takeDamage(double amount) {
    health -= amount;
  }

  bool get isDead => health <= 0;
}
