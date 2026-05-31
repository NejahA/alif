import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as Tone from 'tone';

function Taiko() {
  const [isLoaded, setIsLoaded] = useState(false);
  const synthRef = useRef(null);

  useEffect(() => {
    synthRef.current = new Tone.MembraneSynth({
      pitchDecay: 0.1,
      octaves: 3,
      oscillator: { type: "sine" },
      envelope: { attack: 0.01, decay: 1.5, sustain: 0.1, release: 2 }
    }).toDestination();

    const reverb = new Tone.Reverb(3).toDestination();
    synthRef.current.connect(reverb);

    setIsLoaded(true);

    return () => {
      synthRef.current?.dispose();
      reverb.dispose();
    };
  }, []);

  const playHit = (velocity = 0.8, pitch = "G1") => {
    if (!isLoaded) return;
    synthRef.current.triggerAttackRelease(pitch, "4n", Tone.now(), velocity);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h3>Cinematic Taiko Drum</h3>
      <div 
        style={{
          width: '300px', 
          height: '300px', 
          borderRadius: '50%', 
          background: 'radial-gradient(circle, #8B4513 30%, #5C4033 100%)',
          margin: '20px auto',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          border: '10px solid #3e2723'
        }}
        onMouseDown={() => playHit(1.0, "G1")}
      >
        <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 'bold' }}>HIT</span>
      </div>
      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
        <button className="btn-glass" onClick={() => playHit(0.5, "C2")}>Rim Shot</button>
        <button className="btn-glass" onClick={() => playHit(0.9, "D1")}>Deep Hit</button>
      </div>
    </div>
  );
}

export default Taiko;
