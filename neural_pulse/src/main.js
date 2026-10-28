/**
 * NEURAL-PULSE // MAIN ORCHESTRATOR
 * Coordinates Combat Arena, Web Audio Synthesizer, Real-Time Telemetry, and AI Terminal.
 */

import { SynthEngine } from './audio/synth_engine.js';
import { Arpeggiator } from './audio/arpeggiator.js';
import { AudioVisualizer } from './audio/audio_visualizer.js';
import { SynthKeyboard } from './audio/keyboard.js';
import { CombatEngine } from './game/combat_engine.js';
import { TelemetryMonitor } from './dashboard/telemetry.js';
import { AiTerminal } from './dashboard/ai_terminal.js';

class NeuralPulseApp {
  constructor() {
    // 1. Audio Subsystems
    this.synth = new SynthEngine();
    this.arp = new Arpeggiator(this.synth);
    this.visualizer = new AudioVisualizer('synth-visualizer-canvas', this.synth);
    this.keyboard = new SynthKeyboard('virtual-piano', this.synth);

    // 2. Combat Subsystem
    this.combat = new CombatEngine('combat-canvas', this.synth, (state) => this.onCombatStateUpdate(state));

    // 3. Dashboard & Telemetry Subsystems
    this.telemetry = new TelemetryMonitor('telemetry-chart-canvas');
    this.terminal = new AiTerminal('terminal-output', 'terminal-input', this);

    this.currentMode = 'arena';
    this.initUi();
    this.startGlobalLoop();
  }

