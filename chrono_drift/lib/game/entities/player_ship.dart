import 'dart:collection';
import 'dart:math';
import 'dart:ui';
import '../../models/ship_chassis.dart';
import '../../models/temporal_snapshot.dart';
import '../../models/quantum_upgrade.dart';
import 'projectile.dart';

class PlayerShip {
  final ShipChassis chassis;
  Offset position;
  Offset velocity = Offset.zero;
  double angle = -pi / 2; // Facing up initially
  Offset aimDirection = const Offset(0, -1);

  double health;
  double maxHealth;
  double shield = 0.0;
  double maxShield = 50.0;

  double fireCooldown = 0.0;
  double rewindCooldownTimer = 0.0;
  double invulnerableTimer = 0.0;

  // Phase Dash
  double dashCooldown = 2.4;
  double dashCooldownTimer = 0.0;
  double dashDurationTimer = 0.0;
  bool get isDashing => dashDurationTimer > 0;
  bool canDash() => dashCooldownTimer <= 0.0;
  double get dashProgress => dashCooldownTimer <= 0 ? 1.0 : (1.0 - (dashCooldownTimer / dashCooldown)).clamp(0.0, 1.0);

  // Temporal Overdrive State
  double overdriveTimer = 0.0;
  bool get isOverdrive => overdriveTimer > 0;
  void activateOverdrive(double duration) {
    overdriveTimer = max(overdriveTimer, duration);
  }

  // History buffer for 3.0s rewind
  final Queue<TemporalSnapshot> history = Queue<TemporalSnapshot>();
  static const double recordWindowSeconds = 3.0;

  PlayerShip({
    required this.chassis,
    required this.position,
  })  : health = chassis.baseHealth,
        maxHealth = chassis.baseHealth;

  bool triggerDash(Map<String, QuantumUpgrade> upgrades) {
    if (!canDash()) return false;

    double cd = dashCooldown;
    if (upgrades.containsKey('phase_burst')) {
      cd *= 0.70; // 30% faster cooldown
    }
    dashCooldown = cd;
    dashCooldownTimer = cd;
    dashDurationTimer = 0.22;
    invulnerableTimer = 0.35; // Brief invulnerability during dash

    final dashDir = aimDirection.distance > 0.1 ? aimDirection : const Offset(0, -1);
    velocity = dashDir * 840.0;
    return true;
  }

  void update(
    double dt,
    Size bounds,
    Offset moveInput,
    Offset? aimInput,
    bool isFiringInput,
    double runTime,
    Map<String, QuantumUpgrade> upgrades,
  ) {
    if (invulnerableTimer > 0) {
      invulnerableTimer -= dt;
    }

    if (rewindCooldownTimer > 0) {
      rewindCooldownTimer -= dt;
    }

    if (dashCooldownTimer > 0) {
      dashCooldownTimer -= dt;
    }

    if (dashDurationTimer > 0) {
      dashDurationTimer -= dt;
    }

    if (overdriveTimer > 0) {
      overdriveTimer -= dt;
    }

    if (fireCooldown > 0) {
      fireCooldown -= dt * (isOverdrive ? 1.8 : 1.0);
    }

    // Shield passive recharge if not damaged recently
    if (shield < maxShield) {
      shield = (shield + (isOverdrive ? 25.0 : 10.0) * dt).clamp(0.0, maxShield);
    }

    // Calculate dynamic stats from upgrades
    double currentSpeed = chassis.speed;
    if (upgrades.containsKey('overclock_thrusters')) {
      currentSpeed *= 1.0 + (upgrades['overclock_thrusters']!.currentLevel * 0.15);
    }
    if (isOverdrive) {
      currentSpeed *= 1.5; // +50% speed during Temporal Overdrive
    }

    // Apply movement input (if not dashing)
    if (!isDashing && moveInput != Offset.zero) {
      final inputDir = moveInput / (moveInput.distance > 1.0 ? moveInput.distance : 1.0);
      velocity += inputDir * currentSpeed * 6.0 * dt;
    }

    // Damping / drag
    velocity *= (1.0 - (isDashing ? 1.5 : 4.5) * dt).clamp(0.0, 1.0);

    // Speed clamp
    final maxAllowedSpeed = isDashing ? 900.0 : currentSpeed;
    if (velocity.distance > maxAllowedSpeed) {
      velocity = (velocity / velocity.distance) * maxAllowedSpeed;
    }

    position += velocity * dt;

    // Bounds containment
    const margin = 28.0;
    position = Offset(
      position.dx.clamp(margin, bounds.width - margin),
      position.dy.clamp(margin, bounds.height - margin),
    );

    // Aim direction & rotation
    if (aimInput != null && aimInput.distance > 0.1) {
      aimDirection = aimInput / aimInput.distance;
      angle = atan2(aimDirection.dy, aimDirection.dx);
    } else if (moveInput.distance > 0.1) {
      aimDirection = moveInput / moveInput.distance;
      angle = atan2(aimDirection.dy, aimDirection.dx);
    }

    // Record state for Rewind buffer
    history.addLast(
      TemporalSnapshot(
        timestamp: runTime,
        position: position,
        angle: angle,
        velocity: velocity,
        isFiring: isFiringInput,
        aimDirection: aimDirection,
        health: health,
      ),
    );

    // Prune snapshots older than 3 seconds
    while (history.isNotEmpty && (runTime - history.first.timestamp) > recordWindowSeconds) {
      history.removeFirst();
    }
  }

