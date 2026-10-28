import 'dart:math';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/ship_chassis.dart';
import '../models/game_stats.dart';
import '../models/quantum_upgrade.dart';
import '../models/particle.dart';
import 'entities/player_ship.dart';
import 'entities/temporal_echo.dart';
import 'entities/enemy.dart';
import 'entities/projectile.dart';
import 'audio/game_audio.dart';

enum GameStatus {
  menu,
  playing,
  paused,
  upgrading,
  gameOver,
}

class GameState extends ChangeNotifier {
  GameStatus status = GameStatus.menu;

  // Selected Ship & Stats
  ShipChassis selectedChassis = ShipChassis.allChassis.first;
  final GameStats stats = GameStats();

  // Persistent meta-progression
  int lifetimeCores = 0;
  int highScore = 0;
  Set<String> unlockedShipIds = {'chronos_vector'};

  // In-Game Entities
  late PlayerShip player;
  final List<TemporalEcho> echoes = [];
  final List<Enemy> enemies = [];
  final List<Projectile> projectiles = [];
  final List<GameParticle> particles = [];
  final List<ChronoCoreParticle> cores = [];

  // Upgrades
  final Map<String, QuantumUpgrade> activeUpgrades = {};
  List<QuantumUpgrade> upgradeOptions = [];

  // Wave & Spawning
  double waveTimer = 0.0;
  double spawnCooldown = 1.2;
  int enemiesRemainingInWave = 10;
  bool isBossWave = false;

  // Inputs
  Offset moveInput = Offset.zero;
  Offset? aimInput;
  bool isFiring = true; // Auto-fire enabled by default for slick action

  // Visual FX & Screen Shake
  double screenShake = 0.0;
  double rewindVfxTimer = 0.0; // 0.0 to 1.0 reverse visual distortion
  Offset rewindOrigin = Offset.zero;

  // Viewport
  Size viewport = const Size(800, 600);

  GameState() {
    loadProgress();
  }

