import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Volume2, Wind } from 'lucide-react';
import masterBus from '../audio/masterBus';

const NOTES = [
  { note: 'C4', key: 'a' },
  { note: 'D4', key: 's' },
  { note: 'E4', key: 'd' },
  { note: 'F4', key: 'f' },
  { note: 'G4', key: 'g' },
  { note: 'A4', key: 'h' },
  { note: 'B4', key: 'j' },
  { note: 'C5', key: 'k' },
];

export default function Ocarina() {
  const synthRef = useRef(null);
  const [activeNote, setActiveNote] = useState(null);
  const [volume, setVolume] = useState(-5);
  const [glide, setGlide] = useState(0.1); // Portamento time

  useEffect(() => {
    // Ocarina sound: Pure sine wave with a soft envelope and portamento
    synthRef.current = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.05, decay: 0.1, sustain: 0.9, release: 0.2 },
      portamento: glide
    }).connect(masterBus);
    
    synthRef.current.volume.value = volume;

    const handleKeyDown = (e) => {
      if (e.repeat || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const n = NOTES.find(n => n.key === e.key.toLowerCase());
      if (n) playNote(n.note);
    };

    const handleKeyUp = (e) => {
      const n = NOTES.find(n => n.key === e.key.toLowerCase());
      if (n && activeNote === n.note) stopNote();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      synthRef.current?.dispose();
    };
  }, [activeNote, glide]);

  useEffect(() => {
    if (synthRef.current) synthRef.current.volume.rampTo(volume, 0.1);
  }, [volume]);

  useEffect(() => {
    if (synthRef.current) synthRef.current.portamento = glide;
  }, [glide]);

  const playNote = async (note) => {
    await Tone.start();
    if (!synthRef.current) return;
    
    // If a note is already playing, portamento to the new note
    if (activeNote) {
       synthRef.current.setNote(note);
    } else {
       synthRef.current.triggerAttack(note);
    }
    setActiveNote(note);
  };

  const stopNote = () => {
    if (synthRef.current) {
      synthRef.current.triggerRelease();
    }
    setActiveNote(null);
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
            <Wind size={14} /> Glide (Portamento)
          </label>
          <input 
            type="range" min="0" max="0.5" step="0.01" 
            value={glide} 
            onChange={(e) => setGlide(Number(e.target.value))}
            style={{ width: '100px', accentColor: 'var(--accent-primary)' }}
          />
        </div>
      </div>

      {/* Ocarina Body */}
      <div style={{ 
        position: 'relative',
        width: '400px',
        height: '250px',
        background: 'radial-gradient(ellipse at center, #4169E1, #00008B)',
        borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
        boxShadow: 'inset -10px -10px 20px rgba(0,0,0,0.5), inset 10px 10px 20px rgba(255,255,255,0.2), 0 10px 30px rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        
        {/* Mouthpiece */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '-20px',
          width: '60px',
          height: '40px',
          background: 'linear-gradient(to right, #00008B, #191970)',
          borderRadius: '20px',
          transform: 'rotate(-20deg)',
          boxShadow: 'inset 2px 2px 5px rgba(255,255,255,0.2)'
        }} />

        {/* Finger Holes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '30px', padding: '40px' }}>
          {NOTES.map((n, i) => (
            <motion.div
              key={n.note}
              animate={{
                scale: activeNote === n.note ? 0.9 : 1,
                boxShadow: activeNote === n.note ? 'inset 0 5px 10px rgba(0,0,0,0.8)' : 'inset 0 2px 5px rgba(0,0,0,0.8), 0 2px 5px rgba(255,255,255,0.2)'
              }}
              onMouseDown={() => playNote(n.note)}
              onMouseUp={stopNote}
              onMouseLeave={stopNote}
              style={{
                width: '35px',
                height: '35px',
                borderRadius: '50%',
                background: activeNote === n.note ? '#111' : '#333',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                border: '2px solid #222',
                position: 'relative'
              }}
            >
              <div style={{ fontSize: '10px', color: '#fff', position: 'absolute', top: '-20px', opacity: 0.8 }}>{n.note}</div>
              <div style={{ fontSize: '12px', color: '#888', fontWeight: 'bold' }}>{n.key.toUpperCase()}</div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}
