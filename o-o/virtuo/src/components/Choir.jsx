import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Volume2, Mic } from 'lucide-react';
import masterBus from '../audio/masterBus';

const KEYS = [
  { note: 'C4', key: 'a' }, { note: 'D4', key: 's' }, { note: 'E4', key: 'd' },
  { note: 'F4', key: 'f' }, { note: 'G4', key: 'g' }, { note: 'A4', key: 'h' },
  { note: 'B4', key: 'j' }, { note: 'C5', key: 'k' },
];

export default function Choir() {
  const [activeNotes, setActiveNotes] = useState(new Set());
  const [volume, setVolume] = useState(-5);
  const [vowel, setVowel] = useState('Ah'); // Ah, Ee, Oo
  
  const synthRef = useRef(null);
  const filterRef = useRef(null);
  const reverbRef = useRef(null);

  useEffect(() => {
    reverbRef.current = new Tone.Reverb({ decay: 4, wet: 0.6 }).connect(masterBus);
    
    // Formant filter
    filterRef.current = new Tone.Filter({ type: 'bandpass', frequency: 800, Q: 2 }).connect(reverbRef.current);
    
    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'pwm', modulationFrequency: 0.2 },
      envelope: { attack: 0.5, decay: 0.1, sustain: 1, release: 1.5 }
    }).connect(filterRef.current);
    
    const handleKeyDown = (e) => {
      if (e.repeat || e.target.tagName === 'INPUT') return;
      const keyObj = KEYS.find(k => k.key === e.key.toLowerCase());
      if (keyObj && !activeNotes.has(keyObj.note)) {
        playNote(keyObj.note);
      }
    };

    const handleKeyUp = (e) => {
      const keyObj = KEYS.find(k => k.key === e.key.toLowerCase());
      if (keyObj) releaseNote(keyObj.note);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      synthRef.current?.dispose();
      filterRef.current?.dispose();
      reverbRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.volume.rampTo(volume, 0.1);
    }
  }, [volume]);

  useEffect(() => {
    if (filterRef.current) {
      const freq = vowel === 'Ah' ? 800 : vowel === 'Ee' ? 2500 : 300;
      filterRef.current.frequency.rampTo(freq, 0.5);
    }
  }, [vowel]);

  const playNote = async (note) => {
    await Tone.start();
    if (synthRef.current) {
      synthRef.current.triggerAttack(note);
      setActiveNotes(prev => new Set(prev).add(note));
    }
  };

  const releaseNote = (note) => {
    if (synthRef.current) {
      synthRef.current.triggerRelease(note);
      setActiveNotes(prev => {
        const next = new Set(prev);
        next.delete(note);
        return next;
      });
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
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Vowel Formant</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            {['Ah', 'Ee', 'Oo'].map(v => (
              <button 
                key={v}
                className={`btn-glass ${vowel === v ? 'active' : ''}`}
                onClick={() => setVowel(v)}
                style={{ padding: '5px 15px' }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
        {KEYS.map((k, i) => {
          const isActive = activeNotes.has(k.note);
          return (
            <motion.div 
              key={k.note}
              animate={{
                scale: isActive ? 1.1 : 1,
                opacity: isActive ? 1 : 0.6
              }}
              onMouseDown={() => playNote(k.note)}
              onMouseUp={() => releaseNote(k.note)}
              onMouseLeave={() => releaseNote(k.note)}
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: isActive ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: isActive ? '0 0 20px var(--accent-primary)' : 'none',
                border: '1px solid rgba(255,255,255,0.2)'
              }}
            >
              <Mic size={24} color={isActive ? '#fff' : 'rgba(255,255,255,0.5)'} />
              <span style={{ position: 'absolute', bottom: '-25px', fontSize: '12px', color: 'var(--text-muted)' }}>
                {k.key.toUpperCase()}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
