/**
 * NEURAL-PULSE // SYNTHESIS ENGINE
 * Real-time Web Audio API Polyphonic Synthesizer with Envelopes, Filters, and Delay FX.
 */

export class SynthEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.masterGain = null;
    this.analyser = null;
    this.delayNode = null;
    this.delayGain = null;
    this.filterNode = null;

    // Synth Parameters
    this.params = {
      waveType: 'sawtooth',
      detune: 0,
      subLevel: 0.2,
      glide: 0.05,
      filterCutoff: 2400,
      filterResonance: 6.0,
      attack: 0.02,
      decay: 0.25,
      sustain: 0.6,
      release: 0.45,
      delayMix: 0.35,
      delayTime: 0.28,
    };

    // Active voices map
    this.activeVoices = new Map();
  }

  init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioCtx();

    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);

    // FFT Analyser Node for Visualizers
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 512;
    this.analyser.smoothingTimeConstant = 0.82;

    // Filter Node (24dB Lowpass)
    this.filterNode = this.ctx.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.setValueAtTime(this.params.filterCutoff, this.ctx.currentTime);
    this.filterNode.Q.setValueAtTime(this.params.filterResonance, this.ctx.currentTime);

    // Delay Node (Echo FX)
    this.delayNode = this.ctx.createDelay(2.0);
    this.delayNode.delayTime.setValueAtTime(this.params.delayTime, this.ctx.currentTime);

    this.delayFeedback = this.ctx.createGain();
    this.delayFeedback.gain.setValueAtTime(0.42, this.ctx.currentTime);

    this.delayGain = this.ctx.createGain();
    this.delayGain.gain.setValueAtTime(this.params.delayMix, this.ctx.currentTime);

    // Connect Delay Feedback Loop
    this.filterNode.connect(this.delayNode);
    this.delayNode.connect(this.delayFeedback);
    this.delayFeedback.connect(this.delayNode);
    this.delayNode.connect(this.delayGain);

    // Main Signal Chain: Filter -> Master -> Analyser -> Destination
    this.filterNode.connect(this.masterGain);
    this.delayGain.connect(this.masterGain);
    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);
  }

  ensureContext() {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.ensureContext();
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.7, this.ctx.currentTime);
    }
    return !this.isMuted;
  }

  setFilter(cutoff, resonance) {
    if (cutoff !== undefined) this.params.filterCutoff = cutoff;
    if (resonance !== undefined) this.params.filterResonance = resonance;

    if (this.filterNode && this.ctx) {
      const now = this.ctx.currentTime;
      this.filterNode.frequency.setTargetAtTime(this.params.filterCutoff, now, 0.02);
      this.filterNode.Q.setTargetAtTime(this.params.filterResonance, now, 0.02);
    }
  }

  setParam(name, value) {
    this.params[name] = value;
    if (name === 'delayMix' && this.delayGain && this.ctx) {
      this.delayGain.gain.setTargetAtTime(value, this.ctx.currentTime, 0.05);
    }
  }

  /**
   * Triggers a musical note (e.g. from Piano or Arpeggiator)
   */
  noteOn(freq, velocity = 0.8) {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    // Release old voice if already playing on this frequency
    if (this.activeVoices.has(freq)) {
      this.noteOff(freq);
    }

    const now = this.ctx.currentTime;

    // 1. Primary Oscillator
    const osc = this.ctx.createOscillator();
    osc.type = this.params.waveType;
    osc.frequency.setValueAtTime(freq, now);
    osc.detune.setValueAtTime(this.params.detune, now);

    // 2. Sub Oscillator (-1 Octave Sine for punchy low-end)
    const subOsc = this.ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(freq * 0.5, now);

    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(this.params.subLevel, now);
    subOsc.connect(subGain);

    // 3. Voice Amplitude Envelope (ADSR)
    const voiceGain = this.ctx.createGain();
    voiceGain.gain.setValueAtTime(0.0001, now);

    // Attack
    voiceGain.gain.linearRampToValueAtTime(velocity, now + this.params.attack);
    // Decay to Sustain
    const decayEndTime = now + this.params.attack + this.params.decay;
    voiceGain.gain.exponentialRampToValueAtTime(
      Math.max(0.0001, velocity * this.params.sustain),
      decayEndTime
    );

    // Connect Routing
    osc.connect(voiceGain);
    subGain.connect(voiceGain);
    voiceGain.connect(this.filterNode);

    osc.start(now);
    subOsc.start(now);

    this.activeVoices.set(freq, { osc, subOsc, voiceGain });
  }

  noteOff(freq) {
    if (!this.ctx || !this.activeVoices.has(freq)) return;

    const voice = this.activeVoices.get(freq);
    const now = this.ctx.currentTime;
    const releaseTime = now + this.params.release;

    voice.voiceGain.gain.cancelScheduledValues(now);
    voice.voiceGain.gain.setValueAtTime(voice.voiceGain.gain.value, now);
    voice.voiceGain.gain.exponentialRampToValueAtTime(0.0001, releaseTime);

    voice.osc.stop(releaseTime);
    voice.subOsc.stop(releaseTime);

    setTimeout(() => {
      try {
        voice.osc.disconnect();
        voice.subOsc.disconnect();
        voice.voiceGain.disconnect();
      } catch (_) {}
    }, this.params.release * 1000 + 50);

    this.activeVoices.delete(freq);
  }

  // =========================================================================
  // Combat Sound FX (Synthesized on-the-fly, zero audio samples needed!)
  // =========================================================================

  playLaserSound(pitchMult = 1.0) {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880 * pitchMult, now);
    osc.frequency.exponentialRampToValueAtTime(110 * pitchMult, now + 0.12);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.filterNode);

    osc.start(now);
    osc.stop(now + 0.14);
  }

  playDashSound() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.18);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.24);
  }

  playParrySound() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    // Dual high-sine chime
    [1200, 1800].forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);
      osc.frequency.exponentialRampToValueAtTime(f * 1.5, now + 0.25);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.32);
    });
  }

  playRewindSound() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(750, now + 0.35);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  playExplosionSound() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    // Filtered noise explosion
    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, now);
    filter.frequency.exponentialRampToValueAtTime(40, now + 0.38);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    whiteNoise.start(now);
  }

  playLevelUpSound() {
    this.ensureContext();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880]; // A Major Arpeggio
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + idx * 0.08;

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

      osc.connect(gain);
      gain.connect(this.filterNode);

      osc.start(t);
      osc.stop(t + 0.3);
    });
  }
}
