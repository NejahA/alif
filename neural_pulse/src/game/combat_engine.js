/**
 * NEURAL-PULSE // COMBAT ENGINE
 * High-octane 60 FPS HTML5 Canvas kinetic roguelite with 3.0s Temporal Rewind,
 * Tachyon Laser Tethers, Kinetic Dash Parrying, and Bullet-Time Grazing.
 */

export class CombatEngine {
  constructor(canvasId, synthEngine, onStateChange) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.synth = synthEngine;
    this.onStateChange = onStateChange || (() => {});

    this.isRunning = false;
    this.lastTime = 0;
    this.animId = null;

    // Viewport Size
    this.width = 800;
    this.height = 600;

    // Game State
    this.score = 0;
    this.wave = 1;
    this.level = 1;
    this.currentExp = 0;
    this.expToLevel = 100;
    this.enemiesKilled = 0;
    this.bulletsGrazed = 0;
    this.bulletsParried = 0;
    this.isPaused = false;
    this.isUpgrading = false;
    this.isGameOver = false;

    // Screen Shake & Distortion
    this.screenShake = 0;
    this.rewindGlitchTimer = 0;

    // Player Vessel State
    this.player = {
      x: 400,
      y: 300,
      vx: 0,
      vy: 0,
      angle: -Math.PI / 2,
      aimX: 400,
      aimY: 100,
      health: 100,
      maxHealth: 100,
      shield: 50,
      maxShield: 50,
      speed: 320,
      isFiring: true,
      fireCooldown: 0,
      fireRate: 5.0, // shots per sec
      invulnerableTimer: 0,
      // Phase Dash
      dashCooldown: 2.2,
      dashCooldownTimer: 0,
      dashDurationTimer: 0,
      // Temporal Overdrive
      overdriveTimer: 0,
      // Bullet-Time Dilation
      dilationMeter: 0, // 0 to 1
      bulletTimeTimer: 0,
      grazeRadius: 36,
      // Rewind History
      history: [],
      rewindCooldown: 6.0,
      rewindCooldownTimer: 0,
    };

    // Upgrades Pool
    this.activeUpgrades = new Map();

    // Entities
    this.projectiles = [];
    this.enemies = [];
    this.echoes = [];
    this.particles = [];
    this.cores = [];

    // Wave Spawning
    this.waveTimer = 0;
    this.spawnTimer = 0;
    this.enemiesLeftInWave = 12;

    // Controls input state
    this.keys = { w: false, a: false, s: false, d: false, shift: false, space: false };
    this.mouse = { x: 400, y: 300, isDown: false };

