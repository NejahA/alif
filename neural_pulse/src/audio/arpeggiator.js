/**
 * NEURAL-PULSE // CYBER ARPEGGIATOR & CHORD ENGINE
 * Generates continuous, rhythmic cyberpunk synthwave sequences synced with combat state.
 */

export class Arpeggiator {
  constructor(synthEngine) {
    this.synth = synthEngine;
    this.bpm = 138;
    this.pattern = 'up';
    this.enabled = true;
    this.timerId = null;
    this.stepIndex = 0;
    this.chordIndex = 0;
    this.baseOctave = 3;

    // Cyberpunk Chord Progressions (in Hz)
    this.chords = [
      // Am9: A2, C3, E3, G3, B3
      [110.0, 130.81, 164.81, 196.0, 246.94],
      // Fmaj7: F2, A2, C3, E3, G3
      [87.31, 110.0, 130.81, 164.81, 196.0],
      // Dm7: D2, F2, A2, C3, E3
      [73.42, 87.31, 110.0, 130.81, 164.81],
      // Em7: E2, G2, B2, D3, F#3
      [82.41, 98.0, 123.47, 146.83, 185.0],
    ];

    // Current sequence note pool
    this.currentNotes = [];
    this.updateCurrentNotes();
  }

  start() {
    if (this.timerId) return;
    this.scheduleNextTick();
  }

  stop() {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  setBpm(newBpm) {
    this.bpm = Math.max(60, Math.min(220, newBpm));
  }

  setPattern(newPattern) {
    this.pattern = newPattern;
    this.updateCurrentNotes();
  }

  toggle() {
    this.enabled = !this.enabled;
    if (this.enabled) {
      this.start();
    } else {
      this.stop();
    }
    return this.enabled;
  }

  updateCurrentNotes() {
    const rawChord = this.chords[this.chordIndex % this.chords.length];
    // Extend across 2 octaves
    const extended = [];
    rawChord.forEach(f => extended.push(f));
    rawChord.forEach(f => extended.push(f * 2.0));

    switch (this.pattern) {
      case 'down':
        this.currentNotes = [...extended].reverse();
        break;
      case 'upDown':
        this.currentNotes = [...extended, ...[...extended].slice(1, -1).reverse()];
        break;
      case 'random':
        this.currentNotes = extended;
        break;
      case 'up':
      default:
        this.currentNotes = extended;
        break;
    }
  }

  scheduleNextTick() {
    if (!this.enabled) return;

    // 16th note timing: (60 / BPM) / 4 in milliseconds
    const stepDurationMs = ((60 / this.bpm) / 4) * 1000;

    this.timerId = setTimeout(() => {
      this.tick();
      this.scheduleNextTick();
    }, stepDurationMs);
  }

  tick() {
    if (!this.synth.ctx || this.synth.isMuted || !this.enabled) return;

    let noteFreq;
    if (this.pattern === 'random') {
      noteFreq = this.currentNotes[Math.floor(Math.random() * this.currentNotes.length)];
    } else {
      noteFreq = this.currentNotes[this.stepIndex % this.currentNotes.length];
    }

    // Velocity accent on 1st beat of every 4 steps
    const isAccent = this.stepIndex % 4 === 0;
    const velocity = isAccent ? 0.85 : 0.55;

    // Trigger note
    this.synth.noteOn(noteFreq, velocity);

    // Release note after 75% of step duration for punchy staccato
    const noteDurationMs = ((60 / this.bpm) / 4) * 750;
    setTimeout(() => {
      this.synth.noteOff(noteFreq);
    }, noteDurationMs);

    this.stepIndex++;

    // Advance chord every 16 steps (1 bar)
    if (this.stepIndex % 16 === 0) {
      this.chordIndex = (this.chordIndex + 1) % this.chords.length;
      this.updateCurrentNotes();
    }
  }

  /**
   * Modulates playback according to in-game intensity (combos, overdrive)
   */
  modulateWithCombat(intensity) {
    // Intensity is 0.0 to 1.0
    const targetCutoff = 800 + intensity * 4500;
    const targetReso = 3.0 + intensity * 8.0;
    this.synth.setFilter(targetCutoff, targetReso);
  }
}