  Future<void> loadProgress() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      lifetimeCores = prefs.getInt('lifetime_cores') ?? 0;
      highScore = prefs.getInt('high_score') ?? 0;
      final savedShips = prefs.getStringList('unlocked_ships');
      if (savedShips != null) {
        unlockedShipIds = savedShips.toSet();
      }
      notifyListeners();
    } catch (_) {}
  }

  Future<void> saveProgress() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setInt('lifetime_cores', lifetimeCores);
      if (stats.score > highScore) {
        highScore = stats.score;
        await prefs.setInt('high_score', highScore);
      }
      await prefs.setStringList('unlocked_ships', unlockedShipIds.toList());
    } catch (_) {}
  }

  bool isShipUnlocked(String id) => unlockedShipIds.contains(id);

  bool unlockShip(ShipChassis chassis) {
    if (lifetimeCores >= chassis.coreUnlockCost && !isShipUnlocked(chassis.id)) {
      lifetimeCores -= chassis.coreUnlockCost;
      unlockedShipIds.add(chassis.id);
      saveProgress();
      notifyListeners();
      return true;
    }
    return false;
  }

  void startNewGame(ShipChassis chassis, Size screenSize) {
    selectedChassis = chassis;
    viewport = screenSize;
    stats.reset();
    activeUpgrades.clear();
    echoes.clear();
    enemies.clear();
    projectiles.clear();
    particles.clear();
    cores.clear();

    player = PlayerShip(
      chassis: selectedChassis,
      position: Offset(screenSize.width / 2, screenSize.height / 2),
    );

    waveTimer = 0.0;
    spawnCooldown = 1.0;
    enemiesRemainingInWave = 12;
    isBossWave = false;
    screenShake = 0.0;
    rewindVfxTimer = 0.0;

    status = GameStatus.playing;
    notifyListeners();
  }

  void triggerRewind() {
    if (status != GameStatus.playing || !player.canRewind()) return;

    rewindOrigin = player.position;
    final snapshots = player.triggerRewind(activeUpgrades);
    if (snapshots.isEmpty) return;

    stats.rewindsExecuted++;
    GameAudio.playRewind();

    // Spawn screen shake & visual rewind glitch
    screenShake = 16.0;
    rewindVfxTimer = 0.45;

    // Spawn Temporal Echo
    double dmgMult = 1.0;
    if (activeUpgrades.containsKey('echo_overcharge')) {
      dmgMult += activeUpgrades['echo_overcharge']!.currentLevel * 0.35;
    }

    echoes.add(
      TemporalEcho(
        snapshots: snapshots,
        damageMultiplier: dmgMult,
        ghostColor: const Color(0xFF00E5FF),
      ),
    );

    // Twin Echo upgrade: manifest second echo with slight offset
    if (activeUpgrades.containsKey('twin_echoes')) {
      final shiftedSnapshots = snapshots.map((s) {
        return s;
      }).toList();
      echoes.add(
        TemporalEcho(
          snapshots: shiftedSnapshots,
          damageMultiplier: dmgMult * 0.8,
          ghostColor: const Color(0xFFFF4081),
        ),
      );
    }

    // Paradox Shockwave: EMP wave clearing bullets and damaging hostiles
    if (activeUpgrades.containsKey('paradox_blast')) {
      final blastRadius = 220.0 + (activeUpgrades['paradox_blast']!.currentLevel * 40.0);
      particles.add(
        GameParticle(
          position: player.position,
          velocity: Offset.zero,
          color: const Color(0xFFD500F9),
          radius: 20.0,
          maxLife: 0.5,
          type: ParticleType.shockwave,
          extraVal: blastRadius,
        ),
      );

      // Vaporize enemy projectiles near shockwave
      projectiles.removeWhere((p) {
        if (!p.isPlayer && (p.position - player.position).distance <= blastRadius) {
          _spawnSparks(p.position, const Color(0xFFD500F9), 4);
          return true;
        }
        return false;
      });

      // Damage nearby enemies
      for (final enemy in enemies) {
        if ((enemy.position - player.position).distance <= blastRadius) {
          enemy.takeDamage(45.0 * activeUpgrades['paradox_blast']!.currentLevel);
          _spawnSparks(enemy.position, const Color(0xFFD500F9), 8);
        }
      }
    }

    // Singularity Mine upgrade
    if (activeUpgrades.containsKey('singularity_mine')) {
      particles.add(
        GameParticle(
          position: rewindOrigin,
          velocity: Offset.zero,
          color: const Color(0xFF7C4DFF),
          radius: 15.0,
          maxLife: 3.5,
          type: ParticleType.shockwave,
          extraVal: 180.0,
        ),
      );
    }

    // Timeline Splicer: Snap anchored enemies backward along their timeline trajectory
    for (final enemy in enemies) {
      if (enemy.isAnchored && enemy.positionHistory.isNotEmpty) {
        final oldPos = enemy.position;
        final displacement = enemy.rewindTimeline();
        final rewindDmg = 85.0 + (activeUpgrades['timeline_splicer']?.currentLevel ?? 0) * 45.0;
        enemy.takeDamage(rewindDmg);
        stats.anchoredRewinds++;
        stats.score += 150;

        _spawnSparks(oldPos, const Color(0xFFFF4081), 10);
        _spawnSparks(enemy.position, const Color(0xFFFF4081), 10);
        particles.add(
          GameParticle(
            position: enemy.position,
            velocity: Offset.zero,
            color: const Color(0xFFFF4081),
            radius: 14.0,
            maxLife: 0.45,
            type: ParticleType.shockwave,
            extraVal: 140.0,
          ),
        );
        GameAudio.playAnchorRewind();
      }
    }

    notifyListeners();
  }

  void triggerDash() {
    if (status != GameStatus.playing || !player.canDash()) return;

    if (player.triggerDash(activeUpgrades)) {
      GameAudio.playDash();
      screenShake = 7.0;
      _spawnDashBurst(player.position, player.velocity);

      // Kinetic Deflector: Parry & deflect nearby enemy projectiles into player homing shards!
      _checkDashParry();

      notifyListeners();
    }
  }

  void _checkDashParry() {
    double parryRadius = 85.0;
    if (activeUpgrades.containsKey('kinetic_parry')) {
      parryRadius += activeUpgrades['kinetic_parry']!.currentLevel * 25.0;
    }

    bool didParry = false;
    for (final p in projectiles) {
      if (!p.isPlayer && (p.position - player.position).distance <= parryRadius) {
        // Target nearest enemy
        Offset targetDir = p.velocity.distance > 0 ? -p.velocity / p.velocity.distance : const Offset(1, 0);
        if (enemies.isNotEmpty) {
          Enemy? closestEnemy;
          double closestDist = double.infinity;
          for (final e in enemies) {
            final dist = (e.position - p.position).distance;
            if (dist < closestDist) {
              closestDist = dist;
              closestEnemy = e;
            }
          }
          if (closestEnemy != null) {
            final diff = closestEnemy.position - p.position;
            if (diff.distance > 0.1) {
              targetDir = diff / diff.distance;
            }
          }
        }

        double defDamage = 45.0;
        if (activeUpgrades.containsKey('kinetic_parry')) {
          defDamage += activeUpgrades['kinetic_parry']!.currentLevel * 30.0;
        }

        p.deflect(
          targetDir: targetDir,
          newDamage: defDamage,
          deflectColor: const Color(0xFF00FFCC),
        );

        stats.bulletsParried++;
        stats.score += 50;
        _spawnSparks(p.position, const Color(0xFF00FFCC), 8);
        didParry = true;
      }
    }

    if (didParry) {
      GameAudio.playParry();
      screenShake = 12.0;
    }
  }

  void update(double dt, Size currentViewport) {
    if (status != GameStatus.playing) return;
    viewport = currentViewport;

    stats.timeSurvived += dt;

    // Decay screen shake & VFX
    if (screenShake > 0) {
      screenShake = max(0.0, screenShake - 32.0 * dt);
    }
    if (rewindVfxTimer > 0) {
      rewindVfxTimer = max(0.0, rewindVfxTimer - dt);
    }

    // 1. Update Player
    player.update(
      dt,
      viewport,
      moveInput,
      aimInput,
      isFiring,
      stats.timeSurvived,
      activeUpgrades,
    );

    // Player thruster trail particles
    if (player.velocity.distance > 20.0) {
      final backDir = -player.velocity / player.velocity.distance;
      particles.add(
        GameParticle(
          position: player.position + backDir * 16.0,
          velocity: backDir * 60.0 + Offset((Random().nextDouble() - 0.5) * 30, (Random().nextDouble() - 0.5) * 30),
          color: selectedChassis.primaryColor.withValues(alpha: 0.7),
          radius: 3.5,
          maxLife: 0.35,
          type: ParticleType.smoke,
        ),
      );
    }

    // Phase Dash slipstream and Chrono Collapse detonation check
    if (player.isDashing) {
      final rand = Random();
      particles.add(
        GameParticle(
          position: player.position + Offset((rand.nextDouble() - 0.5) * 12, (rand.nextDouble() - 0.5) * 12),
          velocity: -player.velocity * 0.15 + Offset((rand.nextDouble() - 0.5) * 40, (rand.nextDouble() - 0.5) * 40),
          color: rand.nextBool() ? const Color(0xFF00FFCC) : const Color(0xFFE040FB),
          radius: 4.5,
          maxLife: 0.28,
          type: ParticleType.warpRibbon,
        ),
      );

      // Dash into active Temporal Echo triggers Chrono Collapse!
      for (int i = echoes.length - 1; i >= 0; i--) {
        final echo = echoes[i];
        if (!echo.canResonate) continue;

        if ((echo.currentPosition - player.position).distance <= echo.refractionRadius + 24.0) {
          final collapseOrigin = echo.currentPosition;
          echo.detonate();
          _triggerChronoCollapse(collapseOrigin);
        }
      }
    }

    // Auto-shoot or manual shoot
    if (isFiring) {
      final newBullets = player.tryShoot(activeUpgrades);
      if (newBullets.isNotEmpty) {
        projectiles.addAll(newBullets);
        GameAudio.playShoot();
      }
    }

    // 2. Update Echoes
    for (int i = echoes.length - 1; i >= 0; i--) {
      final echo = echoes[i];
      final echoBullets = echo.update(dt, activeUpgrades);
      projectiles.addAll(echoBullets);

      // Echo ghost particles
      particles.add(
        GameParticle(
          position: echo.currentPosition,
          velocity: Offset((Random().nextDouble() - 0.5) * 20, (Random().nextDouble() - 0.5) * 20),
          color: echo.ghostColor.withValues(alpha: 0.4),
          radius: 4.0,
          maxLife: 0.25,
          type: ParticleType.warpRibbon,
        ),
      );

      if (echo.isFinished) {
        _spawnSparks(echo.currentPosition, echo.ghostColor, 12);
        echoes.removeAt(i);
      }
    }

    // 3. Spawning Waves & Enemies
    _updateWaveAndSpawning(dt);

    // Bullet-Time Dilation factor: slow down enemies & their projectiles
    final enemyDt = player.isBulletTime ? dt * 0.28 : dt;

    // Tachyon Tether & Paradox Grid (Geometric Laser Shearing)
    _updateTachyonTethers(dt);

    // 4. Update Enemies
    // Enemies target the nearest active entity (Player or Echo!)
    for (final enemy in enemies) {
      Offset currentTarget = player.position;
      double closestDist = (enemy.position - player.position).distance;

      // Echoes can taunt / pull enemy focus!
      for (final echo in echoes) {
        final d = (enemy.position - echo.currentPosition).distance;
        if (d < closestDist) {
          closestDist = d;
          currentTarget = echo.currentPosition;
        }
      }

      final enemyBullets = enemy.update(enemyDt, currentTarget, viewport);
      projectiles.addAll(enemyBullets);

      // Collision: Enemy vs Player (Ramming)
      if ((enemy.position - player.position).distance < enemy.collisionRadius + 18.0) {
        player.takeDamage(20.0);
        screenShake = 12.0;
        _spawnSparks(player.position, Colors.redAccent, 8);
        if (enemy.type == EnemyType.pulseChaser) {
          enemy.takeDamage(999); // Chaser suicide ram
        }
      }
    }

    // Remove dead enemies & award cores/exp/score
    for (int i = enemies.length - 1; i >= 0; i--) {
      final enemy = enemies[i];
      if (enemy.isDead) {
        stats.enemiesKilled++;
        stats.score += enemy.scoreValue;
        screenShake = enemy.type == EnemyType.quantumLeviathan ? 24.0 : 6.0;

        // Spawn Chrono-Cores
        for (int c = 0; c < enemy.coreReward; c++) {
          cores.add(
            ChronoCoreParticle(
              position: enemy.position + Offset((Random().nextDouble() - 0.5) * 30, (Random().nextDouble() - 0.5) * 30),
              value: 10 + stats.currentWave * 2,
            ),
          );
        }

        // Spawn explosive debris
        _spawnExplosion(enemy.position, enemy.type == EnemyType.quantumLeviathan ? 28 : 12);
        GameAudio.playExplosion();
        enemies.removeAt(i);
      }
    }

    // 5. Update Projectiles & Bullet Hit Collisions
    _updateProjectiles(dt, enemyDt);

    // 6. Update Chrono-Cores & Magnet Pull
    double magnetRange = 140.0;
    if (activeUpgrades.containsKey('quantum_magnet')) {
      magnetRange += activeUpgrades['quantum_magnet']!.currentLevel * 75.0;
    }

    for (int i = cores.length - 1; i >= 0; i--) {
      final core = cores[i];
      final isAlive = core.update(dt, player.position, magnetRange);
      if (!isAlive) {
        cores.removeAt(i);
        continue;
      }

      // Collect core
      if ((core.position - player.position).distance < 24.0) {
        stats.coresCollected++;
        lifetimeCores++;
        GameAudio.playCoreCollect();

        final leveledUp = stats.addExp(core.value);
        cores.removeAt(i);

        if (leveledUp) {
          _triggerLevelUp();
        }
      }
    }

    // 7. Update Visual Particles
    for (int i = particles.length - 1; i >= 0; i--) {
      if (!particles[i].update(dt)) {
        particles.removeAt(i);
      }
    }

    // Check Player Death
    if (player.isDead) {
      status = GameStatus.gameOver;
      saveProgress();
      GameAudio.playExplosion();
      notifyListeners();
      return;
    }

    notifyListeners();
  }

  void _updateWaveAndSpawning(double dt) {
    waveTimer += dt;
    spawnCooldown -= dt;

    if (enemiesRemainingInWave > 0 && spawnCooldown <= 0) {
      spawnCooldown = max(0.6, 1.8 - (stats.currentWave * 0.12));
      _spawnRandomEnemy();
      enemiesRemainingInWave--;
    }

    // Next wave when cleared
    if (enemiesRemainingInWave <= 0 && enemies.isEmpty) {
      stats.currentWave++;
      isBossWave = stats.currentWave % 5 == 0;
      enemiesRemainingInWave = 12 + stats.currentWave * 4;

      if (isBossWave) {
        // Boss spawn
        final centerTop = Offset(viewport.width / 2, 70.0);
        enemies.add(
          Enemy.create(
            type: EnemyType.quantumLeviathan,
            spawnPos: centerTop,
            wave: stats.currentWave,
          ),
        );
      }
    }
  }

  void _spawnRandomEnemy() {
    final rand = Random();
    // Spawn along perimeter
    Offset spawnPos;
    if (rand.nextBool()) {
      spawnPos = Offset(rand.nextBool() ? 10 : viewport.width - 10, rand.nextDouble() * viewport.height);
    } else {
      spawnPos = Offset(rand.nextDouble() * viewport.width, rand.nextBool() ? 10 : viewport.height - 10);
    }

    EnemyType type;
    final roll = rand.nextDouble();
    if (stats.currentWave >= 3 && roll < 0.25) {
      type = EnemyType.phaseSniper;
    } else if (stats.currentWave >= 2 && roll < 0.60) {
      type = EnemyType.sentinelTurret;
    } else {
      type = EnemyType.pulseChaser;
    }

    enemies.add(Enemy.create(type: type, spawnPos: spawnPos, wave: stats.currentWave));
  }

  void _updateProjectiles(double dt, double enemyDt) {
    final forkedProjectiles = <Projectile>[];

    for (int i = projectiles.length - 1; i >= 0; i--) {
      final p = projectiles[i];
      final pDt = p.isPlayer ? dt : enemyDt;
      if (!p.update(pDt)) {
        projectiles.removeAt(i);
        continue;
      }

      if (p.isPlayer) {
        // Echo Refraction & Prism Splitter check
        if (!p.hasRefracted) {
          for (final echo in echoes) {
            if (!echo.canResonate) continue;
            final distToEcho = (p.position - echo.currentPosition).distance;
            if (distToEcho <= echo.refractionRadius) {
              p.refract(
                damageMultiplier: 1.45,
                prismaticColor: const Color(0xFF00FFCC),
                extraPierces: 3,
              );
              echo.refractionsCount++;
              GameAudio.playRefract();
              _spawnSparks(p.position, const Color(0xFF00FFCC), 6);

              // Prism Splitter: Fork into 2 flanking beams
              if (activeUpgrades.containsKey('prism_splitter')) {
                const forkAngle = 0.22;
                final baseSpeed = p.velocity.distance;
                final currentHeading = atan2(p.velocity.dy, p.velocity.dx);

                final leftDir = Offset(cos(currentHeading - forkAngle), sin(currentHeading - forkAngle));
                final rightDir = Offset(cos(currentHeading + forkAngle), sin(currentHeading + forkAngle));

                forkedProjectiles.add(
                  Projectile(
                    position: p.position,
                    velocity: leftDir * baseSpeed,
                    damage: p.damage * 0.9,
                    isPlayer: true,
                    isEcho: p.isEcho,
                    color: const Color(0xFFE040FB),
                    radius: p.radius * 0.9,
                    isResonant: true,
                    hasRefracted: true,
                    canPenetrate: true,
                    piercesRemaining: 2,
                  ),
                );
                forkedProjectiles.add(
                  Projectile(
                    position: p.position,
                    velocity: rightDir * baseSpeed,
                    damage: p.damage * 0.9,
                    isPlayer: true,
                    isEcho: p.isEcho,
                    color: const Color(0xFFFFD600),
                    radius: p.radius * 0.9,
                    isResonant: true,
                    hasRefracted: true,
                    canPenetrate: true,
                    piercesRemaining: 2,
                  ),
                );
              }
              break;
            }
          }
        }

        // Hit test against enemies
        bool bulletHit = false;
        for (final enemy in enemies) {
          if ((p.position - enemy.position).distance < enemy.collisionRadius + p.radius) {
            enemy.takeDamage(p.damage);
            _spawnSparks(p.position, p.color, 5);
            bulletHit = true;

            // Timeline Splicer: Attach anchor to hit enemies
            if (activeUpgrades.containsKey('timeline_splicer') || p.isResonant || p.isEcho || p.isDeflected) {
              enemy.attachAnchor(5.0);
            }

            if (p.piercesRemaining > 0) {
              p.piercesRemaining--;
              if (p.piercesRemaining <= 0) {
                p.canPenetrate = false;
              }
            }
            if (!p.canPenetrate) break;
          }
        }
        if (bulletHit && !p.canPenetrate) {
          projectiles.removeAt(i);
        }
      } else {
        // Enemy projectile
        final dist = (p.position - player.position).distance;

        // Graze Detection (band between ship hull 18.0 and player.grazeRadius 34.0)
        if (!p.hasGrazed && dist > (18.0 + p.radius) && dist <= (player.grazeRadius + p.radius)) {
          p.hasGrazed = true;
          stats.bulletsGrazed++;
          stats.score += 25;
          final triggeredBt = player.addGraze(0.12, activeUpgrades);
          _spawnSparks(p.position, const Color(0xFF00FFCC), 4);
          GameAudio.playGraze();
          if (triggeredBt) {
            GameAudio.playBulletTime();
            screenShake = 10.0;
          }
        }

        // Enemy projectile hits Player
        if (dist < 18.0 + p.radius) {
          player.takeDamage(p.damage);
          screenShake = 10.0;
          _spawnSparks(p.position, Colors.redAccent, 6);
          projectiles.removeAt(i);
        }
      }
    }

    if (forkedProjectiles.isNotEmpty) {
      projectiles.addAll(forkedProjectiles);
    }
  }

  void _updateTachyonTethers(double dt) {
    if (echoes.isEmpty) return;

    final tetherSegments = <List<Offset>>[];
    for (final echo in echoes) {
      if (!echo.isFinished && !echo.isDetonated) {
        tetherSegments.add([player.position, echo.currentPosition]);
      }
    }

    final activeEchoes = echoes.where((e) => !e.isFinished && !e.isDetonated).toList();
    if (activeEchoes.length >= 2) {
      for (int i = 0; i < activeEchoes.length; i++) {
        for (int j = i + 1; j < activeEchoes.length; j++) {
          tetherSegments.add([activeEchoes[i].currentPosition, activeEchoes[j].currentPosition]);
        }
      }
    }

    double tetherDmg = 45.0;
    if (activeUpgrades.containsKey('tachyon_tether')) {
      tetherDmg += activeUpgrades['tachyon_tether']!.currentLevel * 30.0;
    }

    // 1. Slicing damage for intersecting enemies
    for (final seg in tetherSegments) {
      final a = seg[0];
      final b = seg[1];
      final segVec = b - a;
      final segLenSq = segVec.dx * segVec.dx + segVec.dy * segVec.dy;
      if (segLenSq < 1.0) continue;

      for (final enemy in enemies) {
        final ap = enemy.position - a;
        final t = (ap.dx * segVec.dx + ap.dy * segVec.dy) / segLenSq;
        final clampedT = t.clamp(0.0, 1.0);
        final closestPoint = a + segVec * clampedT;
        final dist = (enemy.position - closestPoint).distance;

        if (dist <= enemy.collisionRadius + 8.0) {
          enemy.takeDamage(tetherDmg * dt);
          enemy.velocity *= 0.65; // Temporal slow
          if (Random().nextDouble() < 0.25) {
            _spawnSparks(closestPoint, const Color(0xFF00FFCC), 2);
            GameAudio.playTetherSever();
          }
        }
      }
    }

    // 2. Paradox Polygon Enclosure: If 2 active echoes exist, check if enemy is inside triangle (Player, Echo1, Echo2)
    if (activeEchoes.length >= 2) {
      final v0 = player.position;
      final v1 = activeEchoes[0].currentPosition;
      final v2 = activeEchoes[1].currentPosition;

      for (final enemy in enemies) {
        if (_isPointInTriangle(enemy.position, v0, v1, v2)) {
          enemy.setParadoxStasis(0.2); // Maintain stasis while enclosed
          if (Random().nextDouble() < 0.15) {
            _spawnSparks(enemy.position, const Color(0xFFFFD600), 2);
          }
        }
      }
    }
  }

  bool _isPointInTriangle(Offset pt, Offset v1, Offset v2, Offset v3) {
    double sign(Offset p1, Offset p2, Offset p3) {
      return (p1.dx - p3.dx) * (p2.dy - p3.dy) - (p2.dx - p3.dx) * (p1.dy - p3.dy);
    }

    final d1 = sign(pt, v1, v2);
    final d2 = sign(pt, v2, v3);
    final d3 = sign(pt, v3, v1);

    final hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0);
    final hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0);

    return !(hasNeg && hasPos);
  }

  void _spawnSparks(Offset pos, Color color, int count) {
    final rand = Random();
    for (int i = 0; i < count; i++) {
      final ang = rand.nextDouble() * pi * 2;
      final speed = 60.0 + rand.nextDouble() * 140.0;
      particles.add(
        GameParticle(
          position: pos,
          velocity: Offset(cos(ang), sin(ang)) * speed,
          color: color,
          radius: 2.0 + rand.nextDouble() * 2.5,
          maxLife: 0.35 + rand.nextDouble() * 0.25,
          type: ParticleType.spark,
        ),
      );
    }
  }

  void _spawnExplosion(Offset pos, int count) {
    final rand = Random();
    final colors = [const Color(0xFF00E5FF), const Color(0xFFFF007F), const Color(0xFFFFD600)];
    for (int i = 0; i < count; i++) {
      final ang = rand.nextDouble() * pi * 2;
      final speed = 80.0 + rand.nextDouble() * 220.0;
      particles.add(
        GameParticle(
          position: pos,
          velocity: Offset(cos(ang), sin(ang)) * speed,
          color: colors[rand.nextInt(colors.length)],
          radius: 3.0 + rand.nextDouble() * 3.5,
          maxLife: 0.5 + rand.nextDouble() * 0.4,
          type: ParticleType.spark,
        ),
      );
    }
  }

  void _triggerChronoCollapse(Offset origin) {
    stats.rewindsExecuted++;
    double blastRadius = 260.0;
    double blastDamage = 130.0;

    if (activeUpgrades.containsKey('chrono_collapse')) {
      final lvl = activeUpgrades['chrono_collapse']!.currentLevel;
      blastRadius *= (1.0 + lvl * 0.45);
      blastDamage += lvl * 65.0;
    }

    screenShake = 22.0;
    GameAudio.playChronoCollapse();

    // Dual EMP Shockwave FX
    particles.add(
      GameParticle(
        position: origin,
        velocity: Offset.zero,
        color: const Color(0xFFFF1744),
        radius: 18.0,
        maxLife: 0.6,
        type: ParticleType.shockwave,
        extraVal: blastRadius,
      ),
    );
    particles.add(
      GameParticle(
        position: origin,
        velocity: Offset.zero,
        color: const Color(0xFF00FFCC),
        radius: 14.0,
        maxLife: 0.5,
        type: ParticleType.shockwave,
        extraVal: blastRadius * 0.75,
      ),
    );

    // Vaporize enemy projectiles (or deflected bullets) caught in EMP blast
    projectiles.removeWhere((p) {
      if ((!p.isPlayer || p.isDeflected) && (p.position - origin).distance <= blastRadius) {
        _spawnSparks(p.position, const Color(0xFFFF1744), 4);
        return true;
      }
      return false;
    });

    // Devastate enemies in radius
    for (final enemy in enemies) {
      if ((enemy.position - origin).distance <= blastRadius) {
        enemy.takeDamage(blastDamage);
        _spawnSparks(enemy.position, const Color(0xFFFF1744), 8);
      }
    }

    // Trigger Temporal Overdrive on player
    double overdriveDuration = 4.0;
    if (activeUpgrades.containsKey('overdrive_surge')) {
      final surgeLvl = activeUpgrades['overdrive_surge']!.currentLevel;
      overdriveDuration += surgeLvl * 1.5;
      player.shield = player.maxShield; // Instantly replenish shields
    }
    player.activateOverdrive(overdriveDuration);
    GameAudio.playOverdrive();
  }

  void _spawnDashBurst(Offset pos, Offset vel) {
    final rand = Random();
    final backDir = vel.distance > 0 ? -vel / vel.distance : const Offset(0, 1);
    for (int i = 0; i < 14; i++) {
      final spread = (rand.nextDouble() - 0.5) * 1.2;
      final speed = 140.0 + rand.nextDouble() * 180.0;
      final rotDir = Offset(
        backDir.dx * cos(spread) - backDir.dy * sin(spread),
        backDir.dx * sin(spread) + backDir.dy * cos(spread),
      );
      particles.add(
        GameParticle(
          position: pos,
          velocity: rotDir * speed,
          color: rand.nextBool() ? const Color(0xFF00E5FF) : const Color(0xFFE040FB),
          radius: 3.0 + rand.nextDouble() * 2.5,
          maxLife: 0.35 + rand.nextDouble() * 0.2,
          type: ParticleType.spark,
        ),
      );
    }
  }

  void _triggerLevelUp() {
    GameAudio.playLevelUp();
    status = GameStatus.upgrading;

    // Pick 3 random distinct upgrades
    final pool = QuantumUpgrade.getInitialPool().where((u) {
      if (activeUpgrades.containsKey(u.id)) {
        return !activeUpgrades[u.id]!.isMaxed;
      }
      return true;
    }).toList();

    pool.shuffle();
    upgradeOptions = pool.take(3).map((u) {
      if (activeUpgrades.containsKey(u.id)) {
        final current = activeUpgrades[u.id]!;
        final copy = u.copy();
        copy.currentLevel = current.currentLevel;
        return copy;
      }
      return u;
    }).toList();

    notifyListeners();
  }

  void selectUpgrade(QuantumUpgrade upgrade) {
    if (activeUpgrades.containsKey(upgrade.id)) {
      activeUpgrades[upgrade.id]!.currentLevel++;
    } else {
      upgrade.currentLevel = 1;
      activeUpgrades[upgrade.id] = upgrade;
    }

    status = GameStatus.playing;
    notifyListeners();
  }

  void pauseGame() {
    if (status == GameStatus.playing) {
      status = GameStatus.paused;
      notifyListeners();
    }
  }

  void resumeGame() {
    if (status == GameStatus.paused) {
      status = GameStatus.playing;
      notifyListeners();
    }
  }

  void exitToMenu() {
    status = GameStatus.menu;
    saveProgress();
    notifyListeners();
  }
}
