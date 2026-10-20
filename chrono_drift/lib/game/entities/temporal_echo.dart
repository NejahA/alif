import 'dart:math';
import 'dart:ui';
import '../../models/temporal_snapshot.dart';
import '../../models/quantum_upgrade.dart';
import 'projectile.dart';

class TemporalEcho {
  final List<TemporalSnapshot> snapshots;
  final double damageMultiplier;
  final Color ghostColor;
  int currentIndex = 0;
  double playbackTime = 0.0;
  Offset currentPosition;
  double currentAngle;
  double shotCooldown = 0.0;
  bool isFinished = false;

  // Echo Overdrive & Resonance Attributes
  final double refractionRadius = 38.0;
  double auraPulse = 0.0;
  int refractionsCount = 0;
  bool isDetonated = false;

  TemporalEcho({
    required this.snapshots,
    this.damageMultiplier = 1.0,
    this.ghostColor = const Color(0xFF00E5FF),
  })  : currentPosition = snapshots.isNotEmpty ? snapshots.first.position : Offset.zero,
        currentAngle = snapshots.isNotEmpty ? snapshots.first.angle : 0.0;

  bool get canResonate => !isFinished && !isDetonated;

  void detonate() {
    isDetonated = true;
    isFinished = true;
  }

  List<Projectile> update(
    double dt,
    Map<String, QuantumUpgrade> upgrades,
  ) {
    auraPulse += dt * 4.0;

    if (isDetonated || snapshots.isEmpty || currentIndex >= snapshots.length - 1) {
      isFinished = true;
      return [];
    }

    if (shotCooldown > 0) {
      shotCooldown -= dt;
    }

    // Step through recorded snapshots
    currentIndex++;
    if (currentIndex >= snapshots.length) {
      isFinished = true;
      return [];
    }

    final snap = snapshots[currentIndex];
    currentPosition = snap.position;
    currentAngle = snap.angle;

    final newBullets = <Projectile>[];

    // Replay weapon discharges
    if (snap.isFiring && shotCooldown <= 0) {
      shotCooldown = 0.18; // rate limiter for echo
      final baseSpeed = 700.0;
      final noseOffset = Offset(cos(currentAngle), sin(currentAngle)) * 22.0;

      // Echo shots are marked with isEcho: true
      newBullets.add(
        Projectile(
          position: currentPosition + noseOffset,
          velocity: snap.aimDirection * baseSpeed,
          damage: 22.0 * damageMultiplier,
          isPlayer: true,
          isEcho: true,
          color: const Color(0xFFE040FB), // Quantum Violet
          radius: 4.0,
        ),
      );
    }

    return newBullets;
  }

  double get progress => snapshots.isNotEmpty ? (currentIndex / snapshots.length).clamp(0.0, 1.0) : 1.0;
}
