import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Volume2, Activity } from 'lucide-react';
import masterBus from '../audio/masterBus';

const KEYS = [
  { note: 'C5', key: 'a', color: 'silver' },
  { note: 'C#5', key: 'w', color: 'black' },
  { note: 'D5', key: 's', color: 'silver' },
  { note: 'D#5', key: 'e', color: 'black' },
  { note: 'E5', key: 'd', color: 'silver' },
  { note: 'F5', key: 'f', color: 'silver' },
  { note: 'F#5', key: 't', color: 'black' },
  { note: 'G5', key: 'g', color: 'silver' },
  { note: 'G#5', key: 'y', color: 'black' },
  { note: 'A5', key: 'h', color: 'silver' },
  { note: 'A#5', key: 'u', color: 'black' },
  { note: 'B5', key: 'j', color: 'silver' },
  { note: 'C6', key: 'k', color: 'silver' }
];

export default function Glockenspiel() {
  const synthRef = useRef(null);
  const [activeNotes, setActiveNotes] = useState(new Set());
  const [volume, setVolume] = useState(-10); // Glockenspiels are loud and piercing
  const [decay, setDecay] = useState(2.0); // Long metallic decay

  useEffect(() => {
    // Glockenspiel sound: High frequency sine with slight FM for the strike transient
    synthRef.current = new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 8,
      modulationIndex: 1.5,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: decay, sustain: 0, release: decay },
      modulation: { type: 'sine' },
      modulationEnvelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 }
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
  }, [decay]);

  useEffect(() => {
    if (synthRef.current) synthRef.current.volume.rampTo(volume, 0.1);
  }, [volume]);

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
    }, 100);
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
            <Activity size={14} /> Ring Decay
          </label>
          <input 
            type="range" min="0.5" max="5" step="0.5" 
            value={decay} 
            onChange={(e) => setDecay(Number(e.target.value))}
            style={{ width: '100px', accentColor: 'var(--accent-primary)' }}
          />
        </div>
      </div>

      {/* Glockenspiel Bars */}
      <div style={{ 
        position: 'relative',
        height: '250px',
        width: '600px',
        padding: '20px',
        background: '#8b4513', // Wooden case
        borderRadius: '10px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5), inset 0 0 20px rgba(0,0,0,0.8)'
      }}>
        
        {/* Felt rails */}
        <div style={{ position: 'absolute', top: 50, left: 20, right: 20, height: 10, background: '#8b0000', borderRadius: 5, boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5)' }} />
        <div style={{ position: 'absolute', bottom: 50, left: 20, right: 20, height: 10, background: '#8b0000', borderRadius: 5, boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5)' }} />

        {/* Silver Keys */}
        <div style={{ display: 'flex', gap: '15px', position: 'absolute', bottom: '30px', left: '30px' }}>
          {KEYS.filter(k => k.color === 'silver').map((k, i) => (
            <motion.div
              key={k.note}
              animate={{
                y: activeNotes.has(k.note) ? 2 : 0,
                filter: activeNotes.has(k.note) ? 'brightness(1.5)' : 'brightness(1)'
              }}
              onMouseDown={() => playNote(k.note)}
              style={{
                width: '35px',
                height: `${140 - (i * 3)}px`,
                background: 'linear-gradient(to right, #e0e0e0, #ffffff, #c0c0c0)',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                alignItems: 'center',
                paddingBottom: '10px',
                boxShadow: '0 5px 10px rgba(0,0,0,0.3), inset 2px 2px 5px rgba(255,255,255,0.8)',
                border: '1px solid #aaa'
              }}
            >
              {/* Pegs */}
              <div style={{ position: 'absolute', top: 15, width: 6, height: 6, borderRadius: '50%', background: '#333' }} />
              <div style={{ position: 'absolute', bottom: 15, width: 6, height: 6, borderRadius: '50%', background: '#333' }} />

              <div style={{ fontSize: '12px', color: '#555', fontWeight: 'bold' }}>{k.note}</div>
              <div style={{ fontSize: '10px', color: '#555', opacity: 0.6 }}>{k.key.toUpperCase()}</div>
            </motion.div>
          ))}
        </div>

        {/* Black/Upper Keys (also metal, but offset) */}
        <div style={{ display: 'flex', gap: '15px', position: 'absolute', top: '30px', left: '55px' }}>
          {KEYS.filter(k => k.color === 'black').map((k, i) => {
            const margin = (k.note === 'F#5') ? '50px' : '0px';
            return (
              <motion.div
                key={k.note}
                animate={{
                  y: activeNotes.has(k.note) ? 2 : 0,
                  filter: activeNotes.has(k.note) ? 'brightness(1.5)' : 'brightness(1)'
                }}
                onMouseDown={() => playNote(k.note)}
                style={{
                  width: '35px',
                  height: `${120 - (i * 3)}px`,
                  background: 'linear-gradient(to right, #999, #bbb, #777)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  paddingBottom: '10px',
                  marginLeft: margin,
                  boxShadow: '0 5px 10px rgba(0,0,0,0.3), inset 2px 2px 5px rgba(255,255,255,0.5)',
                  border: '1px solid #666'
                }}
              >
                <div style={{ position: 'absolute', top: 10, width: 6, height: 6, borderRadius: '50%', background: '#222' }} />
                <div style={{ position: 'absolute', bottom: 10, width: 6, height: 6, borderRadius: '50%', background: '#222' }} />

                <div style={{ fontSize: '10px', color: '#222', fontWeight: 'bold' }}>{k.note}</div>
                <div style={{ fontSize: '8px', color: '#222', opacity: 0.6 }}>{k.key.toUpperCase()}</div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  );
}
