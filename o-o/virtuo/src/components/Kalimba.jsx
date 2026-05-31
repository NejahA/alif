import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Settings2, Volume2, Waves } from 'lucide-react';
import masterBus from '../audio/masterBus';

const TINES = [
  { note: 'D5', key: 'y', freq: Tone.Frequency('D5').toFrequency() },
  { note: 'B4', key: 'u', freq: Tone.Frequency('B4').toFrequency() },
  { note: 'G4', key: 'i', freq: Tone.Frequency('G4').toFrequency() },
  { note: 'E4', key: 'o', freq: Tone.Frequency('E4').toFrequency() },
  { note: 'C4', key: 'p', freq: Tone.Frequency('C4').toFrequency() },
  { note: 'A3', key: 'h', freq: Tone.Frequency('A3').toFrequency() },
  { note: 'F3', key: 'j', freq: Tone.Frequency('F3').toFrequency() },
  { note: 'D3', key: 'k', freq: Tone.Frequency('D3').toFrequency() },
  { note: 'C3', key: 'l', freq: Tone.Frequency('C3').toFrequency() },
  { note: 'E3', key: 'n', freq: Tone.Frequency('E3').toFrequency() },
  { note: 'G3', key: 'm', freq: Tone.Frequency('G3').toFrequency() },
  { note: 'B3', key: ',', freq: Tone.Frequency('B3').toFrequency() },
  { note: 'D4', key: '.', freq: Tone.Frequency('D4').toFrequency() },
  { note: 'F4', key: '/', freq: Tone.Frequency('F4').toFrequency() },
  { note: 'A4', key: 'v', freq: Tone.Frequency('A4').toFrequency() },
  { note: 'C5', key: 'b', freq: Tone.Frequency('C5').toFrequency() },
  { note: 'E5', key: 'n', freq: Tone.Frequency('E5').toFrequency() }
];

export default function Kalimba() {
  const synthRef = useRef(null);
  const [activeNotes, setActiveNotes] = useState(new Set());
  const [volume, setVolume] = useState(-5);
  const [decay, setDecay] = useState(2);

  useEffect(() => {
    synthRef.current = new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 3.01,
      modulationIndex: 14,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: decay, sustain: 0, release: decay },
      modulation: { type: 'square' },
      modulationEnvelope: { attack: 0.002, decay: 0.2, sustain: 0, release: 0.2 }
    }).connect(masterBus);
    
    synthRef.current.volume.value = volume;

    const handleKeyDown = (e) => {
      if (e.repeat || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const tine = TINES.find(t => t.key === e.key.toLowerCase());
      if (tine) {
        playNote(tine.note);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      synthRef.current?.dispose();
    };
  }, [decay]);

  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.volume.rampTo(volume, 0.1);
    }
  }, [volume]);

  const playNote = async (note) => {
    await Tone.start();
    if (!synthRef.current) return;
    
    // Add physical modeling "pluck" noise
    const noise = new Tone.Noise("pink").start();
    const noiseEnv = new Tone.AmplitudeEnvelope({ attack: 0.01, decay: 0.05, sustain: 0, release: 0 }).connect(masterBus);
    noise.connect(noiseEnv);
    noiseEnv.triggerAttack();
    setTimeout(() => { noise.dispose(); noiseEnv.dispose(); }, 100);

    synthRef.current.triggerAttack(note);
    
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
            <Waves size={14} /> Decay Time
          </label>
          <input 
            type="range" min="0.5" max="5" step="0.1" 
            value={decay} 
            onChange={(e) => setDecay(Number(e.target.value))}
            style={{ width: '100px', accentColor: 'var(--accent-primary)' }}
          />
        </div>
      </div>

      {/* Tines */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        alignItems: 'flex-start',
        background: 'linear-gradient(to bottom, #8B4513 0%, #654321 100%)',
        padding: '40px',
        borderRadius: '20px 20px 40px 40px',
        boxShadow: 'inset 0 10px 20px rgba(0,0,0,0.5), 0 10px 30px rgba(0,0,0,0.5)',
        position: 'relative'
      }}>
        {/* Bridge */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          right: '20px',
          height: '15px',
          background: 'linear-gradient(to bottom, #A0522D, #8B4513)',
          borderRadius: '5px',
          boxShadow: '0 5px 10px rgba(0,0,0,0.4)',
          zIndex: 10
        }} />

        {TINES.map((tine, i) => {
          // Calculate length based on pitch (lower frequency = longer tine)
          const length = 200 - (tine.freq / 10);
          
          return (
            <motion.div
              key={tine.note}
              animate={{
                y: activeNotes.has(tine.note) ? 5 : 0,
                scaleY: activeNotes.has(tine.note) ? 1.02 : 1
              }}
              onMouseDown={() => playNote(tine.note)}
              style={{
                width: '25px',
                height: `${length}px`,
                background: 'linear-gradient(to bottom, #d4af37, #aa8c2c)',
                borderRadius: '0 0 12px 12px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                alignItems: 'center',
                paddingBottom: '10px',
                boxShadow: '2px 0 5px rgba(0,0,0,0.3), -1px 0 2px rgba(255,255,255,0.2)',
                position: 'relative',
                zIndex: 20
              }}
            >
              <div style={{ fontSize: '10px', color: '#554616', fontWeight: 'bold' }}>{tine.note}</div>
              <div style={{ fontSize: '8px', color: '#554616', opacity: 0.6, marginTop: '2px' }}>{tine.key.toUpperCase()}</div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
