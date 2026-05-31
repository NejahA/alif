import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';

function Santoor() {
  const [isLoaded, setIsLoaded] = useState(false);
  const synthRef = useRef(null);

  useEffect(() => {
    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: { attack: 0.01, decay: 2, sustain: 0, release: 2 }
    }).toDestination();
    
    const delay = new Tone.FeedbackDelay("8n", 0.4).toDestination();
    const reverb = new Tone.Reverb(2.5).toDestination();
    synthRef.current.connect(delay);
    synthRef.current.connect(reverb);
    
    setIsLoaded(true);

    return () => {
      synthRef.current?.dispose();
      delay.dispose();
      reverb.dispose();
    };
  }, []);

  const playNote = (note) => {
    if (!isLoaded) return;
    synthRef.current.triggerAttackRelease(note, "8n");
  };

  const notes = ["C4", "D4", "E4", "G4", "A4", "C5", "D5", "E5"];

  return (
    <div style={{ textAlign: 'center' }}>
      <h3>Santoor</h3>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
        {notes.map(note => (
          <button key={note} className="btn-glass" onMouseDown={() => playNote(note)}>{note}</button>
        ))}
      </div>
    </div>
  );
}
export default Santoor;
