import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import masterBus from '../audio/masterBus';

// Simplified Hang Drum scale (D minor)
const TONE_FIELDS = [
  { note: 'D3', label: 'Ding (Center)', pos: { top: '40%', left: '40%', size: 80 } },
  { note: 'A3', label: '1', pos: { top: '10%', left: '40%', size: 50 } },
  { note: 'C4', label: '2', pos: { top: '25%', left: '70%', size: 50 } },
  { note: 'D4', label: '3', pos: { top: '60%', left: '75%', size: 50 } },
  { note: 'E4', label: '4', pos: { top: '80%', left: '50%', size: 50 } },
  { note: 'F4', label: '5', pos: { top: '75%', left: '20%', size: 50 } },
  { note: 'G4', label: '6', pos: { top: '45%', left: '10%', size: 50 } },
  { note: 'A4', label: '7', pos: { top: '20%', left: '20%', size: 50 } },
];

export default function HangDrum() {
  const [activeNotes, setActiveNotes] = useState(new Set());
  const [volume, setVolume] = useState(-5);
  
  const synthsRef = useRef(new Map());
  const reverbRef = useRef(null);

  useEffect(() => {
    reverbRef.current = new Tone.Reverb({ decay: 4, wet: 0.5 }).connect(masterBus);
    
    // Hang drum has strong fundamental and 2nd/3rd harmonics
    TONE_FIELDS.forEach(field => {
      const synth = new Tone.FMSynth({
        harmonicity: 2,
        modulationIndex: 1.5,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.01, decay: 2, sustain: 0.1, release: 2 },
        modulation: { type: 'sine' },
        modulationEnvelope: { attack: 0.01, decay: 1, sustain: 0, release: 1 }
      }).connect(reverbRef.current);
      synthsRef.current.set(field.note, synth);
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
      synth.triggerAttackRelease(note, '4n');
      setActiveNotes(prev => new Set(prev).add(note));
      setTimeout(() => {
        setActiveNotes(prev => {
          const next = new Set(prev);
          next.delete(note);
          return next;
        });
      }, 200);
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
        position: 'relative', width: '400px', height: '400px', 
        background: 'radial-gradient(circle at center, #71717a 0%, #3f3f46 50%, #18181b 100%)',
        borderRadius: '50%',
        boxShadow: '0 20px 40px rgba(0,0,0,0.8), inset 0 5px 20px rgba(255,255,255,0.2)'
      }}>
        {TONE_FIELDS.map(field => {
          const isActive = activeNotes.has(field.note);
          return (
            <motion.div
              key={field.note}
              animate={{ scale: isActive ? 0.95 : 1, opacity: isActive ? 1 : 0.7 }}
              onMouseDown={() => playNote(field.note)}
              style={{
                position: 'absolute',
                top: field.pos.top,
                left: field.pos.left,
                width: field.pos.size,
                height: field.pos.size,
                background: 'radial-gradient(circle at center, #52525b 0%, #3f3f46 100%)',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isActive ? 'inset 0 0 20px rgba(0,0,0,0.5)' : 'inset 0 0 10px rgba(0,0,0,0.5), 0 2px 5px rgba(255,255,255,0.1)',
                border: '1px solid #52525b'
              }}
              title={field.label}
            >
              {/* Dimple in the center of the tone field */}
              <div style={{ width: '30%', height: '30%', background: '#27272a', borderRadius: '50%', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5)' }} />
            </motion.div>
          );
        })}
      </div>
      
      <p style={{ color: 'var(--text-muted)' }}>Tap the circular tone fields to play. The center is the Ding (bass).</p>
    </div>
  );
}
