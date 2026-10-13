import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'game_state.dart';
import 'entities.dart';
import 'particle_system.dart';
import '../models/ninja_skin.dart';
import '../models/katana_effect.dart';
import '../audio/sound_effects.dart';

class GameCanvasWidget extends StatefulWidget {
  final GameStateNotifier gameState;

  const GameCanvasWidget({super.key, required this.gameState});

  @override
  State<GameCanvasWidget> createState() => _GameCanvasWidgetState();
}

class _GameCanvasWidgetState extends State<GameCanvasWidget> with SingleTickerProviderStateMixin {
  late AnimationController _ticker;

  late PlayerNinja player;
  final List<GamePlatform> platforms = [];
  final List<Enemy> enemies = [];
  final List<Projectile> projectiles = [];
  final List<GameItem> items = [];

  final ParticleEngine particleEngine = ParticleEngine();
  final SoundSynth synth = SoundSynth();

  double cameraY = 0.0;
  double targetCameraY = 0.0;
  double screenShake = 0.0;

  double voidCorruptionY = 2000.0; // Rising void wall in endless mode
  double levelHeight = 3000.0;

  DateTime _lastFrameTime = DateTime.now();

  // Control inputs
  bool moveLeft = false;
  bool moveRight = false;
  final FocusNode _focusNode = FocusNode();

  @override
  void initState() {
    super.initState();
    _initLevel();
    _ticker = AnimationController(vsync: this, duration: const Duration(seconds: 1))..repeat();
    _ticker.addListener(_gameLoop);
  }

