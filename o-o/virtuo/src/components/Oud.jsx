import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';

function Oud() {
  const [isLoaded, setIsLoaded] = useState(false);
  const synthRef = useRef(null);

  useEffect(() => {
    synthRef.current = new Tone.PluckSynth({
      attackNoise: 1,
      dampening: 4000,
      resonance: 0.9
    }).toDestination();
    setIsLoaded(true);

    return () => synthRef.current?.dispose();
  }, []);

  const playNote = (note) => {
    if (!isLoaded) return;
    synthRef.current.triggerAttack(note, Tone.now());
  };

  const notes = ["D2", "E2", "F2", "G2", "A2", "A#2", "C3", "D3", "E3", "F3", "G3", "A3"];

  return (
    <div style={{ textAlign: 'center' }}>
      <h3>Middle Eastern Oud</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', maxWidth: '600px', margin: '0 auto' }}>
        {notes.map(note => (
          <div 
            key={note}
            onMouseDown={() => playNote(note)}
            style={{
              padding: '20px 15px',
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              borderRadius: '8px',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            {note}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Oud;
