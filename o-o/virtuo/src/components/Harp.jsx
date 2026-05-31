import React, { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import masterBus from '../audio/masterBus';

// Harp strings - concert harp has 47 strings
const HARP_STRINGS = [
  { note: 'C2', string: 0, key: '1' },
  { note: 'D2', string: 1, key: '2' },
  { note: 'E2', string: 2, key: '3' },
  { note: 'F2', string: 3, key: '4' },
  { note: 'G2', string: 4, key: '5' },
  { note: 'A2', string: 5, key: '6' },
  { note: 'B2', string: 6, key: '7' },
  { note: 'C3', string: 7, key: '8' },
  { note: 'D3', string: 8, key: '9' },
  { note: 'E3', string: 9, key: '0' },
];

export default function Harp() {
  const synthRef = useRef(null);
  const [activeStrings, setActiveStrings] = useState(new Set());
  const [pluckStrength, setPluckStrength] = useState(0.6);
  const [reverbAmount, setReverbAmount] = useState(0.7);
  const [glissando, setGlissando] = useState(false);

  useEffect(() => {
    // Initialize a harp-like pluck synth
    synthRef.current = new Tone.PluckSynth({
      attackNoise: 0.8,
      dampening: 3000,
      resonance: 0.9,
    }).connect(masterBus);

    // Add reverb for concert hall effect
    const reverb = new Tone.Reverb({
      decay: 3,
      preDelay: 0.02,
    }).toDestination();
    synthRef.current.connect(reverb);

    // MIDI Listeners
    const onMidiOn = (e) => {
      playString(e.detail.note);
    };
    const onMidiOff = (e) => {
      releaseString(e.detail.note);
    };

    window.addEventListener('virtuo-midi-on', onMidiOn);
    window.addEventListener('virtuo-midi-off', onMidiOff);

    const handleKeyDown = (e) => {
      const stringObj = HARP_STRINGS.find(s => s.key === e.key);
      if (stringObj && !activeStrings.has(stringObj.note)) {
        playString(stringObj.note);
      }
    };

    const handleKeyUp = (e) => {
      const stringObj = HARP_STRINGS.find(s => s.key === e.key);
      if (stringObj) {
        releaseString(stringObj.note);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      synthRef.current?.dispose();
      window.removeEventListener('virtuo-midi-on', onMidiOn);
      window.removeEventListener('virtuo-midi-off', onMidiOff);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const playString = async (note) => {
    await Tone.start();
    if (synthRef.current) {
      synthRef.current.triggerAttack(note, Tone.now(), pluckStrength);
      setActiveStrings(prev => new Set(prev).add(note));
      
      // Glissando effect
      if (glissando) {
        setTimeout(() => {
          const nextNote = Tone.Frequency(note).transpose(5).toNote();
          synthRef.current.triggerAttack(nextNote, Tone.now(), pluckStrength * 0.7);
          setTimeout(() => {
            synthRef.current.triggerRelease(nextNote);
          }, 500);
        }, 100);
      }
    }
  };

  const releaseString = (note) => {
    if (synthRef.current) {
      synthRef.current.triggerRelease(note);
      setActiveStrings(prev => {
        const next = new Set(prev);
        next.delete(note);
        return next;
      });
    }
  };

  const playChord = async (chordNotes) => {
    await Tone.start();
    chordNotes.forEach((note, i) => {
      setTimeout(() => {
        playString(note);
      }, i * 50);
    });
    
    setTimeout(() => {
      chordNotes.forEach((note, i) => {
        setTimeout(() => {
          releaseString(note);
        }, 1000 + i * 50);
      });
    }, 1000);
  };

  const commonChords = {
    'C Major': ['C3', 'E3', 'G3'],
    'G Major': ['G2', 'B2', 'D3'],
    'D Minor': ['D2', 'F2', 'A2'],
    'A Minor': ['A2', 'C3', 'E3'],
    'Arpeggio': ['C2', 'E2', 'G2', 'C3', 'E3', 'G3'],
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', opacity: 0.8 }}>Concert Harp</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', maxWidth: '600px' }}>
          Play the concert harp with 10 strings. Click strings or use keys 1-0.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pluck Strength</label>
          <input 
            type="range" min="0.1" max="1" step="0.1" 
            value={pluckStrength} 
            onChange={(e) => setPluckStrength(Number(e.target.value))}
            style={{ width: '150px', accentColor: 'var(--accent-primary)' }}
          />
          <span style={{ fontSize: '0.8rem' }}>{pluckStrength.toFixed(1)}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Glissando</label>
          <button
            className={`btn-glass ${glissando ? 'active' : ''}`}
            onClick={() => setGlissando(!glissando)}
            style={{ padding: '5px 15px' }}
          >
            {glissando ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Harp Visualization */}
      <div style={{ position: 'relative', width: '800px', height: '400px', display: 'flex', justifyContent: 'center' }}>
        {/* Harp frame */}
        <div style={{
          position: 'absolute',
          width: '600px',
          height: '350px',
          background: 'linear-gradient(135deg, #8b4513 0%, #a0522d 100%)',
          borderRadius: '10px',
          border: '3px solid #5d2906',
          boxShadow: '0 15px 30px rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          paddingTop: '30px'
        }}>
          {/* Strings */}
          {HARP_STRINGS.map((string, i) => {
            const isActive = activeStrings.has(string.note);
            const leftPosition = 50 + (i - 4.5) * 50; // Spread strings
            
            return (
              <motion.div
                key={string.note}
                onMouseDown={() => playString(string.note)}
                onMouseUp={() => releaseString(string.note)}
                animate={{
                  scale: isActive ? 1.05 : 1,
                  boxShadow: isActive ? '0 0 20px var(--accent-glow)' : 'none'
                }}
                transition={{ duration: 0.1 }}
                style={{
                  position: 'absolute',
                  left: `${leftPosition}px`,
                  width: '3px',
                  height: '300px',
                  background: isActive ? 'var(--accent-primary)' : 'linear-gradient(to bottom, #f0f6fc, #8b949e)',
                  borderRadius: '1.5px',
                  cursor: 'pointer',
                  zIndex: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  paddingBottom: '10px'
                }}
              >
                {/* String vibration effect */}
                {isActive && (
                  <motion.div
                    initial={{ width: '0px', opacity: 1 }}
                    animate={{ width: '30px', opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    style={{
                      position: 'absolute',
                      height: '3px',
                      background: 'var(--accent-primary)',
                      borderRadius: '1.5px',
                      top: '50%',
                      left: '-15px'
                    }}
                  />
                )}
                
                <div style={{
                  background: 'rgba(0,0,0,0.3)',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  fontSize: '0.7rem',
                  color: 'white',
                  marginBottom: '5px',
                  zIndex: 3
                }}>
                  {string.key}
                </div>
                <div style={{
                  fontSize: '0.8rem',
                  color: 'white',
                  fontWeight: 600,
                  zIndex: 3
                }}>
                  {string.note}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Chord buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', marginTop: '20px' }}>
        <h4 style={{ margin: 0, fontSize: '1rem', opacity: 0.8 }}>Common Chords</h4>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {Object.entries(commonChords).map(([name, notes]) => (
            <button
              key={name}
              className="btn-glass"
              onClick={() => playChord(notes)}
              style={{ padding: '8px 15px', fontSize: '0.8rem' }}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          Press keys 1-0 or click strings to play. Use chord buttons for common progressions.
        </p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {HARP_STRINGS.map(string => (
            <div key={string.note} style={{
              background: 'rgba(255,255,255,0.05)',
              padding: '5px 10px',
              borderRadius: '5px',
              fontSize: '0.8rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px'
            }}>
              <span style={{ color: 'var(--text-muted)' }}>Key {string.key}</span>
              <span style={{ fontWeight: 600 }}>{string.note}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}