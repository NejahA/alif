/**
 * PianoRollEngine - 16-Step Interactive DAW Piano Roll Melody Sequencer
 */

import { audioEngine } from './AudioEngine';

class PianoRollEngine {
  constructor() {
    this.isPlaying = false;
    this.currentStep = 0;
    this.timerId = null;
    this.bpm = 110;

    this.notes = [
      { name: 'C4',  freq: 523.25, isBlack: false },
      { name: 'B3',  freq: 493.88, isBlack: false },
      { name: 'A#3', freq: 466.16, isBlack: true  },
      { name: 'A3',  freq: 440.00, isBlack: false },
      { name: 'G#3', freq: 415.30, isBlack: true  },
      { name: 'G3',  freq: 392.00, isBlack: false },
      { name: 'F#3', freq: 369.99, isBlack: true  },
      { name: 'F3',  freq: 349.23, isBlack: false },
      { name: 'E3',  freq: 329.63, isBlack: false },
      { name: 'D#3', freq: 311.13, isBlack: true  },
      { name: 'D3',  freq: 293.66, isBlack: false },
      { name: 'C3',  freq: 261.63, isBlack: false }
    ];

    // Grid: 12 rows x 16 steps
    this.grid = Array.from({ length: 12 }, () => Array(16).fill(0));

    // Seed initial catchy synth melody
    this.grid[0][0] = 1;  // C4
    this.grid[3][2] = 1;  // A3
    this.grid[5][4] = 1;  // G3
    this.grid[7][6] = 1;  // F3
    this.grid[8][8] = 1;  // E3
    this.grid[10][10] = 1; // D3
    this.grid[11][12] = 1; // C3
    this.grid[3][14] = 1;  // A3
  }

  toggleCell(rowIdx, stepIdx) {
    if (this.grid[rowIdx]) {
      this.grid[rowIdx][stepIdx] = this.grid[rowIdx][stepIdx] ? 0 : 1;
    }
  }

  clearGrid() {
    this.grid = Array.from({ length: 12 }, () => Array(16).fill(0));
  }

  randomizeGrid() {
    this.clearGrid();
    for (let step = 0; step < 16; step++) {
      if (Math.random() < 0.6) {
        const randomRow = Math.floor(Math.random() * 12);
        this.grid[randomRow][step] = 1;
      }
    }
  }

  toggleSequencer(onStepCallback) {
    if (this.isPlaying) {
      clearInterval(this.timerId);
      this.isPlaying = false;
      this.currentStep = 0;
      return false;
    }

    audioEngine.init();
    this.isPlaying = true;
    const stepMs = (60 / (audioEngine.masterBpm || this.bpm) / 4) * 1000;

    this.timerId = setInterval(() => {
      const step = this.currentStep;

      for (let row = 0; row < 12; row++) {
        if (this.grid[row][step]) {
          audioEngine.playNote(this.notes[row].freq, 0.25);
        }
      }

      if (onStepCallback) onStepCallback(step);
      this.currentStep = (this.currentStep + 1) % 16;
    }, stepMs);

    return true;
  }
}

export const pianoRollEngine = new PianoRollEngine();
