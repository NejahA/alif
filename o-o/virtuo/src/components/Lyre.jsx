import React, { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import masterBus from '../audio/masterBus';

// Lyre tuning - ancient Greek 7-string lyre
const LYRE_STRINGS = [
  { note: 'G3', string: 0, key: '1' },
  { note: 'A3', string: 1, key: '2' },
  { note: 'B3', string: 2, key: '3' },
  { note: 'C4', string: 3, key: '4' },
  { note: 'D4', string: 4, key: '5' },
  { note: 'E4', string: 5, key: '6' },
  { note: 'F4', string: 6, key: '7' },
];

export default function Lyre() {
  const synthRef = useRef(null);
  const [activeStrings, setActiveStrings] = useState(new Set());
  const [pluckStrength, setPluckStrength] = useState(0.7);
  const [reverbAmount, setReverbAmount] = useState(0.5);
  const [tuning, setTuning] = useState('greek'); // 'greek' | 'dorian' | 'phrygian'

  useEffect(() => {
    // Initialize a pluck synth for lyre sounds
    synthRef.current = new Tone.PluckSynth({
      attackNoise: 1,
      dampening: 4000,
      resonance: 0.7,
    }).connect(masterBus);

    // Add reverb for authentic lyre sound
    const reverb = new Tone.Reverb({
      decay: 2,
      preDelay: 0.01,
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
      const stringObj = LYRE_STRINGS.find(s => s.key === e.key);
      if (stringObj && !activeStrings.has(stringObj.note)) {
        playString(stringObj.note);
      }
    };

    const handleKeyUp = (e) => {
      const stringObj = LYRE_STRINGS.find(s => s.key === e.key);
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

  const tunings = {
    greek: ['G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4'],
    dorian: ['A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4'],
    phrygian: ['E3', 'F3', 'G3', 'A3', 'B3', 'C4', 'D4'],
  };

  const handleTuningChange = (newTuning) => {
    setTuning(newTuning);
    // Update string notes based on tuning
    LYRE_STRINGS.forEach((string, i) => {
      string.note = tunings[newTuning][i];
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', opacity: 0.8 }}>Ancient Lyre</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', maxWidth: '600px' }}>
          Play the 7-string ancient Greek lyre. Click strings or use keys 1-7.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
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
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tuning</label>
          <div style={{ display: 'flex', gap: '5px' }}>
            {Object.keys(tunings).map(t => (
              <button
                key={t}
                className={`btn-glass ${tuning === t ? 'active' : ''}`}
                onClick={() => handleTuningChange(t)}
                style={{ textTransform: 'capitalize', fontSize: '0.8rem', padding: '5px 10px' }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lyre Visualization */}
      <div style={{ position: 'relative', width: '600px', height: '300px', display: 'flex', justifyContent: 'center' }}>
        {/* Lyre body */}
        <div style={{
          position: 'absolute',
          width: '400px',
          height: '200px',
          background: 'linear-gradient(135deg, #8b4513 0%, #a0522d 100%)',
          borderRadius: '50% 50% 10px 10px',
          border: '2px solid #5d2906',
          boxShadow: '0 10px 20px rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end',
          paddingBottom: '30px'
        }}>
          {/* Strings */}
          {LYRE_STRINGS.map((string, i) => {
            const isActive = activeStrings.has(string.note);
            const leftPosition = 50 + (i - 3) * 40; // Center strings
            
            return (
              <motion.div
                key={string.note}
                onMouseDown={() => playString(string.note)}
                onMouseUp={() => releaseString(string.note)}
                animate={{
                  scale: isActive ? 1.1 : 1,
                  boxShadow: isActive ? '0 0 20px var(--accent-glow)' : 'none'
                }}
                transition={{ duration: 0.1 }}
                style={{
                  position: 'absolute',
                  left: `${leftPosition}px`,
                  width: '2px',
                  height: '180px',
                  background: isActive ? 'var(--accent-primary)' : 'linear-gradient(to bottom, #f0f6fc, #8b949e)',
                  borderRadius: '1px',
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
                    animate={{ width: '20px', opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{
                      position: 'absolute',
                      height: '2px',
                      background: 'var(--accent-primary)',
                      borderRadius: '1px',
                      top: '50%',
                      left: '-10px'
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

        {/* Crossbar */}
        <div style={{
          position: 'absolute',
          top: '50px',
          width: '350px',
          height: '20px',
          background: 'linear-gradient(90deg, #5d2906, #8b4513, #5d2906)',
          borderRadius: '10px',
          border: '1px solid #3a1b03',
          boxShadow: '0 5px 10px rgba(0,0,0,0.3)'
        }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          Press keys 1-7 or click strings to play. The lyre produces authentic plucked string sounds.
        </p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {LYRE_STRINGS.map(string => (
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