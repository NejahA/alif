import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Volume2, Key } from 'lucide-react';
import masterBus from '../audio/masterBus';

const KEYS = [
  { note: 'C5', key: 'a' },
  { note: 'D5', key: 's' },
  { note: 'E5', key: 'd' },
  { note: 'F5', key: 'f' },
  { note: 'G5', key: 'g' },
  { note: 'A5', key: 'h' },
  { note: 'B5', key: 'j' },
  { note: 'C6', key: 'k' },
];

export default function MusicBox() {
  const synthRef = useRef(null);
  const [activeNotes, setActiveNotes] = useState(new Set());
  const [volume, setVolume] = useState(-5);
  const [winding, setWinding] = useState(0); // visual only for now

  useEffect(() => {
    // Music Box sound: High frequency sine with very fast attack and slow release
    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.005, decay: 0.1, sustain: 0, release: 2.5 }
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

  const playNote = async (note) => {
    await Tone.start();
    if (!synthRef.current) return;
    
    synthRef.current.triggerAttackRelease(note, "16n");
    
    // Wind up visually
    setWinding(prev => prev + 45);

    setActiveNotes(prev => new Set([...prev, note]));
    setTimeout(() => {
      setActiveNotes(prev => {
        const next = new Set(prev);
        next.delete(note);
        return next;
      });
    }, 150); // Visual pluck
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

      {/* Music Box Body */}
      <div style={{ 
        position: 'relative',
        padding: '30px',
        background: '#5c2e0b', // wooden box
        borderRadius: '10px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.8), inset 0 0 20px rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        gap: '20px'
      }}>
        
        {/* Brass Cylinder */}
        <motion.div 
          animate={{ rotateX: winding }}
          transition={{ type: 'spring', stiffness: 50 }}
          style={{
            width: '300px',
            height: '100px',
            background: 'linear-gradient(to bottom, #b8860b, #ffd700, #daa520, #8b6508)',
            borderRadius: '50px',
            boxShadow: '0 5px 10px rgba(0,0,0,0.5), inset 0 2px 5px rgba(255,255,255,0.5)',
            position: 'relative',
            display: 'flex',
            justifyContent: 'space-evenly',
            alignItems: 'center',
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Decorative lines */}
          <div style={{ position: 'absolute', top: 10, bottom: 10, left: 10, width: 2, background: 'rgba(0,0,0,0.2)' }} />
          <div style={{ position: 'absolute', top: 10, bottom: 10, right: 10, width: 2, background: 'rgba(0,0,0,0.2)' }} />
          
          {/* Pins representing notes */}
          {KEYS.map((k, i) => (
             <motion.div
                key={k.note}
                animate={{
                   backgroundColor: activeNotes.has(k.note) ? '#fff' : '#8b6508',
                   scale: activeNotes.has(k.note) ? 1.5 : 1
                }}
                style={{
                   width: '8px',
                   height: '8px',
                   borderRadius: '50%',
                   background: '#8b6508',
                   boxShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                }}
             />
          ))}
        </motion.div>

        {/* Metal Comb */}
        <div style={{
          width: '50px',
          height: '120px',
          background: 'linear-gradient(to right, #ccc, #fff, #999)',
          borderRadius: '5px',
          boxShadow: '0 5px 10px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-evenly',
          padding: '10px 0'
        }}>
           {KEYS.map(k => (
             <motion.div 
               key={k.note + '-comb'}
               animate={{ x: activeNotes.has(k.note) ? -5 : 0 }}
               onMouseDown={() => playNote(k.note)}
               style={{
                 height: '6px',
                 width: '100%',
                 background: '#fff',
                 borderBottom: '1px solid #999',
                 cursor: 'pointer',
                 boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
               }}
             />
           ))}
        </div>

        {/* Winding Key */}
        <div style={{ position: 'absolute', right: '-20px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
           <div style={{ width: '20px', height: '10px', background: '#daa520' }} />
           <motion.div 
             animate={{ rotate: winding }}
             transition={{ type: 'spring', stiffness: 50 }}
             style={{ 
               width: '30px', height: '60px', 
               border: '5px solid #daa520', borderRadius: '50% 50% 10px 10px',
               display: 'flex', alignItems: 'center', justifyContent: 'center'
             }}
           >
             <Key size={16} color="#daa520" style={{ transform: 'rotate(90deg)' }} />
           </motion.div>
        </div>

      </div>
    </div>
  );
}
