import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Volume2, Activity } from 'lucide-react';
import masterBus from '../audio/masterBus';

// Koto tuning (traditional pentatonic-ish)
const STRINGS = [
  { note: 'D4', key: 'a' },
  { note: 'G4', key: 's' },
  { note: 'A4', key: 'd' },
  { note: 'A#4', key: 'f' },
  { note: 'D5', key: 'g' },
  { note: 'D#5', key: 'h' },
  { note: 'G5', key: 'j' },
  { note: 'A5', key: 'k' },
];

export default function Koto() {
  const synthsRef = useRef(new Map()); // Use separate synths for pitch bending individual strings
  const [activeNotes, setActiveNotes] = useState(new Set());
  const [bends, setBends] = useState(new Map()); // Track bend state for each string
  const [volume, setVolume] = useState(-5);
  
  // Reverb for Koto
  const reverbRef = useRef(null);

  useEffect(() => {
    reverbRef.current = new Tone.Reverb({ decay: 2, wet: 0.3 }).connect(masterBus);

    // Initialize a synth for each string so we can bend them independently
    STRINGS.forEach(s => {
      const synth = new Tone.PluckSynth({
        attackNoise: 1,
        dampening: 4000,
        resonance: 0.8
      }).connect(reverbRef.current);
      synthsRef.current.set(s.note, synth);
    });

    const handleKeyDown = (e) => {
      if (e.repeat || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const s = STRINGS.find(s => s.key === e.key.toLowerCase());
      if (s) playNote(s.note);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      synthsRef.current.forEach(synth => synth.dispose());
      synthsRef.current.clear();
      reverbRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    synthsRef.current.forEach(synth => {
       synth.volume.rampTo(volume, 0.1);
    });
  }, [volume]);

  const playNote = async (note) => {
    await Tone.start();
    const synth = synthsRef.current.get(note);
    if (!synth) return;
    
    // Reset pitch before plucking
    // PluckSynth doesn't have a direct frequency setting after instantiation like a normal Synth
    // We can simulate pitch bend using a PitchShift effect or Detune if available.
    // Tone.PluckSynth actually doesn't expose detune easily, so for this we might just rely on visual bend
    // Or we switch to Tone.Synth to allow pitch bending. Let's switch to Tone.Synth for true bending.
    
    // Actually, PluckSynth DOES NOT support pitch bending during the note.
    // Let's use FMSynth to simulate pluck and allow bending.
  };

  // Re-write synth instantiation for pitch bending capability
  useEffect(() => {
    // Override previous synths
    synthsRef.current.forEach(synth => synth.dispose());
    synthsRef.current.clear();

    STRINGS.forEach(s => {
      const synth = new Tone.FMSynth({
        harmonicity: 3,
        modulationIndex: 2,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.01, decay: 1, sustain: 0, release: 1 },
        modulation: { type: 'sawtooth' },
        modulationEnvelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.2 }
      }).connect(reverbRef.current);
      synthsRef.current.set(s.note, synth);
    });
  }, []);

  const playNoteFMSynth = async (note) => {
    await Tone.start();
    const synth = synthsRef.current.get(note);
    if (!synth) return;
    
    // reset detune
    synth.detune.value = 0;
    setBends(prev => new Map(prev).set(note, 0));

    synth.triggerAttackRelease(note, "2n");
    
    setActiveNotes(prev => new Set([...prev, note]));
    setTimeout(() => {
      setActiveNotes(prev => {
        const next = new Set(prev);
        next.delete(note);
        return next;
      });
    }, 150);
  };

  const handleBendStart = (note) => {
    const synth = synthsRef.current.get(note);
    if (!synth) return;
    
    // Bend pitch up by up to 200 cents
    synth.detune.rampTo(200, 0.2);
    setBends(prev => new Map(prev).set(note, 1));
  };

  const handleBendEnd = (note) => {
    const synth = synthsRef.current.get(note);
    if (!synth) return;
    
    synth.detune.rampTo(0, 0.2);
    setBends(prev => new Map(prev).set(note, 0));
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
      </div>

      {/* Koto Body */}
      <div style={{ 
        position: 'relative',
        width: '700px',
        height: '300px',
        background: 'linear-gradient(to right, #8b4513, #a0522d, #cd853f, #8b4513)',
        borderRadius: '10px',
        boxShadow: '0 15px 30px rgba(0,0,0,0.5), inset 0 0 20px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '20px 40px',
        overflow: 'hidden'
      }}>
        {/* Wood grain pattern overlay */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1, backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 10px, #000 10px, #000 12px)', pointerEvents: 'none' }} />

        {/* Bridges and Strings */}
        {STRINGS.map((s, i) => {
          const isBent = bends.get(s.note) === 1;
          const isActive = activeNotes.has(s.note);
          
          return (
            <div key={s.note} style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%', height: '30px' }}>
              
              {/* String Label */}
              <div style={{ width: '30px', fontSize: '10px', color: '#fff', fontWeight: 'bold' }}>{s.key.toUpperCase()}</div>

              {/* Plucking Area (Right side of bridge) */}
              <div 
                 style={{ position: 'absolute', right: 0, width: '60%', height: '20px', zIndex: 10, cursor: 'pointer' }}
                 onMouseDown={() => playNoteFMSynth(s.note)}
              />

              {/* Bending Area (Left side of bridge) */}
              <div 
                 style={{ position: 'absolute', left: '40px', width: '30%', height: '20px', zIndex: 10, cursor: 'ns-resize' }}
                 onMouseDown={() => handleBendStart(s.note)}
                 onMouseUp={() => handleBendEnd(s.note)}
                 onMouseLeave={() => handleBendEnd(s.note)}
                 title="Click and hold to bend pitch"
              />

              {/* The String */}
              <motion.div
                animate={{
                  y: isActive ? [0, -2, 2, -1, 1, 0] : (isBent ? -5 : 0)
                }}
                transition={{ duration: isActive ? 0.2 : 0.1 }}
                style={{
                  position: 'absolute',
                  left: '40px',
                  right: 0,
                  height: '2px',
                  background: '#fdf5e6',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
                  pointerEvents: 'none'
                }}
              />

              {/* The Bridge (Movable bridge - Ji) */}
              <div style={{
                 position: 'absolute',
                 left: `${40 + (i * 5)}%`, // Staggered bridges
                 width: '10px',
                 height: '20px',
                 background: '#f5deb3', // Ivory color
                 borderTop: '2px solid #fff',
                 boxShadow: '2px 2px 5px rgba(0,0,0,0.5)',
                 borderRadius: '2px',
                 transform: 'translateY(-5px)',
                 pointerEvents: 'none'
              }} />

            </div>
          );
        })}

      </div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
         Click the right side of the string to pluck. Click and hold the left side to bend pitch.
      </div>
    </div>
  );
}
