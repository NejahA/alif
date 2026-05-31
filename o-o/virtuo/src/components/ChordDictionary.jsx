import React from 'react';
import * as Tone from 'tone';

const CHORDS = [
  { name: 'C Major', notes: ['C4', 'E4', 'G4'] },
  { name: 'A Minor', notes: ['A3', 'C4', 'E4'] },
  { name: 'G Major', notes: ['G3', 'B3', 'D4'] },
  { name: 'F Major', notes: ['F3', 'A3', 'C4'] },
];

export default function ChordDictionary() {
  const playChord = async (notes) => {
    await Tone.start();
    const synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 1 },
    }).toDestination();
    
    synth.triggerAttackRelease(notes, "2n");
  };

  return (
    <div style={{
      padding: '15px 20px',
      background: 'var(--glass-bg)',
      border: '1px solid var(--glass-border)',
      borderRadius: '8px',
      width: '100%'
    }}>
      <h3 style={{ margin: '0 0 15px 0', fontSize: '1.2rem' }}>Chord Dictionary</h3>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {CHORDS.map((chord) => (
          <button
            key={chord.name}
            className="btn-glass"
            onClick={() => playChord(chord.notes)}
            title={chord.notes.join(' - ')}
          >
            {chord.name}
          </button>
        ))}
      </div>
    </div>
  );
}
