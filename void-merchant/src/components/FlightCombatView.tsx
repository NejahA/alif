import React, { useEffect, useRef, useState } from 'react';
import { EnemyShip, PlacedModule, Projectile, ShipStats, StarSystem } from '../types/game';
import { sound } from '../utils/audio';
import { Crosshair, Shield, Zap, Skull, Coins, Award, Sparkles, Navigation } from 'lucide-react';

interface FlightCombatViewProps {
  placedModules: PlacedModule[];
  stats: ShipStats;
  currentHp: number;
  currentShield: number;
  onUpdateHp: (newHp: number) => void;
  onUpdateShield: (newShield: number) => void;
  currentSystem: StarSystem;
  credits: number;
  onUpdateCredits: (newCredits: number) => void;
  onLog: (text: string, type: 'info' | 'trade' | 'alert' | 'combat' | 'success') => void;
}

interface SalvagePod {
  x: number;
  y: number;
  credits: number;
  life: number;
}

export const FlightCombatView: React.FC<FlightCombatViewProps> = ({
  placedModules,
  stats,
  currentHp,
  currentShield,
  onUpdateHp,
  onUpdateShield,
  currentSystem,
  credits,
  onUpdateCredits,
  onLog,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Flight simulation state refs
  const stateRef = useRef({
    x: 400,
    y: 300,
    vx: 0,
    vy: 0,
    angle: -Math.PI / 2,
    keys: { forward: false, left: false, right: false, fire: false },
    mouse: { x: 400, y: 300 },
    hp: currentHp,
    shield: currentShield,
    projectiles: [] as Projectile[],
    enemies: [] as EnemyShip[],
    salvage: [] as SalvagePod[],
    particles: [] as { x: number; y: number; vx: number; vy: number; color: string; life: number; maxLife: number; size: number }[],
    lastFireTime: 0,
    kills: 0,
  });

  const [waveKills, setWaveKills] = useState<number>(0);
  const [salvageEarned, setSalvageEarned] = useState<number>(0);

  // Synchronize incoming HP/shield
  useEffect(() => {
    stateRef.current.hp = currentHp;
    stateRef.current.shield = currentShield;
  }, [currentHp, currentShield]);

  // Spawn initial enemies based on system danger
  useEffect(() => {
    const danger = 5 - currentSystem.security;
    const initialEnemies: EnemyShip[] = [];

    for (let i = 0; i < Math.max(2, danger); i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 350 + Math.random() * 200;
      initialEnemies.push({
        id: `enemy_${i}_${Date.now()}`,
        name: danger >= 4 ? 'Corsair Raider' : 'Outlaw Skiff',
        type: danger >= 4 ? 'corsair' : 'corvette',
        x: 400 + Math.cos(angle) * dist,
        y: 300 + Math.sin(angle) * dist,
        vx: 0,
        vy: 0,
        angle: 0,
        hp: 120 + danger * 30,
        maxHp: 120 + danger * 30,
        shield: 50 + danger * 20,
        maxShield: 50 + danger * 20,
        speed: 160 + danger * 15,
        dps: 18 + danger * 4,
        bounty: 250 + danger * 100,
        lootCores: 1,
        fireCooldown: 1.5 + Math.random(),
      });
    }

    stateRef.current.enemies = initialEnemies;
  }, [currentSystem]);

  // Keyboard Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = stateRef.current.keys;
      if (e.key === 'w' || e.key === 'ArrowUp') k.forward = true;
      if (e.key === 'a' || e.key === 'ArrowLeft') k.left = true;
      if (e.key === 'd' || e.key === 'ArrowRight') k.right = true;
      if (e.key === ' ' || e.key === 'Spacebar') k.fire = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = stateRef.current.keys;
      if (e.key === 'w' || e.key === 'ArrowUp') k.forward = false;
      if (e.key === 'a' || e.key === 'ArrowLeft') k.left = false;
      if (e.key === 'd' || e.key === 'ArrowRight') k.right = false;
      if (e.key === ' ' || e.key === 'Spacebar') k.fire = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main 60 FPS Render & Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const s = stateRef.current;
      const width = canvas.width;
      const height = canvas.height;

      // 1. Vessel Controls & Kinematics
      const turnSpeed = stats.turnRate * 1.2;
      if (s.keys.left) s.angle -= turnSpeed * dt;
      if (s.keys.right) s.angle += turnSpeed * dt;

      if (s.keys.forward && stats.thrust > 0) {
        const accel = (stats.thrust / Math.max(stats.totalMass, 30)) * 6.5;
        s.vx += Math.cos(s.angle) * accel * dt;
        s.vy += Math.sin(s.angle) * accel * dt;

        // Spawn Thruster Exhaust Particles at rear
        for (let i = 0; i < 2; i++) {
          const backDir = { x: -Math.cos(s.angle), y: -Math.sin(s.angle) };
          s.particles.push({
            x: s.x + backDir.x * 24 + (Math.random() - 0.5) * 8,
            y: s.y + backDir.y * 24 + (Math.random() - 0.5) * 8,
            vx: backDir.x * 120 + (Math.random() - 0.5) * 40,
            vy: backDir.y * 120 + (Math.random() - 0.5) * 40,
            color: '#00e5ff',
            life: 0.35,
            maxLife: 0.35,
            size: 3 + Math.random() * 2,
          });
        }
      }

      // Drag / Damping
      s.vx *= 1.0 - 1.2 * dt;
      s.vy *= 1.0 - 1.2 * dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;

      // Screen wrapping
      if (s.x < 20) s.x = width - 20;
      if (s.x > width - 20) s.x = 20;
      if (s.y < 20) s.y = height - 20;
      if (s.y > height - 20) s.y = 20;

      // Shield Regeneration
      if (s.shield < stats.maxShield) {
        s.shield = Math.min(stats.maxShield, s.shield + 8 * dt);
        onUpdateShield(Math.round(s.shield));
      }

      // 2. Weapon Firing Logic
      const weaponModules = placedModules.filter((m) => m.module.type === 'weapon');
      if (s.keys.fire && weaponModules.length > 0 && now - s.lastFireTime > 220) {
        s.lastFireTime = now;
        sound.playLaser();

        // Fire from each mounted weapon module
        weaponModules.forEach((w) => {
          const muzzleOffset = {
            x: (w.gridX - 2) * 12,
            y: (w.gridY - 2) * 12,
          };
          // Rotate relative to ship angle
          const rotatedMuzzle = {
            x: muzzleOffset.x * Math.cos(s.angle) - muzzleOffset.y * Math.sin(s.angle),
            y: muzzleOffset.x * Math.sin(s.angle) + muzzleOffset.y * Math.cos(s.angle),
          };

          const bulletSpeed = 650;
          s.projectiles.push({
            x: s.x + rotatedMuzzle.x,
            y: s.y + rotatedMuzzle.y,
            vx: Math.cos(s.angle) * bulletSpeed + s.vx * 0.3,
            vy: Math.sin(s.angle) * bulletSpeed + s.vy * 0.3,
            damage: w.module.damage,
            isPlayer: true,
            color: w.module.color,
            life: 1.5,
            maxLife: 1.5,
          });
        });
      }

      // 3. Update Enemies
      for (let i = s.enemies.length - 1; i >= 0; i--) {
        const enemy = s.enemies[i];
        const dx = s.x - enemy.x;
        const dy = s.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const dir = { x: dx / Math.max(dist, 1), y: dy / Math.max(dist, 1) };

        enemy.angle = Math.atan2(dy, dx);

        // Pursuit
        if (dist > 180) {
          enemy.vx += dir.x * enemy.speed * 2 * dt;
          enemy.vy += dir.y * enemy.speed * 2 * dt;
        } else {
          // Circle around player
          enemy.vx += -dir.y * enemy.speed * dt;
          enemy.vy += dir.x * enemy.speed * dt;
        }

        enemy.vx *= 1.0 - 1.5 * dt;
        enemy.vy *= 1.0 - 1.5 * dt;
        enemy.x += enemy.vx * dt;
        enemy.y += enemy.vy * dt;

        // Enemy shooting
        enemy.fireCooldown -= dt;
        if (enemy.fireCooldown <= 0 && dist < 450) {
          enemy.fireCooldown = 1.8 + Math.random() * 0.8;
          sound.playCannon();
          s.projectiles.push({
            x: enemy.x + dir.x * 20,
            y: enemy.y + dir.y * 20,
            vx: dir.x * 380,
            vy: dir.y * 380,
            damage: enemy.dps,
            isPlayer: false,
            color: '#ff1744',
            life: 2.0,
            maxLife: 2.0,
          });
        }

        // Enemy death check
        if (enemy.hp <= 0) {
          sound.playExplosion();
          onLog(`Destroyed hostile [${enemy.name}]! +₡${enemy.bounty} bounty collected.`, 'combat');
          onUpdateCredits(credits + enemy.bounty);
          s.kills++;
          setWaveKills(s.kills);

          // Spawn Salvage
          s.salvage.push({
            x: enemy.x,
            y: enemy.y,
            credits: enemy.bounty,
            life: 25.0,
          });

          // Explosion particles
          for (let p = 0; p < 16; p++) {
            const ang = Math.random() * Math.PI * 2;
            const spd = 60 + Math.random() * 180;
            s.particles.push({
              x: enemy.x,
              y: enemy.y,
              vx: Math.cos(ang) * spd,
              vy: Math.sin(ang) * spd,
              color: '#ffd600',
              life: 0.6,
              maxLife: 0.6,
              size: 3 + Math.random() * 3,
            });
          }

          s.enemies.splice(i, 1);
        }
      }

      // 4. Update Projectiles & Hit Collision
      for (let i = s.projectiles.length - 1; i >= 0; i--) {
        const p = s.projectiles[i];
        p.life -= dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        if (p.life <= 0) {
          s.projectiles.splice(i, 1);
          continue;
        }

        if (p.isPlayer) {
          // Hits against enemies
          let hit = false;
          for (const enemy of s.enemies) {
            const edx = p.x - enemy.x;
            const edy = p.y - enemy.y;
            if (Math.sqrt(edx * edx + edy * edy) < 24) {
              if (enemy.shield > 0) {
                enemy.shield -= p.damage;
              } else {
                enemy.hp -= p.damage;
              }
              hit = true;
              break;
            }
          }
          if (hit) {
            s.projectiles.splice(i, 1);
          }
        } else {
          // Enemy projectile hits Player
          const pdx = p.x - s.x;
          const pdy = p.y - s.y;
          if (Math.sqrt(pdx * pdx + pdy * pdy) < 24) {
            if (s.shield > 0) {
              s.shield = Math.max(0, s.shield - p.damage);
              onUpdateShield(Math.round(s.shield));
            } else {
              s.hp = Math.max(0, s.hp - p.damage);
              onUpdateHp(Math.round(s.hp));
            }
            sound.playAlarm();
            s.projectiles.splice(i, 1);
          }
        }
      }

      // 5. Update Salvage Collection
      for (let i = s.salvage.length - 1; i >= 0; i--) {
        const pod = s.salvage[i];
        const sdx = s.x - pod.x;
        const sdy = s.y - pod.y;
        const sdist = Math.sqrt(sdx * sdx + sdy * sdy);

        // Tractor beam pull
        if (sdist < 180) {
          pod.x += (sdx / sdist) * 220 * dt;
          pod.y += (sdy / sdist) * 220 * dt;
        }

        if (sdist < 28) {
          sound.playTradeCash();
          onUpdateCredits(credits + 150);
          setSalvageEarned((prev) => prev + 150);
          s.salvage.splice(i, 1);
        }
      }

      // 6. Update Particles
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const pt = s.particles[i];
        pt.life -= dt;
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        if (pt.life <= 0) {
          s.particles.splice(i, 1);
        }
      }

      // -------------------------------------------------------------
      // 7. RENDER PASS
      // -------------------------------------------------------------
      ctx.fillStyle = '#050811';
      ctx.fillRect(0, 0, width, height);

      // Star Dust grid
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.08)';
      ctx.lineWidth = 1;
      const step = 48;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Render Salvage Pods
      s.salvage.forEach((pod) => {
        ctx.fillStyle = '#ffd600';
        ctx.shadowColor = '#ffd600';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(pod.x, pod.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Render Particles
      s.particles.forEach((pt) => {
        const alpha = Math.max(0, pt.life / pt.maxLife);
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      // Render Projectiles
      s.projectiles.forEach((p) => {
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Render Enemies
      s.enemies.forEach((enemy) => {
        ctx.save();
        ctx.translate(enemy.x, enemy.y);
        ctx.rotate(enemy.angle);

        ctx.fillStyle = '#ff1744';
        ctx.strokeStyle = '#ff8a80';
        ctx.lineWidth = 2;

        // Triangular corsair
        ctx.beginPath();
        ctx.moveTo(18, 0);
        ctx.lineTo(-14, -12);
        ctx.lineTo(-6, 0);
        ctx.lineTo(-14, 12);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();

        // Health bar above enemy
        if (enemy.hp < enemy.maxHp) {
          const hpRatio = enemy.hp / enemy.maxHp;
          ctx.fillStyle = 'rgba(0,0,0,0.6)';
          ctx.fillRect(enemy.x - 16, enemy.y - 24, 32, 4);
          ctx.fillStyle = '#ff1744';
          ctx.fillRect(enemy.x - 16, enemy.y - 24, 32 * hpRatio, 4);
        }
      });

      // Render Player's Modular Vessel
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.angle + Math.PI / 2); // default models point UP

      // Render each mounted module at relative tile coordinate
      const tileSize = 12;
      placedModules.forEach((m) => {
        const rx = (m.gridX - 2) * tileSize;
        const ry = (m.gridY - 2) * tileSize;

        ctx.fillStyle = m.module.color;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;

        ctx.fillRect(rx - tileSize / 2, ry - tileSize / 2, tileSize - 1, tileSize - 1);
        ctx.strokeRect(rx - tileSize / 2, ry - tileSize / 2, tileSize - 1, tileSize - 1);
      });

      // Shield Dome
      if (s.shield > 0) {
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 32, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [placedModules, stats, credits, onUpdateCredits, onUpdateHp, onUpdateShield, onLog]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 340px', gap: '20px', padding: '0 16px 24px' }}>
      {/* Flight Canvas View */}
      <div className="glass-panel" style={{ padding: '16px', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-amber)', letterSpacing: '1px' }}>
              DEEP SPACE PATROL • {currentSystem.name.toUpperCase()}
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Controls: WASD / Arrow Keys to fly • Spacebar to fire mounted weapons
            </span>
          </div>

          <div style={{ display: 'flex', gap: '14px', fontSize: '0.8rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-red)' }}>
              <Skull size={14} /> KILLS: <strong>{waveKills}</strong>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-amber)' }}>
              <Coins size={14} /> SALVAGE: <strong>+₡{salvageEarned}</strong>
            </span>
          </div>
        </div>

        {/* 2D Canvas */}
        <canvas
          ref={canvasRef}
          width={800}
          height={520}
          style={{
            width: '100%',
            height: '520px',
            borderRadius: '12px',
            border: '1px solid rgba(0, 229, 255, 0.25)',
            background: '#050811',
            display: 'block',
          }}
        />
      </div>

      {/* Flight HUD & Tactical Abilities */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
            TACTICAL AVIONICS
          </h2>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
            Real-time flight diagnostics & weapon hardpoints
          </span>
        </div>

        {/* Mounted Weapons Inventory */}
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '8px' }}>
            ACTIVE HARDPOINTS ({placedModules.filter((m) => m.module.type === 'weapon').length}):
          </div>
          {placedModules.filter((m) => m.module.type === 'weapon').length === 0 ? (
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-red)' }}>
              No weapon hardpoints mounted! Mount Gauss Cannons or Phase Lasers in the Shipyard.
            </div>
          ) : (
            placedModules
              .filter((m) => m.module.type === 'weapon')
              .map((w, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                  <span style={{ color: w.module.color }}>{w.module.name}</span>
                  <span className="mono">{w.module.damage} DPS</span>
                </div>
              ))
          )}
        </div>

        {/* Tactical Controls & Instructions */}
        <div style={{ background: 'rgba(5, 8, 17, 0.7)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--border-cyan)', marginBottom: '6px' }}>
            FLIGHT GUIDE:
          </div>
          <ul style={{ fontSize: '0.75rem', color: 'var(--text-dim)', paddingLeft: '16px', lineHeight: 1.5 }}>
            <li><strong style={{ color: '#fff' }}>W / Up</strong>: Engage Forward Thrusters</li>
            <li><strong style={{ color: '#fff' }}>A / D</strong>: Rotate Vessel Heading</li>
            <li><strong style={{ color: '#fff' }}>Spacebar</strong>: Fire All Hardpoints</li>
            <li>Fly near glowing golden debris to tractor-beam salvage bounty!</li>
          </ul>
        </div>

        {/* Emergency Overcharge Button */}
        <button
          className="btn-sci-fi btn-amber"
          onClick={() => {
            if (stats.netPower < 10) {
              sound.playAlarm();
              onLog('Insufficient reactor power to overcharge shields!', 'alert');
              return;
            }
            sound.playLaser();
            onUpdateShield(stats.maxShield);
            onLog('Emergency Shield Overcharge triggered: Shields restored to 100%!', 'success');
          }}
          style={{ width: '100%', padding: '14px', marginTop: 'auto' }}
        >
          <Zap size={16} /> EMERGENCY SHIELD OVERCHARGE
        </button>
      </div>
    </div>
  );
};
