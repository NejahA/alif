import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Volume2 } from 'lucide-react';
import masterBus from '../audio/masterBus';

const KEYS = [
  { note: 'E3', label: 'E' }, { note: 'F3', label: 'F' }, { note: 'G3', label: 'G' }, { note: 'A3', label: 'A' },
  { note: 'B3', label: 'B' }, { note: 'C4', label: 'C' }, { note: 'D4', label: 'D' }, { note: 'E4', label: 'E' }
];

export default function Clarinet() {
  const [activeNote, setActiveNote] = useState(null);
  const [volume, setVolume] = useState(-5);
  
  const synthRef = useRef(null);
  const reverbRef = useRef(null);

  useEffect(() => {
    reverbRef.current = new Tone.Reverb({ decay: 2, wet: 0.3 }).connect(masterBus);
    
    // Clarinet has a hollow woody tone, best approximated with a square wave / triangle
    synthRef.current = new Tone.MonoSynth({
      oscillator: { type: 'triangle' },
      filter: { type: 'lowpass', frequency: 800, Q: 1 },
      envelope: { attack: 0.1, decay: 0.1, sustain: 0.9, release: 0.2 },
      filterEnvelope: { attack: 0.1, decay: 0.1, sustain: 1, release: 0.2, baseFrequency: 800, octaves: 1 }
    }).connect(reverbRef.current);

    return () => {
      synthRef.current?.dispose();
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

      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        
        {/* The Clarinet Body */}
        <div style={{ 
            width: '60px', height: '450px', background: '#111', 
            borderRadius: '5px 5px 20px 20px', border: '2px solid #333',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '15px',
            boxShadow: 'inset -10px 0 20px rgba(0,0,0,0.8), 0 10px 20px rgba(0,0,0,0.5)',
            position: 'relative'
        }}>
            {/* Mouthpiece */}
            <div style={{ position: 'absolute', top: '-20px', width: '40px', height: '30px', background: '#222', borderRadius: '10px 10px 0 0' }} />
            
            {/* Keys */}
            {KEYS.map(k => (
                <div 
                    key={k.note}
                    onMouseDown={() => playNote(k.note)}
                    onMouseUp={releaseNote}
                    onMouseLeave={releaseNote}
                    style={{
                        width: '30px', height: '30px', background: activeNote === k.note ? '#d1d5db' : '#e5e7eb',
                        borderRadius: '50%', border: '2px solid #888',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#111', fontSize: '10px', fontWeight: 'bold',
                        boxShadow: activeNote === k.note ? 'none' : '0 2px 5px rgba(0,0,0,0.5)'
                    }}
                >
                    {k.label}
                </div>
            ))}
            
            {/* Bell */}
            <div style={{ position: 'absolute', bottom: '-20px', width: '80px', height: '40px', background: '#111', borderRadius: '40px 40px 10px 10px', boxShadow: 'inset 0 -10px 20px rgba(0,0,0,0.8)' }} />
        </div>

      </div>
      
      <p style={{ color: 'var(--text-muted)' }}>Click the silver keys to play the hollow, woody tone of the Clarinet.</p>
    </div>
  );
}
