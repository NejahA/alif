import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Volume2, Wind } from 'lucide-react';
import masterBus from '../audio/masterBus';

const KEYS = [
  { note: 'C4', key: 'a' }, { note: 'D4', key: 's' }, { note: 'E4', key: 'd' },
  { note: 'F4', key: 'f' }, { note: 'G4', key: 'g' }, { note: 'A4', key: 'h' },
  { note: 'B4', key: 'j' }, { note: 'C5', key: 'k' },
];

export default function Saxophone() {
  const [activeNote, setActiveNote] = useState(null);
  const [volume, setVolume] = useState(-5);
  const [breath, setBreath] = useState(0);
  
  const synthRef = useRef(null);
  const vibratoRef = useRef(null);
  const reverbRef = useRef(null);

  useEffect(() => {
    reverbRef.current = new Tone.Reverb({ decay: 2, wet: 0.3 }).connect(masterBus);
    vibratoRef.current = new Tone.Vibrato({ frequency: 5, depth: 0.1 }).connect(reverbRef.current);
    
    synthRef.current = new Tone.MonoSynth({
      oscillator: { type: 'sawtooth' },
      filter: { Q: 2, type: 'lowpass', rolloff: -24 },
      envelope: { attack: 0.1, decay: 0.1, sustain: 0.8, release: 0.4 },
      filterEnvelope: { attack: 0.1, decay: 0.2, sustain: 0.8, release: 0.4, baseFrequency: 300, octaves: 3 }
    }).connect(vibratoRef.current);
    
    const handleKeyDown = (e) => {
      if (e.repeat || e.target.tagName === 'INPUT') return;
      const keyObj = KEYS.find(k => k.key === e.key.toLowerCase());
      if (keyObj && keyObj.note !== activeNote) {
        playNote(keyObj.note);
      }
    };

    const handleKeyUp = (e) => {
      const keyObj = KEYS.find(k => k.key === e.key.toLowerCase());
      if (keyObj && keyObj.note === activeNote) releaseNote();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      synthRef.current?.dispose();
      vibratoRef.current?.dispose();
      reverbRef.current?.dispose();
    };
  }, [activeNote]);

  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.volume.rampTo(volume, 0.1);
    }
  }, [volume]);

  const playNote = async (note) => {
    await Tone.start();
    if (synthRef.current) {
      synthRef.current.triggerAttack(note);
      setActiveNote(note);
      setBreath(1);
    }
  };

  const releaseNote = () => {
    if (synthRef.current) {
      synthRef.current.triggerRelease();
      setActiveNote(null);
      setBreath(0);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', width: '100%' }}>
      <div style={{ display: 'flex', gap: '20px', padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', width: '100%', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Volume2 size={14} /> Master Volume
          </label>
          <input 
            type="range" min="-30" max="0" step="1" 
            value={volume} 
            onChange={(e) => setVolume(Number(e.target.value))}
            style={{ width: '100px', accentColor: 'var(--accent-primary)' }}
          />
        </div>
      </div>

      <div style={{ position: 'relative', width: '400px', height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <motion.div
          animate={{ scale: breath === 1 ? 1.05 : 1, rotate: breath === 1 ? 2 : 0 }}
          style={{
            width: '100px',
            height: '250px',
            background: 'linear-gradient(135deg, #FFD700 0%, #DAA520 50%, #B8860B 100%)', // Gold/Brass color
            borderRadius: '50px',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-evenly',
            boxShadow: 'inset -5px 0 10px rgba(0,0,0,0.3), 5px 5px 15px rgba(0,0,0,0.5)'
          }}
        >
          {KEYS.map((k, i) => (
            <div 
              key={k.note}
              onMouseDown={() => playNote(k.note)}
              onMouseUp={releaseNote}
              onMouseLeave={releaseNote}
              style={{
                width: '40px',
                height: '20px',
                background: activeNote === k.note ? '#fff' : '#f0f0f0',
                borderRadius: '10px',
                border: '2px solid #8B6508',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                color: '#333',
                boxShadow: activeNote === k.note ? 'inset 0 0 5px rgba(0,0,0,0.5)' : '0 2px 5px rgba(0,0,0,0.3)'
              }}
            >
              {k.key.toUpperCase()}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
