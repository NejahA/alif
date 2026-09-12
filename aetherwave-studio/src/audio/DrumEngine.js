/**
 * DrumEngine - 16-Step Web Audio Synthesized 6-Track Drum Machine Engine
 */

import { audioEngine } from './AudioEngine';

class DrumEngine {
  constructor() {
    this.isPlaying = false;
    this.currentStep = 0;
    this.bpm = 110;
    this.swing = 0;
    this.timerId = null;

    // 16-Step Pattern Grid [Kick, Snare, HiHat, Tom, Clap, OpenHat]
    this.grid = {
      kick:    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
      snare:   [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      hihat:   [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      tom:     [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0],
      clap:    [0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0],
      openhat: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0]
    };

    this.mutes = { kick: false, snare: false, hihat: false, tom: false, clap: false, openhat: false };
    this.volumes = { kick: 0.9, snare: 0.7, hihat: 0.5, tom: 0.8, clap: 0.7, openhat: 0.6 };

    this.presetBeats = {
      cyberpump: {
        kick:    [1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0],
        snare:   [0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1],
        hihat:   [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        tom:     [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0],
        clap:    [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
        openhat: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0]
      },
      synthwave: {
        kick:    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
        snare:   [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
        hihat:   [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
        tom:     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0],
        clap:    [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
        openhat: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0]
      },
      techno: {
        kick:    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
        snare:   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        hihat:   [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
        tom:     [0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
        clap:    [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
        openhat: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0]
      },
      discofunk: {
        kick:    [1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0],
        snare:   [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
        hihat:   [1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
        tom:     [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0],
        clap:    [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0],
        openhat: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0]
      }
    };
  }

  // Synthesize Analog Kick Drum
  playKick() {
    const ctx = audioEngine.ctx;
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.14);

    gain.gain.setValueAtTime(this.volumes.kick, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(audioEngine.filterNode || ctx.destination);

    osc.start(now);
    osc.stop(now + 0.45);
  }

  // Synthesize Cyber Snare
  playSnare() {
    const ctx = audioEngine.ctx;
    if (!ctx) return;
    const now = ctx.currentTime;

    const bufferSize = ctx.sampleRate * 0.22;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(950, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(this.volumes.snare, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(audioEngine.filterNode || ctx.destination);

    whiteNoise.start(now);
  }

  // Synthesize Metallic Closed Hi-Hat
  playHiHat() {
    const ctx = audioEngine.ctx;
    if (!ctx) return;
    const now = ctx.currentTime;

    const bufferSize = ctx.sampleRate * 0.06;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7500, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(this.volumes.hihat, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(audioEngine.filterNode || ctx.destination);

    whiteNoise.start(now);
  }

  // Synthesize Sub Tom
  playTom() {
    const ctx = audioEngine.ctx;
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.frequency.setValueAtTime(95, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.22);

    gain.gain.setValueAtTime(this.volumes.tom, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(audioEngine.filterNode || ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  // Synthesize Hand Clap
  playClap() {
    const ctx = audioEngine.ctx;
    if (!ctx) return;
    const now = ctx.currentTime;

    const bufferSize = ctx.sampleRate * 0.18;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.Q.setValueAtTime(3, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(this.volumes.clap, now);
    gain.gain.exponentialRampToValueAtTime(0.005, now + 0.18);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(audioEngine.filterNode || ctx.destination);

    whiteNoise.start(now);
  }

  // Synthesize Open Hi-Hat
  playOpenHat() {
    const ctx = audioEngine.ctx;
    if (!ctx) return;
    const now = ctx.currentTime;

    const bufferSize = ctx.sampleRate * 0.3;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(6500, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(this.volumes.openhat, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(audioEngine.filterNode || ctx.destination);

    whiteNoise.start(now);
  }

  // Load Preset Beat
  loadPreset(presetKey) {
    if (this.presetBeats[presetKey]) {
      this.grid = JSON.parse(JSON.stringify(this.presetBeats[presetKey]));
    }
  }

  // Fill Generator
  triggerFill() {
    // Inject rapid snare & tom rolls into steps 12-15
    this.grid.snare[12] = 1; this.grid.snare[13] = 1; this.grid.snare[14] = 1; this.grid.snare[15] = 1;
    this.grid.tom[14] = 1; this.grid.tom[15] = 1;
  }

  // Start 16-Step Sequencer Loop
  toggleSequencer(onStepCallback) {
    if (this.isPlaying) {
      clearInterval(this.timerId);
      this.isPlaying = false;
      this.currentStep = 0;
      return false;
    }

    audioEngine.init();
    this.isPlaying = true;
    const baseStepIntervalMs = (60 / this.bpm / 4) * 1000; // 16th notes

    this.timerId = setInterval(() => {
      const step = this.currentStep;

      if (this.grid.kick[step] && !this.mutes.kick) this.playKick();
      if (this.grid.snare[step] && !this.mutes.snare) this.playSnare();
      if (this.grid.hihat[step] && !this.mutes.hihat) this.playHiHat();
      if (this.grid.tom[step] && !this.mutes.tom) this.playTom();
      if (this.grid.clap && this.grid.clap[step] && !this.mutes.clap) this.playClap();
      if (this.grid.openhat && this.grid.openhat[step] && !this.mutes.openhat) this.playOpenHat();

      if (onStepCallback) onStepCallback(step);

      this.currentStep = (this.currentStep + 1) % 16;
    }, baseStepIntervalMs);

    return true;
  }

  toggleCell(track, stepIndex) {
    if (this.grid[track]) {
      this.grid[track][stepIndex] = this.grid[track][stepIndex] ? 0 : 1;
    }
  }

  toggleMute(track) {
    if (this.mutes[track] !== undefined) {
      this.mutes[track] = !this.mutes[track];
    }
  }
}

export const drumEngine = new DrumEngine();
