/**
 * AetherWave AudioEngine - Web Audio API Synthesis Engine with 7-Band Equalizer
 */

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.analyser = null;
    this.waveformAnalyser = null;
    this.masterGain = null;
    this.filterNode = null;
    this.delayNode = null;
    this.delayGain = null;
    this.reverbNode = null;
    this.reverbGain = null;
    this.distortionNode = null;
    this.distortionGain = null;
    this.chorusNode = null;
    this.chorusLfo = null;
    this.chorusLfoGain = null;
    this.chorusWetGain = null;
    this.flangerNode = null;
    this.flangerLfo = null;
    this.flangerLfoGain = null;
    this.flangerFeedbackGain = null;
    this.compressorNode = null;
    this.stereoPanner = null;
    this.mediaDestination = null;
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.isRecording = false;

    this.eqBands = [];
    this.eqFrequencies = [60, 150, 400, 1000, 2400, 6000, 15000];

    this.activeOscillators = new Map();
    this.droneOscillators = [];
    this.noiseNode = null;
    this.noiseGain = null;

    this.arpInterval = null;
    this.arpStep = 0;
    this.arpBpm = 110;
    this.arpIsPlaying = false;
    this.arpPattern = 'up';
    this.arpOctaves = 2;
    this.arpGate = 0.7;
    this.currentScale = 'ambientMinor';
    this.rootNote = 220;

    this.loopBuffer = null;
    this.loopSource = null;
    this.loopIsPlaying = false;
    this.loopGain = null;

    this.masterBpm = 110;

    this.params = {
      masterVolume: 0.8,
      filterCutoff: 2500,
      filterResonance: 3,
      waveform: 'sawtooth',
      osc2Waveform: 'square',
      osc2Detune: 12,
      osc2Mix: 0.4,
      subOscGain: 0.3,
      unisonVoices: 3,
      pumpDucking: 0.4,
      attack: 0.08,
      decay: 0.3,
      sustain: 0.7,
      release: 1.0,
      delayTime: 0.35,
      delayFeedback: 0.4,
      reverbWet: 0.5,
      distortionAmount: 0,
      distortionWet: 0,
      chorusRate: 0.3,
      chorusDepth: 0.02,
      chorusWet: 0.2,
      flangerRate: 0.5,
      flangerDepth: 0.005,
      flangerFeedback: 0.4,
      flangerWet: 0,
      compressorThreshold: -24,
      compressorRatio: 4,
      compressorAttack: 0.003,
      compressorRelease: 0.25,
      stereoPan: 0,
      binauralFreq: 432,
      binauralBeat: 4,
      noiseVolume: 0.05,
      scaleName: 'cyberpunk',
      loopVolume: 0.8,
      tapeSaturation: 0.2,
      lfoRate: 1.5,
      lfoDepth: 400
    };

    this.pumpJamInterval = null;
    this.isPumpJamming = false;
    this.pumpJamStep = 0;

    // Scale Frequencies (Multipliers from Root)
    this.scales = {
      ambientMinor: [1, 9/8, 6/5, 4/3, 3/2, 8/5, 9/5, 2],
      pentatonic: [1, 9/8, 81/64, 3/2, 27/16, 2],
      dorian: [1, 9/8, 6/5, 4/3, 3/2, 5/3, 16/9, 2],
      lydian: [1, 9/8, 81/64, 729/512, 3/2, 27/16, 243/128, 2],
      cyberpunk: [1, 16/15, 6/5, 4/3, 45/32, 8/5, 9/5, 2],
      harmonicMinor: [1, 9/8, 6/5, 4/3, 3/2, 8/5, 15/8, 2],
      phrygian: [1, 16/15, 6/5, 4/3, 3/2, 8/5, 9/5, 2],
      mixolydian: [1, 9/8, 5/4, 4/3, 3/2, 5/3, 16/9, 2]
    };
  }

  init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioCtx();

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.85;

    this.waveformAnalyser = this.ctx.createAnalyser();
    this.waveformAnalyser.fftSize = 2048;
    this.waveformAnalyser.smoothingTimeConstant = 0.4;

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.params.masterVolume, this.ctx.currentTime);

    this.filterNode = this.ctx.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.setValueAtTime(this.params.filterCutoff, this.ctx.currentTime);
    this.filterNode.Q.setValueAtTime(this.params.filterResonance, this.ctx.currentTime);

    this.eqBands = this.eqFrequencies.map((freq, i) => {
      const eq = this.ctx.createBiquadFilter();
      if (i === 0) eq.type = 'lowshelf';
      else if (i === this.eqFrequencies.length - 1) eq.type = 'highshelf';
      else eq.type = 'peaking';
      eq.frequency.setValueAtTime(freq, this.ctx.currentTime);
      eq.gain.setValueAtTime(0, this.ctx.currentTime);
      return eq;
    });

    for (let i = 0; i < this.eqBands.length - 1; i++) {
      this.eqBands[i].connect(this.eqBands[i + 1]);
    }

    this.delayNode = this.ctx.createDelay();
    this.delayNode.delayTime.setValueAtTime(this.params.delayTime, this.ctx.currentTime);

    this.delayGain = this.ctx.createGain();
    this.delayGain.gain.setValueAtTime(this.params.delayFeedback, this.ctx.currentTime);

    this.reverbNode = this.ctx.createConvolver();
    this.createReverbBuffer();

    this.reverbGain = this.ctx.createGain();
    this.reverbGain.gain.setValueAtTime(this.params.reverbWet, this.ctx.currentTime);

    this.distortionNode = this.ctx.createWaveShaper();
    this.distortionNode.oversample = '4x';
    this.buildDistortionCurve(this.params.distortionAmount);
    this.distortionGain = this.ctx.createGain();
    this.distortionGain.gain.setValueAtTime(this.params.distortionWet, this.ctx.currentTime);

    this.chorusNode = this.ctx.createDelay();
    this.chorusNode.delayTime.setValueAtTime(0.03, this.ctx.currentTime);
    this.chorusLfo = this.ctx.createOscillator();
    this.chorusLfo.type = 'sine';
    this.chorusLfo.frequency.setValueAtTime(this.params.chorusRate, this.ctx.currentTime);
    this.chorusLfoGain = this.ctx.createGain();
    this.chorusLfoGain.gain.setValueAtTime(this.params.chorusDepth, this.ctx.currentTime);
    this.chorusLfo.connect(this.chorusLfoGain);
    this.chorusLfoGain.connect(this.chorusNode.delayTime);
    this.chorusWetGain = this.ctx.createGain();
    this.chorusWetGain.gain.setValueAtTime(this.params.chorusWet, this.ctx.currentTime);
    this.chorusLfo.start();

    this.flangerNode = this.ctx.createDelay();
    this.flangerNode.delayTime.setValueAtTime(0.005, this.ctx.currentTime);
    this.flangerLfo = this.ctx.createOscillator();
    this.flangerLfo.type = 'sine';
    this.flangerLfo.frequency.setValueAtTime(this.params.flangerRate, this.ctx.currentTime);
    this.flangerLfoGain = this.ctx.createGain();
    this.flangerLfoGain.gain.setValueAtTime(this.params.flangerDepth, this.ctx.currentTime);
    this.flangerLfo.connect(this.flangerLfoGain);
    this.flangerLfoGain.connect(this.flangerNode.delayTime);
    this.flangerFeedbackGain = this.ctx.createGain();
    this.flangerFeedbackGain.gain.setValueAtTime(this.params.flangerFeedback, this.ctx.currentTime);
    this.flangerWetGain = this.ctx.createGain();
    this.flangerWetGain.gain.setValueAtTime(this.params.flangerWet, this.ctx.currentTime);
    this.flangerLfo.start();

    this.compressorNode = this.ctx.createDynamicsCompressor();
    this.compressorNode.threshold.setValueAtTime(this.params.compressorThreshold, this.ctx.currentTime);
    this.compressorNode.knee.setValueAtTime(30, this.ctx.currentTime);
    this.compressorNode.ratio.setValueAtTime(this.params.compressorRatio, this.ctx.currentTime);
    this.compressorNode.attack.setValueAtTime(this.params.compressorAttack, this.ctx.currentTime);
    this.compressorNode.release.setValueAtTime(this.params.compressorRelease, this.ctx.currentTime);

    if (this.ctx.createStereoPanner) {
      this.stereoPanner = this.ctx.createStereoPanner();
      this.stereoPanner.pan.setValueAtTime(this.params.stereoPan, this.ctx.currentTime);
    }

    this.loopGain = this.ctx.createGain();
    this.loopGain.gain.setValueAtTime(this.params.loopVolume, this.ctx.currentTime);

    this.mediaDestination = this.ctx.createMediaStreamDestination();

    this.filterNode.connect(this.eqBands[0]);
    const lastEq = this.eqBands[this.eqBands.length - 1];
    lastEq.connect(this.compressorNode);

    this.filterNode.connect(this.delayNode);
    this.delayNode.connect(this.delayGain);
    this.delayGain.connect(this.delayNode);
    this.delayGain.connect(this.compressorNode);

    this.filterNode.connect(this.reverbNode);
    this.reverbNode.connect(this.reverbGain);
    this.reverbGain.connect(this.compressorNode);

    this.filterNode.connect(this.distortionNode);
    this.distortionNode.connect(this.distortionGain);
    this.distortionGain.connect(this.compressorNode);

    this.filterNode.connect(this.chorusNode);
    this.chorusNode.connect(this.chorusWetGain);
    this.chorusWetGain.connect(this.compressorNode);

    this.filterNode.connect(this.flangerNode);
    this.flangerNode.connect(this.flangerFeedbackGain);
    this.flangerFeedbackGain.connect(this.flangerNode);
    this.flangerNode.connect(this.flangerWetGain);
    this.flangerWetGain.connect(this.compressorNode);

    this.loopGain.connect(this.compressorNode);

    if (this.stereoPanner) {
      this.compressorNode.connect(this.stereoPanner);
      this.stereoPanner.connect(this.masterGain);
    } else {
      this.compressorNode.connect(this.masterGain);
    }

    this.masterGain.connect(this.analyser);
    this.masterGain.connect(this.waveformAnalyser);
    this.analyser.connect(this.ctx.destination);
    this.waveformAnalyser.connect(this.ctx.destination);
    this.masterGain.connect(this.mediaDestination);

    this.startNoiseGenerator();
  }

  setEqBandGain(bandIdx, gainDb) {
    if (this.eqBands[bandIdx] && this.ctx) {
      this.eqBands[bandIdx].gain.setTargetAtTime(gainDb, this.ctx.currentTime, 0.05);
    }
  }

  createReverbBuffer() {
    if (!this.ctx) return;
    const sampleRate = this.ctx.sampleRate;
    const length = sampleRate * 2.5;
    const buffer = this.ctx.createBuffer(2, length, sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.5);
      }
    }
    this.reverbNode.buffer = buffer;
  }

  buildDistortionCurve(amount) {
    if (!this.ctx) return;
    const k = amount * 100;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; i++) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    if (this.distortionNode) {
      this.distortionNode.curve = curve;
    }
  }

  updateParam(key, value) {
    this.params[key] = value;
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (key === 'masterVolume' && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(value, now, 0.05);
    } else if (key === 'filterCutoff' && this.filterNode) {
      this.filterNode.frequency.setTargetAtTime(value, now, 0.05);
    } else if (key === 'filterResonance' && this.filterNode) {
      this.filterNode.Q.setTargetAtTime(value, now, 0.05);
    } else if (key === 'delayTime' && this.delayNode) {
      this.delayNode.delayTime.setTargetAtTime(value, now, 0.05);
    } else if (key === 'delayFeedback' && this.delayGain) {
      this.delayGain.gain.setTargetAtTime(value, now, 0.05);
    } else if (key === 'reverbWet' && this.reverbGain) {
      this.reverbGain.gain.setTargetAtTime(value, now, 0.05);
    } else if (key === 'distortionAmount') {
      this.buildDistortionCurve(value);
    } else if (key === 'distortionWet' && this.distortionGain) {
      this.distortionGain.gain.setTargetAtTime(value, now, 0.05);
    } else if (key === 'chorusWet' && this.chorusWetGain) {
      this.chorusWetGain.gain.setTargetAtTime(value, now, 0.05);
    } else if (key === 'flangerWet' && this.flangerWetGain) {
      this.flangerWetGain.gain.setTargetAtTime(value, now, 0.05);
    } else if (key === 'noiseVolume' && this.noiseGain) {
      this.noiseGain.gain.setTargetAtTime(value, now, 0.05);
    }
  }

  playNote(freq, duration = 0.8, wave = null) {
    if (!this.ctx) this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const now = this.ctx.currentTime;
    const noteGain = this.ctx.createGain();
    const { attack, decay, sustain, release, waveform, osc2Waveform, osc2Detune, osc2Mix, subOscGain, unisonVoices } = this.params;

    const mainWave = wave || waveform;
    const maxGain = 0.32;

    noteGain.gain.setValueAtTime(0, now);
    noteGain.gain.linearRampToValueAtTime(maxGain, now + attack);
    noteGain.gain.exponentialRampToValueAtTime(maxGain * sustain, now + attack + decay);
    noteGain.gain.setValueAtTime(maxGain * sustain, now + Math.max(attack + decay, duration - release));
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    // Osc 1 (Main + Unison stack)
    const voices = unisonVoices || 1;
    const detunes = voices === 3 ? [-12, 0, 12] : voices === 5 ? [-20, -10, 0, 10, 20] : [0];
    
    detunes.forEach(cents => {
      const osc = this.ctx.createOscillator();
      osc.type = mainWave;
      osc.frequency.setValueAtTime(freq * Math.pow(2, cents / 1200), now);
      const voiceGain = this.ctx.createGain();
      voiceGain.gain.setValueAtTime(1 / voices, now);
      osc.connect(voiceGain);
      voiceGain.connect(noteGain);
      osc.start(now);
      osc.stop(now + duration + 0.1);
    });

    // Osc 2 (Dual Oscillator)
    if (osc2Mix > 0) {
      const osc2 = this.ctx.createOscillator();
      osc2.type = osc2Waveform || 'square';
      const osc2Freq = freq * Math.pow(2, (osc2Detune || 0) / 1200);
      osc2.frequency.setValueAtTime(osc2Freq, now);

      const osc2GainNode = this.ctx.createGain();
      osc2GainNode.gain.setValueAtTime(osc2Mix * 0.8, now);
      osc2.connect(osc2GainNode);
      osc2GainNode.connect(noteGain);
      osc2.start(now);
      osc2.stop(now + duration + 0.1);
    }

    // Sub Oscillator (1 Octave Below)
    if (subOscGain > 0) {
      const subOsc = this.ctx.createOscillator();
      subOsc.type = 'triangle';
      subOsc.frequency.setValueAtTime(freq / 2, now);

      const subGainNode = this.ctx.createGain();
      subGainNode.gain.setValueAtTime(subOscGain * 0.9, now);
      subOsc.connect(subGainNode);
      subGainNode.connect(noteGain);
      subOsc.start(now);
      subOsc.stop(now + duration + 0.1);
    }

    noteGain.connect(this.filterNode);
  }

  // DJ Performance FX: Tape Stop
  triggerTapeStop() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.params.masterVolume, now);
    this.masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    setTimeout(() => {
      if (this.ctx && this.masterGain) {
        const resetTime = this.ctx.currentTime;
        this.masterGain.gain.cancelScheduledValues(resetTime);
        this.masterGain.gain.linearRampToValueAtTime(this.params.masterVolume, resetTime + 0.1);
      }
    }, 700);
  }

  // DJ Performance FX: Stutter Gate
  triggerStutter(pulses = 6) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const stepDuration = 0.05;
    for (let i = 0; i < pulses; i++) {
      const t = now + i * stepDuration;
      this.masterGain.gain.setValueAtTime(i % 2 === 0 ? 0.05 : this.params.masterVolume, t);
    }
    setTimeout(() => {
      if (this.ctx && this.masterGain) {
        this.masterGain.gain.setValueAtTime(this.params.masterVolume, this.ctx.currentTime);
      }
    }, pulses * stepDuration * 1000 + 50);
  }

  // 360° Spatial Audio Auto-Orbit Panner
  toggleAutoPan() {
    this.isAutoPanning = !this.isAutoPanning;
    if (this.autoPanInterval) {
      clearInterval(this.autoPanInterval);
      this.autoPanInterval = null;
    }
    if (this.isAutoPanning) {
      let angle = 0;
      this.autoPanInterval = setInterval(() => {
        angle += 0.08;
        const pan = Math.sin(angle);
        if (this.stereoPanner && this.ctx) {
          this.stereoPanner.pan.setTargetAtTime(pan, this.ctx.currentTime, 0.05);
        }
      }, 50);
    } else {
      if (this.stereoPanner && this.ctx) {
        this.stereoPanner.pan.setTargetAtTime(0, this.ctx.currentTime, 0.05);
      }
    }
    return this.isAutoPanning;
  }

  // Real-time Stereo VU Peak Levels
  getStereoLevels() {
    if (!this.analyser) return { left: 0, right: 0 };
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    let sumL = 0, sumR = 0;
    const half = Math.floor(data.length / 2);
    for (let i = 0; i < half; i++) sumL += data[i];
    for (let i = half; i < data.length; i++) sumR += data[i];
    return {
      left: Math.min(1, (sumL / half) / 180),
      right: Math.min(1, (sumR / half) / 180)
    };
  }

  // ⚡ PUMP IT UP! Turbo Jam Engine
  togglePumpJam(onStep) {
    if (this.isPumpJamming) {
      return this.stopPumpJam();
    } else {
      return this.startPumpJam(onStep);
    }
  }

  startPumpJam(onStep) {
    this.init();
    this.isPumpJamming = true;
    this.pumpJamStep = 0;

    // Set parameters for hyper energetic synthwave jam
    this.params.masterVolume = 0.85;
    this.params.waveform = 'sawtooth';
    this.params.osc2Waveform = 'square';
    this.params.osc2Mix = 0.5;
    this.params.subOscGain = 0.4;
    this.params.filterCutoff = 3800;
    this.params.delayFeedback = 0.35;
    this.params.reverbWet = 0.4;

    const bassNotes = [110, 110, 130.81, 146.83, 110, 98, 130.81, 146.83]; // A2, C3, D2
    const leadNotes = [440, 523.25, 659.25, 587.33, 659.25, 783.99, 880, 783.99]; // A4, C5, E5, D5, E5, G5, A5

    const intervalMs = (60 / (this.masterBpm || 128) / 4) * 1000;

    this.pumpJamInterval = setInterval(() => {
      const step = this.pumpJamStep;
      
      // Play driving synth bass on 16th notes
      if (step % 2 === 0) {
        const bassFreq = bassNotes[(Math.floor(step / 2)) % bassNotes.length];
        this.playNote(bassFreq, 0.2, 'sawtooth');
      }

      // Play Arp lead melody
      if (step % 4 === 1 || step % 4 === 3 || step % 8 === 6) {
        const leadFreq = leadNotes[step % leadNotes.length];
        this.playNote(leadFreq, 0.15, 'square');
      }

      // Play chord stab on quarter notes
      if (step % 8 === 0) {
        this.playNote(220, 0.4);
        this.playNote(261.63, 0.4);
        this.playNote(329.63, 0.4);
      }

      if (onStep) onStep(step);
      this.pumpJamStep = (this.pumpJamStep + 1) % 32;
    }, intervalMs);

    return true;
  }

  stopPumpJam() {
    if (this.pumpJamInterval) {
      clearInterval(this.pumpJamInterval);
      this.pumpJamInterval = null;
    }
    this.isPumpJamming = false;
    this.pumpJamStep = 0;
    return false;
  }

  triggerChord(scaleIndex) {
    const scale = this.scales[this.params.scaleName] || this.scales.ambientMinor;
    const root = this.rootNote;
    const baseFreq = root * (scale[scaleIndex % scale.length] || 1);

    this.playNote(baseFreq, 1.2);
    this.playNote(baseFreq * 1.25, 1.2);
    this.playNote(baseFreq * 1.5, 1.2);
  }

  setBinauralBeats(enabled) {
    if (!this.ctx) this.init();
    if (!enabled) {
      this.droneOscillators.forEach(osc => osc.stop());
      this.droneOscillators = [];
      return;
    }

    if (this.droneOscillators.length > 0) return;

    const baseFreq = this.params.binauralFreq;
    const beatFreq = this.params.binauralBeat;

    const oscL = this.ctx.createOscillator();
    const panL = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    const gainL = this.ctx.createGain();
    oscL.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
    gainL.gain.setValueAtTime(0.08, this.ctx.currentTime);
    if (panL) panL.pan.setValueAtTime(-1, this.ctx.currentTime);

    const oscR = this.ctx.createOscillator();
    const panR = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    const gainR = this.ctx.createGain();
    oscR.frequency.setValueAtTime(baseFreq + beatFreq, this.ctx.currentTime);
    gainR.gain.setValueAtTime(0.08, this.ctx.currentTime);
    if (panR) panR.pan.setValueAtTime(1, this.ctx.currentTime);

    if (panL && panR) {
      oscL.connect(gainL).connect(panL).connect(this.filterNode);
      oscR.connect(gainR).connect(panR).connect(this.filterNode);
    } else {
      oscL.connect(gainL).connect(this.filterNode);
      oscR.connect(gainR).connect(this.filterNode);
    }

    oscL.start();
    oscR.start();

    this.droneOscillators = [oscL, oscR];
  }

  startNoiseGenerator() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.05;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    this.noiseGain = this.ctx.createGain();
    this.noiseGain.gain.setValueAtTime(this.params.noiseVolume, this.ctx.currentTime);

    whiteNoise.connect(this.noiseGain);
    this.noiseGain.connect(this.filterNode);
    whiteNoise.start();
    this.noiseNode = whiteNoise;
  }

  toggleArpeggiator(onStepCallback) {
    if (this.arpIsPlaying) {
      clearInterval(this.arpInterval);
      this.arpIsPlaying = false;
      return false;
    }

    this.arpIsPlaying = true;
    this.arpStep = 0;
    const intervalMs = (60 / this.arpBpm / 2) * 1000;
    const scale = this.scales[this.params.scaleName] || this.scales.ambientMinor;
    const totalNotes = scale.length * this.arpOctaves;

    const getNoteIndex = (step) => {
      switch (this.arpPattern) {
        case 'down':
          return totalNotes - 1 - (step % totalNotes);
        case 'updown': {
          const cycle = totalNotes * 2 - 2;
          const mod = step % cycle;
          return mod < totalNotes ? mod : cycle - mod;
        }
        case 'random':
          return Math.floor(Math.random() * totalNotes);
        case 'up':
        default:
          return step % totalNotes;
      }
    };

    this.arpInterval = setInterval(() => {
      const noteIdx = getNoteIndex(this.arpStep);
      const scaleIdx = noteIdx % scale.length;
      const octaveIdx = Math.floor(noteIdx / scale.length);
      const noteMultiplier = scale[scaleIdx];
      const octave = Math.pow(2, octaveIdx);
      const freq = this.rootNote * noteMultiplier * octave;
      const noteDuration = Math.max(0.05, (intervalMs / 1000) * this.arpGate);

      this.playNote(freq, noteDuration, this.params.waveform);

      if (onStepCallback) onStepCallback(scaleIdx, noteIdx);
      this.arpStep++;
    }, intervalMs);

    return true;
  }

  updateParam(key, value) {
    this.params[key] = value;
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    if (key === 'masterVolume' && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(value, t, 0.05);
    } else if (key === 'filterCutoff' && this.filterNode) {
      this.filterNode.frequency.setTargetAtTime(value, t, 0.05);
    } else if (key === 'filterResonance' && this.filterNode) {
      this.filterNode.Q.setTargetAtTime(value, t, 0.05);
    } else if (key === 'delayTime' && this.delayNode) {
      this.delayNode.delayTime.setTargetAtTime(value, t, 0.05);
    } else if (key === 'delayFeedback' && this.delayGain) {
      this.delayGain.gain.setTargetAtTime(value, t, 0.05);
    } else if (key === 'reverbWet' && this.reverbGain) {
      this.reverbGain.gain.setTargetAtTime(value, t, 0.05);
    } else if (key === 'noiseVolume' && this.noiseGain) {
      this.noiseGain.gain.setTargetAtTime(value, t, 0.05);
    } else if (key === 'distortionAmount') {
      this.buildDistortionCurve(value);
    } else if (key === 'distortionWet' && this.distortionGain) {
      this.distortionGain.gain.setTargetAtTime(value, t, 0.05);
    } else if (key === 'chorusRate' && this.chorusLfo) {
      this.chorusLfo.frequency.setTargetAtTime(value, t, 0.05);
    } else if (key === 'chorusDepth' && this.chorusLfoGain) {
      this.chorusLfoGain.gain.setTargetAtTime(value, t, 0.05);
    } else if (key === 'chorusWet' && this.chorusWetGain) {
      this.chorusWetGain.gain.setTargetAtTime(value, t, 0.05);
    } else if (key === 'flangerRate' && this.flangerLfo) {
      this.flangerLfo.frequency.setTargetAtTime(value, t, 0.05);
    } else if (key === 'flangerDepth' && this.flangerLfoGain) {
      this.flangerLfoGain.gain.setTargetAtTime(value, t, 0.05);
    } else if (key === 'flangerFeedback' && this.flangerFeedbackGain) {
      this.flangerFeedbackGain.gain.setTargetAtTime(value, t, 0.05);
    } else if (key === 'flangerWet' && this.flangerWetGain) {
      this.flangerWetGain.gain.setTargetAtTime(value, t, 0.05);
    } else if (key === 'compressorThreshold' && this.compressorNode) {
      this.compressorNode.threshold.setTargetAtTime(value, t, 0.05);
    } else if (key === 'compressorRatio' && this.compressorNode) {
      this.compressorNode.ratio.setTargetAtTime(value, t, 0.05);
    } else if (key === 'compressorAttack' && this.compressorNode) {
      this.compressorNode.attack.setTargetAtTime(value, t, 0.05);
    } else if (key === 'compressorRelease' && this.compressorNode) {
      this.compressorNode.release.setTargetAtTime(value, t, 0.05);
    } else if (key === 'stereoPan' && this.stereoPanner) {
      this.stereoPanner.pan.setTargetAtTime(value, t, 0.05);
    } else if (key === 'loopVolume' && this.loopGain) {
      this.loopGain.gain.setTargetAtTime(value, t, 0.05);
    }
  }

  getWaveformData() {
    if (!this.waveformAnalyser) return new Uint8Array(0);
    const bufferLength = this.waveformAnalyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);
    this.waveformAnalyser.getByteTimeDomainData(dataArray);
    return dataArray;
  }

  getSpectrumDataHighRes() {
    if (!this.waveformAnalyser) return new Uint8Array(0);
    const dataArray = new Uint8Array(this.waveformAnalyser.frequencyBinCount);
    this.waveformAnalyser.getByteFrequencyData(dataArray);
    return dataArray;
  }

  async recordLoop(durationMs = 4000) {
    if (!this.ctx) this.init();
    const sampleRate = this.ctx.sampleRate;
    const numChannels = 2;
    const length = sampleRate * (durationMs / 1000);
    const offlineCtx = new OfflineAudioContext(numChannels, length, sampleRate);

    const now = this.ctx.currentTime;
    const future = now + 0.1;
    const dest = this.ctx.createMediaStreamDestination();
    const rec = new MediaRecorder(dest.stream);
    const chunks = [];

    const splitter = this.ctx.createGain();
    splitter.gain.value = 0;
    this.masterGain.connect(splitter);
    splitter.connect(dest);

    rec.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
    rec.start();

    await new Promise(resolve => setTimeout(resolve, durationMs));

    return new Promise((resolve) => {
      rec.onstop = async () => {
        try {
          splitter.disconnect();
          const blob = new Blob(chunks, { type: 'audio/webm' });
          const arrayBuffer = await blob.arrayBuffer();
          const audioBuf = await this.ctx.decodeAudioData(arrayBuffer.slice(0));
          this.loopBuffer = audioBuf;
          resolve(true);
        } catch (err) {
          console.warn('Loop decode error:', err);
          resolve(false);
        }
      };
      rec.stop();
    });
  }

  toggleLoopPlayback() {
    if (!this.loopBuffer) return false;
    if (this.loopIsPlaying) {
      if (this.loopSource) this.loopSource.stop();
      this.loopSource = null;
      this.loopIsPlaying = false;
      return false;
    }
    const src = this.ctx.createBufferSource();
    src.buffer = this.loopBuffer;
    src.loop = true;
    src.connect(this.loopGain);
    src.start();
    this.loopSource = src;
    this.loopIsPlaying = true;
    return true;
  }

  clearLoop() {
    if (this.loopIsPlaying && this.loopSource) this.loopSource.stop();
    this.loopSource = null;
    this.loopIsPlaying = false;
    this.loopBuffer = null;
  }

  exportMidi(scaleNotes = []) {
    const scale = this.scales[this.params.scaleName] || this.scales.ambientMinor;
    const bpm = this.masterBpm;
    const header = [0x4d, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 0, 0, 1, 0, 0x60];
    const track = [];
    const tempoMeta = [0, 0xff, 0x51, 0x03, 0x07, 0xa1, 0x20];
    track.push(...tempoMeta);

    const ticksPerStep = 24;
    const totalSteps = 32;

    for (let step = 0; step < totalSteps; step++) {
      const noteIdx = step % scale.length;
      const freq = this.rootNote * scale[noteIdx];
      const midiNote = Math.round(12 * Math.log2(freq / 440) + 69);
      const velocity = 0x64;
      track.push(0, 0x90, Math.max(0, Math.min(127, midiNote)), velocity);
      track.push(ticksPerStep, 0x80, Math.max(0, Math.min(127, midiNote)), 0);
    }

    const endOfTrack = [0, 0xff, 0x2f, 0x00];
    track.push(...endOfTrack);

    const trackLen = track.length;
    const trackHeader = [0x4d, 0x54, 0x72, 0x6b, (trackLen >> 24) & 0xff, (trackLen >> 16) & 0xff, (trackLen >> 8) & 0xff, trackLen & 0xff];

    const midi = new Uint8Array([...header, ...trackHeader, ...track]);
    const blob = new Blob([midi], { type: 'audio/midi' });
    return URL.createObjectURL(blob);
  }

  startRecording() {
    if (!this.ctx) this.init();
    if (this.isRecording) return;

    this.recordedChunks = [];
    try {
      this.mediaRecorder = new MediaRecorder(this.mediaDestination.stream);
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.recordedChunks.push(e.data);
        }
      };
      this.mediaRecorder.start();
      this.isRecording = true;
      return true;
    } catch (err) {
      console.error('MediaRecorder error:', err);
      return false;
    }
  }

  stopRecording() {
    if (!this.isRecording || !this.mediaRecorder) return null;

    return new Promise((resolve) => {
      this.mediaRecorder.onstop = () => {
        this.isRecording = false;
        const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        resolve(url);
      };
      this.mediaRecorder.stop();
    });
  }

  getFrequencyData() {
    if (!this.analyser) return new Uint8Array(0);
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }
}

export const audioEngine = new AudioEngine();
