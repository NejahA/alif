import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Volume2, Activity } from 'lucide-react';
import masterBus from '../audio/masterBus';

// Circular layout for Steel Pan
const NOTES = [
  { note: 'C4', key: 'h', angle: 0, radius: 40 },
  { note: 'D4', key: 'j', angle: 45, radius: 40 },
  { note: 'E4', key: 'k', angle: 90, radius: 40 },
  { note: 'F4', key: 'l', angle: 135, radius: 40 },
  { note: 'G4', key: 'u', angle: 180, radius: 40 },
  { note: 'A4', key: 'i', angle: 225, radius: 40 },
  { note: 'B4', key: 'o', angle: 270, radius: 40 },
  { note: 'C5', key: 'p', angle: 315, radius: 40 },
  
  // Inner circle
  { note: 'D5', key: 'y', angle: 0, radius: 75 },
  { note: 'E5', key: 't', angle: 72, radius: 75 },
  { note: 'F5', key: 'r', angle: 144, radius: 75 },
  { note: 'G5', key: 'e', angle: 216, radius: 75 },
  { note: 'A5', key: 'w', angle: 288, radius: 75 },
];

export default function SteelPan() {
  const synthRef = useRef(null);
  const [activeNotes, setActiveNotes] = useState(new Set());
  const [volume, setVolume] = useState(-5);
  const [brightness, setBrightness] = useState(2.5); // Modulation index

  useEffect(() => {
    // Steel Pan sound: FM Synthesis with metallic, non-integer harmonicity
    synthRef.current = new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 2.7, // Non-integer for metallic sound
      modulationIndex: brightness,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.4, sustain: 0.1, release: 1 },
      modulation: { type: 'triangle' },
      modulationEnvelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.2 }
    }).connect(masterBus);
    
    synthRef.current.volume.value = volume;

    const handleKeyDown = (e) => {
      if (e.repeat || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const n = NOTES.find(n => n.key === e.key.toLowerCase());
      if (n) playNote(n.note);
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
      synthRef.current.set({ modulationIndex: brightness });
    }
  }, [brightness]);

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
            <Activity size={14} /> Brightness
          </label>
          <input 
            type="range" min="1" max="10" step="0.5" 
            value={brightness} 
            onChange={(e) => setBrightness(Number(e.target.value))}
            style={{ width: '100px', accentColor: 'var(--accent-primary)' }}
          />
        </div>
      </div>

      {/* Steel Pan Body */}
      <div style={{ 
        position: 'relative',
        width: '350px',
        height: '350px',
        background: 'radial-gradient(ellipse at center, #d4d4d4 0%, #888 70%, #555 100%)',
        borderRadius: '50%',
        boxShadow: 'inset 0 10px 30px rgba(0,0,0,0.8), 0 10px 20px rgba(0,0,0,0.5)',
        border: '10px solid #444',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        
        {NOTES.map((n) => {
          // Convert polar to cartesian
          const rad = (n.angle - 90) * (Math.PI / 180);
          const cx = 50 + n.radius * Math.cos(rad);
          const cy = 50 + n.radius * Math.sin(rad);

          return (
            <motion.div
              key={n.note}
              animate={{
                scale: activeNotes.has(n.note) ? 0.9 : 1,
                backgroundColor: activeNotes.has(n.note) ? '#fff' : 'rgba(200,200,200,0.2)'
              }}
              onMouseDown={() => playNote(n.note)}
              style={{
                position: 'absolute',
                left: `${cx}%`,
                top: `${cy}%`,
                transform: 'translate(-50%, -50%)',
                width: n.radius > 50 ? '45px' : '65px',
                height: n.radius > 50 ? '45px' : '65px',
                borderRadius: '50%',
                border: '1px solid rgba(0,0,0,0.2)',
                boxShadow: activeNotes.has(n.note) ? 'inset 0 2px 10px rgba(0,0,0,0.5)' : 'inset 0 2px 5px rgba(255,255,255,0.8), inset 0 -2px 5px rgba(0,0,0,0.3)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#333'
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{n.note}</span>
              <span style={{ fontSize: '10px', opacity: 0.7 }}>{n.key.toUpperCase()}</span>
            </motion.div>
          );
        })}

        {/* Center Indent */}
        <div style={{
           position: 'absolute',
           width: '60px',
           height: '60px',
           borderRadius: '50%',
           background: 'radial-gradient(ellipse at center, #555 0%, #777 100%)',
           boxShadow: 'inset 0 5px 10px rgba(0,0,0,0.5)'
        }} />

      </div>
    </div>
  );
}