    this.initEvents();
    this.resize();
  }

  initEvents() {
    window.addEventListener('resize', () => this.resize());

    window.addEventListener('keydown', (e) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') this.keys.w = true;
      if (k === 'a' || k === 'arrowleft') this.keys.a = true;
      if (k === 's' || k === 'arrowdown') this.keys.s = true;
      if (k === 'd' || k === 'arrowright') this.keys.d = true;
      if (k === 'shift') {
        this.keys.shift = true;
        this.triggerDash();
      }
      if (k === ' ' || k === 'spacebar') {
        this.keys.space = true;
        this.triggerRewind();
      }
      if (k === 'p' || k === 'escape') {
        this.togglePause();
      }
    });

    window.addEventListener('keyup', (e) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') this.keys.w = false;
      if (k === 'a' || k === 'arrowleft') this.keys.a = false;
      if (k === 's' || k === 'arrowdown') this.keys.s = false;
      if (k === 'd' || k === 'arrowright') this.keys.d = false;
      if (k === 'shift') this.keys.shift = false;
      if (k === ' ' || k === 'spacebar') this.keys.space = false;
    });

    if (this.canvas) {
      this.canvas.addEventListener('mousemove', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
      });

      this.canvas.addEventListener('mousedown', () => {
        this.mouse.isDown = true;
        this.synth.ensureContext();
      });

      this.canvas.addEventListener('mouseup', () => {
        this.mouse.isDown = false;
      });
    }
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  start() {
    this.reset();
    this.isRunning = true;
    this.lastTime = performance.now();
    const loop = (time) => {
      if (!this.isRunning) return;
      const dt = Math.min((time - this.lastTime) / 1000, 0.05);
      this.lastTime = time;

      if (!this.isPaused && !this.isUpgrading && !this.isGameOver) {
        this.update(dt);
      }
      this.render();
      this.animId = requestAnimationFrame(loop);
    };
    this.animId = requestAnimationFrame(loop);
  }

  stop() {
    this.isRunning = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  reset() {
    this.score = 0;
    this.wave = 1;
    this.level = 1;
    this.currentExp = 0;
    this.expToLevel = 100;
    this.enemiesKilled = 0;
    this.bulletsGrazed = 0;
    this.bulletsParried = 0;
    this.isPaused = false;
    this.isUpgrading = false;
    this.isGameOver = false;

    this.player.x = this.width / 2;
    this.player.y = this.height / 2;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.health = 100;
    this.player.shield = 50;
    this.player.history = [];
    this.player.dilationMeter = 0;
    this.player.bulletTimeTimer = 0;
    this.player.overdriveTimer = 0;
    this.player.dashCooldownTimer = 0;
    this.player.rewindCooldownTimer = 0;

    this.activeUpgrades.clear();
    this.projectiles = [];
    this.enemies = [];
    this.echoes = [];
    this.particles = [];
    this.cores = [];

    this.enemiesLeftInWave = 12;
    this.spawnTimer = 0.5;

    this.onStateChange(this);
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    this.onStateChange(this);
  }

  // =========================================================================
  // CORE SIMULATION LOOP
  // =========================================================================

  update(dt) {
    const isBt = this.player.bulletTimeTimer > 0;
    const enemyDt = isBt ? dt * 0.28 : dt;

    // Decay Screen Shake & Glitch
    if (this.screenShake > 0) this.screenShake = Math.max(0, this.screenShake - 35 * dt);
    if (this.rewindGlitchTimer > 0) this.rewindGlitchTimer = Math.max(0, this.rewindGlitchTimer - dt);

    // 1. Update Player
    this.updatePlayer(dt);

    // 2. Tachyon Laser Tethers (Geometric Cutting Wire)
    this.updateTachyonTethers(dt);

    // 3. Update Echoes
    this.updateEchoes(dt);

    // 4. Wave & Spawning
    this.updateWave(dt);

    // 5. Update Enemies
    this.updateEnemies(enemyDt);

    // 6. Update Projectiles
    this.updateProjectiles(dt, enemyDt);

    // 7. Update Chrono-Cores
    this.updateCores(dt);

    // 8. Update Particles
    this.updateParticles(dt);

    // Death check
    if (this.player.health <= 0 && !this.isGameOver) {
      this.isGameOver = true;
      this.synth.playExplosionSound();
      this.spawnExplosion(this.player.x, this.player.y, 35);
      this.onStateChange(this);
    }
  }

  updatePlayer(dt) {
    const p = this.player;

    if (p.invulnerableTimer > 0) p.invulnerableTimer -= dt;
    if (p.dashCooldownTimer > 0) p.dashCooldownTimer -= dt;
    if (p.dashDurationTimer > 0) p.dashDurationTimer -= dt;
    if (p.overdriveTimer > 0) p.overdriveTimer -= dt;
    if (p.bulletTimeTimer > 0) p.bulletTimeTimer -= dt;
    if (p.rewindCooldownTimer > 0) p.rewindCooldownTimer -= dt;
    if (p.fireCooldown > 0) p.fireCooldown -= dt * (p.overdriveTimer > 0 ? 1.8 : 1.0);

    // Shield passive recharge
    if (p.shield < p.maxShield) {
      p.shield = Math.min(p.maxShield, p.shield + (p.overdriveTimer > 0 ? 25 : 10) * dt);
    }

    // Direction calculation
    let mx = 0, my = 0;
    if (this.keys.w) my -= 1;
    if (this.keys.s) my += 1;
    if (this.keys.a) mx -= 1;
    if (this.keys.d) mx += 1;

    const len = Math.hypot(mx, my);
    if (len > 0) {
      mx /= len;
      my /= len;
    }

    // Aiming towards mouse
    const aimDx = this.mouse.x - p.x;
    const aimDy = this.mouse.y - p.y;
    p.angle = Math.atan2(aimDy, aimDx);

    const isDashing = p.dashDurationTimer > 0;
    const speed = isDashing ? 840 : (p.overdriveTimer > 0 ? p.speed * 1.4 : p.speed);

    if (len > 0 && !isDashing) {
      p.vx += mx * speed * 6 * dt;
      p.vy += my * speed * 6 * dt;
    }

    // Damping
    const drag = isDashing ? 1.5 : 4.8;
    p.vx *= Math.max(0, 1 - drag * dt);
    p.vy *= Math.max(0, 1 - drag * dt);

    p.x += p.vx * dt;
    p.y += p.vy * dt;

    // Bounds containment
    const margin = 26;
    p.x = Math.max(margin, Math.min(this.width - margin, p.x));
    p.y = Math.max(margin, Math.min(this.height - margin, p.y));

    // Thruster smoke particles
    if (Math.hypot(p.vx, p.vy) > 30) {
      this.particles.push({
        x: p.x - Math.cos(p.angle) * 16,
        y: p.y - Math.sin(p.angle) * 16,
        vx: -p.vx * 0.15 + (Math.random() - 0.5) * 20,
        vy: -p.vy * 0.15 + (Math.random() - 0.5) * 20,
        color: p.overdriveTimer > 0 ? '#00f0ff' : '#ff007f',
        radius: 3.5,
        life: 0.35,
        maxLife: 0.35,
      });
    }

    // Record 3.0s history buffer
    p.history.push({
      x: p.x,
      y: p.y,
      angle: p.angle,
      vx: p.vx,
      vy: p.vy,
      isFiring: this.mouse.isDown || p.isFiring,
      time: performance.now() / 1000,
    });

    const cutoff = performance.now() / 1000 - 3.0;
    while (p.history.length > 0 && p.history[0].time < cutoff) {
      p.history.shift();
    }

    // Automatic Blasters Discharging
    if (p.fireCooldown <= 0 && (this.mouse.isDown || p.isFiring)) {
      this.firePlayerBlasters();
    }
  }

  firePlayerBlasters() {
    const p = this.player;
    p.fireCooldown = 1.0 / p.fireRate;

    const baseDmg = p.overdriveTimer > 0 ? 35 : 22;
    const speed = p.overdriveTimer > 0 ? 880 : 720;
    const aimDir = { x: Math.cos(p.angle), y: Math.sin(p.angle) };

    // Primary central bolt
    this.projectiles.push({
      x: p.x + aimDir.x * 20,
      y: p.y + aimDir.y * 20,
      vx: aimDir.x * speed,
      vy: aimDir.y * speed,
      damage: baseDmg,
      isPlayer: true,
      color: p.overdriveTimer > 0 ? '#00f0ff' : '#38bdf8',
      radius: p.overdriveTimer > 0 ? 5.5 : 4.0,
      life: 2.2,
      pierces: 0,
      isResonant: p.overdriveTimer > 0,
    });

    // Overdrive Wingtip Blasters
    if (p.overdriveTimer > 0) {
      const perpX = -aimDir.y * 14;
      const perpY = aimDir.x * 14;

      this.projectiles.push({
        x: p.x + perpX,
        y: p.y + perpY,
        vx: aimDir.x * speed,
        vy: aimDir.y * speed,
        damage: baseDmg * 0.7,
        isPlayer: true,
        color: '#ff007f',
        radius: 3.5,
        life: 2.2,
        pierces: 0,
      });

      this.projectiles.push({
        x: p.x - perpX,
        y: p.y - perpY,
        vx: aimDir.x * speed,
        vy: aimDir.y * speed,
        damage: baseDmg * 0.7,
        isPlayer: true,
        color: '#ff007f',
        radius: 3.5,
        life: 2.2,
        pierces: 0,
      });
    }

    this.synth.playLaserSound(p.overdriveTimer > 0 ? 1.3 : 1.0);
  }

  triggerDash() {
    const p = this.player;
    if (p.dashCooldownTimer > 0) return;

    p.dashCooldownTimer = p.dashCooldown;
    p.dashDurationTimer = 0.22;
    p.invulnerableTimer = 0.35;

    // Dash in aim direction
    const dashDir = { x: Math.cos(p.angle), y: Math.sin(p.angle) };
    p.vx = dashDir.x * 860;
    p.vy = dashDir.y * 860;

    this.screenShake = 8;
    this.synth.playDashSound();

    // Kinetic Dash Parry: Deflect nearby enemy projectiles!
    this.checkDashParry();

    // Check Dash into active Temporal Echo -> Chrono Collapse!
    for (let i = this.echoes.length - 1; i >= 0; i--) {
      const echo = this.echoes[i];
      if (Math.hypot(echo.x - p.x, echo.y - p.y) < 55) {
        this.triggerChronoCollapse(echo.x, echo.y);
        this.echoes.splice(i, 1);
      }
    }
  }

  checkDashParry() {
    const parryRadius = 85;
    let parriedAny = false;

    this.projectiles.forEach((proj) => {
      if (!proj.isPlayer && Math.hypot(proj.x - this.player.x, proj.y - this.player.y) <= parryRadius) {
        // Deflect! Target closest hostile
        let targetX = -proj.vx;
        let targetY = -proj.vy;

        if (this.enemies.length > 0) {
          let closestDist = Infinity;
          this.enemies.forEach((e) => {
            const d = Math.hypot(e.x - proj.x, e.y - proj.y);
            if (d < closestDist) {
              closestDist = d;
              targetX = e.x - proj.x;
              targetY = e.y - proj.y;
            }
          });
        }

        const len = Math.hypot(targetX, targetY) || 1;
        proj.isPlayer = true;
        proj.isDeflected = true;
        proj.damage = 48;
        proj.color = '#00f0ff';
        proj.vx = (targetX / len) * 780;
        proj.vy = (targetY / len) * 780;
        proj.pierces = 2;
        proj.life = 2.0;

        this.bulletsParried++;
        this.score += 50;
        parriedAny = true;
        this.spawnSparks(proj.x, proj.y, '#00f0ff', 8);
      }
    });

    if (parriedAny) {
      this.synth.playParrySound();
      this.screenShake = 12;
    }
  }

  triggerRewind() {
    const p = this.player;
    if (p.rewindCooldownTimer > 0 || p.history.length < 15) return;

    p.rewindCooldownTimer = p.rewindCooldown;
    this.rewindGlitchTimer = 0.45;
    this.screenShake = 16;
    this.synth.playRewindSound();

    const oldest = p.history[0];
    const pastSnapshots = [...p.history];

    // Manifest Temporal Echo
    this.echoes.push({
      x: oldest.x,
      y: oldest.y,
      snapshots: pastSnapshots,
      index: 0,
      duration: 3.0,
      color: '#00f0ff',
      isFinished: false,
    });

    // Snap player position 3s back
    p.x = oldest.x;
    p.y = oldest.y;
    p.vx = -oldest.vx * 0.5;
    p.vy = -oldest.vy * 0.5;
    p.shield = p.maxShield; // Recover shield
    p.invulnerableTimer = 1.0;
    p.history = [];

    // Timeline Splicer: Snap anchored hostiles backward along their timelines!
    this.enemies.forEach((enemy) => {
      if (enemy.isAnchored && enemy.history && enemy.history.length > 5) {
        const oldPos = { x: enemy.x, y: enemy.y };
        const rewindTarget = enemy.history[0];
        enemy.x = rewindTarget.x;
        enemy.y = rewindTarget.y;
        enemy.history = [];
        enemy.isAnchored = false;
        enemy.health -= 85;

        this.spawnSparks(oldPos.x, oldPos.y, '#ff007f', 10);
        this.spawnSparks(enemy.x, enemy.y, '#ff007f', 10);
        this.score += 150;
      }
    });
  }

  triggerChronoCollapse(originX, originY) {
    const blastRadius = 260;
    const blastDamage = 135;

    this.screenShake = 22;
    this.synth.playExplosionSound();

    // Vaporize bullets in blast
    this.projectiles = this.projectiles.filter((p) => {
      return Math.hypot(p.x - originX, p.y - originY) > blastRadius;
    });

    // Devastate hostiles
    this.enemies.forEach((e) => {
      if (Math.hypot(e.x - originX, e.y - originY) <= blastRadius) {
        e.health -= blastDamage;
        this.spawnSparks(e.x, e.y, '#ff1744', 10);
      }
    });

    // Enter Temporal Overdrive!
    this.player.overdriveTimer = 4.5;
  }

  // =========================================================================
  // TACHYON TETHERS & PARADOX GRID
  // =========================================================================

  updateTachyonTethers(dt) {
    if (this.echoes.length === 0) return;

    const segments = [];
    this.echoes.forEach((echo) => {
      if (!echo.isFinished) {
        segments.push({ a: { x: this.player.x, y: this.player.y }, b: { x: echo.x, y: echo.y } });
      }
    });

    // Slicing collision with hostiles
    segments.forEach((seg) => {
      const segDx = seg.b.x - seg.a.x;
      const segDy = seg.b.y - seg.a.y;
      const lenSq = segDx * segDx + segDy * segDy;
      if (lenSq < 1) return;

      this.enemies.forEach((enemy) => {
        const aToEx = enemy.x - seg.a.x;
        const aToEy = enemy.y - seg.a.y;
        const t = Math.max(0, Math.min(1, (aToEx * segDx + aToEy * segDy) / lenSq));
        const nearX = seg.a.x + segDx * t;
        const nearY = seg.a.y + segDy * t;
        const dist = Math.hypot(enemy.x - nearX, enemy.y - nearY);

        if (dist <= enemy.radius + 8) {
          enemy.health -= 55 * dt;
          enemy.vx *= 0.65;
          enemy.vy *= 0.65;
          if (Math.random() < 0.25) {
            this.spawnSparks(nearX, nearY, '#00f0ff', 2);
          }
        }
      });
    });
  }

  updateEchoes(dt) {
    for (let i = this.echoes.length - 1; i >= 0; i--) {
      const echo = this.echoes[i];
      if (echo.index < echo.snapshots.length) {
        const snap = echo.snapshots[echo.index++];
        echo.x = snap.x;
        echo.y = snap.y;
        echo.angle = snap.angle;

        // Replay weapon shots
        if (snap.isFiring && echo.index % 6 === 0) {
          const aimDir = { x: Math.cos(echo.angle), y: Math.sin(echo.angle) };
          this.projectiles.push({
            x: echo.x + aimDir.x * 20,
            y: echo.y + aimDir.y * 20,
            vx: aimDir.x * 720,
            vy: aimDir.y * 720,
            damage: 20,
            isPlayer: true,
            isEcho: true,
            color: '#e040fb',
            radius: 4.0,
            life: 2.0,
            pierces: 0,
          });
        }
      } else {
        echo.isFinished = true;
        this.spawnSparks(echo.x, echo.y, echo.color, 10);
        this.echoes.splice(i, 1);
      }
    }
  }

  // =========================================================================
  // HOSTILES & WAVE PROGRESSION
  // =========================================================================

  updateWave(dt) {
    this.spawnTimer -= dt;
    if (this.enemiesLeftInWave > 0 && this.spawnTimer <= 0) {
      this.spawnTimer = Math.max(0.6, 1.8 - this.wave * 0.1);
      this.spawnEnemy();
      this.enemiesLeftInWave--;
    }

    // Wave completed
    if (this.enemiesLeftInWave <= 0 && this.enemies.length === 0) {
      this.wave++;
      this.enemiesLeftInWave = 12 + this.wave * 4;
      this.triggerLevelUp();
    }
  }

  spawnEnemy() {
    // Spawn along boundary perimeter
    let x, y;
    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 10 : this.width - 10;
      y = Math.random() * this.height;
    } else {
      x = Math.random() * this.width;
      y = Math.random() < 0.5 ? 10 : this.height - 10;
    }

    const isBoss = this.wave % 5 === 0 && this.enemiesLeftInWave === 1;
    const type = isBoss ? 'boss' : (this.wave >= 3 && Math.random() < 0.3 ? 'sniper' : 'chaser');

    this.enemies.push({
      x,
      y,
      vx: 0,
      vy: 0,
      radius: isBoss ? 42 : (type === 'sniper' ? 18 : 16),
      health: isBoss ? 550 + this.wave * 80 : (type === 'sniper' ? 50 : 35),
      maxHealth: isBoss ? 550 + this.wave * 80 : (type === 'sniper' ? 50 : 35),
      speed: isBoss ? 65 : (type === 'sniper' ? 120 : 180 + this.wave * 5),
      shootCooldown: 1.5 + Math.random(),
      type,
      history: [],
      isAnchored: false,
    });
  }

  updateEnemies(dt) {
    const p = this.player;

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];

      // Track timeline history for Timeline Splicer
      if (!e.history) e.history = [];
      e.history.push({ x: e.x, y: e.y });
      if (e.history.length > 90) e.history.shift();

      // Target nearest: Player or Echo
      let targetX = p.x;
      let targetY = p.y;
      if (this.echoes.length > 0) {
        targetX = this.echoes[0].x;
        targetY = this.echoes[0].y;
      }

      const dx = targetX - e.x;
      const dy = targetY - e.y;
      const dist = Math.hypot(dx, dy) || 1;

      // Movement
      e.vx = (dx / dist) * e.speed;
      e.vy = (dy / dist) * e.speed;
      e.x += e.vx * dt;
      e.y += e.vy * dt;

      // Hostile Firing
      e.shootCooldown -= dt;
      if (e.shootCooldown <= 0 && dist < 450) {
        e.shootCooldown = e.type === 'boss' ? 0.9 : 2.2;
        this.projectiles.push({
          x: e.x,
          y: e.y,
          vx: (dx / dist) * 320,
          vy: (dy / dist) * 320,
          damage: 15,
          isPlayer: false,
          color: '#ff1744',
          radius: 5.0,
          life: 3.0,
        });
      }

      // Ramming damage to player
      if (Math.hypot(e.x - p.x, e.y - p.y) < e.radius + 18) {
        if (p.invulnerableTimer <= 0) {
          if (p.shield > 20) {
            p.shield -= 20;
          } else {
            p.health -= (20 - p.shield);
            p.shield = 0;
          }
          this.screenShake = 12;
          this.spawnSparks(p.x, p.y, '#ff1744', 6);
          if (e.type === 'chaser') e.health = 0; // suicide chaser
        }
      }

      // Death check
      if (e.health <= 0) {
        this.enemiesKilled++;
        this.score += e.type === 'boss' ? 2500 : 120;
        this.screenShake = e.type === 'boss' ? 24 : 6;
        this.spawnExplosion(e.x, e.y, e.type === 'boss' ? 25 : 12);
        this.synth.playExplosionSound();

        // Spawn Chrono-Cores
        const coresCount = e.type === 'boss' ? 12 : 2;
        for (let c = 0; c < coresCount; c++) {
          this.cores.push({
            x: e.x + (Math.random() - 0.5) * 30,
            y: e.y + (Math.random() - 0.5) * 30,
            val: 15,
            life: 8.0,
          });
        }

        this.enemies.splice(i, 1);
      }
    }
  }

  // =========================================================================
  // PROJECTILE COLLISION & GRAZE
  // =========================================================================

  updateProjectiles(dt, enemyDt) {
    const p = this.player;

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      const pDt = proj.isPlayer ? dt : enemyDt;

      proj.life -= pDt;
      if (proj.life <= 0) {
        this.projectiles.splice(i, 1);
        continue;
      }

      proj.x += proj.vx * pDt;
      proj.y += proj.vy * pDt;

      if (proj.isPlayer) {
        // Player bullet hit enemy
        let hit = false;
        for (let j = 0; j < this.enemies.length; j++) {
          const enemy = this.enemies[j];
          if (Math.hypot(proj.x - enemy.x, proj.y - enemy.y) < enemy.radius + proj.radius) {
            enemy.health -= proj.damage;
            enemy.isAnchored = true; // Timeline Splicer attach
            this.spawnSparks(proj.x, proj.y, proj.color, 4);
            hit = true;
            if (proj.pierces > 0) {
              proj.pierces--;
            } else {
              break;
            }
          }
        }
        if (hit && proj.pierces <= 0) {
          this.projectiles.splice(i, 1);
        }
      } else {
        // Enemy bullet vs Player
        const distToPlayer = Math.hypot(proj.x - p.x, proj.y - p.y);

        // Near-Miss Graze Detection
        if (!proj.hasGrazed && distToPlayer > 18 + proj.radius && distToPlayer <= p.grazeRadius + proj.radius) {
          proj.hasGrazed = true;
          this.bulletsGrazed++;
          this.score += 25;
          p.dilationMeter = Math.min(1.0, p.dilationMeter + 0.14);
          this.spawnSparks(proj.x, proj.y, '#00f0ff', 4);

          // Trigger Bullet-Time if filled!
          if (p.dilationMeter >= 1.0) {
            p.dilationMeter = 0;
            p.bulletTimeTimer = 3.5;
            this.synth.playParrySound();
          }
        }

        // Direct Hit
        if (distToPlayer < 18 + proj.radius) {
          if (p.invulnerableTimer <= 0) {
            if (p.shield >= proj.damage) {
              p.shield -= proj.damage;
            } else {
              p.health -= (proj.damage - p.shield);
              p.shield = 0;
            }
            this.screenShake = 10;
            this.spawnSparks(proj.x, proj.y, '#ff1744', 6);
          }
          this.projectiles.splice(i, 1);
        }
      }
    }
  }

  updateCores(dt) {
    const p = this.player;
    const magnetRadius = 160;

    for (let i = this.cores.length - 1; i >= 0; i--) {
      const core = this.cores[i];
      core.life -= dt;
      if (core.life <= 0) {
        this.cores.splice(i, 1);
        continue;
      }

      // Magnet pull towards player
      const dx = p.x - core.x;
      const dy = p.y - core.y;
      const dist = Math.hypot(dx, dy);

      if (dist < magnetRadius) {
        const pull = 500 * (1 - dist / magnetRadius);
        core.x += (dx / dist) * pull * dt;
        core.y += (dy / dist) * pull * dt;
      }

      // Collect
      if (dist < 26) {
        this.currentExp += core.val;
        this.score += 50;
        this.cores.splice(i, 1);

        if (this.currentExp >= this.expToLevel) {
          this.currentExp -= this.expToLevel;
          this.level++;
          this.expToLevel = Math.round(this.expToLevel * 1.35);
          this.triggerLevelUp();
        }
      }
    }
  }

  triggerLevelUp() {
    this.isUpgrading = true;
    this.synth.playLevelUpSound();
    this.onStateChange(this);
  }

  selectUpgrade(upgradeId) {
    this.activeUpgrades.set(upgradeId, (this.activeUpgrades.get(upgradeId) || 0) + 1);

    // Apply immediate passive boosts
    if (upgradeId === 'overclock_thrusters') this.player.speed *= 1.2;
    if (upgradeId === 'tachyon_splitter') this.player.fireRate *= 1.25;

    this.isUpgrading = false;
    this.onStateChange(this);
  }

  updateParticles(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.life -= dt;
      if (pt.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
    }
  }

  spawnSparks(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 160;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        radius: 2.0 + Math.random() * 2.5,
        life: 0.35 + Math.random() * 0.25,
        maxLife: 0.45,
      });
    }
  }

  spawnExplosion(x, y, count) {
    const colors = ['#00f0ff', '#ff007f', '#ffd600'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 220;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        radius: 3.0 + Math.random() * 3.5,
        life: 0.5 + Math.random() * 0.4,
        maxLife: 0.6,
      });
    }
  }

  // =========================================================================
  // CANVAS RENDERING
  // =========================================================================

  render() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.save();

    // Screen Shake
    if (this.screenShake > 0.1) {
      const sx = (Math.random() - 0.5) * this.screenShake;
      const sy = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(sx, sy);
    }

    // Clear Deep Void
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, w, h);

    // Cyber Matrix Grid
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
    ctx.lineWidth = 1;
    const gridSize = 48;
    for (let x = 0; x < w; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Tachyon Tethers
    this.echoes.forEach((echo) => {
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(this.player.x, this.player.y);
      ctx.lineTo(echo.x, echo.y);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(this.player.x, this.player.y);
      ctx.lineTo(echo.x, echo.y);
      ctx.stroke();
    });

    // Chrono-Cores
    this.cores.forEach((core) => {
      ctx.fillStyle = '#18ffff';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00f0ff';
      ctx.beginPath();
      ctx.arc(core.x, core.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Particles
    this.particles.forEach((pt) => {
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(1, pt.radius), 0, Math.PI * 2);
      ctx.fill();
    });

    // Projectiles
    this.projectiles.forEach((proj) => {
      ctx.fillStyle = proj.color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = proj.color;
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Enemies
    this.enemies.forEach((enemy) => {
      ctx.save();
      ctx.translate(enemy.x, enemy.y);

      // Anchor glyph if anchored
      if (enemy.isAnchored) {
        ctx.strokeStyle = '#ff007f';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, enemy.radius + 6, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.fillStyle = enemy.type === 'boss' ? '#ff0055' : (enemy.type === 'sniper' ? '#a855f7' : '#ef4444');
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.arc(0, 0, enemy.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    });

    // Temporal Echoes
    this.echoes.forEach((echo) => {
      ctx.save();
      ctx.translate(echo.x, echo.y);
      ctx.rotate(echo.angle);

      ctx.strokeStyle = 'rgba(0, 240, 255, 0.65)';
      ctx.lineWidth = 2;
      ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';

      ctx.beginPath();
      ctx.moveTo(20, 0);
      ctx.lineTo(-14, -12);
      ctx.lineTo(-6, 0);
      ctx.lineTo(-14, 12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    });

    // Player Vessel
    const p = this.player;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);

    // Graze / Bullet-Time Halo
    if (p.dilationMeter > 0 || p.bulletTimeTimer > 0) {
      ctx.strokeStyle = p.bulletTimeTimer > 0 ? 'rgba(157, 78, 221, 0.8)' : 'rgba(0, 240, 255, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, p.grazeRadius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Overdrive Aura
    if (p.overdriveTimer > 0) {
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.7)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 28, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Vessel Hull
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.moveTo(22, 0);
    ctx.lineTo(-16, -14);
    ctx.lineTo(-8, 0);
    ctx.lineTo(-16, 14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cockpit
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(4, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    // Shield Dome
    if (p.shield > 0) {
      ctx.strokeStyle = `rgba(0, 240, 255, ${p.shield / p.maxShield * 0.5})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();

    // Rewind Glitch VFX
    if (this.rewindGlitchTimer > 0) {
      const alpha = this.rewindGlitchTimer / 0.45;
      ctx.fillStyle = `rgba(0, 240, 255, ${alpha * 0.25})`;
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = `rgba(224, 64, 251, ${alpha * 0.4})`;
      ctx.lineWidth = 2;
      for (let y = 0; y < h; y += 16) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    }

    // Bullet-Time Vignette
    if (p.bulletTimeTimer > 0) {
      const grad = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, 'rgba(157, 78, 221, 0.32)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }

    ctx.restore();
  }
}
