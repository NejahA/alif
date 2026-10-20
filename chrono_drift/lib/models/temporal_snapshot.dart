import 'dart:ui';

/// Represents a single recorded instant of the player's ship.
/// Used to rewind time and replay actions via the Temporal Echo.
class TemporalSnapshot {
  final double timestamp; // In seconds since run started
  final Offset position;
  final double angle; // In radians
  final Offset velocity;
  final bool isFiring;
  final Offset aimDirection;
  final double health;

  const TemporalSnapshot({
    required this.timestamp,
    required this.position,
    required this.angle,
    required this.velocity,
    required this.isFiring,
    required this.aimDirection,
    required this.health,
  });
}
