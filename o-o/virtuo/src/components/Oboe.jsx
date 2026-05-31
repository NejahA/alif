import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Volume2 } from 'lucide-react';
import masterBus from '../audio/masterBus';

const KEYS = [
  { note: 'C4', label: 'C' }, { note: 'D4', label: 'D' }, { note: 'E4', label: 'E' }, { note: 'F4', label: 'F' },
  { note: 'G4', label: 'G' }, { note: 'A4', label: 'A' }, { note: 'B4', label: 'B' }, { note: 'C5', label: 'C' }
];

export default function Oboe() {
  const [activeNote, setActiveNote] = useState(null);
  const [volume, setVolume] = useState(-5);
  
  const synthRef = useRef(null);
  const vibratoRef = useRef(null);
  const reverbRef = useRef(null);

  useEffect(() => {
    reverbRef.current = new Tone.Reverb({ decay: 2, wet: 0.3 }).connect(masterBus);
    vibratoRef.current = new Tone.Vibrato({ frequency: 5, depth: 0.05 }).connect(reverbRef.current);
    
    // Oboe has a piercing, nasal sound due to double reed
    synthRef.current = new Tone.MonoSynth({
      oscillator: { type: 'sawtooth' },
      filter: { type: 'bandpass', frequency: 1200, Q: 2 },
      envelope: { attack: 0.1, decay: 0.1, sustain: 0.8, release: 0.2 },
      filterEnvelope: { attack: 0.1, decay: 0.2, sustain: 0.8, release: 0.2, baseFrequency: 800, octaves: 1.5 }
    }).connect(vibratoRef.current);

    return () => {
      synthRef.current?.dispose();
      vibratoRef.current?.dispose();
      reverbRef.current?.dispose();
    };
  }, []);

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
    }
  };

  const releaseNote = () => {
    if (synthRef.current) {
      synthRef.current.triggerRelease();
      setActiveNote(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', width: '100%' }}>
      <div style={{ display: 'flex', gap: '20px', padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', width: '100%', justifyContent: 'center' }}>
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

      <div style={{ position: 'relative', width: '600px', height: '100px', display: 'flex', alignItems: 'center' }}>
        {/* Oboe Body */}
        <div style={{ 
          width: '500px', height: '30px', 
          background: '#1a1110', // Dark wood
          borderRadius: '5px 20px 20px 5px',
          boxShadow: 'inset 0 -5px 10px rgba(0,0,0,0.8), 0 10px 20px rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-evenly', paddingLeft: '50px'
        }}>
          {KEYS.map(k => (
            <div 
              key={k.note}
              onMouseDown={() => playNote(k.note)}
              onMouseUp={releaseNote}
              onMouseLeave={releaseNote}
              style={{
                width: '25px', height: '25px', 
                background: activeNote === k.note ? '#d4af37' : '#e5e7eb', // Silver/Gold keys
                borderRadius: '50%',
                cursor: 'pointer',
                boxShadow: activeNote === k.note ? 'inset 0 2px 5px rgba(0,0,0,0.5)' : '0 2px 5px rgba(0,0,0,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#111', fontSize: '10px', fontWeight: 'bold'
              }}
            >
              {k.label}
            </div>
          ))}
        </div>

        {/* Double Reed Mouthpiece */}
        <div style={{ 
          position: 'absolute', left: '-20px', top: '40px',
          width: '40px', height: '10px', 
          background: '#d2b48c', // Tan cane reed
          borderRadius: '2px',
          transform: 'rotate(-5deg)'
        }} />
      </div>
      
      <p style={{ color: 'var(--text-muted)' }}>Click the keys to play the Oboe.</p>
    </div>
  );
}
