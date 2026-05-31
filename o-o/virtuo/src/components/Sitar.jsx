import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Volume2, Music } from 'lucide-react';
import masterBus from '../audio/masterBus';

const STRINGS = [
  { note: 'C3', key: 'a' },
  { note: 'D3', key: 's' },
  { note: 'E3', key: 'd' },
  { note: 'F3', key: 'f' },
  { note: 'G3', key: 'g' },
  { note: 'A3', key: 'h' },
  { note: 'B3', key: 'j' },
  { note: 'C4', key: 'k' },
];

export default function Sitar() {
  const synthRef = useRef(null);
  const droneRef = useRef(null);
  const [activeNotes, setActiveNotes] = useState(new Set());
  const [droneActive, setDroneActive] = useState(false);
  const [volume, setVolume] = useState(-5);
  const [resonance, setResonance] = useState(0.8);

  useEffect(() => {
    // Sitar sound: Plucked string with high resonance to simulate the Jawari (bridge)
    synthRef.current = new Tone.PolySynth(Tone.PluckSynth, {
      attackNoise: 1,
      dampening: 4000,
      resonance: resonance
    }).connect(masterBus);

    // Drone sound: sustained notes typically C and G
    droneRef.current = new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 1.5,
      modulationIndex: 1,
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 1, decay: 0.1, sustain: 1, release: 2 }
    }).connect(masterBus);
    
    synthRef.current.volume.value = volume;
    droneRef.current.volume.value = volume - 10; // Drone should be softer

    const handleKeyDown = (e) => {
      if (e.repeat || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key.toLowerCase() === ' ') {
        toggleDrone();
        return;
      }
      const s = STRINGS.find(s => s.key === e.key.toLowerCase());
      if (s) playNote(s.note);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      synthRef.current?.dispose();
      droneRef.current?.dispose();
    };
  }, [resonance]);

  useEffect(() => {
    if (synthRef.current) synthRef.current.volume.rampTo(volume, 0.1);
    if (droneRef.current) droneRef.current.volume.rampTo(volume - 10, 0.1);
  }, [volume]);

  const playNote = async (note) => {
    await Tone.start();
    if (!synthRef.current) return;
    
    synthRef.current.triggerAttack(note);
    setActiveNotes(prev => new Set([...prev, note]));
    setTimeout(() => {
      setActiveNotes(prev => {
        const next = new Set(prev);
        next.delete(note);
        return next;
      });
    }, 100); // Visual pluck
  };

  const toggleDrone = async () => {
    await Tone.start();
    if (!droneRef.current) return;
    
    if (!droneActive) {
      // Play a C2 and G2 drone
      droneRef.current.triggerAttack(['C2', 'G2']);
      setDroneActive(true);
    } else {
      droneRef.current.triggerRelease(['C2', 'G2']);
      setDroneActive(false);
    }
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
            <Music size={14} /> Resonance
          </label>
          <input 
            type="range" min="0.5" max="0.99" step="0.01" 
            value={resonance} 
            onChange={(e) => setResonance(Number(e.target.value))}
            style={{ width: '100px', accentColor: 'var(--accent-primary)' }}
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button 
            className={`btn-glass ${droneActive ? 'active' : ''}`}
            onClick={toggleDrone}
            style={{ padding: '8px 15px', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            {droneActive ? 'Stop Drone' : 'Play Drone (Space)'}
          </button>
        </div>
      </div>

      {/* Sitar Fretboard */}
      <div style={{ 
        position: 'relative',
        width: '600px',
        height: '180px',
        background: 'linear-gradient(to right, #8b4513, #cd853f, #8b4513)',
        borderRadius: '5px 50px 50px 5px',
        boxShadow: '0 10px 20px rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        padding: '20px'
      }}>
        
        {/* Frets (Visual only) */}
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '100px', right: '100px', display: 'flex', justifyContent: 'space-between', opacity: 0.3 }}>
          {[...Array(12)].map((_, i) => (
             <div key={i} style={{ width: '4px', background: '#d4af37', height: '100%' }} />
          ))}
        </div>

        {/* Strings */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', width: '100%', zIndex: 10 }}>
          {STRINGS.map((s, i) => (
            <motion.div
              key={s.note}
              animate={{
                y: activeNotes.has(s.note) ? [0, -2, 2, -1, 1, 0] : 0
              }}
              transition={{ duration: 0.2 }}
              onMouseDown={() => playNote(s.note)}
              style={{
                height: '4px',
                width: '100%',
                background: 'linear-gradient(to bottom, #d4af37, #fdf5e6, #d4af37)',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                position: 'relative'
              }}
            >
              {/* String label indicator */}
              <div style={{ position: 'absolute', left: '-30px', fontSize: '10px', color: '#fff', fontWeight: 'bold' }}>{s.key.toUpperCase()}</div>
              {/* Note name on hover/active */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: activeNotes.has(s.note) ? 1 : 0 }}
                style={{ position: 'absolute', left: '50%', background: '#fff', color: '#000', padding: '2px 5px', borderRadius: '4px', fontSize: '10px' }}
              >
                {s.note}
              </motion.div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}
