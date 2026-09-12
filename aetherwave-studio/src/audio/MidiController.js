/**
 * MidiController - Web MIDI API Integration for Hardware Synth Keyboards
 */

import { audioEngine } from './AudioEngine';

class MidiController {
  constructor() {
    this.midiAccess = null;
    this.inputs = [];
    this.isSupported = false;
    this.activeInputsCount = 0;
    this.listeners = [];
  }

  async init(onStateChange) {
    if (!navigator.requestMIDIAccess) {
      console.warn('Web MIDI API is not supported in this browser.');
      this.isSupported = false;
      return false;
    }

    try {
      this.midiAccess = await navigator.requestMIDIAccess();
      this.isSupported = true;
      this.bindInputs(onStateChange);

      this.midiAccess.onstatechange = () => {
        this.bindInputs(onStateChange);
      };

      return true;
    } catch (err) {
      console.error('Failed to access MIDI devices:', err);
      this.isSupported = false;
      return false;
    }
  }

  bindInputs(onStateChange) {
    if (!this.midiAccess) return;

    this.inputs = [];
    const inputs = this.midiAccess.inputs.values();

    for (const input of inputs) {
      this.inputs.push(input);
      input.onmidimessage = (msg) => this.handleMidiMessage(msg);
    }

    this.activeInputsCount = this.inputs.length;
    if (onStateChange) onStateChange(this.activeInputsCount);
  }

  handleMidiMessage(event) {
    const [status, note, velocity] = event.data;
    const command = status >> 4;
    const channel = status & 0xf;

    // Note On (command 9)
    if (command === 9 && velocity > 0) {
      const freq = 440 * Math.pow(2, (note - 69) / 12); // MIDI note to Hz formula
      const normVel = velocity / 127;
      audioEngine.playNote(freq, 0.8 * normVel);
    }
    // Control Change (command 11) - CC Knobs
    else if (command === 11) {
      if (note === 1) { // Mod wheel -> Filter Cutoff
        const cutoff = 200 + (velocity / 127) * 7500;
        audioEngine.updateParam('filterCutoff', cutoff);
      } else if (note === 7) { // Volume slider
        audioEngine.updateParam('masterVolume', velocity / 127);
      }
    }
  }
}

export const midiController = new MidiController();
