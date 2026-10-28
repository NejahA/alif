/**
 * NEURAL-PULSE // AI ARCHITECT TERMINAL
 * Interactive cybernetic command-line interface with real-time system hooks.
 */

export class AiTerminal {
  constructor(outputId, inputId, app) {
    this.output = document.getElementById(outputId);
    this.input = document.getElementById(inputId);
    this.app = app;

    this.history = [];
    this.historyIdx = -1;

    this.initEvents();
  }

  initEvents() {
    if (!this.input) return;
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const cmd = this.input.value.trim();
        if (cmd) {
          this.history.push(cmd);
          this.historyIdx = this.history.length;
          this.execute(cmd);
          this.input.value = '';
        }
      } else if (e.key === 'ArrowUp') {
        if (this.historyIdx > 0) {
          this.historyIdx--;
          this.input.value = this.history[this.historyIdx];
        }
      } else if (e.key === 'ArrowDown') {
        if (this.historyIdx < this.history.length - 1) {
          this.historyIdx++;
          this.input.value = this.history[this.historyIdx];
        } else {
          this.historyIdx = this.history.length;
          this.input.value = '';
        }
      }
    });
  }

  log(text, type = 'info') {
    if (!this.output) return;
    const line = document.createElement('div');
    line.className = `log-line ${type}`;
    line.textContent = text;
    this.output.appendChild(line);
    this.output.scrollTop = this.output.scrollHeight;
  }

  execute(raw) {
    this.log(`> ${raw}`, 'system');
    const parts = raw.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (cmd) {
      case 'help':
        this.log('=== AVAILABLE NEURAL COMMANDS ===', 'info');
        this.log('  help            - Display this manual', 'system');
        this.log('  status          - Query kernel integrity & memory telemetry', 'system');
        this.log('  overclock <pct> - Boost vessel plasma thrusters & blasters', 'system');
        this.log('  synth [mute|saw|sine|bpm <val>] - Tune audio engine directly', 'system');
        this.log('  arena [wave <n>|rewind|dash]   - Direct combat intervention', 'system');
        this.log('  scan            - Scan local sector for anomaly signatures', 'system');
        this.log('  matrix          - Trigger cyber neural cascade', 'system');
        this.log('  clear           - Purge terminal display logs', 'system');
        break;

      case 'status':
        this.log(`[KERNEL] Status: ONLINE // Frame: 60fps`, 'success');
        this.log(`[COMBAT] Sector: ${this.app.combat.wave} // Score: ${this.app.combat.score} // Kills: ${this.app.combat.enemiesKilled}`, 'info');
        this.log(`[AUDIO] Waveform: ${this.app.synth.params.waveType.toUpperCase()} // BPM: ${this.app.arp.bpm}`, 'info');
        this.log(`[VESSEL] Hull: ${Math.round(this.app.combat.player.health)}% // Shield: ${Math.round(this.app.combat.player.shield)}%`, 'info');
        break;

      case 'overclock':
        const pct = parseInt(args[0]) || 150;
        this.app.combat.player.speed = 320 * (pct / 100);
        this.app.combat.player.fireRate = 5.0 * (pct / 100);
        this.log(`[SUCCESS] Plasma subsystems overclocked to ${pct}%.`, 'success');
        this.app.synth.playLevelUpSound();
        break;

      case 'synth':
        if (args[0] === 'mute') {
          const state = this.app.synth.toggleMute();
          this.log(`[SYNTH] Audio output ${state ? 'ENABLED' : 'MUTED'}.`, 'warning');
        } else if (args[0] === 'bpm') {
          const bpm = parseInt(args[1]) || 140;
          this.app.arp.setBpm(bpm);
          this.log(`[SYNTH] Arpeggiator tempo set to ${bpm} BPM.`, 'success');
        } else if (['sawtooth', 'square', 'sine', 'triangle'].includes(args[0])) {
          this.app.synth.setParam('waveType', args[0]);
          this.log(`[SYNTH] Oscillator waveform switched to ${args[0].toUpperCase()}.`, 'success');
        } else {
          this.log(`[SYNTH] Usage: synth [mute | bpm <n> | sawtooth | square | sine]`, 'warning');
        }
        break;

      case 'arena':
        if (args[0] === 'rewind') {
          this.app.combat.triggerRewind();
          this.log(`[ARENA] Temporal Rewind executed remotely.`, 'success');
        } else if (args[0] === 'dash') {
          this.app.combat.triggerDash();
          this.log(`[ARENA] Phase Dash burst fired.`, 'success');
        } else if (args[0] === 'wave' && args[1]) {
          this.app.combat.wave = parseInt(args[1]) || 1;
          this.log(`[ARENA] Sector jumped to ${this.app.combat.wave}.`, 'warning');
        } else {
          this.log(`[ARENA] Usage: arena [rewind | dash | wave <n>]`, 'warning');
        }
        break;

      case 'scan':
        this.log('[SCAN] Scanning Sector Zero quantum frequency bands...', 'info');
        setTimeout(() => {
          this.log(`[RESULTS] Hostiles detected: ${this.app.combat.enemies.length} active signatures.`, 'warning');
          this.log(`[RESULTS] Quantum Cores nearby: ${this.app.combat.cores.length} recoverable units.`, 'info');
        }, 350);
        break;

      case 'matrix':
        this.log('01001110 01000101 01010101 01010010 01000001 01001100', 'success');
        this.log('01010000 01010101 01001100 01010011 01000101 00100001', 'success');
        this.log('SYNAPSE PROTOCOL SYNCHRONIZED.', 'success');
        this.app.synth.playParrySound();
        break;

      case 'clear':
        if (this.output) this.output.innerHTML = '';
        break;

      default:
        this.log(`[ERROR] Command unrecognized: '${cmd}'. Type 'help' for manual.`, 'error');
        break;
    }
  }
}
