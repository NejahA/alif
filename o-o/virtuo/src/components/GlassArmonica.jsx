import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Volume2, Activity } from 'lucide-react';
import masterBus from '../audio/masterBus';

const NOTES = [
  { note: 'C4', key: 'a', radius: 100 },
  { note: 'D4', key: 's', radius: 90 },
  { note: 'E4', key: 'd', radius: 80 },
  { note: 'F4', key: 'f', radius: 70 },
  { note: 'G4', key: 'g', radius: 60 },
  { note: 'A4', key: 'h', radius: 50 },
  { note: 'B4', key: 'j', radius: 40 },
  { note: 'C5', key: 'k', radius: 30 }
];

export default function GlassArmonica() {
  const synthRef = useRef(null);
  const [activeNotes, setActiveNotes] = useState(new Set());
  const [volume, setVolume] = useState(-5);
  const [spinSpeed, setSpinSpeed] = useState(1);

  useEffect(() => {
    // Glass Armonica sound: Pure sine with slow attack/release, slight chorus for ethereal feel
    const chorus = new Tone.Chorus(0.5, 2.5, 0.5).start().connect(masterBus);
    const reverb = new Tone.Reverb({ decay: 5, wet: 0.5 }).connect(chorus);
    
    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.5, decay: 0.5, sustain: 1, release: 2 }
    }).connect(reverb);
    
    synthRef.current.volume.value = volume;

    const handleKeyDown = (e) => {
      if (e.repeat || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const n = NOTES.find(n => n.key === e.key.toLowerCase());
      if (n && !activeNotes.has(n.note)) {
        playNote(n.note);
      }
    };

    const handleKeyUp = (e) => {
      const n = NOTES.find(n => n.key === e.key.toLowerCase());
      if (n) stopNote(n.note);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      synthRef.current?.dispose();
      chorus.dispose();
      reverb.dispose();
    };
  }, []);

  useEffect(() => {
    if (synthRef.current) synthRef.current.volume.rampTo(volume, 0.1);
  }, [volume]);

  const playNote = async (note) => {
    await Tone.start();
    if (!synthRef.current) return;
    synthRef.current.triggerAttack(note);
    setActiveNotes(prev => new Set([...prev, note]));
  };

  const stopNote = (note) => {
    if (!synthRef.current) return;
    synthRef.current.triggerRelease(note);
    setActiveNotes(prev => {
      const next = new Set(prev);
      next.delete(note);
      return next;
    });
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

      {/* Glass Armonica Body */}
      <div style={{ 
        position: 'relative',
        height: '250px',
        width: '600px',
        background: 'linear-gradient(to bottom, #111, #222)',
        borderRadius: '10px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.8), inset 0 20px 50px rgba(0,100,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        {/* Central Spindle */}
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '4px', background: 'linear-gradient(to bottom, #ccc, #777, #ccc)', transform: 'translateY(-50%)', zIndex: 1 }} />
        
        {/* Bowls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '-20px', zIndex: 2 }}>
          {NOTES.map((n, i) => (
            <motion.div
              key={n.note}
              animate={{ 
                 rotateX: activeNotes.has(n.note) ? [0, 360] : 0,
                 boxShadow: activeNotes.has(n.note) ? '0 0 20px rgba(100, 200, 255, 0.8), inset 0 0 30px rgba(100,200,255,0.5)' : 'inset 0 0 10px rgba(255,255,255,0.2)'
              }}
              transition={{ 
                 rotateX: { duration: 1 / spinSpeed, repeat: Infinity, ease: 'linear' },
                 boxShadow: { duration: 0.5 }
              }}
              onMouseDown={() => playNote(n.note)}
              onMouseUp={() => stopNote(n.note)}
              onMouseLeave={() => stopNote(n.note)}
              style={{
                width: `${n.radius / 2}px`,
                height: `${n.radius * 2}px`,
                background: 'linear-gradient(to right, rgba(255,255,255,0.1), rgba(255,255,255,0.4), rgba(255,255,255,0.1))',
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.5)',
                margin: '0 -5px', // Overlap
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(2px)'
              }}
            >
               <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', transform: 'rotate(90deg)' }}>{n.key.toUpperCase()}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
