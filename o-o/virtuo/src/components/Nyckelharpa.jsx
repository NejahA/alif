import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';

function Nyckelharpa() {
  const [isLoaded, setIsLoaded] = useState(false);
  const synthRef = useRef(null);

  useEffect(() => {
    synthRef.current = new Tone.FMSynth({
      harmonicity: 1.5,
      modulationIndex: 2,
      oscillator: { type: "sawtooth" },
      envelope: { attack: 0.1, decay: 0.2, sustain: 0.8, release: 1.2 }
    }).toDestination();
    
    const chorus = new Tone.Chorus(4, 2.5, 0.5).toDestination().start();
    synthRef.current.connect(chorus);
    
    setIsLoaded(true);

    return () => {
      synthRef.current?.dispose();
      chorus.dispose();
    };
  }, []);

  const playNote = (note) => {
    if (!isLoaded) return;
    synthRef.current.triggerAttackRelease(note, "8n", Tone.now());
  };

  const keys = ["G3", "A3", "B3", "C4", "D4", "E4", "F#4", "G4"];

  return (
    <div style={{ textAlign: 'center' }}>
      <h3>Swedish Nyckelharpa</h3>
      <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', marginTop: '30px' }}>
        {keys.map(key => (
          <div 
            key={key}
            onMouseDown={() => playNote(key)}
            style={{
              height: '150px',
              width: '40px',
              background: '#e0e0e0',
              border: '1px solid #ccc',
              borderRadius: '0 0 5px 5px',
              cursor: 'pointer',
              color: '#333',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              paddingBottom: '10px',
              fontWeight: 'bold',
              userSelect: 'none'
            }}
          >
            {key}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Nyckelharpa;
