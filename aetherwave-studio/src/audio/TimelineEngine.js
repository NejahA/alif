/**
 * TimelineEngine - Multi-Track Song Arranger & Sequence Timeline Engine
 */

import { audioEngine } from './AudioEngine';
import { drumEngine } from './DrumEngine';

class TimelineEngine {
  constructor() {
    this.isPlaying = false;
    this.currentBlock = 0;
    this.timerId = null;

    this.tracks = [
      { id: 'drums',  name: 'Drum Beats', color: '#ec4899' },
      { id: 'bass',   name: 'Synth Bass', color: '#8b5cf6' },
      { id: 'lead',   name: 'Arp Lead',   color: '#06b6d4' },
      { id: 'chords', name: 'Pad Chords', color: '#f59e0b' },
      { id: 'fx',     name: 'FX & Riser', color: '#10b981' }
    ];

    this.blocks = ['Intro', 'Verse 1', 'Verse 2', 'Chorus 1', 'Drop', 'Breakdown', 'Chorus 2', 'Outro'];

    // Matrix: 5 tracks x 8 blocks
    this.timeline = [
      [1, 1, 1, 1, 1, 0, 1, 1], // Drums
      [0, 1, 1, 1, 1, 1, 1, 0], // Bass
      [0, 0, 1, 1, 1, 0, 1, 0], // Lead
      [1, 1, 1, 1, 1, 1, 1, 1], // Chords
      [1, 0, 0, 1, 1, 1, 0, 1]  // FX
    ];

    this.mutes = [false, false, false, false, false];
  }

  toggleBlock(trackIdx, blockIdx) {
    if (this.timeline[trackIdx]) {
      this.timeline[trackIdx][blockIdx] = this.timeline[trackIdx][blockIdx] ? 0 : 1;
    }
  }

  toggleMute(trackIdx) {
    this.mutes[trackIdx] = !this.mutes[trackIdx];
  }

  clearTimeline() {
    this.timeline = Array.from({ length: 5 }, () => Array(8).fill(0));
  }

  presetFullSong() {
    this.timeline = [
      [1, 1, 1, 1, 1, 0, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 0, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 1, 1, 1, 0, 1]
    ];
  }

  toggleSequencer(onBlockCallback) {
    if (this.isPlaying) {
      clearInterval(this.timerId);
      this.isPlaying = false;
      this.currentBlock = 0;
      return false;
    }

    audioEngine.init();
    this.isPlaying = true;
    const blockDurationMs = 2800; // ~2.8 seconds per block bar

    this.timerId = setInterval(() => {
      const block = this.currentBlock;

      // Play active track instruments for this block
      if (this.timeline[0][block] && !this.mutes[0]) drumEngine.playKick();
      if (this.timeline[1][block] && !this.mutes[1]) audioEngine.playNote(110, 0.4, 'sawtooth');
      if (this.timeline[2][block] && !this.mutes[2]) audioEngine.playNote(659.25, 0.25, 'square');
      if (this.timeline[3][block] && !this.mutes[3]) audioEngine.triggerChord(block % 5);
      if (this.timeline[4][block] && !this.mutes[4]) drumEngine.playOpenHat();

      if (onBlockCallback) onBlockCallback(block);
      this.currentBlock = (this.currentBlock + 1) % 8;
    }, blockDurationMs);

    return true;
  }
}

export const timelineEngine = new TimelineEngine();
