import 'dart:math';
import 'package:flutter/material.dart';

enum PlayerState {
  idle,
  running,
  jumping,
  wallClinging,
  wallSliding,
  dashing,
  attacking,
  dead,
}

enum PlatformType {
  normal,
  bambooWallLeft,
  bambooWallRight,
  shadowAlcove, // Hides player in stealth mode!
  flameTrap,
  spikeTrap,
  exitDoor,
}

enum EnemyType {
  shadowGuard,
  watcherOrb,
  spiritArcher,
  demonBoss,
}

class PlayerNinja {
  Rect bounds;
  Offset velocity = Offset.zero;
  PlayerState state = PlayerState.idle;
  int facing = 1; // 1: right, -1: left

  double health = 100.0;
  double maxHealth = 100.0;
  double dashEnergy = 100.0;
  double maxDashEnergy = 100.0;

  bool isGrounded = false;
  bool isWallSliding = false;
  int wallDirection = 0; // -1 left wall, 1 right wall

  // Ability timers
  double dashTimer = 0.0;
  double attackTimer = 0.0;
  double invulnerableTimer = 0.0;
  bool isStealthHidden = false;

  PlayerNinja({required double x, required double y})
      : bounds = Rect.fromLTWH(x, y, 32, 48);

  void update(double dt, double gravity) {
    if (state == PlayerState.dead) return;

    // Recharge dash energy
    if (dashEnergy < maxDashEnergy) {
      dashEnergy = (dashEnergy + 35 * dt).clamp(0.0, maxDashEnergy);
    }

    if (dashTimer > 0) {
      dashTimer -= dt;
      if (dashTimer <= 0 && state == PlayerState.dashing) {
        state = isGrounded ? PlayerState.idle : PlayerState.jumping;
      }
    }

    if (attackTimer > 0) {
      attackTimer -= dt;
    }

    if (invulnerableTimer > 0) {
      invulnerableTimer -= dt;
    }

    // Apply physics if not dashing
    if (state != PlayerState.dashing) {
      if (isWallSliding) {
        velocity = Offset(velocity.dx, min(velocity.dy + gravity * 0.2 * dt, 80));
      } else {
        velocity = Offset(velocity.dx, velocity.dy + gravity * dt);
      }
      bounds = bounds.translate(velocity.dx * dt, velocity.dy * dt);
    } else {
      // Dashing movement
      bounds = bounds.translate(facing * 600 * dt, 0);
    }
  }

  void jump() {
    if (isGrounded) {
      velocity = Offset(velocity.dx, -550);
      isGrounded = false;
      state = PlayerState.jumping;
    } else if (isWallSliding) {
      // Wall jump leap off wall
      velocity = Offset(-wallDirection * 350, -520);
      facing = -wallDirection;
      isWallSliding = false;
      state = PlayerState.jumping;
    }
  }

  bool dash() {
    if (dashEnergy >= 30 && dashTimer <= 0) {
      dashEnergy -= 30;
      dashTimer = 0.25;
      invulnerableTimer = 0.3;
      state = PlayerState.dashing;
      return true;
    }
    return false;
  }

  bool attack() {
    if (attackTimer <= 0) {
      attackTimer = 0.3;
      return true;
    }
    return false;
  }

  void takeDamage(double amount) {
    if (invulnerableTimer > 0 || state == PlayerState.dashing || state == PlayerState.dead) return;
    health -= amount;
    invulnerableTimer = 0.5;
    if (health <= 0) {
      health = 0;
      state = PlayerState.dead;
    }
  }
}

class Projectile {
  Rect bounds;
  Offset velocity;
  bool isFromEnemy;
  bool isDeflected;

  Projectile({
    required this.bounds,
    required this.velocity,
    this.isFromEnemy = true,
    this.isDeflected = false,
  });

  void update(double dt) {
    bounds = bounds.translate(velocity.dx * dt, velocity.dy * dt);
  }
}

class Enemy {
  String id;
  EnemyType type;
  Rect bounds;
  double health;
  double maxHealth;
  int facing = 1;
  double attackCooldown = 0.0;
  double patrolMinX;
  double patrolMaxX;
  bool isAlerted = false;

  Enemy({
    required this.id,
    required this.type,
    required this.bounds,
    required this.health,
    required this.patrolMinX,
    required this.patrolMaxX,
  }) : maxHealth = health;

  void update(double dt, PlayerNinja player, List<Projectile> projectiles) {
    if (health <= 0) return;

    if (attackCooldown > 0) attackCooldown -= dt;

    if (type == EnemyType.shadowGuard) {
      // Patrol horizontal platform
      double moveSpeed = isAlerted ? 120.0 : 60.0;
      bounds = bounds.translate(facing * moveSpeed * dt, 0);

      if (bounds.left <= patrolMinX) {
        facing = 1;
      } else if (bounds.right >= patrolMaxX) {
        facing = -1;
      }

      // Check line of sight to player
      final distToPlayer = (player.bounds.center - bounds.center).distance;
      if (distToPlayer < 250 && !player.isStealthHidden) {
        isAlerted = true;
        facing = player.bounds.center.dx > bounds.center.dx ? 1 : -1;
      } else {
        isAlerted = false;
      }
    } else if (type == EnemyType.watcherOrb) {
      // Floating laser orb bobbing up and down
      final hoverY = sin(DateTime.now().millisecondsSinceEpoch / 400.0) * 1.5;
      bounds = bounds.translate(0, hoverY);

      final distToPlayer = (player.bounds.center - bounds.center).distance;
      if (distToPlayer < 280 && !player.isStealthHidden) {
        isAlerted = true;
        if (attackCooldown <= 0) {
          attackCooldown = 1.8;
          // Shoot laser projectile towards player
          final dir = (player.bounds.center - bounds.center);
          final norm = dir / dir.distance;
          projectiles.add(
            Projectile(
              bounds: Rect.fromLTWH(bounds.center.dx, bounds.center.dy, 12, 12),
              velocity: norm * 260,
            ),
          );
        }
      } else {
        isAlerted = false;
      }
    } else if (type == EnemyType.spiritArcher) {
      final distToPlayer = (player.bounds.center - bounds.center).distance;
      if (distToPlayer < 320 && !player.isStealthHidden) {
        isAlerted = true;
        facing = player.bounds.center.dx > bounds.center.dx ? 1 : -1;

        if (attackCooldown <= 0) {
          attackCooldown = 2.2;
          final dir = (player.bounds.center - bounds.center);
          final norm = dir / dir.distance;
          projectiles.add(
            Projectile(
              bounds: Rect.fromLTWH(bounds.center.dx, bounds.center.dy, 16, 8),
              velocity: norm * 320,
            ),
          );
        }
      } else {
        isAlerted = false;
      }
    }
  }

  void takeDamage(double dmg) {
    health -= dmg;
  }
}

class GamePlatform {
  Rect bounds;
  PlatformType type;
  Color color;
  bool isOneWay;

  GamePlatform({
    required this.bounds,
    required this.type,
    this.color = const Color(0xFF334155),
    this.isOneWay = false,
  });
}

class GameItem {
  Rect bounds;
  String type; // 'orb', 'coin', 'potion'
  bool isCollected = false;

  GameItem({
    required this.bounds,
    required this.type,
  });
}
