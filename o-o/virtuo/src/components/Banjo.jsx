import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Volume2, Activity } from 'lucide-react';
import masterBus from '../audio/masterBus';

const STRINGS = [
  { note: 'G4', key: 'g' }, // 5th string (short string)
  { note: 'D3', key: 'a' }, // 4th string
  { note: 'G3', key: 's' }, // 3rd string
  { note: 'B3', key: 'd' }, // 2nd string
  { note: 'D4', key: 'f' }, // 1st string
];

export default function Banjo() {
  const synthRef = useRef(null);
  const [activeNotes, setActiveNotes] = useState(new Set());
  const [volume, setVolume] = useState(-5);
  const [twang, setTwang] = useState(0.8);

  useEffect(() => {
    // Banjo sound: Plucked synth with sharp attack, fast decay, and bright harmonics
    synthRef.current = new Tone.PolySynth(Tone.PluckSynth, {
      attackNoise: 1,
      dampening: 3000,
      resonance: twang
    }).connect(masterBus);

    synthRef.current.volume.value = volume;

    const handleKeyDown = (e) => {
      if (e.repeat || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const s = STRINGS.find(s => s.key === e.key.toLowerCase());
      if (s) playNote(s.note);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      synthRef.current?.dispose();
    };
  }, [twang]);

  useEffect(() => {
    if (synthRef.current) synthRef.current.volume.rampTo(volume, 0.1);
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
            <Activity size={14} /> Twang (Resonance)
          </label>
          <input 
            type="range" min="0.5" max="0.99" step="0.01" 
            value={twang} 
            onChange={(e) => setTwang(Number(e.target.value))}
            style={{ width: '100px', accentColor: 'var(--accent-primary)' }}
          />
        </div>
      </div>

      {/* Banjo Body & Fretboard */}
      <div style={{ 
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        padding: '20px'
      }}>
        
        {/* Fretboard */}
        <div style={{
          width: '400px',
          height: '100px',
          background: 'linear-gradient(to bottom, #4a2e15, #2e1a0b)',
          borderRadius: '5px 0 0 5px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-around',
          padding: '10px 0',
          position: 'relative',
          boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
          zIndex: 5
        }}>
          {/* Frets */}
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50px', right: '0', display: 'flex', justifyContent: 'space-evenly', opacity: 0.5, pointerEvents: 'none' }}>
             {[...Array(15)].map((_, i) => (
                <div key={i} style={{ width: '3px', background: '#e0e0e0', height: '100%' }} />
             ))}
          </div>

          {/* Strings on Fretboard */}
          {STRINGS.map((s, i) => {
            // 5th string is physically shorter, starts partway up the neck
            const isShortString = i === 0;
            return (
              <motion.div
                key={s.note}
                animate={{
                  y: activeNotes.has(s.note) ? [0, -2, 2, -1, 1, 0] : 0
                }}
                transition={{ duration: 0.2 }}
                onMouseDown={() => playNote(s.note)}
                style={{
                  height: '2px',
                  width: isShortString ? '60%' : '100%',
                  marginLeft: isShortString ? '40%' : '0',
                  background: '#e0e0e0',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  position: 'relative',
                  zIndex: 10
                }}
              >
                <div style={{ position: 'absolute', left: '-25px', fontSize: '12px', color: '#fff', fontWeight: 'bold' }}>{s.key.toUpperCase()}</div>
              </motion.div>
            )
          })}
        </div>

        {/* Drum Body */}
        <div style={{
          width: '250px',
          height: '250px',
          background: 'radial-gradient(ellipse at center, #fdf5e6 0%, #e8dcc4 80%, #b5a485 100%)', // Drum head
          borderRadius: '50%',
          marginLeft: '-30px',
          border: '15px solid #8b4513', // Resonator rim
          boxShadow: '0 10px 30px rgba(0,0,0,0.5), inset 0 0 20px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 4,
          position: 'relative'
        }}>
           {/* Bridge */}
           <div style={{ width: '15px', height: '100px', background: '#f5deb3', borderRadius: '3px', boxShadow: '2px 2px 5px rgba(0,0,0,0.3)', position: 'absolute', left: '150px' }} />
           
           {/* Strings crossing the drum */}
           <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '17px', height: '100px', position: 'absolute', left: '0', right: '50px', zIndex: 10 }}>
              {STRINGS.map(s => (
                <motion.div
                  key={s.note + '-drum'}
                  animate={{ y: activeNotes.has(s.note) ? [0, -2, 2, -1, 1, 0] : 0 }}
                  transition={{ duration: 0.2 }}
                  onMouseDown={() => playNote(s.note)}
                  style={{
                    height: '2px',
                    width: '100%',
                    background: '#ccc',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.5)',
                    cursor: 'pointer'
                  }}
                />
              ))}
           </div>
        </div>

      </div>
    </div>
  );
}
