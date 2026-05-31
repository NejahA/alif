import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { motion } from 'framer-motion';
import { Volume2, Settings2 } from 'lucide-react';
import masterBus from '../audio/masterBus';

const KEYS = [
  { note: 'C4', key: 'a' }, { note: 'C#4', key: 'w' }, { note: 'D4', key: 's' },
  { note: 'D#4', key: 'e' }, { note: 'E4', key: 'd' }, { note: 'F4', key: 'f' },
  { note: 'F#4', key: 't' }, { note: 'G4', key: 'g' }, { note: 'G#4', key: 'y' },
  { note: 'A4', key: 'h' }, { note: 'A#4', key: 'u' }, { note: 'B4', key: 'j' },
  { note: 'C5', key: 'k' },
];

export default function Organ() {
  const [activeNotes, setActiveNotes] = useState(new Set());
  const [volume, setVolume] = useState(-5);
  const [drawbars, setDrawbars] = useState([8, 8, 8, 0, 0, 0, 0, 0, 0]);
  const [rotarySpeed, setRotarySpeed] = useState('slow');
  
  const synthRef = useRef(null);
  const vibratoRef = useRef(null);
  const tremoloRef = useRef(null);

  useEffect(() => {
    // Leslie Speaker simulation
    vibratoRef.current = new Tone.Vibrato({ frequency: 1, depth: 0.1 }).connect(masterBus);
    tremoloRef.current = new Tone.Tremolo({ frequency: 1, depth: 0.2 }).connect(vibratoRef.current).start();
    
    synthRef.current = new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 1,
      modulationIndex: 1,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.1, sustain: 1, release: 0.1 },
      modulation: { type: 'sine' },
      modulationEnvelope: { attack: 0.01, decay: 0.1, sustain: 1, release: 0.1 }
    }).connect(tremoloRef.current);
    
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
      vibratoRef.current?.dispose();
      tremoloRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.volume.rampTo(volume, 0.1);
    }
  }, [volume]);

  useEffect(() => {
    if (vibratoRef.current && tremoloRef.current) {
      const freq = rotarySpeed === 'fast' ? 6 : 1;
      vibratoRef.current.frequency.rampTo(freq, 1);
      tremoloRef.current.frequency.rampTo(freq, 1);
    }
  }, [rotarySpeed]);

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
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Rotary Speaker</label>
          <button 
            className={`btn-glass ${rotarySpeed === 'fast' ? 'active' : ''}`}
            onClick={() => setRotarySpeed(s => s === 'fast' ? 'slow' : 'fast')}
            style={{ padding: '8px 20px', fontSize: '0.9rem' }}
          >
            {rotarySpeed === 'fast' ? 'FAST' : 'SLOW'}
          </button>
        </div>
      </div>

      <div style={{ background: '#2c1e16', padding: '20px', borderRadius: '10px', border: '2px solid #5c3a21', display: 'flex', gap: '10px', height: '200px' }}>
        {drawbars.map((val, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <input 
              type="range" min="0" max="8" step="1" 
              value={8 - val} 
              onChange={(e) => {
                const newBars = [...drawbars];
                newBars[i] = 8 - Number(e.target.value);
                setDrawbars(newBars);
                // Simple mapping: adjust harmonicity roughly
                if (synthRef.current) synthRef.current.set({ harmonicity: 1 + (newBars[0]/8) });
              }}
              style={{ writingMode: 'vertical-lr', direction: 'rtl', height: '150px', accentColor: i < 3 ? '#a86132' : i < 6 ? '#d4d4d4' : '#111' }}
            />
            <span style={{ fontSize: '10px', color: '#fff' }}>{val}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', position: 'relative', height: '150px', background: '#111', padding: '10px', borderRadius: '8px', borderBottom: '10px solid #5c3a21' }}>
        {KEYS.map((k, i) => {
          const isBlack = k.note.includes('#');
          const isActive = activeNotes.has(k.note);
          
          if (isBlack) {
            return (
              <div 
                key={k.note}
                onMouseDown={() => playNote(k.note)}
                onMouseUp={() => releaseNote(k.note)}
                onMouseLeave={() => releaseNote(k.note)}
                style={{
                  position: 'absolute',
                  left: `${(i - 0.5) * 40 + 10}px`,
                  width: '30px',
                  height: '90px',
                  background: isActive ? '#333' : '#000',
                  border: '1px solid #222',
                  borderBottomLeftRadius: '3px',
                  borderBottomRightRadius: '3px',
                  zIndex: 2,
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  paddingBottom: '10px',
                  color: '#555',
                  fontSize: '10px',
                  cursor: 'pointer'
                }}
              >
                {k.key.toUpperCase()}
              </div>
            );
          }
          
          return (
            <div 
              key={k.note}
              onMouseDown={() => playNote(k.note)}
              onMouseUp={() => releaseNote(k.note)}
              onMouseLeave={() => releaseNote(k.note)}
              style={{
                width: '40px',
                height: '100%',
                background: isActive ? '#e0e0e0' : '#fff',
                border: '1px solid #ccc',
                borderBottomLeftRadius: '5px',
                borderBottomRightRadius: '5px',
                marginRight: '2px',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                paddingBottom: '10px',
                color: '#888',
                fontSize: '10px',
                cursor: 'pointer',
                boxShadow: isActive ? 'inset 0 0 10px rgba(0,0,0,0.2)' : '0 2px 2px rgba(0,0,0,0.1)'
              }}
            >
              {k.key.toUpperCase()}
            </div>
          );
        })}
      </div>
    </div>
  );
}
