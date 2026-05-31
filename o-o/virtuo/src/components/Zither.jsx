import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';

function Zither() {
  const [isLoaded, setIsLoaded] = useState(false);
  const synthRef = useRef(null);

  useEffect(() => {
    synthRef.current = new Tone.PluckSynth({
      attackNoise: 1,
      dampening: 6000,
      resonance: 0.95
    }).toDestination();
    setIsLoaded(true);

    return () => synthRef.current?.dispose();
  }, []);

  const playNote = (note) => {
    if (!isLoaded) return;
    synthRef.current.triggerAttack(note);
  };

  const notes = ["G3", "A3", "B3", "C4", "D4", "E4", "F#4", "G4"];

  return (
    <div style={{ textAlign: 'center' }}>
      <h3>Folk Zither</h3>
      <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', marginTop: '20px' }}>
        {notes.map(note => (
          <div 
            key={note} 
            onMouseDown={() => playNote(note)}
            onMouseEnter={(e) => { if (e.buttons === 1) playNote(note); }}
            style={{ 
              width: '30px', 
              height: '200px', 
              borderLeft: '2px solid rgba(255,255,255,0.8)', 
              cursor: 'crosshair',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              paddingBottom: '10px',
              fontSize: '12px',
              userSelect: 'none'
            }}
          >
            {note}
          </div>
        ))}
      </div>
      <p style={{ marginTop: '10px', color: 'var(--text-muted)' }}>Click and drag across strings</p>
    </div>
  );
}
export default Zither;
