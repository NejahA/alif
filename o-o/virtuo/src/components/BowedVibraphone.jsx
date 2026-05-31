import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';

const NOTES = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5'];

const BowedVibraphone = () => {
  const [activeNotes, setActiveNotes] = useState(new Set());
  const synthRef = useRef(null);
  const filterRef = useRef(null);
  const reverbRef = useRef(null);
  
  useEffect(() => {
    reverbRef.current = new Tone.Reverb({ decay: 5, wet: 0.6 }).toDestination();
    filterRef.current = new Tone.Filter(2000, "lowpass").connect(reverbRef.current);
    
    synthRef.current = new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 3.01,
      modulationIndex: 10,
      oscillator: {
        type: "sine"
      },
      envelope: {
        attack: 1.5,
        decay: 1.0,
        sustain: 1.0,
        release: 3.0
      },
      modulation: {
        type: "square"
      },
      modulationEnvelope: {
        attack: 2.0,
        decay: 1.0,
        sustain: 1.0,
        release: 3.0
      }
    }).connect(filterRef.current);

    return () => {
      if (synthRef.current) synthRef.current.dispose();
      if (filterRef.current) filterRef.current.dispose();
      if (reverbRef.current) reverbRef.current.dispose();
    };
  }, []);

  const handleMouseDown = (note) => {
    Tone.start();
    synthRef.current.triggerAttack(note);
    setActiveNotes(prev => new Set(prev).add(note));
  };

  const handleMouseUp = (note) => {
    synthRef.current.triggerRelease(note);
    setActiveNotes(prev => {
      const next = new Set(prev);
      next.delete(note);
      return next;
    });
  };
  
  const handleMouseLeave = (note) => {
    if (activeNotes.has(note)) {
      handleMouseUp(note);
    }
  };

  return (
    <div style={{ padding: '30px', background: 'var(--glass-bg)', borderRadius: '20px', border: '1px solid var(--glass-border)', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2 style={{ marginBottom: '10px', color: '#c084fc', textAlign: 'center' }}>Bowed Vibraphone</h2>
      <p style={{ color: '#888', marginBottom: '30px', textAlign: 'center' }}>Hover and drag across the bars to simulate bowing the metallic keys.</p>

      <div style={{ display: 'flex', gap: '8px', height: '300px', alignItems: 'flex-start' }}>
        {NOTES.map((note, idx) => {
          const isActive = activeNotes.has(note);
          // Calculate length of bar based on pitch
          const height = 300 - (idx * 15);
          
          return (
            <div
              key={note}
              onMouseDown={() => handleMouseDown(note)}
              onMouseUp={() => handleMouseUp(note)}
              onMouseEnter={(e) => e.buttons === 1 && handleMouseDown(note)}
              onMouseLeave={() => handleMouseLeave(note)}
              style={{
                width: '40px',
                height: `${height}px`,
                background: isActive ? 'linear-gradient(to bottom, #d8b4fe, #c084fc)' : 'linear-gradient(to bottom, #333, #111)',
                borderRadius: '5px',
                border: isActive ? '1px solid #fff' : '1px solid #444',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-end',
                paddingBottom: '15px',
                boxShadow: isActive ? '0 0 20px rgba(192, 132, 252, 0.5)' : 'inset 0 0 10px rgba(0,0,0,0.5)',
                transition: 'background 0.3s ease, border 0.3s ease'
              }}
            >
              <span style={{ 
                color: isActive ? 'white' : '#666', 
                fontSize: '12px', 
                fontWeight: 'bold', 
                pointerEvents: 'none' 
              }}>
                {note.replace(/[0-9]/g, '')}
              </span>
            </div>
          );
        })}
      </div>
      
      <div style={{ marginTop: '30px', width: '100%', maxWidth: '400px', display: 'flex', justifyContent: 'space-between', color: '#888' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', marginBottom: '5px' }}>Damping</div>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid #444', background: '#111' }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', marginBottom: '5px' }}>Motor Speed</div>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid #444', background: '#111' }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '10px', textTransform: 'uppercase', marginBottom: '5px' }}>Bowed Pressure</div>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid #c084fc', background: '#222' }} />
        </div>
      </div>
    </div>
  );
};

export default BowedVibraphone;
