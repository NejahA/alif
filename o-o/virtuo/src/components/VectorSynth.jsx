import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Crosshair, Move, Volume2 } from 'lucide-react';
import masterBus from '../audio/masterBus';

const OSC_TYPES = [
  { id: 'A', name: 'Sine', type: 'sine', color: '#60a5fa', x: 0, y: 0 },
  { id: 'B', name: 'Saw', type: 'sawtooth', color: '#f87171', x: 100, y: 0 },
  { id: 'C', name: 'Square', type: 'square', color: '#fbbf24', x: 0, y: 100 },
  { id: 'D', name: 'Noise', type: 'noise', color: '#a78bfa', x: 100, y: 100 }
];

export default function VectorSynth() {
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isNotePlaying, setIsNotePlaying] = useState(false);
  const [activeNote, setActiveNote] = useState('C3');
  
  const synthsRef = useRef({});
  const containerRef = useRef(null);

  useEffect(() => {
    // Initialize 4 synths for the 4 corners
    synthsRef.current.A = new Tone.MonoSynth({ oscillator: { type: 'sine' }, envelope: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 1 } }).connect(masterBus);
    synthsRef.current.B = new Tone.MonoSynth({ oscillator: { type: 'sawtooth' }, envelope: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 1 } }).connect(masterBus);
    synthsRef.current.C = new Tone.MonoSynth({ oscillator: { type: 'square' }, envelope: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 1 } }).connect(masterBus);
    
    // Special case for noise
    synthsRef.current.D = new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 1 } }).connect(masterBus);

    return () => {
      Object.values(synthsRef.current).forEach(s => s.dispose());
    };
  }, []);

  useEffect(() => {
    // Update volumes based on XY position
    const { x, y } = position;
    const normX = x / 100;
    const normY = y / 100;

    // Weighting logic for 4 corners
    const volA = (1 - normX) * (1 - normY);
    const volB = normX * (1 - normY);
    const volC = (1 - normX) * normY;
    const volD = normX * normY;

    const setVol = (synth, weight) => {
      // Use gain value for ramp
      const db = Tone.gainToDb(weight);
      if (synth.volume) synth.volume.rampTo(db, 0.05);
    };

    setVol(synthsRef.current.A, volA);
    setVol(synthsRef.current.B, volB);
    setVol(synthsRef.current.C, volC);
    setVol(synthsRef.current.D, volD);
  }, [position]);

  const handleXYMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.min(Math.max(0, ((e.clientX - rect.left) / rect.width) * 100), 100);
    const y = Math.min(Math.max(0, ((e.clientY - rect.top) / rect.height) * 100), 100);
    setPosition({ x, y });
  };

  const playNote = async (note) => {
    await Tone.start();
    setActiveNote(note);
    setIsNotePlaying(true);
    
    Object.keys(synthsRef.current).forEach(key => {
      if (key === 'D') {
        synthsRef.current[key].triggerAttack(Tone.now());
      } else {
        synthsRef.current[key].triggerAttack(note, Tone.now());
      }
    });
  };

  const stopNote = () => {
    setIsNotePlaying(false);
    Object.values(synthsRef.current).forEach(s => s.triggerRelease());
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
          <Crosshair size={24} color="var(--accent-primary)" /> Vector Synthesizer
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>4-Way Morphing Engine</p>
      </div>

      <div 
        ref={containerRef}
        onMouseMove={(e) => e.buttons === 1 && handleXYMove(e)}
        onMouseDown={handleXYMove}
        style={{ 
          width: '400px', height: '400px', 
          background: '#000', borderRadius: '24px', 
          position: 'relative', overflow: 'hidden',
          border: '1px solid var(--glass-border)',
          boxShadow: '0 0 50px rgba(0,0,0,0.5)',
          cursor: 'crosshair'
        }}
      >
        {/* Background Gradients */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 0% 0%, rgba(96, 165, 250, 0.2), transparent)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 100% 0%, rgba(248, 113, 113, 0.2), transparent)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 0% 100%, rgba(251, 191, 36, 0.2), transparent)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 100% 100%, rgba(167, 139, 250, 0.2), transparent)' }} />

        {/* Labels */}
        {OSC_TYPES.map(osc => (
          <div key={osc.id} style={{ 
            position: 'absolute', 
            left: osc.x === 0 ? '20px' : 'auto', 
            right: osc.x === 100 ? '20px' : 'auto',
            top: osc.y === 0 ? '20px' : 'auto',
            bottom: osc.y === 100 ? '20px' : 'auto',
            color: osc.color,
            fontSize: '10px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            {osc.name}
          </div>
        ))}

        {/* Morph Cursor */}
        <motion.div 
          animate={{ x: (position.x / 100) * 400 - 20, y: (position.y / 100) * 400 - 20 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          style={{ 
            position: 'absolute', 
            width: '40px', height: '40px', 
            borderRadius: '50%', border: '2px solid white',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(4px)',
            boxShadow: '0 0 20px rgba(255,255,255,0.3)',
            pointerEvents: 'none'
          }}
        >
          <div style={{ width: '4px', height: '4px', background: 'white', borderRadius: '50%' }} />
        </motion.div>
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {['C2', 'E2', 'G2', 'C3', 'E3', 'G3', 'C4'].map(note => (
          <button
            key={note}
            className={`btn-glass ${activeNote === note && isNotePlaying ? 'active' : ''}`}
            onMouseDown={() => playNote(note)}
            onMouseUp={stopNote}
            onMouseLeave={stopNote}
            style={{ padding: '15px 25px', borderRadius: '12px' }}
          >
            {note}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', background: 'rgba(0,0,0,0.2)', padding: '15px 30px', borderRadius: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: 'var(--text-muted)' }}>
          <Move size={14} /> Drag XY Pad to Morph
        </div>
        <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: 'var(--text-muted)' }}>
          <Volume2 size={14} /> Master Vector Output
        </div>
      </div>
    </div>
  );
}
