import 'dart:math';
import 'package:flutter/material.dart';

class Particle {
  double x;
  double y;
  double vx;
  double vy;
  double size;
  Color color;
  double opacity;
  double life;
  double maxLife;
  final double gravity;
  final double friction;

  Particle({
    required this.x,
    required this.y,
    required this.color,
    this.vx = 0,
    this.vy = 0,
    this.size = 4,
    this.opacity = 1.0,
    this.life = 1.0,
    this.maxLife = 1.0,
    this.gravity = 0,
    this.friction = 0.98,
  });

  bool get isDead => life <= 0;

  void update() {
    vx *= friction;
    vy *= friction;
    vy += gravity;
    x += vx;
    y += vy;
    life -= 1.0 / maxLife;
    opacity = life.clamp(0, 1);
  }

  static Particle burst({
    required double x,
    required double y,
    required Color color,
    double speed = 4,
    double size = 4,
    double life = 1.0,
    double gravity = 0.05,
  }) {
    final rng = Random();
    final angle = rng.nextDouble() * 2 * pi;
    final velocity = rng.nextDouble() * speed + 1;
    return Particle(
      x: x,
      y: y,
      vx: cos(angle) * velocity,
      vy: sin(angle) * velocity,
      color: color,
      size: rng.nextDouble() * size + 1,
      life: life,
      maxLife: life,
      gravity: gravity,
      friction: 0.96,
    );
  }

  static Particle spark({
    required double x,
    required double y,
    required Color color,
    double angle = 0,
    double speed = 6,
  }) {
    final rng = Random();
    return Particle(
      x: x,
      y: y,
      vx: cos(angle) * speed + (rng.nextDouble() - 0.5) * 2,
      vy: sin(angle) * speed + (rng.nextDouble() - 0.5) * 2,
      color: color,
      size: rng.nextDouble() * 3 + 1,
      life: 0.6,
      maxLife: 0.6,
      gravity: 0.08,
      friction: 0.94,
    );
  }
}