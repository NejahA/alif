import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Volume2, Activity } from 'lucide-react';
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

export default function Marimba() {
  const synthRef = useRef(null);
  const [activeNotes, setActiveNotes] = useState(new Set());
  const [volume, setVolume] = useState(-5);
  const [hardness, setHardness] = useState(0.8); // Controls attack sharpness

  useEffect(() => {
    // FM Synth for wooden percussive sound
    synthRef.current = new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 3.5,
      modulationIndex: 2,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.005, decay: 0.3, sustain: 0, release: 0.3 },
      modulation: { type: 'square' },
      modulationEnvelope: { attack: 0.002, decay: 0.1, sustain: 0, release: 0.1 }
    }).connect(masterBus);
    
    synthRef.current.volume.value = volume;

    const handleKeyDown = (e) => {
      if (e.repeat || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const k = KEYS.find(k => k.key === e.key.toLowerCase());
      if (k) playNote(k.note);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      synthRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (synthRef.current) synthRef.current.volume.rampTo(volume, 0.1);
  }, [volume]);

  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.set({
        envelope: { attack: 0.01 - (hardness * 0.009) }, // Sharper attack with higher hardness
        modulationIndex: hardness * 5 // Brighter sound
      });
    }
  }, [hardness]);

  const playNote = async (note) => {
    await Tone.start();
    if (!synthRef.current) return;
    
    synthRef.current.triggerAttackRelease(note, "8n");
    
    setActiveNotes(prev => new Set([...prev, note]));
    setTimeout(() => {
      setActiveNotes(prev => {
        const next = new Set(prev);
        next.delete(note);
        return next;
      });
    }, 150);
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
            <Activity size={14} /> Mallet Hardness
          </label>
          <input 
            type="range" min="0" max="1" step="0.05" 
            value={hardness} 
            onChange={(e) => setHardness(Number(e.target.value))}
            style={{ width: '100px', accentColor: 'var(--accent-primary)' }}
          />
        </div>
      </div>

      {/* Marimba Bars */}
      <div style={{ 
        position: 'relative',
        height: '250px',
        width: '600px',
        padding: '20px',
        background: '#1a1a1a',
        borderRadius: '10px',
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8), 0 10px 30px rgba(0,0,0,0.5)'
      }}>
        {/* Resonators (Visual Background) */}
        <div style={{
          position: 'absolute', top: 50, left: 20, right: 20, bottom: 20,
          display: 'flex', justifyContent: 'space-around', opacity: 0.3
        }}>
          {KEYS.filter(k => k.color === 'white').map((_, i) => (
            <div key={i} style={{ width: '30px', background: 'linear-gradient(to right, #111, #333, #111)', borderRadius: '0 0 15px 15px', height: `${100 - i * 5}%` }} />
          ))}
        </div>

        {/* White Keys */}
        <div style={{ display: 'flex', gap: '10px', position: 'absolute', bottom: '20px', left: '30px' }}>
          {KEYS.filter(k => k.color === 'white').map((k, i) => (
            <motion.div
              key={k.note}
              animate={{
                y: activeNotes.has(k.note) ? 5 : 0,
                scale: activeNotes.has(k.note) ? 0.95 : 1
              }}
              onMouseDown={() => playNote(k.note)}
              style={{
                width: '50px',
                height: `${160 - (i * 5)}px`,
                background: 'linear-gradient(to bottom, #8B4513, #5C3A21)',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                alignItems: 'center',
                paddingBottom: '10px',
                boxShadow: '0 5px 10px rgba(0,0,0,0.5), inset 0 2px 5px rgba(255,255,255,0.2)',
                border: '1px solid #3d2210'
              }}
            >
              <div style={{ fontSize: '12px', color: '#ffd59e', fontWeight: 'bold' }}>{k.note}</div>
              <div style={{ fontSize: '10px', color: '#ffd59e', opacity: 0.6 }}>{k.key.toUpperCase()}</div>
            </motion.div>
          ))}
        </div>

        {/* Black Keys */}
        <div style={{ display: 'flex', gap: '10px', position: 'absolute', top: '20px', left: '60px' }}>
          {KEYS.filter(k => k.color === 'black').map((k, i) => {
            // Add spacing for missing black keys (between E-F and B-C)
            const margin = (k.note === 'F#4') ? '60px' : '0px';
            return (
              <motion.div
                key={k.note}
                animate={{
                  y: activeNotes.has(k.note) ? 5 : 0,
                  scale: activeNotes.has(k.note) ? 0.95 : 1
                }}
                onMouseDown={() => playNote(k.note)}
                style={{
                  width: '40px',
                  height: `${130 - (i * 4)}px`,
                  background: 'linear-gradient(to bottom, #6B3E2E, #3D231A)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  paddingBottom: '10px',
                  marginLeft: margin,
                  marginRight: '10px',
                  boxShadow: '0 5px 10px rgba(0,0,0,0.5), inset 0 2px 5px rgba(255,255,255,0.1)',
                  border: '1px solid #2a1610',
                  zIndex: 10
                }}
              >
                <div style={{ fontSize: '10px', color: '#ffd59e', fontWeight: 'bold' }}>{k.note}</div>
                <div style={{ fontSize: '8px', color: '#ffd59e', opacity: 0.6 }}>{k.key.toUpperCase()}</div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  );
}