  bool canRewind() => rewindCooldownTimer <= 0.0 && history.length >= 10;

  double get rewindProgress {
    final maxCd = chassis.rewindCooldown;
    if (rewindCooldownTimer <= 0) return 1.0;
    return (1.0 - (rewindCooldownTimer / maxCd)).clamp(0.0, 1.0);
  }

  /// Initiates rewind, returns snapshots to be used by Temporal Echo.
  List<TemporalSnapshot> triggerRewind(
    Map<String, QuantumUpgrade> upgrades,
  ) {
    if (!canRewind()) return [];

    final snapshots = history.toList();
    final pastState = history.first;

    // Rewind player position to 3 seconds ago
    position = pastState.position;
    velocity = pastState.velocity * -0.5; // slight counter-inertia
    angle = pastState.angle;

    // Upgrades: Temporal Leech
    if (upgrades.containsKey('temporal_leech')) {
      final heal = 15.0 * upgrades['temporal_leech']!.currentLevel;
      health = (health + heal).clamp(0.0, maxHealth);
      shield = maxShield;
    }

    // Upgrades: Phase Cloak
    if (upgrades.containsKey('phase_cloak')) {
      invulnerableTimer = 1.5;
    } else {
      invulnerableTimer = 0.8; // default brief invulnerability
    }

    // Reset cooldown
    rewindCooldownTimer = chassis.rewindCooldown;
    if (upgrades.containsKey('echo_overcharge')) {
      rewindCooldownTimer *= 0.88;
    }

    // Clear old history to start a fresh sequence
    history.clear();

    return snapshots;
  }

  List<Projectile> tryShoot(
    Map<String, QuantumUpgrade> upgrades,
  ) {
    if (fireCooldown > 0) return [];

    fireCooldown = (1.0 / chassis.fireRate) * (isOverdrive ? 0.55 : 1.0);
    final bullets = <Projectile>[];

    final baseSpeed = isOverdrive ? 850.0 : 700.0;
    final baseDmg = isOverdrive ? 36.0 : 25.0;

    // Gun nozzle position offset
    final noseOffset = Offset(cos(angle), sin(angle)) * 22.0;
    final fireOrigin = position + noseOffset;

    // Base projectile (Overdrive gives glowing electric cyan/violet)
    bullets.add(
      Projectile(
        position: fireOrigin,
        velocity: aimDirection * baseSpeed,
        damage: baseDmg,
        isPlayer: true,
        color: isOverdrive ? const Color(0xFF00FFCC) : chassis.primaryColor,
        radius: isOverdrive ? 5.5 : 4.5,
      ),
    );

    // Overdrive Wingtip Blasters
    if (isOverdrive) {
      final wingOffsetLeft = Offset(-sin(angle), cos(angle)) * 14.0;
      final wingOffsetRight = Offset(sin(angle), -cos(angle)) * 14.0;
      bullets.add(
        Projectile(
          position: position + wingOffsetLeft,
          velocity: aimDirection * baseSpeed,
          damage: baseDmg * 0.7,
          isPlayer: true,
          color: const Color(0xFFE040FB),
          radius: 3.5,
        ),
      );
      bullets.add(
        Projectile(
          position: position + wingOffsetRight,
          velocity: aimDirection * baseSpeed,
          damage: baseDmg * 0.7,
          isPlayer: true,
          color: const Color(0xFFE040FB),
          radius: 3.5,
        ),
      );
    }

    // Tachyon Splitter upgrade: multi-shot
    if (upgrades.containsKey('tachyon_multishot')) {
      final lvl = upgrades['tachyon_multishot']!.currentLevel;
      for (int i = 1; i <= lvl; i++) {
        final spreadAngle = 0.16 * i;
        // Left bolt
        final leftDir = Offset(
          aimDirection.dx * cos(spreadAngle) - aimDirection.dy * sin(spreadAngle),
          aimDirection.dx * sin(spreadAngle) + aimDirection.dy * cos(spreadAngle),
        );
        bullets.add(
          Projectile(
            position: fireOrigin,
            velocity: leftDir * baseSpeed,
            damage: baseDmg * 0.75,
            isPlayer: true,
            color: const Color(0xFFFFD600),
            radius: 3.5,
          ),
        );

        // Right bolt
        final rightDir = Offset(
          aimDirection.dx * cos(-spreadAngle) - aimDirection.dy * sin(-spreadAngle),
          aimDirection.dx * sin(-spreadAngle) + aimDirection.dy * cos(-spreadAngle),
        );
        bullets.add(
          Projectile(
            position: fireOrigin,
            velocity: rightDir * baseSpeed,
            damage: baseDmg * 0.75,
            isPlayer: true,
            color: const Color(0xFFFFD600),
            radius: 3.5,
          ),
        );
      }
    }

    return bullets;
  }

  void takeDamage(double amount) {
    if (invulnerableTimer > 0) return;

    if (shield > 0) {
      if (shield >= amount) {
        shield -= amount;
        return;
      } else {
        amount -= shield;
        shield = 0;
      }
    }

    health = (health - amount).clamp(0.0, maxHealth);
  }

  bool get isDead => health <= 0;
}
