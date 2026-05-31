import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Volume2 } from 'lucide-react';
import masterBus from '../audio/masterBus';

const KEYS = [
  { note: 'F3', label: 'F' }, { note: 'G3', label: 'G' }, { note: 'A3', label: 'A' }, { note: 'Bb3', label: 'Bb' },
  { note: 'C4', label: 'C' }, { note: 'D4', label: 'D' }, { note: 'E4', label: 'E' }, { note: 'F4', label: 'F' }
];

export default function FrenchHorn() {
  const [activeNote, setActiveNote] = useState(null);
  const [volume, setVolume] = useState(-5);
  
  const synthRef = useRef(null);
  const reverbRef = useRef(null);

  useEffect(() => {
    reverbRef.current = new Tone.Reverb({ decay: 4, wet: 0.6 }).connect(masterBus);
    
    // French Horn: Mellow, rich brass sound with a slow attack swell
    synthRef.current = new Tone.FMSynth({
      harmonicity: 1.01, // Slight detune for brassiness
      modulationIndex: 2,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.3, decay: 0.2, sustain: 0.8, release: 0.8 },
      modulation: { type: 'triangle' },
      modulationEnvelope: { attack: 0.4, decay: 0.2, sustain: 0.5, release: 0.8 }
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

      <div style={{ position: 'relative', width: '400px', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        
        {/* The Coiled Tubing */}
        <div style={{ 
            width: '250px', height: '250px', 
            borderRadius: '50%', border: '20px solid #d4af37', // Gold brass
            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5), 0 10px 20px rgba(0,0,0,0.5)',
            position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            {/* Inner coil */}
            <div style={{ width: '150px', height: '150px', borderRadius: '50%', border: '15px solid #d4af37', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5), 0 5px 10px rgba(0,0,0,0.5)' }} />
            
            {/* The Bell */}
            <div style={{ 
                position: 'absolute', right: '-80px', top: '50px',
                width: '100px', height: '150px', background: 'radial-gradient(ellipse at right, #111, #d4af37)',
                borderRadius: '50% 10px 10px 50%', transform: 'rotate(-20deg)',
                boxShadow: '0 10px 20px rgba(0,0,0,0.5)'
            }} />
        </div>

        {/* The Valves */}
        <div style={{ position: 'absolute', left: '20px', top: '150px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {KEYS.map(k => (
                <div 
                    key={k.note}
                    onMouseDown={() => playNote(k.note)}
                    onMouseUp={releaseNote}
                    onMouseLeave={releaseNote}
                    style={{
                        width: '40px', height: '40px', background: activeNote === k.note ? '#fff' : '#d4af37',
                        borderRadius: '50%', border: '2px solid #854d0e',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: activeNote === k.note ? '#000' : '#111', fontWeight: 'bold', fontSize: '10px',
                        boxShadow: activeNote === k.note ? 'inset 0 5px 10px rgba(0,0,0,0.5)' : '0 5px 10px rgba(0,0,0,0.5)'
                    }}
                >
                    {k.label}
                </div>
            ))}
        </div>

      </div>
      
      <p style={{ color: 'var(--text-muted)' }}>Press the valves to play the majestic, swelling tones of the French Horn.</p>
    </div>
  );
}