  @override
  void dispose() {
    _ticker.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _initLevel() {
    platforms.clear();
    enemies.clear();
    projectiles.clear();
    items.clear();

    final isEndless = widget.gameState.selectedMode == GameMode.endless;
    levelHeight = isEndless ? 10000.0 : 3500.0;

    // Player spawn near bottom center
    player = PlayerNinja(x: 220, y: levelHeight - 120);
    cameraY = player.bounds.center.dy - 300;
    targetCameraY = cameraY;
    voidCorruptionY = levelHeight + 300;

    // Base ground platform
    platforms.add(
      GamePlatform(
        bounds: Rect.fromLTWH(0, levelHeight - 40, 600, 80),
        type: PlatformType.normal,
        color: const Color(0xFF1E293B),
      ),
    );

    // Left and Right Outer Bamboo Walls for wall-jumping
    platforms.add(
      GamePlatform(
        bounds: Rect.fromLTWH(-20, -500, 40, levelHeight + 600),
        type: PlatformType.bambooWallLeft,
        color: const Color(0xFF0F172A),
      ),
    );

    platforms.add(
      GamePlatform(
        bounds: Rect.fromLTWH(500, -500, 40, levelHeight + 600),
        type: PlatformType.bambooWallRight,
        color: const Color(0xFF0F172A),
      ),
    );

    // Build floor platforms going upwards
    final rng = Random(42);
    double currentY = levelHeight - 180;
    int enemyCounter = 0;

    while (currentY > 100) {
      final width = 110.0 + rng.nextDouble() * 120;
      final x = 40.0 + rng.nextDouble() * (440.0 - width);

      final isShadowAlcove = rng.nextDouble() < 0.25;
      final isTrap = rng.nextDouble() < 0.2;

      PlatformType pType = PlatformType.normal;
      if (isShadowAlcove) {
        pType = PlatformType.shadowAlcove;
      } else if (isTrap) {
        pType = rng.nextBool() ? PlatformType.flameTrap : PlatformType.spikeTrap;
      }

      platforms.add(
        GamePlatform(
          bounds: Rect.fromLTWH(x, currentY, width, 22),
          type: pType,
          color: isShadowAlcove
              ? const Color(0xFF312E81)
              : (isTrap ? const Color(0xFF991B1B) : const Color(0xFF334155)),
        ),
      );

      // Spawn Enemy on platform
      if (!isTrap && rng.nextDouble() < 0.65 && currentY < levelHeight - 300) {
        enemyCounter++;
        final eType = (rng.nextDouble() < 0.4)
            ? EnemyType.shadowGuard
            : (rng.nextDouble() < 0.7 ? EnemyType.watcherOrb : EnemyType.spiritArcher);

        enemies.add(
          Enemy(
            id: 'enemy_$enemyCounter',
            type: eType,
            bounds: Rect.fromLTWH(x + width / 4, currentY - 40, 32, 40),
            health: eType == EnemyType.shadowGuard ? 60 : (eType == EnemyType.spiritArcher ? 40 : 30),
            patrolMinX: x,
            patrolMaxX: x + width - 32,
          ),
        );
      }

      // Collectibles
      if (rng.nextDouble() < 0.4) {
        items.add(
          GameItem(
            bounds: Rect.fromLTWH(x + width / 2 - 10, currentY - 30, 20, 20),
            type: rng.nextDouble() < 0.7 ? 'coin' : 'orb',
          ),
        );
      }

      currentY -= 130 + rng.nextDouble() * 70;
    }

    // Goal Exit Door at top in campaign mode
    if (!isEndless) {
      platforms.add(
        GamePlatform(
          bounds: Rect.fromLTWH(200, 60, 120, 30),
          type: PlatformType.exitDoor,
          color: const Color(0xFFF59E0B),
        ),
      );
    }
  }

  void _gameLoop() {
    if (widget.gameState.isPaused || widget.gameState.isGameOver) return;

    final now = DateTime.now();
    final dt = (now.difference(_lastFrameTime).inMicroseconds / 1000000.0).clamp(0.001, 0.05);
    _lastFrameTime = now;

    _updatePhysics(dt);
    particleEngine.update(dt);
    particleEngine.spawnCherryPetals(const Size(500, 700), count: 1);

    if (mounted) setState(() {});
  }

  void _updatePhysics(double dt) {
    if (player.state == PlayerState.dead) return;

    // Movement input handling
    double moveDx = 0;
    if (moveLeft) moveDx -= 1;
    if (moveRight) moveDx += 1;

    if (player.state != PlayerState.dashing) {
      if (moveDx != 0) {
        player.facing = moveDx > 0 ? 1 : -1;
        player.velocity = Offset(moveDx * 240, player.velocity.dy);
        if (player.isGrounded) player.state = PlayerState.running;
      } else {
        player.velocity = Offset(player.velocity.dx * 0.7, player.velocity.dy);
        if (player.isGrounded && player.state != PlayerState.attacking) {
          player.state = PlayerState.idle;
        }
      }
    }

    // Apply Player update
    player.update(dt, 980);

    // Wall slide detection (clinging to outer left/right bamboo walls)
    player.isWallSliding = false;
    if (!player.isGrounded && player.velocity.dy > 0) {
      if (player.bounds.left <= 20) {
        player.isWallSliding = true;
        player.wallDirection = -1;
      } else if (player.bounds.right >= 480) {
        player.isWallSliding = true;
        player.wallDirection = 1;
      }
    }

    // Platform collisions
    player.isGrounded = false;
    player.isStealthHidden = false;

    for (final p in platforms) {
      if (player.bounds.overlaps(p.bounds)) {
        if (p.type == PlatformType.shadowAlcove) {
          player.isStealthHidden = true;
        }

        if (p.type == PlatformType.flameTrap || p.type == PlatformType.spikeTrap) {
          player.takeDamage(25 * dt);
          screenShake = 5.0;
        }

        if (p.type == PlatformType.exitDoor && widget.gameState.selectedMode == GameMode.campaign) {
          widget.gameState.triggerGameOver(victory: true);
          synth.playVictory();
          return;
        }

        // Top landing collision
        if (player.velocity.dy > 0 && player.bounds.bottom - player.velocity.dy * dt <= p.bounds.top + 10) {
          player.bounds = Rect.fromLTWH(
            player.bounds.left,
            p.bounds.top - player.bounds.height,
            player.bounds.width,
            player.bounds.height,
          );
          player.velocity = Offset(player.velocity.dx, 0);
          player.isGrounded = true;
        }
      }
    }

    // Rising Void Corruption in Endless Mode
    if (widget.gameState.selectedMode == GameMode.endless) {
      voidCorruptionY -= 45 * dt;
      if (player.bounds.bottom >= voidCorruptionY) {
        player.takeDamage(100);
        widget.gameState.triggerGameOver(victory: false);
        synth.playHit();
        return;
      }
    }

    // Katana attack hits enemies & deflects projectiles!
    if (player.attackTimer > 0) {
      final attackArc = Rect.fromLTWH(
        player.facing == 1 ? player.bounds.right : player.bounds.left - 45,
        player.bounds.top - 10,
        55,
        65,
      );

      particleEngine.spawnSlashSparks(
        attackArc.center,
        widget.gameState.currentKatana.slashColor,
        count: 2,
      );

      for (final e in enemies) {
        if (e.health > 0 && attackArc.overlaps(e.bounds)) {
          bool isBackstab = (e.facing == player.facing);
          double dmg = isBackstab ? 120 : 45;

          e.takeDamage(dmg);
          synth.playSlash();
          screenShake = 6.0;

          if (isBackstab) {
            synth.playStealthTakedown();
            widget.gameState.stealthTakedowns++;
            particleEngine.spawnSpiritBurst(e.bounds.center, const Color(0xFFF43F5E), count: 20);
          } else {
            particleEngine.spawnSlashSparks(e.bounds.center, widget.gameState.currentKatana.sparkColor);
          }

          if (e.health <= 0) {
            widget.gameState.enemiesKilled++;
            widget.gameState.incrementCombo();
            widget.gameState.addCoins(15);
          }
        }
      }

      // Deflect enemy projectiles!
      for (final proj in projectiles) {
        if (proj.isFromEnemy && attackArc.overlaps(proj.bounds)) {
          proj.isFromEnemy = false;
          proj.isDeflected = true;
          proj.velocity = Offset(-proj.velocity.dx * 1.5, -proj.velocity.dy);
          synth.playDeflect();
          particleEngine.spawnSlashSparks(proj.bounds.center, const Color(0xFFFBBF24), count: 12);
        }
      }
    }

    // Update Enemies
    for (final e in enemies) {
      e.update(dt, player, projectiles);
      if (e.health > 0 && e.bounds.overlaps(player.bounds)) {
        player.takeDamage(15 * dt);
        screenShake = 4.0;
      }
    }

    // Update Projectiles
    for (int i = projectiles.length - 1; i >= 0; i--) {
      final proj = projectiles[i];
      proj.update(dt);

      if (proj.isFromEnemy && proj.bounds.overlaps(player.bounds)) {
        player.takeDamage(20);
        synth.playHit();
        projectiles.removeAt(i);
        screenShake = 8.0;
        continue;
      }

      if (proj.isDeflected) {
        for (final e in enemies) {
          if (e.health > 0 && proj.bounds.overlaps(e.bounds)) {
            e.takeDamage(80);
            synth.playExplosion();
            particleEngine.spawnSpiritBurst(e.bounds.center, const Color(0xFFF59E0B));
            projectiles.removeAt(i);
            break;
          }
        }
      }
    }

    // Collect Items
    for (final item in items) {
      if (!item.isCollected && player.bounds.overlaps(item.bounds)) {
        item.isCollected = true;
        synth.playCoin();
        if (item.type == 'coin') {
          widget.gameState.addCoins(10);
        } else {
          widget.gameState.addScore(50);
        }
      }
    }

    // Camera follow smoothly
    targetCameraY = player.bounds.center.dy - 350;
    cameraY += (targetCameraY - cameraY) * 5 * dt;

    if (screenShake > 0) {
      screenShake = (screenShake - 20 * dt).clamp(0.0, 10.0);
    }

    // Check Player Death
    if (player.state == PlayerState.dead || player.bounds.top > levelHeight + 200) {
      widget.gameState.triggerGameOver(victory: false);
      synth.playHit();
    }
  }

  void _triggerJump() {
    player.jump();
    synth.playJump();
  }

  void _triggerDash() {
    if (player.dash()) {
      synth.playDash();
      particleEngine.spawnShadowDashTrail(
        player.bounds.center,
        widget.gameState.currentSkin.glowColor,
      );
    }
  }

  void _triggerAttack() {
    if (player.attack()) {
      synth.playSlash();
    }
  }

  @override
  Widget build(BuildContext context) {
    return KeyboardListener(
      focusNode: _focusNode,
      autofocus: true,
      onKeyEvent: (event) {
        if (event is KeyDownEvent) {
          if (event.logicalKey == LogicalKeyboardKey.keyA || event.logicalKey == LogicalKeyboardKey.arrowLeft) {
            moveLeft = true;
          } else if (event.logicalKey == LogicalKeyboardKey.keyD ||
              event.logicalKey == LogicalKeyboardKey.arrowRight) {
            moveRight = true;
          } else if (event.logicalKey == LogicalKeyboardKey.space || event.logicalKey == LogicalKeyboardKey.keyW) {
            _triggerJump();
          } else if (event.logicalKey == LogicalKeyboardKey.shiftLeft || event.logicalKey == LogicalKeyboardKey.keyJ) {
            _triggerDash();
          } else if (event.logicalKey == LogicalKeyboardKey.keyK || event.logicalKey == LogicalKeyboardKey.keyE) {
            _triggerAttack();
          }
        } else if (event is KeyUpEvent) {
          if (event.logicalKey == LogicalKeyboardKey.keyA || event.logicalKey == LogicalKeyboardKey.arrowLeft) {
            moveLeft = false;
          } else if (event.logicalKey == LogicalKeyboardKey.keyD ||
              event.logicalKey == LogicalKeyboardKey.arrowRight) {
            moveRight = false;
          }
        }
      },
      child: Stack(
        children: [
          CustomPaint(
            size: Size.infinite,
            painter: GamePainter(
              player: player,
              platforms: platforms,
              enemies: enemies,
              projectiles: projectiles,
              items: items,
              particleEngine: particleEngine,
              cameraY: cameraY,
              screenShake: screenShake,
              skin: widget.gameState.currentSkin,
              katana: widget.gameState.currentKatana,
              voidCorruptionY: voidCorruptionY,
              isEndless: widget.gameState.selectedMode == GameMode.endless,
            ),
          ),
          // Touch controls overlay for mobile/mouse clicks
          Positioned(
            left: 20,
            bottom: 20,
            child: Row(
              children: [
                _buildCircularButton(
                  icon: Icons.arrow_back,
                  onPressStart: () => moveLeft = true,
                  onPressEnd: () => moveLeft = false,
                ),
                const SizedBox(width: 15),
                _buildCircularButton(
                  icon: Icons.arrow_forward,
                  onPressStart: () => moveRight = true,
                  onPressEnd: () => moveRight = false,
                ),
              ],
            ),
          ),
          Positioned(
            right: 20,
            bottom: 20,
            child: Row(
              children: [
                _buildCircularButton(
                  icon: Icons.bolt,
                  color: widget.gameState.currentSkin.accentColor,
                  onTap: _triggerDash,
                  label: 'DASH',
                ),
                const SizedBox(width: 12),
                _buildCircularButton(
                  icon: Icons.navigation,
                  color: Colors.cyanAccent,
                  onTap: _triggerJump,
                  label: 'JUMP',
                ),
                const SizedBox(width: 12),
                _buildCircularButton(
                  icon: Icons.colorize,
                  color: widget.gameState.currentKatana.slashColor,
                  onTap: _triggerAttack,
                  label: 'SLASH',
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCircularButton({
    required IconData icon,
    Color color = Colors.white24,
    VoidCallback? onTap,
    VoidCallback? onPressStart,
    VoidCallback? onPressEnd,
    String? label,
  }) {
    return GestureDetector(
      onTapDown: (_) => onPressStart?.call(),
      onTapUp: (_) => onPressEnd?.call(),
      onTapCancel: () => onPressEnd?.call(),
      onTap: onTap,
      child: Container(
        width: 62,
        height: 62,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: color.withValues(alpha: 0.25),
          border: Border.all(color: color.withValues(alpha: 0.8), width: 2),
          boxShadow: [
            BoxShadow(
              color: color.withValues(alpha: 0.3),
              blurRadius: 10,
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: Colors.white, size: 26),
            if (label != null)
              Text(
                label,
                style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold),
              ),
          ],
        ),
      ),
    );
  }
}

class GamePainter extends CustomPainter {
  final PlayerNinja player;
  final List<GamePlatform> platforms;
  final List<Enemy> enemies;
  final List<Projectile> projectiles;
  final List<GameItem> items;
  final ParticleEngine particleEngine;
  final double cameraY;
  final double screenShake;
  final NinjaSkin skin;
  final KatanaEffect katana;
  final double voidCorruptionY;
  final bool isEndless;

  final Random _shakeRng = Random();

  GamePainter({
    required this.player,
    required this.platforms,
    required this.enemies,
    required this.projectiles,
    required this.items,
    required this.particleEngine,
    required this.cameraY,
    required this.screenShake,
    required this.skin,
    required this.katana,
    required this.voidCorruptionY,
    required this.isEndless,
  });

  @override
  void paint(Canvas canvas, Size size) {
    canvas.save();

    // Screen shake offsets
    if (screenShake > 0) {
      canvas.translate(
        (_shakeRng.nextDouble() * 2 - 1) * screenShake,
        (_shakeRng.nextDouble() * 2 - 1) * screenShake,
      );
    }

    // Dark Japanese Cyber-Pagoda Sky Background Gradient
    final skyGradient = LinearGradient(
      begin: Alignment.topCenter,
      end: Alignment.bottomCenter,
      colors: const [
        Color(0xFF030712),
        Color(0xFF0F172A),
        Color(0xFF1E1B4B),
      ],
    );
    canvas.drawRect(Rect.fromLTWH(0, 0, size.width, size.height), Paint()..shader = skyGradient.createShader(Rect.fromLTWH(0, 0, size.width, size.height)));

    // Full Moon & Clouds in Background
    final moonPaint = Paint()
      ..color = const Color(0xFFFEF3C7).withValues(alpha: 0.85)
      ..maskFilter = const MaskFilter.blur(BlurStyle.solid, 15);
    canvas.drawCircle(Offset(size.width * 0.75, 140 - cameraY * 0.1), 60, moonPaint);

    canvas.save();
    canvas.translate(0, -cameraY);

    // Draw Platforms & Shadows
    for (final p in platforms) {
      final pPaint = Paint()..color = p.color;
      canvas.drawRRect(RRect.fromRectAndRadius(p.bounds, const Radius.circular(4)), pPaint);

      if (p.type == PlatformType.shadowAlcove) {
        // Glowing purple shadow curtain
        final alcoveGlow = Paint()
          ..color = const Color(0xFF6366F1).withValues(alpha: 0.25)
          ..maskFilter = const MaskFilter.blur(BlurStyle.solid, 8);
        canvas.drawRect(p.bounds.inflate(4), alcoveGlow);
      } else if (p.type == PlatformType.flameTrap) {
        // Flame jets
        particleEngine.spawnFireEmbers(Offset(p.bounds.center.dx, p.bounds.top));
      }
    }

    // Draw Items
    for (final item in items) {
      if (item.isCollected) continue;
      final itemPaint = Paint()
        ..color = item.type == 'coin' ? const Color(0xFFF59E0B) : const Color(0xFF38BDF8)
        ..maskFilter = const MaskFilter.blur(BlurStyle.solid, 4);
      canvas.drawCircle(item.bounds.center, 8, itemPaint);
    }

    // Draw Enemies
    for (final e in enemies) {
      if (e.health <= 0) continue;
      final ePaint = Paint()..color = e.type == EnemyType.shadowGuard ? const Color(0xFFDC2626) : const Color(0xFFA855F7);

      canvas.drawRRect(RRect.fromRectAndRadius(e.bounds, const Radius.circular(6)), ePaint);

      // Glowing Eyes / Laser detection cone
      final eyePaint = Paint()..color = Colors.yellowAccent;
      canvas.drawCircle(
        Offset(e.facing == 1 ? e.bounds.right - 6 : e.bounds.left + 6, e.bounds.top + 10),
        3,
        eyePaint,
      );

      // Health bar above enemy
      if (e.health < e.maxHealth) {
        final hpWidth = (e.bounds.width * (e.health / e.maxHealth)).clamp(0.0, e.bounds.width);
        canvas.drawRect(Rect.fromLTWH(e.bounds.left, e.bounds.top - 8, e.bounds.width, 4), Paint()..color = Colors.black54);
        canvas.drawRect(Rect.fromLTWH(e.bounds.left, e.bounds.top - 8, hpWidth, 4), Paint()..color = Colors.redAccent);
      }
    }

    // Draw Projectiles
    for (final proj in projectiles) {
      final pColor = proj.isDeflected ? const Color(0xFFFBBF24) : const Color(0xFFEF4444);
      final pPaint = Paint()
        ..color = pColor
        ..maskFilter = const MaskFilter.blur(BlurStyle.solid, 4);
      canvas.drawOval(proj.bounds, pPaint);
    }

    // Draw Particles
    particleEngine.draw(canvas);

    // Draw Player Ninja Character
    if (player.state != PlayerState.dead) {
      final opacity = player.isStealthHidden ? 0.35 : (player.invulnerableTimer > 0 ? 0.6 : 1.0);

      final bodyPaint = Paint()
        ..color = skin.primaryColor.withValues(alpha: opacity)
        ..style = PaintingStyle.fill;

      final accentPaint = Paint()
        ..color = skin.accentColor.withValues(alpha: opacity)
        ..style = PaintingStyle.fill;

      final glowPaint = Paint()
        ..color = skin.glowColor.withValues(alpha: opacity * 0.7)
        ..maskFilter = const MaskFilter.blur(BlurStyle.solid, 6);

      // Body & Ninja Scarf Glow
      canvas.drawRRect(RRect.fromRectAndRadius(player.bounds, const Radius.circular(8)), glowPaint);
      canvas.drawRRect(RRect.fromRectAndRadius(player.bounds, const Radius.circular(8)), bodyPaint);

      // Head band & glowing eyes
      canvas.drawRect(
        Rect.fromLTWH(
          player.facing == 1 ? player.bounds.right - 14 : player.bounds.left,
          player.bounds.top + 8,
          14,
          6,
        ),
        accentPaint,
      );

      // Katana sword blade when attacking or idle
      final katanaColor = katana.slashColor.withValues(alpha: opacity);
      final bladePaint = Paint()
        ..color = katanaColor
        ..strokeWidth = 4
        ..style = PaintingStyle.stroke
        ..maskFilter = const MaskFilter.blur(BlurStyle.solid, 3);

      final swordStart = player.bounds.center;
      final swordEnd = player.facing == 1
          ? Offset(player.bounds.right + 25, player.bounds.top + (player.attackTimer > 0 ? 35 : 10))
          : Offset(player.bounds.left - 25, player.bounds.top + (player.attackTimer > 0 ? 35 : 10));

      canvas.drawLine(swordStart, swordEnd, bladePaint);

      // Slash arc effect
      if (player.attackTimer > 0) {
        final arcPaint = Paint()
          ..color = katana.slashColor.withValues(alpha: player.attackTimer / 0.3)
          ..strokeWidth = 8
          ..style = PaintingStyle.stroke;
        final arcRect = Rect.fromLTWH(
          player.facing == 1 ? player.bounds.right - 10 : player.bounds.left - 45,
          player.bounds.top - 15,
          55,
          65,
        );
        canvas.drawArc(arcRect, player.facing == 1 ? -pi / 3 : pi / 3, pi * 0.7, false, arcPaint);
      }
    }

    // Draw Rising Void Corruption in Endless Mode
    if (isEndless) {
      final voidGradient = LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: const [
          Color(0xEE881337),
          Color(0xFF881337),
        ],
      );
      canvas.drawRect(
        Rect.fromLTWH(0, voidCorruptionY, size.width, 1000),
        Paint()..shader = voidGradient.createShader(Rect.fromLTWH(0, voidCorruptionY, size.width, 1000)),
      );
    }

    canvas.restore();
    canvas.restore();
  }

  @override
  bool shouldRepaint(covariant GamePainter oldDelegate) => true;
}
