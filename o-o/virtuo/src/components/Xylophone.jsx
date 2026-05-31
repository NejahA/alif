import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import masterBus from '../audio/masterBus';

const KEYS = [
  { note: 'C4', color: '#ef4444' }, // Red
  { note: 'D4', color: '#f97316' }, // Orange
  { note: 'E4', color: '#eab308' }, // Yellow
  { note: 'F4', color: '#22c55e' }, // Green
  { note: 'G4', color: '#06b6d4' }, // Cyan
  { note: 'A4', color: '#3b82f6' }, // Blue
  { note: 'B4', color: '#8b5cf6' }, // Purple
  { note: 'C5', color: '#ec4899' }  // Pink
];

export default function Xylophone() {
  const [activeNotes, setActiveNotes] = useState(new Set());
  const [volume, setVolume] = useState(-5);
  
  const synthsRef = useRef(new Map());
  const reverbRef = useRef(null);

  useEffect(() => {
    reverbRef.current = new Tone.Reverb({ decay: 1, wet: 0.3 }).connect(masterBus);
    
    // Wooden mallet sound
    KEYS.forEach(k => {
      const synth = new Tone.MembraneSynth({
        pitchDecay: 0.01,
        octaves: 2,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.5, sustain: 0.01, release: 1 }
      }).connect(reverbRef.current);
      synthsRef.current.set(k.note, synth);
    });

    return () => {
      synthsRef.current.forEach(synth => synth.dispose());
      synthsRef.current.clear();
      reverbRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    synthsRef.current.forEach(synth => synth.volume.rampTo(volume, 0.1));
  }, [volume]);

  const playNote = async (note) => {
    await Tone.start();
    const synth = synthsRef.current.get(note);
    if (synth) {
      synth.triggerAttackRelease(note, '8n');
      setActiveNotes(prev => new Set(prev).add(note));
      setTimeout(() => {
        setActiveNotes(prev => {
          const next = new Set(prev);
          next.delete(note);
          return next;
        });
      }, 100);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', width: '100%' }}>
      <div style={{ display: 'flex', gap: '20px', padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', width: '100%', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Volume2 size={14} /> Master Volume
          </label>
          <input 
            type="range" min="-30" max="0" step="1" 
            value={volume} 
            onChange={(e) => setVolume(Number(e.target.value))}
            style={{ width: '100px', accentColor: 'var(--accent-primary)' }}
          />
        </div>
      </div>

      <div style={{ 
        position: 'relative', width: '600px', height: '300px', 
        display: 'flex', justifyContent: 'space-between', padding: '40px',
        background: '#a16207', borderRadius: '10px', // Wooden base
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8), 0 10px 20px rgba(0,0,0,0.5)'
      }}>
        {/* Support rails */}
        <div style={{ position: 'absolute', top: '80px', left: 0, width: '100%', height: '10px', background: '#451a03' }} />
        <div style={{ position: 'absolute', bottom: '80px', left: 0, width: '100%', height: '10px', background: '#451a03' }} />

        {KEYS.map((k, i) => (
          <div key={k.note} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
            <motion.div
              animate={{ scale: activeNotes.has(k.note) ? 0.95 : 1, y: activeNotes.has(k.note) ? 5 : 0 }}
              onMouseDown={() => playNote(k.note)}
              style={{
                width: '40px',
                height: `${200 - (i * 10)}px`, // Keys get shorter
                background: k.color,
                borderRadius: '5px',
                cursor: 'pointer',
                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.2), 0 5px 10px rgba(0,0,0,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 'bold', fontSize: '12px', textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                position: 'relative'
              }}
            >
              {/* Pegs */}
              <div style={{ position: 'absolute', top: '15px', width: '6px', height: '6px', background: '#111', borderRadius: '50%' }} />
              <div style={{ position: 'absolute', bottom: '15px', width: '6px', height: '6px', background: '#111', borderRadius: '50%' }} />
              
              {k.note.slice(0, 1)}
            </motion.div>
          </div>
        ))}
      </div>
      
      <p style={{ color: 'var(--text-muted)' }}>Click the colorful wooden bars to play.</p>
    </div>
  );
}
