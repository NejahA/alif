import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Volume2, Wind } from 'lucide-react';
import masterBus from '../audio/masterBus';

const KEYS = [
  { note: 'C4', key: 'a', color: 'white' },
  { note: 'C#4', key: 'w', color: 'black' },
  { note: 'D4', key: 's', color: 'white' },
  { note: 'D#4', key: 'e', color: 'black' },
  { note: 'E4', key: 'd', color: 'white' },
  { note: 'F4', key: 'f', color: 'white' },
  { note: 'F#4', key: 't', color: 'black' },
  { note: 'G4', key: 'g', color: 'white' },
  { note: 'G#4', key: 'y', color: 'black' },
  { note: 'A4', key: 'h', color: 'white' },
  { note: 'A#4', key: 'u', color: 'black' },
  { note: 'B4', key: 'j', color: 'white' },
  { note: 'C5', key: 'k', color: 'white' }
];

export default function Accordion() {
  const synthRef = useRef(null);
  const [activeNotes, setActiveNotes] = useState(new Set());
  const [volume, setVolume] = useState(-5);
  const [bellowsIntensity, setBellowsIntensity] = useState(50); // Simulates bellow pressure (filter cutoff / volume)

  useEffect(() => {
    // Accordion sound: Sawtooth with chorus/detune for rich reed sound
    const chorus = new Tone.Chorus(4, 2.5, 0.5).start().connect(masterBus);
    
    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'fatsawtooth', count: 3, spread: 20 },
      envelope: { attack: 0.1, decay: 0.2, sustain: 0.8, release: 0.4 }
    }).connect(chorus);
    
    synthRef.current.volume.value = volume;

    const handleKeyDown = (e) => {
      if (e.repeat || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const k = KEYS.find(k => k.key === e.key.toLowerCase());
      if (k && !activeNotes.has(k.note)) {
        playNote(k.note);
      }
    };

    const handleKeyUp = (e) => {
      const k = KEYS.find(k => k.key === e.key.toLowerCase());
      if (k) stopNote(k.note);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      synthRef.current?.dispose();
      chorus.dispose();
    };
  }, []);

  useEffect(() => {
    if (synthRef.current) {
      // Map bellows intensity to volume and subtle filter changes
      const volMap = volume + (bellowsIntensity - 50) * 0.2;
      synthRef.current.volume.rampTo(volMap, 0.1);
    }
  }, [volume, bellowsIntensity]);

  const playNote = async (note) => {
    await Tone.start();
    if (!synthRef.current) return;
    synthRef.current.triggerAttack(note);
    setActiveNotes(prev => new Set([...prev, note]));
  };

  const stopNote = (note) => {
    if (!synthRef.current) return;
    synthRef.current.triggerRelease(note);
    setActiveNotes(prev => {
      const next = new Set(prev);
      next.delete(note);
      return next;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', width: '100%' }}>
      {/* Controls */}
      <div style={{ display: 'flex', gap: '20px', padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Volume2 size={14} /> Volume
          </label>
          <input 
            type="range" min="-30" max="0" step="1" 
            value={volume} 
            onChange={(e) => setVolume(Number(e.target.value))}
            style={{ width: '100px', accentColor: 'var(--accent-primary)' }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Wind size={14} /> Bellows Pressure
          </label>
          <input 
            type="range" min="0" max="100" step="1" 
            value={bellowsIntensity} 
            onChange={(e) => setBellowsIntensity(Number(e.target.value))}
            style={{ width: '100px', accentColor: 'var(--accent-primary)' }}
          />
        </div>
      </div>

      {/* Accordion Body */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: '0',
        padding: '20px',
        background: '#1a1a1a',
        borderRadius: '10px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
      }}>
        
        {/* Left Side (Buttons / Grill) */}
        <div style={{
          width: '80px',
          height: '250px',
          background: 'linear-gradient(to right, #8b0000, #a52a2a)',
          borderRadius: '8px 0 0 8px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          boxShadow: 'inset -5px 0 10px rgba(0,0,0,0.3)',
          border: '2px solid #5c0000'
        }}>
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
             {[...Array(8)].map((_, i) => (
                <div key={i} style={{ width: '15px', height: '15px', borderRadius: '50%', background: '#f5f5f5', boxShadow: 'inset 0 -2px 5px rgba(0,0,0,0.5)' }} />
             ))}
           </div>
        </div>

        {/* Bellows (Animated) */}
        <motion.div 
          animate={{ width: activeNotes.size > 0 ? 150 : 100 }}
          transition={{ type: 'spring', stiffness: 100 }}
          style={{
          height: '220px',
          background: 'repeating-linear-gradient(90deg, #111 0px, #111 10px, #333 10px, #333 20px)',
          borderTop: '2px solid #000',
          borderBottom: '2px solid #000'
        }} />

        {/* Right Side (Keyboard) */}
        <div style={{
          height: '250px',
          background: '#fff',
          borderRadius: '0 8px 8px 0',
          position: 'relative',
          width: '240px',
          boxShadow: 'inset 5px 0 10px rgba(0,0,0,0.2)',
          border: '2px solid #ccc'
        }}>
          {/* White Keys */}
          <div style={{ display: 'flex', height: '100%' }}>
            {KEYS.filter(k => k.color === 'white').map((k, i) => (
              <motion.div
                key={k.note}
                animate={{
                  backgroundColor: activeNotes.has(k.note) ? '#e0e0e0' : '#fff',
                  scaleY: activeNotes.has(k.note) ? 0.98 : 1,
                  transformOrigin: 'top'
                }}
                onMouseDown={() => playNote(k.note)}
                onMouseUp={() => stopNote(k.note)}
                onMouseLeave={() => stopNote(k.note)}
                style={{
                  flex: 1,
                  borderRight: '1px solid #ccc',
                  borderBottom: '1px solid #ccc',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  paddingBottom: '10px',
                  boxShadow: activeNotes.has(k.note) ? 'inset 0 0 5px rgba(0,0,0,0.2)' : 'none'
                }}
              >
                <span style={{ fontSize: '10px', color: '#666', pointerEvents: 'none' }}>{k.key.toUpperCase()}</span>
              </motion.div>
            ))}
          </div>

          {/* Black Keys */}
          <div style={{ display: 'flex', position: 'absolute', top: 0, left: 0, width: '100%' }}>
            {KEYS.filter(k => k.color === 'black').map((k, i) => {
              const leftPos = k.note === 'C#4' ? 18 : 
                              k.note === 'D#4' ? 48 : 
                              k.note === 'F#4' ? 108 : 
                              k.note === 'G#4' ? 138 : 168; // A#4
              return (
                <motion.div
                  key={k.note}
                  animate={{
                    backgroundColor: activeNotes.has(k.note) ? '#333' : '#000',
                    scaleY: activeNotes.has(k.note) ? 0.95 : 1,
                    transformOrigin: 'top'
                  }}
                  onMouseDown={() => playNote(k.note)}
                  onMouseUp={() => stopNote(k.note)}
                  onMouseLeave={() => stopNote(k.note)}
                  style={{
                    position: 'absolute',
                    left: `${leftPos}%`,
                    width: '12%',
                    height: '60%',
                    background: '#000',
                    borderRadius: '0 0 3px 3px',
                    cursor: 'pointer',
                    zIndex: 10,
                    boxShadow: '2px 2px 5px rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    paddingBottom: '5px'
                  }}
                >
                  <span style={{ fontSize: '8px', color: '#fff', pointerEvents: 'none' }}>{k.key.toUpperCase()}</span>
                </motion.div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
