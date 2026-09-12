/**
 * GenerativeComposer - Algorithmic Music & Chord Progression Generator Engine
 */

import { audioEngine } from './AudioEngine';
import { drumEngine } from './DrumEngine';

class GenerativeComposer {
  constructor() {
    this.isPlaying = false;
    this.timerId = null;
    this.currentStep = 0;
    this.currentMood = 'cyberpunk';
    this.chaos = 0.3; // 0 to 1
    this.density = 0.7; // 0 to 1

    this.moods = {
      cyberpunk: {
        bpm: 124,
        scale: 'cyberpunk',
        rootFreq: 110, // A2
        chords: [
          [1, 1.2, 1.5], // Am
          [0.89, 1.06, 1.33], // F
          [1.12, 1.33, 1.68], // C
          [1.0, 1.18, 1.41]  // G
        ],
        drumPreset: 'cyberpump',
        wave: 'sawtooth',
        cutoff: 4200
      },
      synthwave: {
        bpm: 118,
        scale: 'ambientMinor',
        rootFreq: 130.81, // C3
        chords: [
          [1, 1.25, 1.5, 1.875], // Cmaj7
          [0.84, 1.05, 1.26, 1.57], // Am7
          [0.67, 0.84, 1.0, 1.25],  // Fmaj7
          [0.75, 0.94, 1.12, 1.41]  // G7
        ],
        drumPreset: 'synthwave',
        wave: 'sawtooth',
        cutoff: 3500
      },
      vaporwave: {
        bpm: 95,
        scale: 'lydian',
        rootFreq: 146.83, // D3
        chords: [
          [1, 1.25, 1.5, 1.875],
          [1.12, 1.4, 1.68, 2.1],
          [0.89, 1.12, 1.33, 1.68],
          [0.75, 0.94, 1.12, 1.41]
        ],
        drumPreset: 'discofunk',
        wave: 'square',
        cutoff: 2200
      },
      techno: {
        bpm: 132,
        scale: 'dorian',
        rootFreq: 98, // G2
        chords: [
          [1, 1.2],
          [1.18, 1.41],
          [0.89, 1.06],
          [1.0, 1.2]
        ],
        drumPreset: 'techno',
        wave: 'sawtooth',
        cutoff: 5500
      }
    };
  }

  generateTrack(moodKey = 'cyberpunk') {
    const config = this.moods[moodKey] || this.moods.cyberpunk;
    this.currentMood = moodKey;

    // Apply engine parameters
    audioEngine.masterBpm = config.bpm;
    audioEngine.arpBpm = config.bpm;
    drumEngine.bpm = config.bpm;
    drumEngine.loadPreset(config.drumPreset);

    audioEngine.updateParam('waveform', config.wave);
    audioEngine.updateParam('filterCutoff', config.cutoff);
    audioEngine.updateParam('reverbWet', 0.45);
    audioEngine.updateParam('delayFeedback', 0.35);

    return {
      mood: moodKey,
      bpm: config.bpm,
      scale: config.scale,
      chordCount: config.chords.length
    };
  }

  toggleComposition(onStepCallback) {
    if (this.isPlaying) {
      clearInterval(this.timerId);
      this.isPlaying = false;
      drumEngine.toggleSequencer();
      return false;
    }

    this.generateTrack(this.currentMood);
    audioEngine.init();
    drumEngine.toggleSequencer();

    this.isPlaying = true;
    const config = this.moods[this.currentMood];
    const stepMs = (60 / config.bpm / 4) * 1000;

    this.timerId = setInterval(() => {
      const step = this.currentStep;
      const chordIdx = Math.floor(step / 8) % config.chords.length;
      const currentChord = config.chords[chordIdx];

      // Bassline on 16th notes
      if (step % 2 === 0) {
        const bassFreq = config.rootFreq * currentChord[0];
        audioEngine.playNote(bassFreq, 0.18, 'sawtooth');
      }

      // Chord Pad Stabs on step 0 and 4
      if (step % 8 === 0 || (this.chaos > 0.4 && step % 8 === 4)) {
        currentChord.forEach(multiplier => {
          audioEngine.playNote(config.rootFreq * multiplier * 2, 0.5, config.wave);
        });
      }

      // Arpeggiated Melody Lead
      if (Math.random() < this.density) {
        const noteMult = currentChord[step % currentChord.length] || 1;
        const octaveMult = (step % 4 === 3) ? 4 : 2;
        audioEngine.playNote(config.rootFreq * noteMult * octaveMult, 0.15, 'square');
      }

      if (onStepCallback) onStepCallback(step);
      this.currentStep = (this.currentStep + 1) % 32;
    }, stepMs);

    return true;
  }
}

export const generativeComposer = new GenerativeComposer();
