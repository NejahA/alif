import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';

function Mridangam() {
  const [isLoaded, setIsLoaded] = useState(false);
  const synthRef = useRef(null);

  useEffect(() => {
    synthRef.current = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 4,
      oscillator: { type: "sine" },
      envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 }
    }).toDestination();
    setIsLoaded(true);

    return () => synthRef.current?.dispose();
  }, []);

  const playHit = (pitch = "C2", velocity = 0.8) => {
    if (!isLoaded) return;
    synthRef.current.triggerAttackRelease(pitch, "8n", Tone.now(), velocity);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h3>Mridangam</h3>
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '20px' }}>
        <button className="btn-glass" style={{ width: '100px', height: '100px', borderRadius: '50%' }} onMouseDown={() => playHit("G1", 1)}>Bass</button>
        <button className="btn-glass" style={{ width: '80px', height: '80px', borderRadius: '50%', alignSelf: 'center' }} onMouseDown={() => playHit("C3", 0.7)}>Treble</button>
        <button className="btn-glass" style={{ width: '90px', height: '90px', borderRadius: '50%' }} onMouseDown={() => playHit("D2", 0.9)}>Mid</button>
      </div>
    </div>
  );
}
export default Mridangam;