  initUi() {
    const viewport = document.getElementById('app-viewport');

    // Navigation Mode Switcher Tabs
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const mode = tab.dataset.mode;
        this.currentMode = mode;
        viewport.className = `mode-${mode}`;

        // Ensure canvas layouts resize on tab switch
        setTimeout(() => {
          this.combat.resize();
          this.visualizer.resize();
          this.telemetry.resize();
        }, 50);

        this.synth.ensureContext();
      });
    });

    // Audio Mute Toggle
    const btnAudio = document.getElementById('btn-audio-toggle');
    const audioIcon = document.getElementById('audio-icon');
    if (btnAudio) {
      btnAudio.addEventListener('click', () => {
        const isAudible = this.synth.toggleMute();
        audioIcon.textContent = isAudible ? '🔊' : '🔇';
      });
    }

    // Fullscreen Toggle
    const btnFs = document.getElementById('btn-fullscreen');
    if (btnFs) {
      btnFs.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      });
    }

    // Combat Action Buttons (Touch / Click)
    const btnDash = document.getElementById('btn-phase-dash');
    if (btnDash) {
      btnDash.addEventListener('click', () => this.combat.triggerDash());
    }

    const btnRewind = document.getElementById('btn-chrono-rewind');
    if (btnRewind) {
      btnRewind.addEventListener('click', () => this.combat.triggerRewind());
    }

    // Game Over Restart Buttons
    const btnRestart = document.getElementById('btn-restart-run');
    if (btnRestart) {
      btnRestart.addEventListener('click', () => {
        document.getElementById('gameover-modal').classList.add('hidden');
        this.combat.reset();
      });
    }

    const btnSwitchSynth = document.getElementById('btn-switch-synth');
    if (btnSwitchSynth) {
      btnSwitchSynth.addEventListener('click', () => {
        document.getElementById('gameover-modal').classList.add('hidden');
        document.getElementById('tab-synth').click();
      });
    }

    // Visualizer Mode Buttons
    const visBtns = document.querySelectorAll('.vis-btn');
    visBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        visBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (btn.id === 'btn-vis-wave') this.visualizer.setMode('wave');
        if (btn.id === 'btn-vis-bars') this.visualizer.setMode('bars');
        if (btn.id === 'btn-vis-circular') this.visualizer.setMode('circular');
      });
    });

    // Oscillator Wave Selector
    const waveBtns = document.querySelectorAll('.wave-btn');
    waveBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        waveBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.synth.setParam('waveType', btn.dataset.wave);
      });
    });

    // Synth Sliders
    this.bindSlider('synth-detune', 'val-detune', (v) => this.synth.setParam('detune', parseFloat(v)));
    this.bindSlider('synth-sub', 'val-sub', (v) => this.synth.setParam('subLevel', parseFloat(v)));
    this.bindSlider('synth-glide', 'val-glide', (v) => this.synth.setParam('glide', parseFloat(v)));
    this.bindSlider('synth-cutoff', 'val-cutoff', (v) => this.synth.setFilter(parseFloat(v), undefined));
    this.bindSlider('synth-reso', 'val-reso', (v) => this.synth.setFilter(undefined, parseFloat(v)));
    this.bindSlider('env-a', 'val-env-a', (v) => this.synth.setParam('attack', parseFloat(v)), 's');
    this.bindSlider('env-d', 'val-env-d', (v) => this.synth.setParam('decay', parseFloat(v)), 's');
    this.bindSlider('env-s', 'val-env-s', (v) => this.synth.setParam('sustain', parseFloat(v)), '%', 100);
    this.bindSlider('env-r', 'val-env-r', (v) => this.synth.setParam('release', parseFloat(v)), 's');
    this.bindSlider('arp-bpm', 'val-arp-bpm', (v) => this.arp.setBpm(parseInt(v)));
    this.bindSlider('synth-delay', 'val-delay', (v) => this.synth.setParam('delayMix', parseFloat(v)), '%', 100);

    // Arp Pattern
    const arpPatternSelect = document.getElementById('arp-pattern');
    if (arpPatternSelect) {
      arpPatternSelect.addEventListener('change', (e) => {
        this.arp.setPattern(e.target.value);
      });
    }

    // Arp Toggle
    const btnArpToggle = document.getElementById('btn-arp-toggle');
    if (btnArpToggle) {
      btnArpToggle.addEventListener('click', () => {
        const active = this.arp.toggle();
        btnArpToggle.classList.toggle('active', active);
        btnArpToggle.textContent = active ? 'ARP ON' : 'ARP OFF';
      });
    }

    // Octave Buttons
    const btnOctDown = document.getElementById('btn-octave-down');
    const btnOctUp = document.getElementById('btn-octave-up');
    if (btnOctDown) btnOctDown.addEventListener('click', () => this.keyboard.setOctave(this.keyboard.octave - 1));
    if (btnOctUp) btnOctUp.addEventListener('click', () => this.keyboard.setOctave(this.keyboard.octave + 1));

    // Filter XY Touchpad
    this.initFilterXyPad();

    // Tuning Matrix Sliders
    this.bindSlider('tune-speed', 'tune-val-speed', (v) => {
      this.combat.player.speed = 320 * (parseFloat(v) / 100);
    }, '%');

    this.bindSlider('tune-fire', 'tune-val-fire', (v) => {
      this.combat.player.fireRate = 5.0 * (parseFloat(v) / 100);
    }, '%');

    this.bindSlider('tune-graze', 'tune-val-graze', (v) => {
      this.combat.player.grazeRadius = parseFloat(v);
    }, 'px');

    const btnResetTuning = document.getElementById('btn-reset-tuning');
    if (btnResetTuning) {
      btnResetTuning.addEventListener('click', () => {
        document.getElementById('tune-speed').value = 100;
        document.getElementById('tune-fire').value = 100;
        document.getElementById('tune-graze').value = 34;
        this.combat.player.speed = 320;
        this.combat.player.fireRate = 5.0;
        this.combat.player.grazeRadius = 34;
        document.getElementById('tune-val-speed').textContent = '100%';
        document.getElementById('tune-val-fire').textContent = '100%';
        document.getElementById('tune-val-graze').textContent = '34px';
      });
    }

    // Start Engines
    this.combat.start();
    this.visualizer.start();
    this.arp.start();
  }

  bindSlider(inputId, labelId, onChange, suffix = '', multiplier = 1) {
    const el = document.getElementById(inputId);
    const label = document.getElementById(labelId);
    if (!el) return;

    el.addEventListener('input', (e) => {
      const val = e.target.value;
      if (label) {
        label.textContent = `${Math.round(val * multiplier)}${suffix}`;
      }
      onChange(val);
    });
  }

  initFilterXyPad() {
    const pad = document.getElementById('filter-xy-pad');
    const crosshair = document.getElementById('filter-crosshair');
    if (!pad || !crosshair) return;

    let isTracking = false;

    const updatePad = (e) => {
      const rect = pad.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

      crosshair.style.left = `${x}px`;
      crosshair.style.top = `${y}px`;

      // Cutoff: 100Hz to 12000Hz (logarithmic feel)
      const normX = x / rect.width;
      const cutoff = 100 + Math.pow(normX, 2) * 11900;

      // Resonance: 0.5 to 18 (inverted Y)
      const normY = 1.0 - (y / rect.height);
      const resonance = 0.5 + normY * 17.5;

      this.synth.setFilter(cutoff, resonance);

      const cutoffSlider = document.getElementById('synth-cutoff');
      const resoSlider = document.getElementById('synth-reso');
      if (cutoffSlider) cutoffSlider.value = cutoff;
      if (resoSlider) resoSlider.value = resonance;

      const valCutoff = document.getElementById('val-cutoff');
      const valReso = document.getElementById('val-reso');
      if (valCutoff) valCutoff.textContent = Math.round(cutoff);
      if (valReso) valReso.textContent = resonance.toFixed(1);
    };

    pad.addEventListener('mousedown', (e) => {
      isTracking = true;
      updatePad(e);
    });

    window.addEventListener('mousemove', (e) => {
      if (isTracking) updatePad(e);
    });

    window.addEventListener('mouseup', () => {
      isTracking = false;
    });
  }

  onCombatStateUpdate(combat) {
    // 1. Update Top Bar HUD
    const hpText = document.getElementById('hud-hp-text');
    const hpBar = document.getElementById('hud-hp-bar');
    const shieldBar = document.getElementById('hud-shield-bar');
    const scoreVal = document.getElementById('hud-score-val');
    const waveVal = document.getElementById('hud-wave-val');
    const levelText = document.getElementById('hud-level-text');
    const expBar = document.getElementById('hud-exp-bar');

    if (hpText) hpText.textContent = `${Math.max(0, Math.round(combat.player.health))} / ${combat.player.maxHealth}`;
    if (hpBar) hpBar.style.width = `${Math.max(0, (combat.player.health / combat.player.maxHealth) * 100)}%`;
    if (shieldBar) shieldBar.style.width = `${Math.max(0, (combat.player.shield / combat.player.maxShield) * 100)}%`;
    if (scoreVal) scoreVal.textContent = String(combat.score).padStart(6, '0');
    if (waveVal) waveVal.textContent = String(combat.wave).padStart(2, '0');
    if (levelText) levelText.textContent = `LV. ${combat.level}`;
    if (expBar) expBar.style.width = `${(combat.currentExp / combat.expToLevel) * 100}%`;

    // 2. Dilation Ribbon & Combat Alerts
    const dilationBar = document.getElementById('hud-dilation-bar');
    const grazeStats = document.getElementById('hud-graze-stats');
    const tagOverdrive = document.getElementById('hud-overdrive-tag');
    const tagBulletTime = document.getElementById('hud-bullet-time-tag');

    if (dilationBar) {
      const pct = combat.player.bulletTimeTimer > 0
        ? (combat.player.bulletTimeTimer / 3.5) * 100
        : combat.player.dilationMeter * 100;
      dilationBar.style.width = `${pct}%`;
    }

    if (grazeStats) {
      grazeStats.textContent = `⚡ ${combat.bulletsGrazed} GRAZES / ${combat.bulletsParried} PARRIES`;
    }

    if (tagOverdrive) {
      tagOverdrive.classList.toggle('hidden', combat.player.overdriveTimer <= 0);
      if (combat.player.overdriveTimer > 0) {
        tagOverdrive.textContent = `⚡ OVERDRIVE ENGAGED [${combat.player.overdriveTimer.toFixed(1)}s]`;
      }
    }

    if (tagBulletTime) {
      tagBulletTime.classList.toggle('hidden', combat.player.bulletTimeTimer <= 0);
      if (combat.player.bulletTimeTimer > 0) {
        tagBulletTime.textContent = `⏳ BULLET-TIME ACTIVE [${combat.player.bulletTimeTimer.toFixed(1)}s]`;
      }
    }

    // 3. Radial Action Cooldowns
    const dashCd = document.getElementById('dash-cd-indicator');
    const dashRing = document.getElementById('dash-radial-fill');
    if (dashCd && dashRing) {
      if (combat.player.dashCooldownTimer <= 0) {
        dashCd.textContent = 'READY';
        dashRing.style.strokeDashoffset = '0';
      } else {
        dashCd.textContent = `${combat.player.dashCooldownTimer.toFixed(1)}s`;
        const offset = 106.8 * (combat.player.dashCooldownTimer / combat.player.dashCooldown);
        dashRing.style.strokeDashoffset = `${offset}`;
      }
    }

    const rewindCd = document.getElementById('rewind-cd-indicator');
    const rewindRing = document.getElementById('rewind-radial-fill');
    if (rewindCd && rewindRing) {
      if (combat.player.rewindCooldownTimer <= 0) {
        rewindCd.textContent = 'READY';
        rewindRing.style.strokeDashoffset = '0';
      } else {
        rewindCd.textContent = `${combat.player.rewindCooldownTimer.toFixed(1)}s`;
        const offset = 106.8 * (combat.player.rewindCooldownTimer / combat.player.rewindCooldown);
        rewindRing.style.strokeDashoffset = `${offset}`;
      }
    }

    // 4. Upgrade Modal Presentation
    const upgradeModal = document.getElementById('upgrade-modal');
    if (upgradeModal) {
      if (combat.isUpgrading) {
        upgradeModal.classList.remove('hidden');
        this.renderUpgradeOptions();
      } else {
        upgradeModal.classList.add('hidden');
      }
    }

    // 5. Game Over Modal Presentation
    const gameOverModal = document.getElementById('gameover-modal');
    if (gameOverModal) {
      if (combat.isGameOver) {
        gameOverModal.classList.remove('hidden');
        document.getElementById('go-score').textContent = combat.score;
        document.getElementById('go-wave').textContent = combat.wave;
        document.getElementById('go-kills').textContent = combat.enemiesKilled;
        document.getElementById('go-parries').textContent = combat.bulletsParried;
      } else {
        gameOverModal.classList.add('hidden');
      }
    }
  }

  renderUpgradeOptions() {
    const container = document.getElementById('upgrade-options-container');
    if (!container) return;

    const pool = [
      {
        id: 'tachyon_monofilament',
        icon: '⚡',
        name: 'TACHYON MONOFILAMENT',
        desc: 'Temporal Echoes project +60% thicker slicing laser tethers with severe hostile slow.',
      },
      {
        id: 'kinetic_deflector',
        icon: '🛡️',
        name: 'KINETIC DEFLECTOR',
        desc: 'Phase Dash deflects enemy projectiles into high-velocity homing tachyon shards with 2x damage.',
      },
      {
        id: 'timeline_splicer',
        icon: '⏳',
        name: 'TIMELINE SPLICER',
        desc: 'Blasters attach Tachyon Anchors. Triggering Rewind violently yanks anchored hostiles back through time.',
      },
      {
        id: 'tachyon_splitter',
        icon: '✨',
        name: 'TACHYON SPLITTER',
        desc: 'Main blasters gain +25% fire rate and fire secondary chromatic spread bolts.',
      },
      {
        id: 'overclock_thrusters',
        icon: '🚀',
        name: 'OVERCLOCK THRUSTERS',
        desc: 'Increases vessel maximum speed and maneuver agility by +20%.',
      },
    ];

    // Pick 3 random
    const shuffled = [...pool].sort(() => 0.5 - Math.random()).slice(0, 3);
    container.innerHTML = '';

    shuffled.forEach((upg) => {
      const card = document.createElement('div');
      card.className = 'upgrade-card';
      card.innerHTML = `
        <div class="upgrade-icon">${upg.icon}</div>
        <div class="upgrade-info">
          <h4>${upg.name}</h4>
          <p>${upg.desc}</p>
        </div>
      `;
      card.addEventListener('click', () => {
        this.combat.selectUpgrade(upg.id);
      });
      container.appendChild(card);
    });
  }

  startGlobalLoop() {
    let lastTime = performance.now();

    const loop = (time) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      // 1. Reactive Combat -> Synth Modulation
      const enemyCount = this.combat.enemies.length;
      const isOverdrive = this.combat.player.overdriveTimer > 0;
      const combatIntensity = Math.min(1.0, (enemyCount / 10) + (isOverdrive ? 0.4 : 0));
      this.arp.modulateWithCombat(combatIntensity);

      // 2. Telemetry Updates
      let audioAmp = 10;
      if (this.synth.dataFreqArray) {
        audioAmp = this.synth.dataFreqArray[10] || 10;
      }
      this.telemetry.update(audioAmp);

      // Update Header Ticker & FPS Pill
      const fpsEl = document.getElementById('tel-fps');
      const apmEl = document.getElementById('tel-apm');
      if (fpsEl) fpsEl.textContent = this.telemetry.currentFps;
      if (apmEl) apmEl.textContent = this.telemetry.currentApm;

      // Update Footer Clock
      const footerTime = document.getElementById('footer-time');
      if (footerTime) {
        const secs = (time / 1000).toFixed(2);
        footerTime.textContent = `RUN TIME: ${secs}s`;
      }

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }
}

// Bootstrap application on DOM ready
window.addEventListener('DOMContentLoaded', () => {
  window.app = new NeuralPulseApp();
});
