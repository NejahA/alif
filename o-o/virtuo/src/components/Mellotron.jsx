import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import masterBus from '../audio/masterBus';

const KEYS = [
  { note: 'C4', key: 'a' }, { note: 'D4', key: 's' }, { note: 'E4', key: 'd' }, { note: 'F4', key: 'f' },
  { note: 'G4', key: 'g' }, { note: 'A4', key: 'h' }, { note: 'B4', key: 'j' }, { note: 'C5', key: 'k' }
];

export default function Mellotron() {
  const [activeNotes, setActiveNotes] = useState(new Set());
  const [volume, setVolume] = useState(-5);
  
  const synthsRef = useRef(new Map());
  const lfoRef = useRef(null);
  const reverbRef = useRef(null);

  useEffect(() => {
    reverbRef.current = new Tone.Reverb({ decay: 2, wet: 0.3 }).connect(masterBus);
    
    // Mellotron wow/flutter tape effect
    lfoRef.current = new Tone.LFO({ frequency: 2, type: 'sine', min: -10, max: 10 }).start();
    
    KEYS.forEach(k => {
      // Vintage string/choir tape sound
      const synth = new Tone.MonoSynth({
        oscillator: { type: 'pwm', modulationFrequency: 0.2 },
        filter: { type: 'lowpass', frequency: 1500 },
        envelope: { attack: 0.3, decay: 0.1, sustain: 1, release: 0.4 }
      }).connect(reverbRef.current);
      
      // Connect LFO to detune to simulate tape wow
      lfoRef.current.connect(synth.detune);
      
      synthsRef.current.set(k.note, synth);
    });

    return () => {
      synthsRef.current.forEach(synth => synth.dispose());
      synthsRef.current.clear();
      lfoRef.current?.dispose();
      reverbRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    synthsRef.current.forEach(synth => synth.volume.rampTo(volume, 0.1));
  }, [volume]);

  const playNote = async (note) => {
    await Tone.start();
    const synth = synthsRef.current.get(note);
    if (synth && !activeNotes.has(note)) {
      synth.triggerAttack(note);
      setActiveNotes(prev => new Set(prev).add(note));
    }
  };

  const releaseNote = (note) => {
    const synth = synthsRef.current.get(note);
    if (synth) {
      synth.triggerRelease();
      setActiveNotes(prev => {
        const next = new Set(prev);
        next.delete(note);
        return next;
      });
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
        padding: '30px', background: '#d1d5db', borderRadius: '10px', // Vintage white/grey casing
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.2), 0 10px 20px rgba(0,0,0,0.5)',
        border: '1px solid #9ca3af'
      }}>
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ color: '#374151', fontFamily: 'monospace', fontSize: '20px', fontWeight: 'bold' }}>M400</div>
            <div style={{ width: '40px', height: '10px', background: '#dc2626', borderRadius: '5px' }} /> {/* Fake light */}
        </div>

        <div style={{ display: 'flex', gap: '2px', background: '#111', padding: '10px', borderRadius: '5px' }}>
          {KEYS.map(k => (
            <motion.div
              key={k.note}
              animate={{ backgroundColor: activeNotes.has(k.note) ? '#e5e7eb' : '#fff', y: activeNotes.has(k.note) ? 2 : 0 }}
              onMouseDown={() => playNote(k.note)}
              onMouseUp={() => releaseNote(k.note)}
              onMouseLeave={() => releaseNote(k.note)}
              style={{
                width: '40px', height: '120px', background: '#fff',
                border: '1px solid #ccc', borderRadius: '0 0 5px 5px',
                cursor: 'pointer', display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                paddingBottom: '10px', color: '#555', fontSize: '10px', fontWeight: 'bold'
              }}
            >
              {k.key.toUpperCase()}
            </motion.div>
          ))}
        </div>
      </div>
      
      <p style={{ color: 'var(--text-muted)' }}>Vintage tape-replay keyboard. Click or use A-K keys (unmapped physically here, but visually represented).</p>
    </div>
  );
}
