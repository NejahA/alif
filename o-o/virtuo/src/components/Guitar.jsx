import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import masterBus from '../audio/masterBus';

const STRINGS = ['E4', 'B3', 'G3', 'D3', 'A2', 'E2'];
const FRETS = 12;

export default function Guitar() {
  const [activeNote, setActiveNote] = useState(null);
  const synthRef = useRef(null);

  useEffect(() => {
    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 1 }
    }).connect(masterBus);

    return () => synthRef.current?.dispose();
  }, []);

  const playNote = async (note) => {
    await Tone.start();
    if (synthRef.current) {
      synthRef.current.triggerAttackRelease(note, '0.5s');
      setActiveNote(note);
      setTimeout(() => setActiveNote(null), 200);
    }
  };

  const getNote = (stringIndex, fret) => {
    const baseNote = Tone.Frequency(STRINGS[stringIndex]).toMidi();
    return Tone.Frequency(baseNote + fret, 'midi').toNote();
  };

  return (
    <div style={{ width: '100%', overflowX: 'auto', padding: '20px' }}>
      <div style={{ 
        position: 'relative', 
        background: 'linear-gradient(90deg, #3d2b1f 0%, #2a1d15 100%)', 
        height: '240px', 
        borderRadius: '8px', 
        border: '4px solid #1a120d',
        display: 'flex',
        minWidth: '800px'
      }}>
        {/* Frets */}
        {Array.from({ length: FRETS + 1 }).map((_, i) => (
          <div 
            key={i} 
            style={{ 
              position: 'absolute', 
              left: `${(i / FRETS) * 100}%`, 
              top: 0, 
              bottom: 0, 
              width: '2px', 
              background: 'linear-gradient(180deg, #d4af37, #b8860b)',
              boxShadow: '1px 0 2px rgba(0,0,0,0.5)'
            }} 
          />
        ))}

        {/* Fret Markers */}
        {[3, 5, 7, 9, 12].map(fret => (
          <div 
            key={fret}
            style={{
              position: 'absolute',
              left: `${((fret - 0.5) / FRETS) * 100}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '12px',
              height: '12px',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '50%'
            }}
          />
        ))}

        {/* Strings */}
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', justifyContent: 'space-around', padding: '10px 0' }}>
          {STRINGS.map((_, sIndex) => (
            <div key={sIndex} style={{ position: 'relative', width: '100%', height: '20px' }}>
              {/* String line */}
              <div style={{ 
                position: 'absolute', 
                top: '50%', 
                left: 0, 
                right: 0, 
                height: `${1 + sIndex * 0.5}px`, 
                background: 'linear-gradient(180deg, #c0c0c0, #808080)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.8)'
              }} />
              
              {/* Interactive Fret Areas */}
              <div style={{ display: 'flex', width: '100%', height: '100%' }}>
                {Array.from({ length: FRETS }).map((_, fIndex) => {
                  const note = getNote(sIndex, fIndex);
                  const isActive = activeNote === note;
                  return (
                    <motion.div
                      key={fIndex}
                      onMouseDown={() => playNote(note)}
                      whileHover={{ background: 'rgba(255,255,255,0.05)' }}
                      style={{ 
                        flex: 1, 
                        height: '100%', 
                        zIndex: 2, 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {isActive && (
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          style={{ 
                            width: '15px', 
                            height: '15px', 
                            borderRadius: '50%', 
                            background: 'var(--accent-primary)',
                            boxShadow: '0 0 10px var(--accent-glow)'
                          }} 
                        />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-muted)' }}>Click the frets to play notes</p>
    </div>
  );
}
