/**
 * NEURAL-PULSE // INTERACTIVE SYNTH KEYBOARD
 * Virtual 2-Octave interactive piano keyboard with PC keyboard bindings and touch response.
 */

export class SynthKeyboard {
  constructor(containerId, synthEngine) {
    this.container = document.getElementById(containerId);
    this.synth = synthEngine;
    this.octave = 3;

    // Note frequencies table for base octave 3
    this.notes = [
      { name: 'C', isBlack: false, semitones: 0, key: 'a' },
      { name: 'C#', isBlack: true, semitones: 1, key: 'w' },
      { name: 'D', isBlack: false, semitones: 2, key: 's' },
      { name: 'D#', isBlack: true, semitones: 3, key: 'e' },
      { name: 'E', isBlack: false, semitones: 4, key: 'd' },
      { name: 'F', isBlack: false, semitones: 5, key: 'f' },
      { name: 'F#', isBlack: true, semitones: 6, key: 't' },
      { name: 'G', isBlack: false, semitones: 7, key: 'g' },
      { name: 'G#', isBlack: true, semitones: 8, key: 'y' },
      { name: 'A', isBlack: false, semitones: 9, key: 'h' },
      { name: 'A#', isBlack: true, semitones: 10, key: 'u' },
      { name: 'B', isBlack: false, semitones: 11, key: 'j' },
      // Second octave start
      { name: 'C2', isBlack: false, semitones: 12, key: 'k' },
      { name: 'C#2', isBlack: true, semitones: 13, key: 'o' },
      { name: 'D2', isBlack: false, semitones: 14, key: 'l' },
      { name: 'D#2', isBlack: true, semitones: 15, key: 'p' },
      { name: 'E2', isBlack: false, semitones: 16, key: ';' },
    ];

    this.render();
    this.initKeyboardEvents();
  }

  getFrequency(semitones) {
    // A4 = 440 Hz is 57 semitones above C0
    // C0 is ~16.35 Hz
    const cOctave = 16.3516 * Math.pow(2, this.octave);
    return cOctave * Math.pow(2, semitones / 12);
  }

  setOctave(oct) {
    this.octave = Math.max(1, Math.min(6, oct));
    const label = document.getElementById('val-octave');
    if (label) label.textContent = `OCT: ${this.octave}`;
  }

  render() {
    if (!this.container) return;
    this.container.innerHTML = '';

    // Render white keys first
    const whiteKeys = this.notes.filter(n => !n.isBlack);
    const whiteElements = new Map();

    whiteKeys.forEach((note) => {
      const keyEl = document.createElement('div');
      keyEl.className = 'white-key';
      keyEl.dataset.semitones = note.semitones;
      keyEl.innerHTML = `<span>${note.name} <small>[${note.key.toUpperCase()}]</small></span>`;

      keyEl.addEventListener('mousedown', () => this.playNote(note.semitones, keyEl));
      keyEl.addEventListener('mouseup', () => this.stopNote(note.semitones, keyEl));
      keyEl.addEventListener('mouseleave', () => this.stopNote(note.semitones, keyEl));

      this.container.appendChild(keyEl);
      whiteElements.set(note.semitones, keyEl);
    });

    // Render black keys with accurate relative positioning
    const totalWhite = whiteKeys.length;
    let whiteIndex = 0;

    this.notes.forEach((note) => {
      if (!note.isBlack) {
        whiteIndex++;
      } else {
        const blackKey = document.createElement('div');
        blackKey.className = 'black-key';
        blackKey.dataset.semitones = note.semitones;

        // Position horizontally between adjacent white keys
        const pct = (whiteIndex / totalWhite) * 100 - (2.75);
        blackKey.style.left = `${pct}%`;

        blackKey.addEventListener('mousedown', () => this.playNote(note.semitones, blackKey));
        blackKey.addEventListener('mouseup', () => this.stopNote(note.semitones, blackKey));
        blackKey.addEventListener('mouseleave', () => this.stopNote(note.semitones, blackKey));

        this.container.appendChild(blackKey);
      }
    });
  }

  playNote(semitones, el) {
    const freq = this.getFrequency(semitones);
    this.synth.noteOn(freq);
    if (el) el.classList.add('playing');
  }

  stopNote(semitones, el) {
    const freq = this.getFrequency(semitones);
    this.synth.noteOff(freq);
    if (el) el.classList.remove('playing');
  }

  initKeyboardEvents() {
    const activeKeys = new Set();

    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return; // Ignore inside terminal
      const key = e.key.toLowerCase();
      if (activeKeys.has(key)) return;

      const note = this.notes.find(n => n.key === key);
      if (note) {
        activeKeys.add(key);
        const el = this.container.querySelector(`[data-semitones="${note.semitones}"]`);
        this.playNote(note.semitones, el);
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.target.tagName === 'INPUT') return;
      const key = e.key.toLowerCase();
      if (activeKeys.has(key)) {
        activeKeys.delete(key);
        const note = this.notes.find(n => n.key === key);
        if (note) {
          const el = this.container.querySelector(`[data-semitones="${note.semitones}"]`);
          this.stopNote(note.semitones, el);
        }
      }
    });
  }
}
